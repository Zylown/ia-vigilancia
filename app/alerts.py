from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

import cv2


@dataclass(slots=True)
class EvidenceManager:
    directory: Path
    cooldown_seconds: int
    enabled: bool = True
    _last_saved_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.enabled:
            self.directory.mkdir(parents=True, exist_ok=True)

    def maybe_save(self, frame: cv2.typing.MatLike, detection_count: int) -> Path | None:
        if not self.enabled or detection_count <= 0:
            return None

        now = datetime.now()
        if self._last_saved_at is not None:
            elapsed = now - self._last_saved_at
            if elapsed < timedelta(seconds=self.cooldown_seconds):
                return None

        filename = f"evento_{now.strftime('%Y%m%d_%H%M%S')}.jpg"
        output_path = self.directory / filename
        cv2.imwrite(str(output_path), frame)
        self._last_saved_at = now
        return output_path

