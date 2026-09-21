"""
Copia/optimiza imagenes utiles de utils/*/imagenes hacia public/
para que scripts/seed.ts las suba a Media.

Uso:
  python scripts/preparar-public-cambios.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Falta Pillow. Instala con: pip install pillow")
    sys.exit(1)

RAIZ = Path(__file__).resolve().parents[1]
UTILS = RAIZ / "utils"
PUBLIC = RAIZ / "public"

SELECCION = {
    "newsletter": {"prefijo": "newsletter-salud", "max": 6, "min_lado": 400},
    "auditoria": {"prefijo": "auditoria-mantenimiento", "max": 4, "min_lado": 300},
}


def optimizar(origen: Path, destino: Path, ancho_max: int = 1600) -> None:
    with Image.open(origen) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w > ancho_max:
            ratio = ancho_max / w
            im = im.resize((ancho_max, int(h * ratio)), Image.Resampling.LANCZOS)
        destino.parent.mkdir(parents=True, exist_ok=True)
        im.save(destino, "JPEG", quality=82, optimize=True, progressive=True)


def preparar(slug: str, prefijo: str, max_n: int, min_lado: int) -> list[str]:
    meta_path = UTILS / slug / "meta.json"
    if not meta_path.exists():
        print(f"  SKIP {slug}: corre antes scripts/extract-cambios-pdfs.py")
        return []
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    imgs = meta.get("imagenes", [])
    candidatas = [
        item
        for item in imgs
        if item["ancho"] >= min_lado and item["alto"] >= min_lado
    ]
    candidatas.sort(key=lambda x: x["ancho"] * x["alto"], reverse=True)
    elegidas = candidatas[:max_n]

    nombres: list[str] = []
    for i, item in enumerate(elegidas, start=1):
        src = UTILS / slug / item["archivo"]
        if not src.exists():
            continue
        nombre = f"{prefijo}-{i}.jpg"
        destino = PUBLIC / nombre
        optimizar(src, destino)
        nombres.append(nombre)
        print(f"  {slug}: {src.name} -> public/{nombre} ({item['ancho']}x{item['alto']})")

    (UTILS / slug / "public-map.json").write_text(
        json.dumps({"archivos": nombres}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return nombres


def main() -> None:
    print(f"Public: {PUBLIC}")
    for slug, cfg in SELECCION.items():
        preparar(slug, cfg["prefijo"], cfg["max"], cfg["min_lado"])
    print("Listo.")


if __name__ == "__main__":
    main()
