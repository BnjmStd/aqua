"""
Extrae texto e imagenes de los PDF de docs/CAMBIOS hacia utils/.

Uso (desde la raiz del repo):
  python scripts/extract-cambios-pdfs.py

Salida (gitignored):
  utils/<slug>/texto.md
  utils/<slug>/meta.json
  utils/<slug>/imagenes/pXX-imgYY.png

Luego:
  python scripts/preparar-public-cambios.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Falta PyMuPDF. Instala con: pip install pymupdf")
    sys.exit(1)

RAIZ = Path(__file__).resolve().parents[1]
ORIGEN = RAIZ / "docs" / "CAMBIOS"
DESTINO = RAIZ / "utils"

PDFS: dict[str, str] = {
    "cambios": "cambios.pdf",
    "auditoria": "7 AUDITORÍA DE MANTENIMIENTO ORIENTADA AL PROCESO.pdf",
    "newsletter": "Newsletter_01_2026_Salud_del_Lodo_AQUABIOPROCESS_ACADEMY.pdf",
}


def resolver_pdf(slug: str, archivo: str) -> Path | None:
    ruta = ORIGEN / archivo
    if ruta.exists():
        return ruta
    candidatos = list(ORIGEN.glob("*.pdf"))
    if slug == "auditoria":
        return next((c for c in candidatos if "AUDITOR" in c.name.upper()), None)
    if slug == "newsletter":
        return next(
            (c for c in candidatos if "Newsletter" in c.name or "Salud" in c.name),
            None,
        )
    if slug == "cambios":
        return next((c for c in candidatos if c.name.lower() == "cambios.pdf"), None)
    return None


def extraer_pdf(slug: str, archivo: str) -> None:
    ruta = resolver_pdf(slug, archivo)
    if not ruta:
        print(f"  SKIP {slug}: no esta {archivo}")
        return

    out = DESTINO / slug
    imgs_dir = out / "imagenes"
    imgs_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(ruta)
    paginas_texto: list[str] = []
    imagenes_meta: list[dict] = []
    vistos: set[int] = set()

    for i, page in enumerate(doc):
        texto = page.get_text("text").strip()
        paginas_texto.append(f"## Pagina {i + 1}\n\n{texto}\n")

        for j, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            if xref in vistos:
                continue
            vistos.add(xref)
            try:
                pix = fitz.Pixmap(doc, xref)
                if pix.n > 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                if pix.width < 80 or pix.height < 80:
                    continue
                nombre = f"p{i + 1:02d}-img{j + 1:02d}-{pix.width}x{pix.height}.png"
                destino = imgs_dir / nombre
                pix.save(destino.as_posix())
                imagenes_meta.append(
                    {
                        "archivo": f"imagenes/{nombre}",
                        "pagina": i + 1,
                        "ancho": pix.width,
                        "alto": pix.height,
                        "xref": xref,
                    }
                )
            except Exception as e:  # noqa: BLE001
                print(f"  warn imagen p{i + 1} xref={xref}: {e}")

    (out / "texto.md").write_text(
        f"# {ruta.name}\n\n" + "\n".join(paginas_texto),
        encoding="utf-8",
    )
    (out / "meta.json").write_text(
        json.dumps(
            {
                "slug": slug,
                "origen": ruta.name,
                "paginas": doc.page_count,
                "imagenes": imagenes_meta,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"  {slug}: {doc.page_count} paginas, {len(imagenes_meta)} imagenes -> utils/{slug}/")


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    print(f"Origen: {ORIGEN}")
    print(f"Destino: {DESTINO}")
    for slug, archivo in PDFS.items():
        extraer_pdf(slug, archivo)
    print("Listo. Siguiente: python scripts/preparar-public-cambios.py")


if __name__ == "__main__":
    main()
