const extensionesSoportadas = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp']);
const categoryOrder = ['genero', 'edad', 'emociones', 'profesion', 'sombrero', 'gafas'];


// Objeto para almacenar todos los elementos del DOM
const domElements = {
  generatedText: document.getElementById('generatedText'),
  dropArea: document.getElementById('dropArea'),
  fileInput: document.getElementById('fileInput'),
  imagePreview: document.getElementById('imagePreview'),
  previewImage: document.getElementById('previewImage'),
  uploadMessage: document.getElementById('uploadMessage'),
  analyzing: document.getElementById('analyzing'),
  results: document.getElementById('results'),
  resultsCards: document.getElementById('resultsCards'),
  resultTitle: document.getElementById('resultTitle'),
  resultSubtitle: document.getElementById('resultSubtitle'),
  resultBadge: document.getElementById('resultBadge'),
  resetButton: document.getElementById('resetButton')
};

// Datos completos de cada categoría
const categoryData = {
  'genero': {
    name: 'Género',
    description: 'Predicción basada en características faciales asociadas al género percibido.',
    color: '#ff0000', // Rojo
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
  'edad': {
    name: 'Edad',
    description: 'Clasificación estimada por rangos de edad: niño, joven, adulto o anciano.',
    color: '#60a5fa', // Azul
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 2c0 3.87-3.13 7-7 7s-7-3.13-7-7"/><path d="M17 22c0-3.87-3.13-7-7-7s-7 3.13-7 7"/></svg>`
  },
  'profesion': {
    name: 'Profesión',
    description: 'Clasificación de ocupaciones basada en uniforme, entorno o rasgos distintivos.',
    color: '#a78bfa', // Violeta
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3h-8v4h8V3z"/></svg>`
  },
  'emociones': {
    name: 'Expresión',
    description: 'Detecta la emoción predominante en el rostro: alegría, tristeza, sorpresa, etc.',
    color: '#34d399', // Verde
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24" viewBox="0 0 24 24" class="lucide lucide-smile"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>`
  },
  'sombrero': {
    name: 'Sombrero',
    description: 'Clasificación binaria sobre si la persona lleva o no sombrero.',
    color: '#fbbf24', // Amarillo
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hat"><path d="M3 18v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><path d="M12 2l2 7H10l2-7z"/></svg>`
  },
  'gafas': {
    name: 'Gafas',
    description: 'Clasificación binaria sobre si la persona usa gafas.',
    color: '#38bdf8', // Celeste
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24" class="lucide lucide-glasses"><circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M10 15h4"/><path d="M2 15h1"/><path d="M21 15h1"/></svg>`
  }
};


function generarNarrativa(data) {
  const genero = Object.entries(data.Genero).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const edad = Object.entries(data.Edad).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const gafas = Object.entries(data.Gafas).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const sombrero = Object.entries(data.Sombrero).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const profesion = data.Profesion ? Object.entries(data.Profesion).reduce((a, b) => a[1] > b[1] ? a : b)[0] : null;

  let narrativa = `La imagen muestra a una persona ${genero.toLowerCase()} de edad ${edad.toLowerCase()}. ${gafas === 'Si' ? 'Lleva gafas' : 'No lleva gafas'}, y ${sombrero === 'Si' ? 'usa sombrero' : 'no usa sombrero'}.`;

  if (profesion) {
    narrativa += ` La profesión estimada es: ${profesion.toLowerCase()}.`;
  }

  return narrativa;
}

// Función para verificar elementos críticos del DOM
function verifyDomElements() {
  const criticalElements = ['analyzing', 'results', 'resultsCards', 'resultTitle', 'resetButton'];
  criticalElements.forEach(id => {
    if (!domElements[id]) {
      throw new Error(`Elemento crítico no encontrado: ${id}`);
    }
  });
}

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para mostrar los resultados del análisis
function displayResults(results) {
  try {
    console.log('Mostrando resultados:', results);

    // Verificar elementos del DOM
    if (!domElements.analyzing || !domElements.results || !domElements.resultsCards) {
      throw new Error('Elementos del DOM no disponibles');
    }

    // Validar resultados
    if (!results || !Array.isArray(results)) {
      throw new Error('Formato de resultados inválido');
    }

    // Ocultar sección de análisis y mostrar resultados
    domElements.analyzing.style.display = 'none';
    domElements.results.style.display = 'block';

    // Ordenar resultados por confianza
    const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);
    const topResult = sortedResults[0];

    // Actualizar título principal
    if (domElements.resultTitle) {
      domElements.resultTitle.textContent = `Desglose del análisis:`;
    }

    // Mostrar badge de completado
    if (domElements.resultBadge) {
      domElements.resultBadge.textContent = 'Análisis completado';
      domElements.resultBadge.style.display = 'block';
    }

    // Limpiar resultados anteriores
    domElements.resultsCards.innerHTML = '';

    // Agrupar resultados por categoría
    const groupedResults = {};
    sortedResults.forEach(res => {
      if (!groupedResults[res.category]) groupedResults[res.category] = [];
      groupedResults[res.category].push(res);
    });


    categoryOrder.forEach((category, index) => {
    const items = groupedResults[category];
    if (!items) return;

    const topItem = items.find(i => i.isTop);
    const topPerc = Math.round(topItem.confidence * 100);

    // Omitir "profesion" si su probabilidad es baja
    if (category === 'profesion' && topPerc < 70) return;

    const categoryInfo = categoryData[category] || { name: category, description: '', color: '#999', icon: '' };

    const card = document.createElement('div');
    card.className = 'analysis-card animate-slide-up';
    card.setAttribute('data-category', category);
    card.style.animationDelay = `${index * 0.15}s`;
    card.style.setProperty('--card-color', categoryInfo.color);

    const breakdownList = items.map(item => {
      const perc = Math.round(item.confidence * 100);
      const label = capitalizeFirstLetter(item.label);
      return `<li${item.isTop ? ' class="top-label"' : ''}>${label}: ${perc}%</li>`;
    }).join('');

    card.innerHTML = `
      <div class="analysis-card-content">
        <div class="analysis-card-header">
          <div class="analysis-card-title">
            <div class="analysis-card-icon">${categoryInfo.icon}</div>
            <h3>${capitalizeFirstLetter(categoryInfo.name)}</h3>
          </div>
          <div class="analysis-card-confidence">${topPerc}%</div>
        </div>

        <div class="analysis-card-progress">
          <div class="analysis-card-progress-bar" style="width: 0%"></div>
        </div>

        <ul class="analysis-card-list">
          ${breakdownList}
        </ul>

        <div class="analysis-card-description">
          ${categoryInfo.description}
        </div>
      </div>
    `;

    domElements.resultsCards.appendChild(card);

    setTimeout(() => {
      const progressBar = card.querySelector('.analysis-card-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${topPerc}%`;
      }
    }, 100);
  });



  } catch (error) {
    console.error('Error al mostrar resultados:', error);

    // Mostrar mensaje de error en la interfaz
    if (domElements.resultsCards) {
      domElements.resultsCards.innerHTML = `
        <div class="error-message">
          <p>Ocurrió un error al mostrar los resultados:</p>
          <p>${error.message}</p>
        </div>
      `;
    }

    if (domElements.analyzing) domElements.analyzing.style.display = 'none';
    if (domElements.results) domElements.results.style.display = 'block';
  }
}

