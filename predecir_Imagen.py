from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import openai
import cv2
import traceback
import colorsys
from rembg import remove
from io import BytesIO
import mediapipe as mp

# --- Configuración OpenAI ---
from openai import OpenAI
client = OpenAI(api_key="OPENAI_API_KEY")

app = Flask(__name__)

# --- Modelos y clases ---
model_paths = {
    'Genero':    ('modelo_hombre_mujer.h5', ['Mujer', 'Hombre']),
    'Edad':      ('modelo_edad.h5', ['Adulto', 'Anciano', 'Joven', 'Niño']),
    'Profesion': ('modelo_profesion.h5', ['Bombero', 'Chef', 'Medico', 'Policia']),
    'Sombrero':    ('modelo_sombreros.h5', ['No', 'Si']),
    'Gafas':    ('modelo_gafas.h5', ['No', 'Si']),
    'Emociones': ('modelo_emociones.h5', ['Enfadado', 'Feliz', 'Neutral', 'Triste'])
}

modelos = {}
input_sizes = {}

for key, (path, _) in model_paths.items():
    modelo = tf.keras.models.load_model(path)
    modelos[key] = modelo
    try:
        shape = modelo.input_shape
        input_sizes[key] = (shape[1], shape[2])
    except Exception:
        input_sizes[key] = (224, 224)

