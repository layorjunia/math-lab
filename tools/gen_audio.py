#!/usr/bin/env python3
"""Render every narratable Math Lab string to a neural-voice clip.

  .venv-tts/bin/python tools/gen_audio.py            # incremental
  .venv-tts/bin/python tools/gen_audio.py --clean    # start over

THE CORPUS COMES FROM NODE, NOT FROM A REGEX. The reference implementation
scrapes quoted strings out of JS source as raw text, which mis-pairs quotes on
every apostrophe in the prose. Here the data files are evaluated properly and
walked by field name, so a renamed field raises instead of silently halving the
corpus. numspeak.js is asked for its own vocabulary the same way — there is no
Python twin of the number composer to drift out of step with the one the app
actually runs.

TWO KINDS OF CLIP, and the difference is the whole point of this file:

  PROSE — a hint, an error explanation, a skill name, a UI line. Fixed, finite,
  one clip each, keyed by the normalized text as DISPLAYED. Rendered once and
  trusted: Piper is reliable on connected speech.

  SHORT WORDS — the number vocabulary. "three", "six", "forty", "plus". These
  are what a math app is made of and they are exactly where Piper drifts,
  because the model has almost no context to condition on. MEASURED on this
  voice before writing this file: rendered in isolation, "three" came back as
  "FREE!" and "six" as "Sex."; re-rolled across the six documented length_scale
  values, "three" was wrong on 3 of 6 draws and "plus" and "times" on 1 of 6.
  Nothing was unfixable, so the fix is cheap: render, listen with
  faster-whisper, and re-roll until it transcribes back correctly.

  That loop already existed — PiperEngine.speak_word_verified — and was called
  by nothing in either sibling app. It is called here.

A short clip that survives every re-roll is reported, not shipped quietly. In a
reading app a drifted clip is a mispronounced word; here it is the app saying
the wrong number in a confident voice, which is worse than saying nothing.
"""
import argparse
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK
os.environ.setdefault('HF_HOME', os.path.join(ROOT, '.work', 'hf'))
os.environ.setdefault('PIPER_BITRATE', '48000')   # short clips want a crisp attack

sys.path.insert(0, os.path.join(ROOT, 'tools'))
from speech_forms import for_speech                      # noqa: E402
from tts_engines import get_engine                       # noqa: E402

AUDIO = os.path.join(ROOT, 'audio')
MANIFEST = os.path.join(AUDIO, 'manifest.json')

# Must match AudioLib.norm in js/audio.js character for character. A divergence
# is not an error — it is a lookup miss, and one line speaks in the browser
# voice with nothing logged. tools/check_norm.py proves it.
EMOJI_RE = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️‍]')


def norm(text):
    t = str(text).lower().replace('‘', "'").replace('’', "'")
    t = EMOJI_RE.sub('', t)
    return re.sub(r'\s+', ' ', t).strip()


# ── corpus ───────────────────────────────────────────────────────────────
_DUMP = r'''
globalThis.window = globalThis;   // games.js/family.js publish onto it
const fs = require('fs');
// /gm, not /m: several of these files declare more than one top-level const,
// and a non-global replace only reaches the first one.
const load = f => { const s = fs.readFileSync(f, 'utf8')
  .replace(/^const (\w+)/gm, 'globalThis.$1'); eval(s); };
load('js/schema.js'); load('js/skills.js'); load('js/numspeak.js');
load('js/generators.js'); load('js/manipulatives.js'); load('js/ui-speech.js');
load('js/lessons.js'); load('js/games.js');

const prose = new Set(), add = t => { if (t && String(t).trim()) prose.add(String(t)); };

SKILLS.forEach(s => add(s.name));
Object.values(STRANDS).forEach(v => add(v.name));
Object.values(GRADES).forEach(v => add(v.name));
// The error explanations are the highest-value text in the app: what went
// wrong, and the one step that fixes it.
Object.values(ERRORS).forEach(e => { add(e.name); add(e.say); add(e.fix); });
UI_PHRASES.forEach(add);

// The lessons. This is the largest and most important prose in the app — the
// idea, the method, the worked example and the trap — and it is all authored
// literals, so every line of it can have a clip.
Object.values(LESSONS).forEach(l => {
  add(l.idea);
  (l.steps || []).forEach(add);
  if (l.ex) { add(l.ex.q); (l.ex.steps || []).forEach(add); }
  add(l.watch);
});

// The quest framing. Twelve Listen buttons pointed at strings that were never
// rendered, because this file did not know games.js existed — caught by
// audit_resolve.py, which is the whole reason that gate is run.
QUESTS.forEach(q => { add(q.intro); add(q.outro); });

// Hints and fixed question text are literals inside the generators, so the only
// honest way to enumerate them is to run the generators. Anything that varies
// across draws is interpolated and can never have a clip (RULE 5) — it is
// counted and reported rather than silently dropped.
const varying = [];
SKILLS.filter(s => GEN[s.id]).forEach(s => {
  const hints = new Set(), qs = new Set();
  for (let k = 0; k < 400; k++) {
    const p = GEN[s.id](mulberry32(k * 7 + 1));
    if (p.hint) hints.add(p.hint);
    qs.add(p.q);
  }
  if (hints.size > 4) varying.push({ id: s.id, field: 'hint', n: hints.size });
  else hints.forEach(add);
  // A question whose text is the same every draw is a real string worth a clip.
  // One that changes is an expression, and numspeak composes it at runtime.
  if (qs.size <= 3) qs.forEach(add);
});

console.log(JSON.stringify({
  prose: [...prose],
  numbers: NumSpeak.vocabulary(),
  varying,
}));
'''