function limitarTexto(texto, maxLength = 300) {
  if (texto.length <= maxLength) return texto;
  const truncado = texto.slice(0, maxLength);
  const ultimoEspacio = truncado.lastIndexOf(' ');
  return truncado.slice(0, ultimoEspacio) + '...';
}

function generarNarrativa(data) {
  const emocion = getLabel(data.Emociones);
  const edad = getLabel(data.Edad);
  const generoRaw = getLabel(data.Genero);
  const profesion = getLabel(data.Profesion);
  const sombrero = getLabel(data.Sombrero);
  const gafas = getLabel(data.Gafas);

  const genero = generoRaw === 'Mujer' ? 'femenino' :
                 generoRaw === 'Hombre' ? 'masculino' : 'desconocido';

  let frase = `Una persona de género ${genero}, de edad ${edad?.toLowerCase() || 'indeterminada'}, con expresión ${emocion?.toLowerCase() || 'neutra'}`;

  if (profesion && data.Profesion?.[profesion] >= 0.7) {
    frase += ` y profesión de ${profesion.toLowerCase()}`;
  }

  if (sombrero === 'Si') {
    frase += `, lleva sombrero`;
  }

  if (gafas === 'Si') {
    frase += `, usa gafas`;
  }

  frase += '.';
  return frase;
}



function getLabel(attr) {
  if (!attr || typeof attr !== 'object') return null;
  const top = Object.entries(attr).reduce((a, b) => a[1] > b[1] ? a : b);
  return top[0];
}

function analyzeImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  domElements.uploadMessage.style.display = 'none';
  domElements.analyzing.style.display = 'flex';
  domElements.results.style.display = 'none';

  fetch('/predict', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => {
      console.log('Datos recibidos del backend:', data);

    // Mostrar tarjetas de atributos
    const results = [];

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value && typeof value === 'object' && !value.error) {
        const entries = Object.entries(value);
        const maxEntry = entries.reduce((a, b) => a[1] > b[1] ? a : b);
        entries.forEach(([label, confidence]) => {
          results.push({
            category: key.toLowerCase(),
            label,
            confidence,
            isTop: label === maxEntry[0]
          });
        });
      }
    });


      displayResults(results);

      // Generar narrativa
      const narrativa = generarNarrativa(data);
      if (!narrativa || narrativa.trim().length < 5) {
        console.warn("Narrativa inválida:", narrativa);
      }

      fetch('/historia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: narrativa })
      })
        .then(res => res.json())
        .then(res => {
          const historia = res.historia || narrativa;
          const textoLimitado = limitarTexto(historia, 500); // Limita a ~5-6 líneas
          if (domElements.generatedText) domElements.generatedText.textContent = textoLimitado;
          const storyText = document.getElementById('storyText');
          const storyContainer = document.getElementById('storyContainer');
          if (storyText && storyContainer) {
            storyText.textContent = textoLimitado;
            storyContainer.style.display = 'block';
          }
        })
        .catch(err => {
          console.error('Error al generar historia:', err);
          domElements.generatedText.textContent = narrativa;
        });

    })
    .catch(error => {
      console.error('Error:', error);
      domElements.analyzing.style.display = 'none';
      domElements.results.style.display = 'block';
      domElements.resultsCards.innerHTML = `
        <div class="error-message">
          <p>Error al analizar la imagen:</p>
          <p>${error.message}</p>
        </div>
      `;
    });
}
// Función para mostrar la vista previa de la imagen
function displayImage(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    domElements.previewImage.src = e.target.result;
    domElements.imagePreview.style.display = 'flex';
    domElements.dropArea.style.display = 'none';

    // Mostrar estado de análisis
    domElements.uploadMessage.style.display = 'none';
    domElements.analyzing.style.display = 'flex';
    domElements.results.style.display = 'none';
  }

  reader.readAsDataURL(file);
}

// Función para reiniciar el analizador
function resetAnalyzer() {
  // Restablecer UI
  domElements.imagePreview.style.display = 'none';
  domElements.dropArea.style.display = 'flex';
  domElements.results.style.display = 'none';
  domElements.uploadMessage.style.display = 'block';

  // Ocultar badge
  if (domElements.resultBadge) {
    domElements.resultBadge.style.display = 'none';
  }

  // Limpiar entrada de archivo
  domElements.fileInput.value = '';
}

// Función para prevenir comportamientos por defecto en eventos de arrastre
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Función para resaltar el área de drop
function highlight() {
  domElements.dropArea.classList.add('active');
}

// Función para quitar el resaltado del área de drop
function unhighlight() {
  domElements.dropArea.classList.remove('active');
}

// Función para manejar archivos soltados
function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  if (files.length) {
    handleFiles(files);
  }
}

// Función para manejar archivos seleccionados
function handleFiles(files) {
  if (files[0]) {
    const file = files[0];
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!extensionesSoportadas.has(extension)) {
      mostrarPopupError();
      return;
    }

    if (!file.type.match('image.*')) {
      mostrarPopupError();
      return;
    }

    displayImage(file);
    analyzeImage(file);
  }
}

function mostrarPopupError() {
  // Crear elementos del pop-up
  const backdrop = document.createElement('div');
  backdrop.className = 'popup-backdrop';

  const popup = document.createElement('div');
  popup.className = 'extension-error-popup';
  popup.innerHTML = `
    <h4>Extensión no soportada</h4>
    <p>Solo se admiten archivos de imagen con las siguientes extensiones:</p>
    <p><strong>JPG, JPEG, PNG, BMP, GIF, TIFF, WEBP</strong></p>
    <button id="closePopup">Entendido</button>
  `;

  // Añadir al cuerpo del documento
  document.body.appendChild(backdrop);
  document.body.appendChild(popup);

  // Configurar evento de cierre
  const closeButton = document.getElementById('closePopup');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(backdrop);
    document.body.removeChild(popup);
  });

  // Cerrar al hacer clic fuera del pop-up
  backdrop.addEventListener('click', () => {
    document.body.removeChild(backdrop);
    document.body.removeChild(popup);
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  try {
    verifyDomElements();

    // Configurar event listeners para drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      domElements.dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      domElements.dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      domElements.dropArea.addEventListener(eventName, unhighlight, false);
    });

    domElements.dropArea.addEventListener('drop', handleDrop, false);
    domElements.fileInput.addEventListener('change', () => handleFiles(domElements.fileInput.files));
    domElements.resetButton.addEventListener('click', resetAnalyzer);

  } catch (error) {
    console.error('Error inicial:', error);
    // Mostrar mensaje de error al usuario
    document.body.innerHTML = `
      <div style="padding: 2rem; color: red; font-family: sans-serif;">
        <h1>Error de configuración</h1>
        <p>${error.message}</p>
        <p>Por favor, recarga la página o contacta al soporte.</p>
      </div>
    `;
  }
});