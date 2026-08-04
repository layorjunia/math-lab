#!/usr/bin/env python3
"""Splice rewritten lessons into js/lessons.js.

The lessons are authored as JSON batches in .work/ and written into the shipped
file by this tool, so the formatting is uniform and a half-finished batch cannot
leave the file syntactically broken.

  python3 tools/apply_lessons.py .work/lessons-npv.json
"""
import json
import os
import re
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK

TARGET = os.path.join(ROOT, 'js', 'lessons.js')


def js(v):
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, dict):
        items = [(k, x) for k, x in v.items() if x not in ('', None)]
        return '{ ' + ', '.join(f'{k}: {js(x)}' for k, x in items) + ' }'
    raise TypeError(v)


def block(sid, d):
    out = [f"'{sid}': {{", f"  anchor: {js(d['anchor'])},", f"  idea: {js(d['idea'])},",
           '  steps: [']
    out += ['    ' + js(s) + ',' for s in d['steps']]
    out += ['  ],', '  ex: {', '    q: ' + js(d['ex']['q']) + ',', '    steps: [']
    out += ['      ' + js(s) + ',' for s in d['ex']['steps']]
    out += ['    ],', '    a: ' + js(d['ex']['a']) + ',', '  },',
            '  turn: ' + js(d['turn']) + ',', '  watch: ' + js(d['watch']) + ',', '},']
    return '\n'.join(out)


REQUIRED = ('anchor', 'idea', 'steps', 'ex', 'turn', 'watch')


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = open(TARGET, encoding='utf-8').read()
    total = 0
    for path in sys.argv[1:]:
        batch = json.load(open(path, encoding='utf-8'))
        for sid, d in batch.items():
            missing = [k for k in REQUIRED if not d.get(k)]
            if missing:
                print(f'  {sid}: missing {missing} — skipped')
                continue
            # Interpolation can never have a clip (RULE 5); refuse to write it.
            flat = json.dumps(d, ensure_ascii=False)
            if '${' in flat:
                print(f'  {sid}: contains a template literal — skipped')
                continue
            m = re.search(r"^'" + re.escape(sid) + r"': \{.*?^\},\n", src, re.S | re.M)
            if not m:
                print(f'  {sid}: not found in lessons.js — skipped')
                continue
            src = src[:m.start()] + block(sid, d) + '\n' + src[m.end():]
            total += 1
    open(TARGET, 'w', encoding='utf-8').write(src)
    print(f'{total} lesson(s) rewritten')
    return 0


if __name__ == '__main__':
    sys.exit(main())
