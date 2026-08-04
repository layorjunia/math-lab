#!/usr/bin/env python3
"""Stamp a build id into the app so devices can detect a stale copy.

An installed service worker plus edge HTML caching can leave a deployed change
invisible on a device for hours. The app compares the id baked into the page
against version.json fetched no-store, and on a mismatch clears its own caches
and reloads once.

STAMP BEFORE THE COMMIT. Stamp after and `meta` and version.json still agree
with each other, the update check finds no mismatch, and every installed device
keeps running the previous build indefinitely with no error anywhere.

  python3 tools/stamp_version.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK          # never the system temp dir

CACHE_PREFIX = 'mathlab'


def rewrite(path, subs):
    """Read fully, THEN open for write.

    `open(f,'w').write(open(f).read())` truncates before it reads — that
    emptied sw.js to zero bytes in a sibling project and got pushed twice.
    """
    with open(path, encoding='utf-8') as f:
        text = f.read()
    for pattern, repl in subs:
        text = re.sub(pattern, repl, text)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    return text


def main():
    rev = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROOT,
                         capture_output=True, text=True).stdout.strip() or 'dev'
    stamp = subprocess.run(['date', '+%Y%m%d-%H%M'],
                           capture_output=True, text=True).stdout.strip()
    build = f'{stamp}-{rev}'

    with open(os.path.join(ROOT, 'version.json'), 'w', encoding='utf-8') as f:
        json.dump({'build': build}, f)

    html = rewrite(os.path.join(ROOT, 'index.html'), [
        (r'<meta name="build" content="[^"]*">', f'<meta name="build" content="{build}">'),
        (r'\.js\?v=[^"]*"', f'.js?v={build}"'),
        (r'style\.css\?v=[^"]*"', f'style.css?v={build}"'),
    ])
    if 'name="build"' not in html:
        raise SystemExit('index.html has no <meta name="build"> — the update '
                         'self-heal cannot work without it')

    rewrite(os.path.join(ROOT, 'sw.js'),
            [(r"const CACHE = '[^']*';", f"const CACHE = '{CACHE_PREFIX}-{build}';")])

    # Every versioned asset must actually carry the new id. A ?v= the regex did
    # not reach is a file that stays cached forever, and nothing else notices.
    stale = [m for m in re.findall(r'\?v=([^"]*)', html) if m != build]
    if stale:
        raise SystemExit(f'{len(stale)} asset URL(s) still on an old build id: '
                         f'{sorted(set(stale))[:5]} — add a re.sub above')

    print('build', build)
    return 0


if __name__ == '__main__':
    sys.exit(main())
