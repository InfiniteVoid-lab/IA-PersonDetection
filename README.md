# 👁️‍🗨️ IA – Person Detection (Género, Edad, Emoción y Oficio)

[![Last commit](https://img.shields.io/github/last-commit/InfiniteVoid-lab/IA-PersonDetection?logo=git&color=0EA5E9)](https://github.com/InfiniteVoid-lab/IA-PersonDetection/commits)  
[![Lenguaje](https://img.shields.io/github/languages/top/InfiniteVoid-lab/IA-PersonDetection?logo=python&label=python&color=3776AB)](./)  
[![Issues](https://img.shields.io/github/issues/InfiniteVoid-lab/IA-PersonDetection?color=22C55E)](https://github.com/InfiniteVoid-lab/IA-PersonDetection/issues)  
[![License](https://img.shields.io/badge/license-MIT-10B981.svg)](#licencia)  

Este proyecto implementa un sistema de **detección y análisis de personas mediante IA**, capaz no solo de localizar rostros sino también de **inferir atributos humanos** como:  

- 👩‍🦱 **Género**  
- 🎂 **Edad aproximada**  
- 💼 **Profesión / oficio estimado**  
- 🙂 **Estado emocional**  

Se apoya en modelos de **Deep Learning** entrenados para clasificación de imágenes faciales y atributos, con el objetivo de crear una herramienta flexible para investigación y desarrollo en aplicaciones de análisis humano.  

---

## ✨ Características principales
- Detección de rostros en imágenes y vídeo.  
- Inferencia de género, edad, oficio y emoción a partir de modelos entrenados.  
- Procesamiento en tiempo real desde webcam o stream.  
- Resultados acompañados de métricas de confianza.  
- Modelos pre-entrenados listos para usar 👉 [Descarga aquí]([https://drive.google.com/drive/folders/1wJI4dPS-6Le3Iv6YCiRT-P1O0xuLDsKg?usp=sharing](https://drive.google.com/drive/folders/1wJI4dPS-6Le3Iv6YCiRT-P1O0xuLDsKg?usp=sharing)).  

---

## 📦 Requisitos
- **Python 3.9+**  
- Librerías necesarias:  
  - `opencv-python`  
  - `numpy`  
  - `torch` o `tensorflow` (dependiendo del modelo)  
  - `matplotlib`  
  - `pandas`  
  - `scikit-learn`  

Instalación rápida:
```bash
pip install -r requirements.txt