def corpus():
    """({key: spoken}, {key: spoken}) — prose and short-word vocabularies."""
    r = subprocess.run(['node', '-e', _DUMP], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit('node dump failed:\n' + r.stderr[:1200])
    data = json.loads(r.stdout)

    if data['varying']:
        for v in data['varying']:
            print(f'  INTERPOLATED {v["id"]}.{v["field"]}: {v["n"]} variants — '
                  'no clip is possible, make it generic (RULE 5)')
        raise SystemExit(f'{len(data["varying"])} interpolated spoken string(s)')

    prose, numbers = {}, {}
    for t in data['prose']:
        k = norm(t)
        if k:
            prose[k] = for_speech(t)
    for w in data['numbers']:
        k = norm(w)
        if k:
            numbers[k] = w          # already a spoken form; nothing to convert
    # A word that is also a prose line gets one clip, and the number
    # vocabulary owns it — those are the ones that get the verified loop.
    for k in numbers:
        prose.pop(k, None)
    return prose, numbers


def clip_path(key):
    return os.path.join('p', hashlib.md5(key.encode('utf-8')).hexdigest()[:12] + '.m4a')


# ── validation ───────────────────────────────────────────────────────────
def duration(path):
    r = subprocess.run(['afinfo', path], capture_output=True, text=True)
    m = re.search(r'estimated duration: ([\d.]+)', r.stdout)
    return float(m.group(1)) if m else 0.0


def clip_energy(path):
    """(peak, seconds above amplitude 1500).

    A clip can have the right name, the right size and the right duration and
    still be digital silence — a stop consonant with nothing after it makes no
    sound at all. Duration alone never caught that. The reference runs this over
    310 phoneme clips and nothing else; here it runs over everything new.
    """
    import wave
    import numpy as np
    wav = tempfile.mktemp(suffix='.wav')
    try:
        r = subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@22050',
                            '-c', '1', path, wav], capture_output=True, text=True)
        if r.returncode != 0:
            return 0, 0.0
        with wave.open(wav, 'rb') as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
        if a.size == 0:
            return 0, 0.0
        return int(np.abs(a).max()), float((np.abs(a) > 1500).sum()) / 22050.0
    finally:
        if os.path.exists(wav):
            os.unlink(wav)


def validate(manifest, check_energy):
    problems = []
    for key, rel in manifest['words'].items():
        path = os.path.join(AUDIO, rel)
        if not os.path.exists(path):
            problems.append(f'missing file for {key[:60]!r}')
            continue
        if os.path.getsize(path) < 900:
            problems.append(f'tiny file ({os.path.getsize(path)}b) for {key[:60]!r}')
            continue
        if key in check_energy:
            peak, loud = clip_energy(path)
            if peak < 9000 or loud < 0.04:
                problems.append(f'silent/quiet clip (peak {peak}, {loud:.2f}s) for {key[:60]!r}')
            elif duration(path) < 0.18:
                problems.append(f'clip under 0.18s for {key[:60]!r}')
    return problems


# ── the listener: does this clip say what it should? ─────────────────────
NUM_WORDS = ('zero one two three four five six seven eight nine ten eleven twelve '
             'thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty '
             'thirty forty fifty sixty seventy eighty ninety hundred thousand '
             'million billion').split()