# --- Detección facial ---
mp_face = mp.solutions.face_detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# --- Procesamiento ---
def redimensionar_con_padding(imagen, tam=(224, 224), fondo=(255, 255, 255)):
    ancho, alto = imagen.size
    ratio = ancho / alto
    if ratio > 1:
        nw = tam[0]
        nh = int(nw / ratio)
    else:
        nh = tam[1]
        nw = int(nh * ratio)
    imagen_red = imagen.resize((nw, nh), Image.Resampling.LANCZOS)
    fondo_img = Image.new("RGB", tam, fondo)
    fondo_img.paste(imagen_red, ((tam[0] - nw) // 2, (tam[1] - nh) // 2))
    return fondo_img

def fondo_chillon(imagen_pil, umbral=0.6):
    np_img = np.array(imagen_pil.convert("RGB"))
    bordes = np.concatenate([np_img[0], np_img[-1], np_img[:, 0], np_img[:, -1]], axis=0)
    saturaciones = [colorsys.rgb_to_hsv(*pixel / 255.0)[1] for pixel in bordes]
    return np.mean(saturaciones) > umbral

def eliminar_fondo(imagen_pil, fondo_color=(255, 255, 255)):
    buffer = BytesIO()
    imagen_pil.save(buffer, format="PNG")
    data = remove(buffer.getvalue())
    img_transp = Image.open(BytesIO(data)).convert("RGBA")
    fondo = Image.new("RGBA", img_transp.size, fondo_color + (255,))
    return Image.alpha_composite(fondo, img_transp).convert("RGB")

def eliminar_fondo_si_chillon(imagen_pil):
    if fondo_chillon(imagen_pil):
        return eliminar_fondo(imagen_pil, fondo_color=(255, 255, 255))
    return imagen_pil


def recorte_sombrero(imagen_pil):
    imagen_np = np.array(imagen_pil.convert("RGB"))
    h, w, _ = imagen_np.shape
    with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        resultados = face_detection.process(imagen_np)
        if resultados.detections:
            face = resultados.detections[0]
            box = face.location_data.relative_bounding_box
            x = int(box.xmin * w)
            y = int(box.ymin * h)
            ancho = int(box.width * w)
            alto = int(box.height * h)
            cx = x + ancho // 2
            cy = y + alto // 2
            lado = int(ancho * 2.4)
            desplazamiento_arriba = int(lado * 0.45)
            recorte_x1 = max(0, cx - lado // 2)
            recorte_y1 = max(0, cy - desplazamiento_arriba)
            recorte_x2 = min(w, recorte_x1 + lado)
            recorte_y2 = min(h, recorte_y1 + lado)
            recorte = imagen_pil.crop((recorte_x1, recorte_y1, recorte_x2, recorte_y2))
            imagen_final = recorte.resize((224, 224))
        else:
            imagen_final = redimensionar_con_padding(imagen_pil)
    return eliminar_fondo_si_chillon(imagen_final)


def procesar_profesion(imagen_pil):
    imagen_sin_fondo = eliminar_fondo(imagen_pil, fondo_color=(0, 0, 0))  # Fondo negro
    return redimensionar_con_padding(imagen_sin_fondo, tam=(224, 224), fondo=(255, 255, 255))  # Padding blanco

def procesar_emociones(imagen):
    # 1. Recorte estilo sombrero (centrado en la cara)
    imagen_recortada = recorte_sombrero(imagen)

    # 2. Elimina fondo con fondo negro
    imagen_sin_fondo = eliminar_fondo(imagen_recortada, fondo_color=(0, 0, 0))

    # 3. Redimensiona con padding si es necesario
    return redimensionar_con_padding(imagen_sin_fondo)



# --- Rutas ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No se ha subido ningún archivo'}), 400

    file = request.files['file']
    if file.filename == '' or not file.content_type.startswith('image/'):
        return jsonify({'error': 'Archivo inválido'}), 400

    try:
        image = Image.open(io.BytesIO(file.read()))
    except:
        return jsonify({'error': 'No se pudo leer la imagen'}), 400

    output = {}

    try:
        img_gen = recorte_sombrero(image).convert("RGB")
        img_pro = procesar_profesion(image).convert("RGB")

        input_gen = np.expand_dims(np.array(img_gen) / 255.0, axis=0)
        input_pro = np.expand_dims(np.array(img_pro) / 255.0, axis=0)

        # Genero
        pred_gen = modelos['Genero'].predict(input_gen)[0][0]
        output['Genero'] = {
            'Mujer': float(pred_gen),
            'Hombre': float(1 - pred_gen)
        }
        

        # Edad
        pred_edad = modelos['Edad'].predict(input_gen)[0]
        output['Edad'] = {model_paths['Edad'][1][i]: float(pred_edad[i]) for i in range(len(pred_edad))}

        # Profesion
        pred_prof = modelos['Profesion'].predict(input_pro)[0]
        output['Profesion'] = {model_paths['Profesion'][1][i]: float(pred_prof[i]) for i in range(len(pred_prof))}
        
        # Sombrero (modelo devuelve probabilidad de NO tener sombrero)
        pred_hat = modelos['Sombrero'].predict(input_gen)[0][0]
        output['Sombrero'] = {
            'Si': float(pred_hat),
            'No': float(1 - pred_hat)
        }

        # Gafas (modelo devuelve probabilidad de NO tener gafas)
        pred_glasses = modelos['Gafas'].predict(input_gen)[0][0]
        output['Gafas'] = {
            'Si': float(pred_glasses),
            'No': float(1 - pred_glasses)
        }
        
        img_emo = procesar_emociones(image).convert("RGB")
        input_emo = np.expand_dims(np.array(img_emo) / 255.0, axis=0)

        # Emociones
        pred_emo = modelos['Emociones'].predict(input_emo)[0]
        output['Emociones'] = {
            model_paths['Emociones'][1][i]: float(pred_emo[i])
            for i in range(len(pred_emo))
        }


    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Error en predicción: {str(e)}'}), 500

    return jsonify(output)

@app.route('/historia', methods=['POST'])
def historia():
    data = request.get_json()
    descripcion = data.get('descripcion', '')
    atributos = data.get('atributos', {})  # Nuevo campo opcional para control

    # Verificar si se debe omitir "profesion"
    if 'Profesion' in atributos:
        top_prof = max(atributos['Profesion'].items(), key=lambda x: x[1])
        if top_prof[1] < 0.7:
            descripcion = descripcion.replace(f"{top_prof[0].lower()}", "")

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un narrador creativo que genera historias breves de 3 a 5 frases en la que se destaquen claramente estos atributos."
                },
                {
                    "role": "user",
                    "content": f"Escribe una pequeña historia sobre esta persona: {descripcion}"
                }
            ]
        )
        texto = response.choices[0].message.content
        return jsonify({"historia": texto})

    except Exception as e:
        print(f"[❌ ERROR API OPENAI] {e}")
        historia_simulada = f"{descripcion.capitalize()} caminaba por un mundo desconocido cuando encontró algo que cambió su destino para siempre."
        return jsonify({"historia": historia_simulada})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
