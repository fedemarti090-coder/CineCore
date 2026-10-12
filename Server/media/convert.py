import argparse
import shutil
import subprocess
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = Path(
    "1080p/weapons_trailer.mp4"
)
RESOLUTIONS = {
    "720p": 720,
    "480p": 480,
    "360p": 360,
}


def transcode_local_video(
    input_video_path: Path,
    output_dir: Path = SCRIPT_DIR,
) -> bool:
    if not input_video_path.is_file():
        print(f"Errore: il file '{input_video_path}' non è stato trovato.")
        return False

    input_video_path = input_video_path.resolve()
    source_dir = output_dir / "1080p"
    source_dir.mkdir(parents=True, exist_ok=True)
    source_path = source_dir / input_video_path.name

    if input_video_path != source_path.resolve():
        print(f"Copia del video originale in '{source_path}'...")
        shutil.copy2(input_video_path, source_path)

    for resolution, height in RESOLUTIONS.items():
        destination_dir = output_dir / resolution
        destination_dir.mkdir(parents=True, exist_ok=True)
        output_path = destination_dir / input_video_path.name

        print(f"Generazione della versione {resolution}...")
        command = [
            "ffmpeg",
            "-y",
            "-i",
            str(source_path),
            "-map",
            "0:v:0",
            "-map",
            "0:a?",
            "-vf",
            f"scale=-2:{height}",
            "-c:v",
            "libx264",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            str(output_path),
        ]

        try:
            subprocess.run(
                command,
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                text=True,
            )
        except FileNotFoundError:
            print("Errore: FFmpeg non è installato o non è disponibile nel PATH.")
            return False
        except subprocess.CalledProcessError as error:
            print(f"Errore durante la conversione {resolution}:\n{error.stderr}")
            return False

        print(f"Creato: {output_path}")

    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Crea versioni video a 720p, 480p e 360p con FFmpeg."
    )
    parser.add_argument(
        "video",
        nargs="?",
        type=Path,
        default=SCRIPT_DIR / DEFAULT_INPUT,
        help="video da convertire (default: il video nella cartella 1080p)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=SCRIPT_DIR,
        help="cartella in cui creare le cartelle 1080p, 720p, 480p e 360p",
    )
    args = parser.parse_args()

    if transcode_local_video(args.video, args.output_dir):
        print("Conversione completata.")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
