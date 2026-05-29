from __future__ import annotations

from dataclasses import dataclass

import cv2


@dataclass(slots=True)
class CameraOption:
    source: str
    label: str


def parse_camera_source(source: str) -> int | str:
    source = source.strip()
    return int(source) if source.isdigit() else source


def list_available_cameras(max_index: int = 5) -> list[CameraOption]:
    cameras: list[CameraOption] = []

    for index in range(max_index):
        camera = cv2.VideoCapture(index, cv2.CAP_DSHOW)
        if camera.isOpened():
            ok, _ = camera.read()
            if ok:
                cameras.append(CameraOption(source=str(index), label=f"Camara local {index}"))
        camera.release()

    return cameras


def choose_video_source(default_source: str, prompt_user: bool, scan_limit: int) -> CameraOption:
    detected_cameras = list_available_cameras(scan_limit)

    if not prompt_user:
        return CameraOption(source=default_source, label=f"Fuente configurada ({default_source})")

    print("\nSelector de camara")
    print("------------------")
    if detected_cameras:
        for index, camera in enumerate(detected_cameras, start=1):
            print(f"{index}. {camera.label}")
    else:
        print("No se detectaron camaras locales en el escaneo rapido.")

    print("M. Ingresar manualmente otra fuente (URL RTSP/HTTP, iPhone, IP camera, etc.)")
    print(f"Enter. Usar fuente por defecto configurada: {default_source}")

    selected_value = input("Selecciona una opcion: ").strip()
    if not selected_value:
        return CameraOption(source=default_source, label=f"Fuente por defecto ({default_source})")

    if selected_value.lower() == "m":
        manual_source = input("Ingresa el indice o la URL de la fuente de video: ").strip()
        if not manual_source:
            return CameraOption(source=default_source, label=f"Fuente por defecto ({default_source})")
        return CameraOption(source=manual_source, label=f"Fuente manual ({manual_source})")

    if selected_value.isdigit():
        camera_index = int(selected_value)
        if 1 <= camera_index <= len(detected_cameras):
            return detected_cameras[camera_index - 1]

    print("Opcion invalida. Se usara la fuente por defecto.")
    return CameraOption(source=default_source, label=f"Fuente por defecto ({default_source})")


def open_camera(source: str, width: int | None = None, height: int | None = None, fps: int | None = None) -> cv2.VideoCapture:
    parsed_source = parse_camera_source(source)
    if isinstance(parsed_source, int):
        camera = cv2.VideoCapture(parsed_source, cv2.CAP_DSHOW)
    else:
        camera = cv2.VideoCapture(parsed_source)

    if not camera.isOpened():
        raise RuntimeError(
            f"No se pudo abrir la fuente de video '{source}'. "
            "Verifica la camara, el indice o la URL del stream."
        )

    if width is not None:
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    if height is not None:
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    if fps is not None:
        camera.set(cv2.CAP_PROP_FPS, fps)
    camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    return camera
