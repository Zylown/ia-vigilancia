from pathlib import Path
import shutil

from huggingface_hub import hf_hub_download


def main() -> None:
    target_dir = Path("models/fight")
    target_dir.mkdir(parents=True, exist_ok=True)

    model_path = hf_hub_download(
        repo_id="Musawer14/fight_detection_yolov8",
        filename="yolo_small_weights.pt",
    )

    target_path = target_dir / "best.pt"
    shutil.copy(model_path, target_path)

    print(f"Modelo guardado en: {target_path}")


if __name__ == "__main__":
    main()