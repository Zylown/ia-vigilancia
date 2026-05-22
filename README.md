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

- permite seleccionar la camara al iniciar
- abre una fuente de video
- ejecuta deteccion con YOLO
- evalua eventos basicos por heuristica
- muestra el video anotado en pantalla
- guarda evidencia por carpeta de evento
- permite salir con `q`, `ESC` o `Ctrl+C`

## Estructura

```text
ia-vigilancia/
  app/
    alerts.py
    capture.py
    config.py
    detector.py
    event_engine.py
    event_catalog.py
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
- `PROMPT_CAMERA_SELECTION=true`: muestra selector de camara al iniciar
- `CAMERA_SCAN_LIMIT=5`: cantidad de indices locales a escanear
- `MODEL_PATH=yolov8n.pt`: ruta al modelo
- `CONFIDENCE_THRESHOLD=0.55`: sube este valor si detecta demasiado "a lo loco"
- `YOLO_CLASSES=0`: detecta solo personas
- `ENABLED_EVENTS=fight,crowd,fallen_person`: eventos basicos activos
- `FIGHT_MOTION_THRESHOLD=18.0`: sensibilidad de movimiento para pelea
- `FIGHT_FRAMES_REQUIRED=6`: cantidad de frames seguidos para disparar pelea
- `CROWD_PERSON_THRESHOLD=6`: minimo de personas para aglomeracion
- `SAVE_EVIDENCE=true`: guarda capturas

Si luego usas el iPhone como stream IP o URL, cambia `CAMERA_SOURCE` por esa direccion o elige la opcion manual al iniciar.

## Ejecutar

```powershell
python app\main.py
```

Importante: haz esto desde `Anaconda Prompt` o desde una terminal donde `conda` ya funcione. En una terminal normal de Windows, `python` puede apuntar al alias de Microsoft Store y no al entorno real.

## Selector de camara

Al iniciar, el sistema escanea las camaras locales y muestra un selector simple en terminal.

Opciones:

- elegir una camara local detectada
- presionar `Enter` para usar la fuente por defecto del `.env`
- escribir `M` para ingresar manualmente una fuente de video

La fuente manual puede ser:

- un indice, por ejemplo `1`
- una URL RTSP de una camara IP
- una URL HTTP/MJPEG si el dispositivo la ofrece

## Como conectar el iPhone al sistema

Para el prototipo tienes tres caminos practicos:

1. Usarlo como webcam del sistema.
   Si Windows lo reconoce como camara, el selector lo mostrara como una camara local.

2. Usarlo como camara IP dentro de tu red Wi-Fi.
   En ese caso, la aplicacion del telefono te dara una URL y la pegas en la opcion manual del selector.

3. Usarlo como stream RTSP.
   Esta es la opcion mas parecida a una camara de videovigilancia real, porque a futuro muchas camaras IP profesionales entregan RTSP.

### Usar Camo

Si ya instalaste Camo en el iPhone y en la laptop:

1. Abre Camo en el iPhone.
2. Abre Camo Studio en la laptop.
3. Conecta el iPhone por USB o con el metodo que Camo te habilite.
4. Verifica en Camo Studio que ya ves la imagen del telefono.
5. Cierra aplicaciones que puedan estar ocupando esa camara virtual.
6. Ejecuta `python app\main.py`.
7. En el selector, prueba una de las camaras locales detectadas hasta encontrar la de Camo.

Como el selector actual muestra indices y no nombres del driver, la camara de Camo normalmente aparecera como otra camara local, por ejemplo `1` o `2`.

Si no aparece:

- deja abierto Camo Studio antes de correr Python
- desconecta otras apps de videollamada
- prueba subir `CAMERA_SCAN_LIMIT` a `8`
- en ultimo caso, usa `M` y escribe un indice manual como `1`, `2` o `3`

Recomendacion para tu proyecto:

- hoy: usa webcam o iPhone como stream
- despues: migra a camara IP/RTSP
- futuro final: integra camaras de videovigilancia con RTSP/ONVIF y nombres por ubicacion

## Como se conectaria una camara de videovigilancia a futuro

Lo normal en una camara profesional es:

- la camara transmite RTSP
- tu sistema toma esa URL como fuente
- a cada camara se le asigna una ubicacion, por ejemplo `Biblioteca Norte` o `Laboratorio 3`
- las alertas se guardan con `fecha`, `hora`, `camara`, `ubicacion` y `tipo de evento`

Ejemplo de fuente futura:

```text
rtsp://usuario:clave@192.168.1.50:554/stream1
```

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
3. Agregar identificador de camara y ubicacion.
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

## Catalogo de eventos objetivo

El proyecto ya incluye un catalogo interno de eventos objetivo en `app/event_catalog.py`. Ese archivo modela prioridades y estrategia de deteccion para eventos como:

- pelea
- arma de fuego
- cuchillo
- humo
- fuego
- persona inconsciente
- intrusion
- merodeo
- vandalismo
- aglomeracion

Esto no significa que todos esos eventos ya se detecten hoy. Significa que la arquitectura ya esta preparada para crecer hacia ese objetivo.

## Evidencia por evento

La evidencia ya no se guarda por cualquier deteccion de persona.

Ahora se guarda por carpeta segun el evento detectado:

- `evidence/fight/`
- `evidence/crowd/`
- `evidence/fallen_person/`

Esto reduce mucho el ruido respecto al comportamiento anterior.

## Estado real de la deteccion de peleas

La deteccion de `fight` que se agrego ahora es una heuristica inicial, no un detector entrenado. Busca:

- dos o mas personas cercanas
- movimiento brusco sostenido durante varios frames

Sirve para experimentar, pero tendra falsos positivos y falsos negativos.

Para hacerlo bien, el camino correcto es por fases:

1. Deteccion de personas y tracking.
2. Recoleccion de clips de ejemplo reales o datasets etiquetados.
3. Modelo de accion para `fight/aggression/running/climbing`.
4. Reglas de contexto por zona, horario y permanencia.
5. Alertas y almacenamiento de clips, no solo snapshots.

## Recomendacion tecnica clave

Para detectar bien eventos complejos como pelea, robo, intrusiones o merodeo no basta con YOLO.

Necesitaras combinar:

- deteccion de objetos
- deteccion de acciones
- tracking de personas
- contexto temporal entre varios frames
- reglas de negocio por zona y horario

Ejemplo:

- `running` solo no implica riesgo
- `running + crowd + direccion de escape` puede indicar estampida
- `two persons + forceful motion + close contact over time` puede indicar pelea