DIGIT = {w: str(i) for i, w in enumerate(NUM_WORDS[:20])}
DIGIT.update({'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
              'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90',
              'hundred': '100', 'thousand': '1000', 'million': '1000000'})


DENOM_WORD = {'half': 2, 'halves': 2, 'third': 3, 'thirds': 3, 'fourth': 4,
              'fourths': 4, 'quarter': 4, 'quarters': 4, 'fifth': 5, 'fifths': 5,
              'sixth': 6, 'sixths': 6, 'seventh': 7, 'sevenths': 7,
              'eighth': 8, 'eighths': 8, 'ninth': 9, 'ninths': 9,
              'tenth': 10, 'tenths': 10, 'eleventh': 11, 'elevenths': 11,
              'twelfth': 12, 'twelfths': 12, 'sixteenth': 16, 'sixteenths': 16,
              'twentieth': 20, 'twentieths': 20, 'fiftieth': 50, 'fiftieths': 50,
              'hundredth': 100, 'hundredths': 100,
              'thousandth': 1000, 'thousandths': 1000}


def spoken_key(text):
    """Normalise a phrase so a spelled number and a numeral compare equal.

    faster-whisper writes "forty" as "40" and "three fourths" as "3/4".
    Comparing spellings would flag every single number clip, and a report that
    is mostly noise gets skimmed once and then ignored — which is worse than no
    report at all, because the one real defect is buried in it.
    """
    t = re.sub(r'[^a-z0-9/ ]', ' ', str(text).lower())
    t = re.sub(r'\s+', ' ', t).strip()
    # "three fourths" and "3/4" have to land on the same string, or every one of
    # the ~150 fraction clips flags forever.
    t = re.sub(r'\b(\d+|[a-z]+) (' + '|'.join(DENOM_WORD) + r')\b',
               lambda m: f'{DIGIT.get(m.group(1), m.group(1))}/{DENOM_WORD[m.group(2)]}', t)
    t = t.replace(' / ', '/')
    words = []
    for w in t.split():
        words.append(DIGIT.get(w, w))
    joined = ' '.join(words)
    # "twenty-one" -> "20 1" -> 21 ; "one hundred" -> "1 100" -> 100
    joined = re.sub(r'\b(\d0) (\d)\b', lambda m: str(int(m.group(1)) + int(m.group(2))), joined)
    joined = re.sub(r'\b(\d+) 100\b', lambda m: str(int(m.group(1)) * 100), joined)
    joined = re.sub(r'\b(\d+) 1000\b', lambda m: str(int(m.group(1)) * 1000), joined)
    joined = re.sub(r'\b(\d+) (\d+)\b',
                    lambda m: str(int(m.group(1)) + int(m.group(2)))
                    if int(m.group(1)) % 100 == 0 and int(m.group(2)) < 100 else m.group(0),
                    joined)
    # faster-whisper writes a spoken fraction as a digit ordinal: "eight
    # sixteenths" comes back as "8-16th", "18-20th's", "11 9th". Without this
    # 165 of the 179 first-run suspects were this one artifact, and a report
    # that is 90% artifact is a report nobody reads.
    joined = re.sub(r'\b(\d+)[\s-]+(\d+)(?:st|nd|rd|th)s?\'?s?\b', r'\1/\2', joined)
    return joined


def numeric_match(expected, heard):
    """Accept the shapes whisper writes for a number, and nothing looser.

    Deliberately NOT a blanket "strip every separator and compare": that would
    let a clip saying "eighty-four" pass as "eight fourths", since both collapse
    to 84. These two rules are exact.
    """
    want, got = spoken_key(expected), spoken_key(heard)
    if want == got:
        return True
    digits = re.findall(r'\d+', got)
    # A fraction: "eight fourths" -> 8/4, and whisper writes "8-4", "8 4th",
    # "8-4ths" — two separate numbers in the same order.
    m = re.fullmatch(r'(\d+)/(\d+)', want)
    if m and digits == [m.group(1), m.group(2)]:
        return True
    # A compound integer: "eighty-one" -> 81, and whisper writes "8-1".
    if re.fullmatch(r'\d+', want) and ''.join(digits) == want:
        return True
    return False


