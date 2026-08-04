#!/usr/bin/env python3
"""Run the real player's resolve() over everything the app can speak.

This is the ship gate. It loads js/audio.js in node with the actual manifest
attached and asks the question the app will ask at runtime: does this string
have its own recording?

  clip      one pre-generated file. The only acceptable answer for prose.
  stitched  several word clips joined. Prose assembled this way sounds like a
            list being read, and RULE 8 forbids it.
  tts       the browser synthesiser. A build defect, not a fallback: a different
            voice on every device, and silent on iOS until a user gesture.

The math delta on the reference's version of this gate: an EXPRESSION has no
clip of its own and never will, because "347 + 288" is one of millions. So
expressions are checked differently — every part numspeak composes them from
must exist in the manifest. A missing part is the same defect as a missing clip;
it just shows up as one word of an answer spoken in a stranger's voice.

  .venv-tts/bin/python tools/audit_resolve.py
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK
os.environ.setdefault('HF_HOME', os.path.join(ROOT, '.work', 'hf'))

JS = r'''
globalThis.fetch = () => Promise.reject();
globalThis.document = { addEventListener() {}, removeEventListener() {},
                        querySelector() { return null; } };
globalThis.location = { hostname: 'localhost', protocol: 'http:', origin: 'http://localhost' };
globalThis.window = globalThis;   // games.js/family.js publish onto it
const fs = require('fs');
const load = f => { const s = fs.readFileSync(f, 'utf8')
  .replace(/^const (\w+)/gm, 'globalThis.$1'); eval(s); };
load('js/schema.js'); load('js/skills.js'); load('js/numspeak.js');
load('js/generators.js'); load('js/manipulatives.js'); load('js/ui-speech.js');
load('js/lessons.js'); load('js/games.js');
const AudioLib = eval(fs.readFileSync('js/audio.js', 'utf8') + '; AudioLib');
AudioLib.manifest = JSON.parse(fs.readFileSync('audio/manifest.json', 'utf8'));

const out = { prose: [], parts: [] };
const seen = new Set();
const proseCheck = t => {
  if (!t || seen.has(t)) return;
  seen.add(t);
  out.prose.push({ t, kind: AudioLib.resolve(t).kind });
};

SKILLS.forEach(s => proseCheck(s.name));
Object.values(STRANDS).forEach(v => proseCheck(v.name));
Object.values(GRADES).forEach(v => proseCheck(v.name));
Object.values(ERRORS).forEach(e => { proseCheck(e.name); proseCheck(e.say); proseCheck(e.fix); });
UI_PHRASES.forEach(proseCheck);
// The lessons are now the largest body of spoken prose in the app. A gate that
// does not cover them is a gate over a third of the text.
const sayStep = t => (typeof t === 'string') ? t
  : [t.do, t.why].filter(Boolean).join(' ');
Object.values(LESSONS).forEach(l => {
  proseCheck(l.anchor);
  proseCheck(l.idea);
  (l.steps || []).forEach(t => proseCheck(sayStep(t)));
  if (l.ex) {
    proseCheck(l.ex.q);
    (l.ex.steps || []).forEach(t => proseCheck(sayStep(t)));
    proseCheck('The answer is ' + l.ex.a);
  }
  if (l.turn) { proseCheck(l.turn.q); proseCheck(l.turn.ask);
                proseCheck(l.turn.a); proseCheck(l.turn.why); }
  proseCheck(l.watch);
});
QUESTS.forEach(q => { proseCheck(q.intro); proseCheck(q.outro); });

// Every part of every composed expression must exist. Sampling every generator
// hard is the point: a number the composer can name but the corpus never
// rendered is a silent hole that only opens on the draw that hits it.
const missing = new Map();
SKILLS.filter(s => GEN[s.id]).forEach(s => {
  const hints = new Set();
  for (let k = 0; k < 300; k++) {
    const p = GEN[s.id](mulberry32(k * 11 + 5));
    if (p.hint) hints.add(p.hint);
    (AudioLib.has(p.q) ? [p.q] : NumSpeak.sayQuestion(p.q)).forEach(part => {
      if (!AudioLib.fileFor(part)) {
        const key = part + '  <-  ' + s.id;
        missing.set(key, (missing.get(key) || 0) + 1);
      }
    });
  }
  if (hints.size <= 4) hints.forEach(proseCheck);
});
out.parts = [...missing.entries()].map(([k, n]) => ({ k, n }));
console.log(JSON.stringify(out));
'''


def main():
    if not os.path.exists(os.path.join(ROOT, 'audio', 'manifest.json')):
        print('no audio/manifest.json — run tools/gen_audio.py first')
        return 1
    js_file = os.path.join(_WORK, 'resolve-audit.js')
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(JS)
    r = subprocess.run(['node', js_file], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print('node failed:\n' + r.stderr[:800])
        return 1
    data = json.loads(r.stdout)

    counts = {}
    bad = []
    for row in data['prose']:
        counts[row['kind']] = counts.get(row['kind'], 0) + 1
        if row['kind'] != 'clip':
            bad.append((row['kind'], row['t']))

    print(f'{len(data["prose"])} prose strings -> {counts}')
    for k, t in bad[:20]:
        print(f'  {k.upper():8} {t[:80]!r}')

    parts = sorted(data['parts'], key=lambda p: -p['n'])
    if parts:
        print(f'\n{len(parts)} expression part(s) with no clip:')
        for p in parts[:25]:
            print(f'  {p["n"]:>5}×  {p["k"]}')

    if bad or parts:
        print(f'\n{len(bad)} prose string(s) and {len(parts)} expression part(s) '
              'would not play from a recording.')
        return 1
    print('every prose string has its own clip; every expression part exists')
    return 0


if __name__ == '__main__':
    sys.exit(main())
