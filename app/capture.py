from __future__ import annotations

import cv2


def parse_camera_source(source: str) -> int | str:
    source = source.strip()
    return int(source) if source.isdigit() else source


def open_camera(source: str) -> cv2.VideoCapture:
    parsed_source = parse_camera_source(source)
    camera = cv2.VideoCapture(parsed_source)

    if not camera.isOpened():
        raise RuntimeError(
            f"No se pudo abrir la fuente de video '{source}'. "
            "Verifica la camara, el indice o la URL del stream."
        )

    return camera

