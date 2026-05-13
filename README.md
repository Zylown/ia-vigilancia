# IA Vigilancia

Prototipo inicial de videovigilancia inteligente para entorno universitario.

La idea de esta primera version es validar el flujo base:

- capturar video desde la laptop o un stream externo
- detectar objetos con YOLO en tiempo real
- priorizar personas por defecto para reducir ruido
- guardar evidencia basica cuando se detecta actividad
- preparar la base para futuras alertas a SAE y analisis de conductas

## Estado actual

Esta version no detecta peleas ni infracciones complejas todavia.

Hoy el proyecto hace lo siguiente:

- abre una fuente de video
- ejecuta deteccion con YOLO
- muestra el video anotado en pantalla
- guarda una imagen de evidencia cuando detecta objetos de interes
- permite salir con `q`, `ESC` o `Ctrl+C`

## Estructura

```text
ia-vigilancia/
  app/
    alerts.py
    capture.py
    config.py
    detector.py
    main.py
  .env.example
  .gitignore
  README.md
  requirements.txt
```

## Requisitos

- Windows con Anaconda o Miniconda
- Python 3.10
- Webcam o fuente de video

## Crear entorno

Abre `Anaconda Prompt` dentro de la carpeta del proyecto y ejecuta:

```powershell
conda create -n ia-vigilancia python=3.10 -y
conda activate ia-vigilancia
pip install -r requirements.txt
```

Tambien puedes crear el entorno directamente desde el archivo del proyecto:

```powershell
conda env create -f environment.yml
conda activate ia-vigilancia
```

## Configuracion

1. Copia `.env.example` como `.env`
2. Ajusta los valores si hace falta

Variables importantes:

- `CAMERA_SOURCE=0`: usa la webcam de la laptop
- `MODEL_PATH=yolov8n.pt`: ruta al modelo
- `CONFIDENCE_THRESHOLD=0.55`: sube este valor si detecta demasiado "a lo loco"
- `YOLO_CLASSES=0`: detecta solo personas
- `SAVE_EVIDENCE=true`: guarda capturas

Si luego usas el iPhone como stream IP o URL, cambia `CAMERA_SOURCE` por esa direccion.

## Ejecutar

```powershell
python app\main.py
```

Importante: haz esto desde `Anaconda Prompt` o desde una terminal donde `conda` ya funcione. En una terminal normal de Windows, `python` puede apuntar al alias de Microsoft Store y no al entorno real.

## Controles

- `q`: salir
- `ESC`: salir
- `Ctrl+C`: detener desde terminal

Nota: si `Ctrl+C` no responde, haz clic primero en la terminal y vuelve a intentarlo. Si la ventana de video tiene el foco, usa `q` o `ESC`.

## Por que antes detectaba mal

El script anterior mostraba muchas clases con configuracion por defecto. Eso genera ruido visual y falsas detecciones aparentes.

En esta version:

- se usa un umbral de confianza configurable
- se limita por defecto a la clase `0`, que en YOLO corresponde a `person`
- se separa la configuracion del codigo para poder ajustar el comportamiento sin reescribir el script

## Siguientes pasos recomendados

1. Validar que funcione estable con webcam.
2. Conectar el iPhone como fuente de video.
3. Agregar zonas del campus o nombres de camara.
4. Registrar eventos en un archivo `.csv` o base de datos.
5. Enviar alertas basicas por correo, Telegram o WhatsApp.
6. Pasar de deteccion de personas a deteccion de conductas o acciones.

## Idea de MVP

Un MVP realista para presentar seria:

- detectar personas
- identificar presencia en zonas restringidas
- guardar evidencia del evento
- mostrar hora y camara
- emitir una alerta automatica simple

Eso ya demuestra valor sin entrar todavia en el problema mas dificil, que es detectar peleas en video.
