from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _parse_int_list(value: str) -> list[int]:
    items = [item.strip() for item in value.split(",") if item.strip()]
    return [int(item) for item in items]


@dataclass(slots=True)
class Settings:
    camera_source: str
    model_path: str
    confidence_threshold: float
    tracked_classes: list[int] | None
    window_name: str
    save_evidence: bool
    evidence_dir: str
    evidence_cooldown_seconds: int

    @classmethod
    def from_env(cls) -> "Settings":
        raw_classes = os.getenv("YOLO_CLASSES", "0").strip()
        tracked_classes = _parse_int_list(raw_classes) if raw_classes else None

        return cls(
            camera_source=os.getenv("CAMERA_SOURCE", "0"),
            model_path=os.getenv("MODEL_PATH", "yolov8n.pt"),
            confidence_threshold=float(os.getenv("CONFIDENCE_THRESHOLD", "0.55")),
            tracked_classes=tracked_classes,
            window_name=os.getenv("WINDOW_NAME", "IA Vigilancia - Deteccion"),
            save_evidence=os.getenv("SAVE_EVIDENCE", "true").lower() == "true",
            evidence_dir=os.getenv("EVIDENCE_DIR", "evidence"),
            evidence_cooldown_seconds=int(os.getenv("EVIDENCE_COOLDOWN_SECONDS", "10")),
        )

