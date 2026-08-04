#!/usr/bin/env python3
"""Build a page that plays every clip the machine flagged, for a human ear.

NEURAL-NARRATION 7.6: the verify reports are worklists, not gates. The bar is
"every remaining entry has been listened to and judged correct" — and some of
them can only ever be settled that way, because "cent" and "sent" are
homophones and no recogniser will ever separate them without context.

  python3 tools/build_listen_page.py
"""
import json
import os
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK

REPORT = os.path.join(ROOT, 'tools', 'audio-suspect-report.json')
OUT = os.path.join(ROOT, '.work', 'listen.html')

# Pairs the recogniser cannot separate in isolation. Flagged for information,
# not dismissed — the ear still decides.
HOMOPHONE = {'cent': 'sent', 'cents': 'sense', 'quarts': 'courts',
             'gallon': 'Galen', 'pint': 'point', 'quart': 'court'}


def main():
    rows = json.load(open(REPORT)) if os.path.exists(REPORT) else []
    manifest = json.load(open(os.path.join(ROOT, 'audio', 'manifest.json')))
    cards = []
    for r in rows:
        rel = manifest['words'].get(r['key'])
        if not rel:
            continue
        note = ''
        h = HOMOPHONE.get(r['spoken'])
        if h:
            note = (f'<p class="note">Near-homophone of &ldquo;{h}&rdquo; — the '
                    f'recogniser cannot separate these without context, so this '
                    f'may well be correct.</p>')
        cards.append(f'''<div class="c">
  <div class="w">{r["spoken"]}</div>
  <p class="h">machine heard: <b>{r.get("heard")}</b></p>{note}
  <audio controls preload="none" src="../audio/{rel}"></audio>
</div>''')

    html = f'''<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Clips to listen to</title><style>
body{{font:16px/1.5 -apple-system,system-ui,sans-serif;background:#12161c;color:#e9eef4;
     margin:0;padding:24px;max-width:760px;margin:0 auto}}
h1{{font-size:1.6rem}} .lede{{color:#93a3b5;max-width:60ch}}
.c{{background:#191f28;border:1px solid #2c3846;border-left:3px solid #ffb43d;
   border-radius:14px;padding:14px;margin:12px 0}}
.w{{font-size:1.4rem;font-weight:800}}
.h{{color:#93a3b5;font-size:.9rem;margin:4px 0 8px}}
.h b{{color:#ff7d6b}}
.note{{color:#93a3b5;font-size:.85rem;margin:0 0 8px;font-style:italic}}
audio{{width:100%}}
</style></head><body>
<h1>Clips the machine could not vouch for</h1>
<p class="lede">{len(cards)} of {len(manifest["words"])} clips. Play each one. If it says
the word at the top, it is fine — the recogniser mishears correct audio
constantly, and some of these are homophones it can never settle. If it says
something else, tell Claude the word and it will be re-cut from a carrier
sentence.</p>
{''.join(cards) if cards else '<p class="lede">Nothing flagged.</p>'}
</body></html>'''
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'{len(cards)} clip(s) -> {os.path.relpath(OUT, ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
