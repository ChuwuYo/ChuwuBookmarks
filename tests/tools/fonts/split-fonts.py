#!/usr/bin/env python3
"""Split LXGW WenKai Medium into unicode-range slices.

Development-only tool; the site itself stays zero-build. It reads the original
font file from tests/tools/fonts/source/, writes the slices to
assets/fonts/<name>/ and the matching @font-face rules to assets/css/fonts.css.
DingTalk JinBuTi (assets/fonts/DingTalk-JinBuTi.woff2, declared in base.css)
stays one file: sliced, it rendered a few pixels differently in Chromium.

Slicing: every codepoint in a font's cmap goes to exactly one slice.
1. "common": every codepoint that is not a CJK ideograph (Latin, Greek,
   Cyrillic, kana, punctuation, symbols, combining marks). These characters
   take part in kerning, punctuation spacing (halt) and grapheme clusters
   with each other, which only work when they come from the same font file,
   so they stay together.
2. "han-NN": CJK ideographs in frequency order, taken from Google Fonts'
   Chinese slicing (google-cjk-sc-ranges.json, applied from its last, most
   frequent entry to the first). Consecutive Google slices are merged until a
   slice holds at least SLICE_SIZE ideographs, which keeps the per-file
   overhead (see below) small. Ideographs outside those ranges follow in
   codepoint order, SLICE_SIZE per slice.

Every slice also carries the glyphs from autohint-reference.txt that belong to
its own characters' scripts (ideograph slices: the ideographs in the list;
"common": all of them), only in its cmap, not in its unicode-range. FreeType's
auto-hinter, used by Chromium on Linux, derives a font's alignment zones from
these characters; without them a slice would be hinted differently from the
original font and render with slightly different pixels. The list holds the
blue-zone and standard characters of the FreeType auto-hinter
(src/autofit/afblue.dat and afscript.h).

Empty slices are skipped. The unicode-range lists may span codepoints the font
does not contain (see format_range). Each slice keeps all layout features,
hinting, name records and metrics of the original font.

Usage (Python 3.9+, `pip install fonttools brotli`):
    python3 tests/tools/fonts/split-fonts.py
"""

import json
import shutil
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = HERE / "source"
FONTS_DIR = ROOT / "assets" / "fonts"
CSS_FILE = ROOT / "assets" / "css" / "fonts.css"
SLICE_SIZE = 500

# family name in CSS, source file, output folder
FONTS = [
    ("LXGW WenKai", "LXGWWenKai-Medium.woff2", "LXGWWenKai-Medium"),
]


def parse_range(text):
    cps = set()
    for part in text.split(","):
        part = part.strip()[2:]
        start, _, end = part.partition("-")
        start = int(start, 16)
        cps.update(range(start, (int(end, 16) if end else start) + 1))
    return cps


def format_range(cps, cmap_cps):
    """Format codepoints as a unicode-range list.

    Neighbouring runs are joined across codepoints the font does not contain at
    all: the browser falls back for those either way, and the list stays short.
    """
    cps = sorted(cps)
    out = []
    i = 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and not any(
            cp in cmap_cps for cp in range(cps[j] + 1, cps[j + 1])
        ):
            j += 1
        out.append(f"U+{cps[i]:x}" if i == j else f"U+{cps[i]:x}-{cps[j]:x}")
        i = j + 1
    return ", ".join(out)


HAN_RANGES = [(0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xF900, 0xFAFF), (0x20000, 0x3FFFF)]


def is_han(cp):
    return any(start <= cp <= end for start, end in HAN_RANGES)


def plan_slices(cmap_cps, ranges):
    common = {cp for cp in cmap_cps if not is_han(cp)}
    remaining = set(cmap_cps) - common
    planned = [("common", common)] if common else []
    # Google's slices, most frequent first, merged up to SLICE_SIZE codepoints
    groups = []
    current = set()
    for entry in reversed(ranges):
        part = remaining & parse_range(entry["unicodeRange"])
        remaining -= part
        current |= part
        if len(current) >= SLICE_SIZE:
            groups.append(current)
            current = set()
    if current:
        groups.append(current)
    rest = sorted(remaining)
    groups += [set(rest[i : i + SLICE_SIZE]) for i in range(0, len(rest), SLICE_SIZE)]
    planned += [(f"han-{n:02d}", group) for n, group in enumerate(groups)]
    return planned


def subset_font(src, dest, cps):
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.name_legacy = True
    options.notdef_outline = True
    options.glyph_names = False
    options.legacy_cmap = True
    options.symbol_cmap = True
    options.hinting = True
    options.drop_tables = []
    options.prune_unicode_ranges = False
    options.prune_codepage_ranges = False
    options.recalc_bounds = False
    options.recalc_timestamp = False
    font = subset.load_font(str(src), options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(cps))
    subsetter.subset(font)
    subset.save_font(font, str(dest), options)


def main():
    ranges = json.loads((HERE / "google-cjk-sc-ranges.json").read_text())
    reference = {ord(ch) for ch in (HERE / "autohint-reference.txt").read_text()}
    css = [
        "/* Generated by tests/tools/fonts/split-fonts.py. Do not edit by hand. */",
        "",
    ]
    tmp = tempfile.mkdtemp()
    for family, filename, folder in FONTS:
        # Decode the woff2 once; subsetting from a plain TTF is much faster.
        original = TTFont(str(SOURCE / filename))
        cmap_cps = set(original.getBestCmap())
        original.flavor = None
        src = Path(tmp) / f"{folder}.ttf"
        original.save(str(src))
        out_dir = FONTS_DIR / folder
        shutil.rmtree(out_dir, ignore_errors=True)
        out_dir.mkdir(parents=True)
        planned = plan_slices(cmap_cps, ranges)
        covered = set()
        for name, cps in planned:
            assert not (covered & cps), f"{family}: overlapping slice {name}"
            covered |= cps
            dest = out_dir / f"{name}.woff2"
            extra = reference if name == "common" else {cp for cp in reference if is_han(cp)}
            subset_font(src, dest, cps | (extra & cmap_cps))
            # A slice may map a few extra codepoints whose glyphs it keeps for
            # layout features; unicode-range decides which slice is used.
            got = set(TTFont(str(dest)).getBestCmap())
            assert cps <= got, f"{family}: slice {name} is missing codepoints"
            css += [
                "@font-face {",
                f'\tfont-family: "{family}";',
                f'\tsrc: url("../fonts/{folder}/{name}.woff2") format("woff2");',
                "\tfont-display: swap;",
                unicode_range_line(format_range(cps, cmap_cps)),
                "}",
                "",
            ]
        assert covered == cmap_cps, f"{family}: coverage mismatch"
        print(f"{family}: {len(cmap_cps)} codepoints in {len(planned)} slices")
    shutil.rmtree(tmp, ignore_errors=True)
    CSS_FILE.write_text("\n".join(css))


def unicode_range_line(ranges):
    """Return the unicode-range declaration as Biome formats it (line width 80)."""
    line = f"\tunicode-range: {ranges};"
    if len(line.expandtabs(2)) <= 80:
        return line
    return f"\tunicode-range:\n\t\t{ranges};"


if __name__ == "__main__":
    main()