ALIASES = {
    'oh': {'oh', '0', 'o'}, 'zero': {'0', 'zero'},
    'one': {'1', 'one', 'won'}, 'two': {'2', 'two', 'too', 'to'},
    'four': {'4', 'four', 'for'}, 'eight': {'8', 'eight', 'ate'},
    'and': {'and'}, 'point': {'point'}, 'over': {'over'},
    'a m': {'am', 'a m'}, 'p m': {'pm', 'p m'},
    "o'clock": {'oclock', "o'clock"},
    'equals': {'equals', 'equal'},
    'to': {'to', '2', 'too'},
    'is': {'is'},
}


CARRIERS = [
    'We can say {w} again today.',
    'The word {w} is on this page.',
    'She said {w} and then smiled.',
    'I like the word {w} very much.',
]


def rescue(engine, listener, text, out_path):
    """Cut the word out of a spoken sentence.

    Piper drifts on very short inputs because the model has almost no context to
    condition on, and no amount of re-rolling shakes some of them loose: `ounce`
    came out "bounce" and `quart` came out "report" on every draw. The same
    words are perfect inside a sentence.

    So: synthesise a carrier with the word MID-SENTENCE (a sentence-final word
    gets a clipped, falling delivery), ask the recogniser for word timestamps,
    and cut the target out. The cut is then re-checked ON ITS OWN and only kept
    if it passes — without that, a merged word earlier in the carrier silently
    overwrites the clip with something else entirely, which is a worse failure
    than the one being fixed.
    """
    import numpy as np
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    voice = engine.voice
    target = str(text).strip().lower()
    ntok = len(target.split())

    for carrier in CARRIERS:
        for ls in (1.0, 1.15, 0.92):
            cs = list(voice.synthesize(carrier.format(w=target),
                                       syn_config=SynthesisConfig(length_scale=ls)))
            audio = np.concatenate([np.frombuffer(c.audio_int16_bytes, dtype=np.int16)
                                    for c in cs])
            sr = cs[0].sample_rate
            wav = tempfile.mktemp(suffix='.wav')
            with wave.open(wav, 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
                w.writeframes(audio.tobytes())
            segs, _ = listener.m.transcribe(wav, language='en', beam_size=5,
                                            vad_filter=False, word_timestamps=True)
            stamps = [x for sg in segs for x in (sg.words or [])]
            os.unlink(wav)
            if not stamps:
                continue
            words = [x.word.strip().lower().strip(".,!?\'\"") for x in stamps]
            first = target.split()[0]
            idx = next((i for i, w in enumerate(words) if w == first), None)
            if idx is None:
                # Some words the recogniser never spells back correctly. Fall
                # back to the word's SLOT in the carrier, so the cut is driven by
                # position rather than by the recogniser agreeing with us.
                slot = carrier.split().index('{w}')
                idx = slot if slot < len(stamps) else None
            if idx is None or idx + ntok > len(stamps):
                continue
            a = max(0.0, stamps[idx].start - 0.055)
            b = min(len(audio) / sr, stamps[idx + ntok - 1].end + 0.075)
            cut = audio[int(a * sr):int(b * sr)].astype(np.float32)
            if cut.size < sr * 0.08:
                continue
            peak = float(np.max(np.abs(cut))) or 1.0
            cut = cut * (26000.0 / peak)
            n = min(int(sr * 0.008), cut.size // 2)
            if n > 0:
                ramp = np.linspace(0, 1, n)
                cut[:n] *= ramp
                cut[-n:] *= ramp[::-1]
            tmp = out_path + '.try.wav'
            with wave.open(tmp, 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
                w.writeframes(np.clip(cut, -32000, 32000).astype(np.int16).tobytes())
            probe = out_path + '.try.m4a'
            r = subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b',
                                os.environ.get('PIPER_BITRATE', '48000'), tmp, probe],
                               capture_output=True, text=True)
            os.unlink(tmp)
            if r.returncode != 0:
                continue
            ok = listener.accepts(probe, text)
            if ok is True:
                shutil.move(probe, out_path)
                return True
            os.unlink(probe)
    return False


class Listener:
    """faster-whisper, loaded once, reused for every clip."""

    def __init__(self, model='base.en'):
        from faster_whisper import WhisperModel
        self.m = WhisperModel(model, device='cpu', compute_type='int8')

    def hear(self, path):
        segs, _ = self.m.transcribe(path, language='en', beam_size=5, vad_filter=False)
        return ' '.join(s.text for s in segs).strip()

    def accepts(self, path, expected):
        heard = self.hear(path)
        want, got = spoken_key(expected), spoken_key(heard)
        if want == got or numeric_match(expected, heard):
            return True
        al = ALIASES.get(str(expected).lower())
        if al and got in {spoken_key(x) for x in al}:
            return True
        return heard


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', default=os.environ.get('TTS_ENGINE', 'piper'))
    ap.add_argument('--clean', action='store_true')
    ap.add_argument('--workers', type=int, default=6)
    ap.add_argument('--limit', type=int, default=0, help='render only the first N (smoke test)')
    ap.add_argument('--no-verify', action='store_true',
                    help='skip the listen-and-re-roll pass over short clips')
    ap.add_argument('--attempts', type=int, default=6,
                    help='re-roll budget per short clip; RATES has 6 entries')
    ap.add_argument('--recheck', action='store_true',
                    help='re-verify only the clips in the last suspect report')
    ap.add_argument('--only', default='',
                    help='comma-separated strings to re-verify and rescue')
    args = ap.parse_args()

    try:
        engine = get_engine(args.engine)
    except Exception as e:
        print(e)
        return 2

    lock = os.path.join(_WORK, 'gen_audio.lock')
    if os.path.exists(lock):
        try:
            pid = int(open(lock).read().strip())
            os.kill(pid, 0)
            print(f'another gen_audio.py is running (pid {pid}).\n'
                  'Two runs share audio/ and the older one\'s orphan prune will '
                  'delete clips the newer one just rendered. Wait for it, or '
                  f'remove {os.path.relpath(lock, ROOT)} if it is stale.')
            return 2
        except (ValueError, ProcessLookupError, PermissionError):
            pass            # stale lock from a killed run
    with open(lock, 'w') as f:
        f.write(str(os.getpid()))
    try:
        return _run(args, engine)
    finally:
        if os.path.exists(lock):
            os.unlink(lock)


def _run(args, engine):
    if args.clean and os.path.isdir(AUDIO):
        # Narrowed to the directory this tool owns. A blanket rmtree of audio/
        # takes audio/sfx/ with it, and Sfx.play() swallows the resulting 404 —
        # so every tap goes silent with nothing logged.
        shutil.rmtree(os.path.join(AUDIO, 'p'), ignore_errors=True)
        if os.path.exists(MANIFEST):
            os.unlink(MANIFEST)

    os.makedirs(os.path.join(AUDIO, 'p'), exist_ok=True)

    prose, numbers = corpus()
    if args.limit:
        prose = dict(list(prose.items())[:args.limit])
        numbers = dict(list(numbers.items())[:args.limit])
    print(f'{len(prose)} prose + {len(numbers)} number/vocabulary = '
          f'{len(prose) + len(numbers)} clips')

    manifest = {'words': {}, 'engine': engine.name, 'voice': engine.VOICE_NAME}
    jobs, short_keys = {}, set()
    for src, is_short in ((prose, False), (numbers, True)):
        for key, spoken in src.items():
            rel = clip_path(key)
            manifest['words'][key] = rel
            if is_short:
                short_keys.add(key)
            out = os.path.join(AUDIO, rel)
            if not os.path.exists(out):
                jobs[out] = spoken          # dedupe by output path, not by index

    print(f'{len(jobs)} to render ({len(manifest["words"]) - len(jobs)} already on disk)')
    fails = []
    if jobs:
        def render(item):
            out, spoken = item
            try:
                engine.speak_text(spoken, out)
            except Exception as e:
                fails.append((out, str(e)[:160]))

        done = 0
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            for _ in ex.map(render, list(jobs.items())):
                done += 1
                if done % 200 == 0:
                    print(f'  rendered {done}/{len(jobs)}')

    # ── listen to the short clips and re-roll the wrong ones ──
    suspect = []
    if args.recheck:
        old = os.path.join(ROOT, 'tools', 'audio-suspect-report.json')
        prior = json.load(open(old)) if os.path.exists(old) else []
        if args.only:
            keys = [norm(w) for w in args.only.split(',') if norm(w) in manifest['words']]
        else:
            keys = [x['key'] for x in prior if x['key'] in manifest['words']]
        print(f're-checking {len(keys)} previously suspect clip(s)')
        if keys:
            listener = Listener()
            fixed = rescued = 0
            for key in keys:
                path = os.path.join(AUDIO, clip_path(key))
                spoken = numbers.get(key, prose.get(key, key))
                got = listener.accepts(path, spoken)
                if got is True:
                    continue
                for k in range(args.attempts):
                    ls = [None, 1.15, 0.95, 1.3, 1.05, 1.45][k % 6]
                    engine.speak_text(spoken, path, length_scale=ls)
                    got = listener.accepts(path, spoken)
                    if got is True:
                        fixed += 1
                        break
                if got is not True:
                    if rescue(engine, listener, spoken, path):
                        rescued += 1
                    else:
                        suspect.append({'key': key, 'spoken': spoken, 'heard': got})
            print(f'{len(keys) - fixed - rescued - len(suspect)} were already fine; '
                  f're-rolled {fixed}; rescued from a carrier {rescued}; '
                  f'{len(suspect)} unresolved')
    elif not args.no_verify and jobs:
        rev = {os.path.join(AUDIO, clip_path(k)): k for k in manifest['words']}
        fresh_short = [rev[o] for o in jobs if rev.get(o) in short_keys]
        if fresh_short:
            print(f'listening to {len(fresh_short)} newly rendered short clip(s)')
            listener = Listener()
            checked = fixed = rescued = 0
            for key in sorted(fresh_short):
                path = os.path.join(AUDIO, clip_path(key))
                spoken = numbers.get(key, key)
                verdict = listener.accepts(path, spoken)
                checked += 1
                if verdict is True:
                    continue
                # Sampling is stochastic, so another draw usually lands. Vary
                # length_scale as well, for a different draw AND slightly
                # different acoustics.
                got = None
                for k in range(args.attempts):
                    ls = [None, 1.15, 0.95, 1.3, 1.05, 1.45][k % 6]
                    engine.speak_text(spoken, path, length_scale=ls)
                    got = listener.accepts(path, spoken)
                    if got is True:
                        fixed += 1
                        break
                if got is not True:
                    # Re-rolling did not shake it loose, so cut the word out of
                    # a carrier sentence instead.
                    if rescue(engine, listener, spoken, path):
                        rescued += 1
                    else:
                        suspect.append({'key': key, 'spoken': spoken, 'heard': got})
                if checked % 100 == 0:
                    print(f'  listened {checked}/{len(fresh_short)}, re-rolled {fixed}, '
                          f'{len(suspect)} still suspect')
            print(f'listened to {checked}; re-rolled {fixed}; rescued from a carrier '
                  f'{rescued}; {len(suspect)} unresolved')

    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, separators=(',', ':'), ensure_ascii=False)

    rev = {v: k for k, v in manifest['words'].items()}
    fresh = {rev[os.path.relpath(o, AUDIO)] for o in jobs
             if os.path.relpath(o, AUDIO) in rev}
    print(f'checking {len(fresh)} newly rendered clip(s) for silence')
    problems = validate(manifest, fresh)

    for out, err in fails[:10]:
        print(f'  RENDER FAILED {os.path.basename(out)}: {err}')
    for p in problems[:20]:
        print('  ' + p)

    report = os.path.join(ROOT, 'tools', 'audio-suspect-report.json')
    if args.no_verify:
        print(f'(--no-verify: leaving {os.path.relpath(report, ROOT)} alone)')
    else:
        with open(report, 'w', encoding='utf-8') as f:
            json.dump(suspect, f, indent=1, ensure_ascii=False)
    for s in suspect[:25]:
        print(f'  SUSPECT {s["spoken"]!r} heard as {s["heard"]!r}')

    # A reworded string hashes to a new filename and abandons the old clip.
    # Prune, or every device caches hundreds of dead files.
    used = set(manifest['words'].values())
    orphans = [p for p in glob.glob(os.path.join(AUDIO, 'p', '*.m4a'))
               if os.path.relpath(p, AUDIO) not in used]
    for o in orphans:
        os.unlink(o)
    if orphans:
        print(f'pruned {len(orphans)} orphaned clip(s)')

    total = sum(os.path.getsize(os.path.join(AUDIO, v))
                for v in manifest['words'].values()
                if os.path.exists(os.path.join(AUDIO, v)))
    print(f'\n{len(manifest["words"])} clips, {total / 1048576:.0f} MB -> {MANIFEST}')
    if fails or problems:
        print(f'{len(fails)} render failure(s), {len(problems)} validation problem(s)')
        return 1
    if suspect:
        print(f'{len(suspect)} clip(s) still do not transcribe back correctly — '
              f'see {os.path.relpath(report, ROOT)}. LISTEN to them before shipping.')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
