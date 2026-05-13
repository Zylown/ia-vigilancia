from __future__ import annotations

from dataclasses import dataclass

import cv2
from ultralytics import YOLO


@dataclass(slots=True)
class DetectionSummary:
    annotated_frame: cv2.typing.MatLike
    labels: list[str]
    detection_count: int


class YOLODetector:
    def __init__(self, model_path: str, confidence_threshold: float, tracked_classes: list[int] | None) -> None:
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold
        self.tracked_classes = tracked_classes
        self.class_names = self.model.names

    def detect(self, frame: cv2.typing.MatLike) -> DetectionSummary:
        results = self.model.predict(
            source=frame,
            conf=self.confidence_threshold,
            classes=self.tracked_classes,
            verbose=False,
        )
        result = results[0]
        labels: list[str] = []

        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls.item())
                confidence = float(box.conf.item())
                class_name = self.class_names[class_id]
                labels.append(f"{class_name} ({confidence:.2f})")

        return DetectionSummary(
            annotated_frame=result.plot(),
            labels=labels,
            detection_count=len(labels),
        )

