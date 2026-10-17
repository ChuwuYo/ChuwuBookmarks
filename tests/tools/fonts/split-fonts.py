#!/usr/bin/env python3
"""Split the site fonts into unicode-range slices and write assets/css/fonts.css.

Usage (Python 3.9+, `pip install fonttools brotli`):
    python3 tests/tools/fonts/split-fonts.py

Non-ideographs stay together in one "common" slice: kerning, punctuation
spacing (halt) and grapheme clusters only work within one font file.

FreeType's auto-hinter, used by Chromium on Linux, derives the CJK alignment
zones of a font from the median outline extremes of a few reference ideographs
and its stem widths from 田 (src/autofit/afblue.dat, afscript.h, afcjk.c). Every
slice therefore also carries, in its cmap but not in its unicode-range, 田 and
a small set of those reference ideographs that gives the same medians as the
whole font; without them a slice renders with different pixels. The reference
characters of the other scripts are all in the common slice.
"""

import json
import shutil
import tempfile
from itertools import product
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = HERE / "source"
FONTS_DIR = ROOT / "assets" / "fonts"
CSS_FILE = ROOT / "assets" / "css" / "fonts.css"
SLICE_SIZE = 500

FONTS = [
    ("LXGW WenKai", "LXGWWenKai-Medium.woff2", "LXGWWenKai-Medium"),
    ("DingTalk JinBuTi", "DingTalk-JinBuTi.woff2", "DingTalk-JinBuTi"),
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


CJK_STANDARD = "田囗"
# (fill characters, flat characters, axis, take the maximum) per CJK blue string
CJK_BLUES = [
    (
        "他们你來們到和地对對就席我时時會来為能舰說说这這齊",
        "军同已愿既星是景民照现現理用置要軍那配里開雷露面顾",
        1,
        True,
    ),
    (
        "个为人他以们你來個們到和大对對就我时時有来為要說说",
        "主些因它想意理生當看着置者自著裡过还进進過道還里面",
        1,
        False,
    ),
    (
        "些们你來們到和地她将將就年得情最样樣理能說说这這通",
        "即吗吧听呢品响嗎师師收断斷明眼間间际陈限除陳随際隨",
        0,
        False,
    ),
    (
        "事前學将將情想或政斯新样樣民沒没然特现現球第經谁起",
        "例別别制动動吗嗎增指明朝期构物确种調调費费那都間间",
        0,
        True,
    ),
]


def outline_extremes(font):
    """Map each codepoint of the CJK blue strings to its outline extremes."""
    glyf = font["glyf"]
    cmap = font.getBestCmap()
    extremes = {}
    for fills, flats, _, _ in CJK_BLUES:
        for ch in fills + flats:
            name = cmap.get(ord(ch))
            if name is None:
                continue
            coords, ends, _ = glyf[name].getCoordinates(glyf)
            if len(coords) <= 2:
                continue
            points = []
            first = 0
            for last in ends:
                if last > first:
                    points += coords[first : last + 1]
                first = last + 1
            if points:
                extremes[ord(ch)] = (
                    (min(x for x, _ in points), max(x for x, _ in points)),
                    (min(y for _, y in points), max(y for _, y in points)),
                )
    return extremes


def blue_medians(cps, extremes):
    """Return the fill and flat medians af_cjk_metrics_init_blues takes per string."""
    medians = []
    for fills, flats, axis, top in CJK_BLUES:
        for chars in (fills, flats):
            values = sorted(
                extremes[ord(ch)][axis][1 if top else 0]
                for ch in chars
                if ord(ch) in cps and ord(ch) in extremes
            )
            medians.append(values[len(values) // 2] if values else None)
    return medians


def median_fix(values, target, pools):
    """Return how many values below, equal to and above target to add."""
    best = None
    below = sum(v < target for v in values)
    equal = sum(v == target for v in values)
    above = len(values) - below - equal
    for add in product(*(range(len(pool) + 1) for pool in pools)):
        a, e, b = below + add[0], equal + add[1], above + add[2]
        if a <= (a + e + b) // 2 < a + e and (best is None or sum(add) < sum(best)):
            best = add
    return best


def autohint_reference(cps, cmap_cps, extremes):
    """Pick the reference ideographs a slice needs to hint like the whole font."""
    target = blue_medians(cmap_cps, extremes)
    standard = next((cp for cp in map(ord, CJK_STANDARD) if cp in cmap_cps), None)
    extra = {standard} if standard is not None and standard not in cps else set()
    usage = {}
    for fills, flats, _, _ in CJK_BLUES:
        for ch in fills + flats:
            usage[ord(ch)] = usage.get(ord(ch), 0) + 1
    strings = [
        (chars, axis, top)
        for fills, flats, axis, top in CJK_BLUES
        for chars in (fills, flats)
    ]
    parts = [(*string, goal) for string, goal in zip(strings, target) if goal is not None]
    for _ in range(4 * len(parts)):
        have = (cps | extra) & cmap_cps
        if blue_medians(have, extremes) == target:
            return extra
        for chars, axis, top, goal in parts:
            listed = [ord(ch) for ch in chars if ord(ch) in extremes]
            values = {cp: extremes[cp][axis][1 if top else 0] for cp in listed}
            present = [values[cp] for cp in listed if cp in have]
            spare = sorted(
                (cp for cp in listed if cp not in have), key=lambda cp: (usage[cp], cp)
            )
            if not present and not spare:
                continue
            pools = (
                [cp for cp in spare if values[cp] < goal],
                [cp for cp in spare if values[cp] == goal],
                [cp for cp in spare if values[cp] > goal],
            )
            add = median_fix(present, goal, pools)
            if add and any(add):
                for pool, count in zip(pools, add):
                    extra.update(pool[:count])
                break
    every = {ord(ch) for fills, flats, _, _ in CJK_BLUES for ch in fills + flats}
    return (extra | every) & cmap_cps


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
    css = [
        "/* Generated by tests/tools/fonts/split-fonts.py. Do not edit by hand. */",
        "",
    ]
    with tempfile.TemporaryDirectory() as tmp:
        for family, filename, folder in FONTS:
            original = TTFont(str(SOURCE / filename))
            cmap_cps = set(original.getBestCmap())
            extremes = outline_extremes(original)
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
                extra = autohint_reference(cps, cmap_cps, extremes)
                subset_font(src, dest, cps | extra)
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
    CSS_FILE.write_text("\n".join(css))


def unicode_range_line(ranges):
    """Return the unicode-range declaration as Biome formats it (line width 80)."""
    line = f"\tunicode-range: {ranges};"
    if len(line.expandtabs(2)) <= 80:
        return line
    return f"\tunicode-range:\n\t\t{ranges};"


if __name__ == "__main__":
    main()
