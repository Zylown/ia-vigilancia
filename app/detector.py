from __future__ import annotations

from dataclasses import dataclass

import cv2
from ultralytics import YOLO


@dataclass(slots=True)
class DetectionBox:
    class_id: int
    class_name: str
    confidence: float
    x1: int
    y1: int
    x2: int
    y2: int

    @property
    def width(self) -> int:
        return max(0, self.x2 - self.x1)

    @property
    def height(self) -> int:
        return max(0, self.y2 - self.y1)

    @property
    def area(self) -> int:
        return self.width * self.height

    @property
    def center(self) -> tuple[int, int]:
        return (self.x1 + self.width // 2, self.y1 + self.height // 2)


@dataclass(slots=True)
class DetectionSummary:
    annotated_frame: cv2.typing.MatLike
    labels: list[str]
    detection_count: int
    detections: list[DetectionBox]


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
        detections: list[DetectionBox] = []

        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls.item())
                confidence = float(box.conf.item())
                class_name = self.class_names[class_id]
                x1, y1, x2, y2 = [int(value) for value in box.xyxy[0].tolist()]
                labels.append(f"{class_name} ({confidence:.2f})")
                detections.append(
                    DetectionBox(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=confidence,
                        x1=x1,
                        y1=y1,
                        x2=x2,
                        y2=y2,
                    )
                )

        return DetectionSummary(
            annotated_frame=result.plot(),
            labels=labels,
            detection_count=len(labels),
            detections=detections,
        )
