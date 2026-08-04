#!/usr/bin/env python3
"""Listen to the PROSE clips and flag any that do not say what they should.

Neural TTS fails silently. Piper renders confident, natural-sounding audio of
the wrong thing; no file is missing, no clip is silent, and validate() passes.
The build has to listen to its own output.

Short clips — the number vocabulary — are already checked and re-rolled inside
gen_audio.py, where a wrong one is a wrong number taught in a confident voice.
This tool covers the other half: hints, error explanations, skill names and UI
lines, scored by word error rate.

TWO DESIGN DECISIONS make the report trustworthy rather than noise:

1. NUMBERS ARE SPELLED OUT ON BOTH SIDES. NEURAL-NARRATION §7.2 is explicit
   that the reference's `words_of()` strips to [a-z0-9' ] with a SUBS table
   covering only 1-10, so whisper's "40" against a reference of "forty" flags
   forever. A fifth of Wonder Lab's corpus flagged for exactly this reason and
   the report became unreadable. In a math app it would be most of it. So the
   normaliser here runs numbers, ordinals, fractions, percent, degrees and unit
   abbreviations through the same form on both sides BEFORE scoring.

2. TWO-STAGE ESCALATION. base.en over everything; only clips above tolerance
   become suspects; small.en re-listens to just those. The small model's own
   mishearings are most of what a single pass reports, and a report that is 70%
   artefact gets skimmed once and then ignored — including the one real defect
   buried in it.

  .venv-tts/bin/python tools/verify_phrases.py
  .venv-tts/bin/python tools/verify_phrases.py --tol 0.3 --since 600
"""
import argparse
import json
import os
import re
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK
os.environ.setdefault('HF_HOME', os.path.join(ROOT, '.work', 'hf'))

sys.path.insert(0, os.path.join(ROOT, 'tools'))
from gen_audio import spoken_key, corpus                 # noqa: E402

AUDIO = os.path.join(ROOT, 'audio')
REPORT = os.path.join(ROOT, 'tools', 'verify-phrases-report.json')

# Spelling variants the recogniser reaches for when the audio is correct.
SUBS = {
    'ok': 'okay', 'dont': 'do not', 'cant': 'can not', 'wont': 'will not',
    'its': 'it is', 'thats': 'that is', 'youre': 'you are', 'theres': 'there is',
    'lets': 'let us', 'isnt': 'is not', 'doesnt': 'does not', 'didnt': 'did not',
    'wouldnt': 'would not', 'couldnt': 'could not', 'cannot': 'can not',
    'practice': 'practice', 'practicing': 'practicing',
    'per cent': 'percent', 'math': 'math',
    'gray': 'gray', 'zero': 'zero',
}
UNITS = {'ft': 'feet', 'in': 'inches', 'lb': 'pounds', 'oz': 'ounces',
         'mi': 'miles', 'yd': 'yards', 'cm': 'centimeters', 'km': 'kilometers',
         'hr': 'hours', 'min': 'minutes', 'sec': 'seconds'}


def words_of(text):
    t = str(text).lower()
    t = t.replace('%', ' percent ').replace('°', ' degrees ').replace('$', ' dollars ')
    t = t.replace('×', ' times ').replace('÷', ' divided by ')
    t = t.replace('−', ' minus ').replace('≥', ' at least ').replace('≤', ' at most ')
    t = re.sub(r'[^a-z0-9/\' ]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    out = []
    for w in t.split():
        w = SUBS.get(w, UNITS.get(w, w))
        out.extend(w.split())
    # spoken_key turns "forty" and "40" into the same token, which is the whole
    # reason this report is readable at all
    return spoken_key(' '.join(out)).split()


def wer(ref, hyp):
    """Levenshtein over word sequences, divided by len(ref)."""
    if not ref:
        return 0.0 if not hyp else 1.0
    prev = list(range(len(hyp) + 1))
    for i, a in enumerate(ref, 1):
        cur = [i]
        for j, b in enumerate(hyp, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a != b)))
        prev = cur
    return prev[-1] / len(ref)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tol', type=float, default=0.34)
    ap.add_argument('--since', type=float, default=0,
                    help='only clips written in the last N seconds')
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    mpath = os.path.join(AUDIO, 'manifest.json')
    if not os.path.exists(mpath):
        print('no audio/manifest.json — run tools/gen_audio.py first')
        return 1
    with open(mpath, encoding='utf-8') as f:
        manifest = json.load(f)

    prose, numbers = corpus()
    # Short vocabulary clips are gen_audio.py's job; this is the prose half.
    keys = [k for k in manifest['words'] if k in prose]
    if args.since:
        cutoff = time.time() - args.since
        keys = [k for k in keys
                if os.path.exists(os.path.join(AUDIO, manifest['words'][k]))
                and os.path.getmtime(os.path.join(AUDIO, manifest['words'][k])) >= cutoff]
    keys.sort()
    if args.limit:
        keys = keys[:args.limit]
    print(f'{len(keys)} prose clip(s) to check')
    if not keys:
        with open(REPORT, 'w') as f:
            json.dump([], f)
        return 0

    from faster_whisper import WhisperModel

    def listen(model, key):
        path = os.path.join(AUDIO, manifest['words'][key])
        if not os.path.exists(path):
            return None, 1.0
        segs, _ = model.transcribe(path, language='en', beam_size=5, vad_filter=False)
        heard = ' '.join(s.text for s in segs).strip()
        return heard, wer(words_of(prose[key]), words_of(heard))

    print('stage 1: base.en over everything')
    base = WhisperModel('base.en', device='cpu', compute_type='int8')
    suspects = []
    for i, k in enumerate(keys, 1):
        heard, e = listen(base, k)
        if e > args.tol:
            suspects.append({'key': k, 'spoken': prose[k], 'first_pass': heard, 'wer': round(e, 3)})
        if i % 100 == 0:
            print(f'  {i}/{len(keys)}, {len(suspects)} suspect so far')
    print(f'stage 1: {len(suspects)} suspect of {len(keys)}')

    survivors = []
    if suspects:
        print(f'stage 2: small.en over the {len(suspects)} suspect(s)')
        small = WhisperModel('small.en', device='cpu', compute_type='int8')
        for s in suspects:
            heard, e = listen(small, s['key'])
            if e > args.tol:
                s['heard'] = heard
                s['wer'] = round(e, 3)
                survivors.append(s)
        print(f'stage 2: {len(suspects) - len(survivors)} were transcription artefacts, '
              f'{len(survivors)} survive')

    with open(REPORT, 'w', encoding='utf-8') as f:
        json.dump(survivors, f, indent=1, ensure_ascii=False)
    for s in survivors[:25]:
        print(f'  WER {s["wer"]:.2f}  {s["spoken"][:64]!r}\n'
              f'          heard {str(s.get("heard"))[:64]!r}')

    print(f'\n{len(survivors)} clip(s) in {os.path.relpath(REPORT, ROOT)}')
    # Gate on the report's CONTENTS, not the exit code — the reference tools all
    # return 0 unconditionally, so a CI check on exit status reports success
    # while the report holds hundreds of suspects.
    return 1 if survivors else 0


if __name__ == '__main__':
    sys.exit(main())
