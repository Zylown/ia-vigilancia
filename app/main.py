from __future__ import annotations

from pathlib import Path

import cv2

from alerts import EvidenceManager
from capture import open_camera
from config import Settings
from detector import YOLODetector


def main() -> None:
    settings = Settings.from_env()
    detector = YOLODetector(
        model_path=settings.model_path,
        confidence_threshold=settings.confidence_threshold,
        tracked_classes=settings.tracked_classes,
    )
    evidence_manager = EvidenceManager(
        directory=Path(settings.evidence_dir),
        cooldown_seconds=settings.evidence_cooldown_seconds,
        enabled=settings.save_evidence,
    )

    camera = open_camera(settings.camera_source)

    print("Iniciando vigilancia inteligente...")
    print("Controles: enfoca la ventana de video y presiona 'q' o 'ESC' para salir.")
    print(
        f"Modelo: {settings.model_path} | "
        f"Confianza minima: {settings.confidence_threshold:.2f} | "
        f"Clases: {settings.tracked_classes or 'todas'}"
    )

    try:
        while True:
            ok, frame = camera.read()
            if not ok:
                print("No se pudo leer un frame de la camara. Finalizando.")
                break

            summary = detector.detect(frame)
            saved_path = evidence_manager.maybe_save(frame, summary.detection_count)

            if saved_path is not None:
                print(f"Alerta basica: evidencia guardada en {saved_path}")

            cv2.imshow(settings.window_name, summary.annotated_frame)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), 27):
                print("Salida solicitada por teclado.")
                break

    except KeyboardInterrupt:
        print("Proceso detenido con Ctrl+C.")
    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("Recursos liberados correctamente.")


if __name__ == "__main__":
    main()
