#!/usr/bin/env python3
"""Synthesise the app's sound effects.

The app had speech and nothing else, which is why it felt flat — a child's app
lives on the little noises: the pop when you tap, the chime when you're right,
the sparkle when a new creature appears. These are generated from scratch (sine
partials, short envelopes) so they are ours, tiny, and consistent in character:
soft bell tones, no harsh edges, nothing that reads as "wrong, you failed".

  python3 tools/gen_sfx.py
"""
import math
import os
import struct
import subprocess
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK          # never the system temp dir
OUT = os.path.join(ROOT, 'audio', 'sfx')
SR = 44100


def env(n, attack=0.01, decay=0.25, sustain=0.0):
    """Percussive envelope, in samples."""
    a = max(1, int(SR * attack))
    d = max(1, int(SR * decay))
    out = []
    for i in range(n):
        if i < a:
            out.append(i / a)
        elif i < a + d:
            t = (i - a) / d
            out.append((1 - t) * (1 - sustain) + sustain)
        else:
            out.append(sustain * max(0.0, 1 - (i - a - d) / max(1, n - a - d)))
    return out


def tone(freq, dur, amp=0.5, attack=0.008, decay=None, partials=(1, 2, 3),
         weights=(1.0, 0.35, 0.12), vib=0.0):
    n = int(SR * dur)
    decay = decay if decay is not None else dur * 0.9
    e = env(n, attack, decay)
    buf = [0.0] * n
    for p, w in zip(partials, weights):
        for i in range(n):
            f = freq * p
            if vib:
                f *= 1 + vib * math.sin(2 * math.pi * 5.5 * i / SR)
            buf[i] += w * math.sin(2 * math.pi * f * i / SR)
    peak = max(1e-9, max(abs(x) for x in buf))
    return [amp * e[i] * buf[i] / peak for i in range(n)]


def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i, v in enumerate(l):
            out[i] += v
    peak = max(1e-9, max(abs(x) for x in out))
    if peak > 0.95:
        out = [x * 0.95 / peak for x in out]
    return out


def seq(*items):
    """(delay_seconds, samples) laid onto one timeline."""
    total = max(int(SR * d) + len(s) for d, s in items)
    out = [0.0] * total
    for d, s in items:
        off = int(SR * d)
        for i, v in enumerate(s):
            out[off + i] += v
    peak = max(1e-9, max(abs(x) for x in out))
    if peak > 0.95:
        out = [x * 0.95 / peak for x in out]
    return out


def silence(dur):
    return [0.0] * int(SR * dur)


def write(name, samples, pad=0.03):
    samples = silence(pad) + samples + silence(pad * 2)
    wav = os.path.join(OUT, name + '.wav')
    m4a = os.path.join(OUT, name + '.m4a')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b''.join(
            struct.pack('<h', int(max(-1, min(1, s)) * 32000)) for s in samples))
    r = subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000',
                        wav, m4a], capture_output=True, text=True)
    os.unlink(wav)
    if r.returncode != 0:
        raise SystemExit('afconvert failed for ' + name + ': ' + r.stderr[:200])
    return m4a


# note frequencies (a bright, friendly pentatonic — nothing sounds "wrong")
N = {'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00,
     'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.0,
     'C7': 2093.0, 'F5': 698.46, 'B5': 987.77, 'A4': 440.0, 'F6': 1396.9}


def build():
    os.makedirs(OUT, exist_ok=True)
    made = []

    # tap — a soft wooden pop, quiet enough to hear a hundred times
    made.append(write('tap', tone(N['E5'], 0.09, amp=0.30, attack=0.002,
                                  decay=0.07, partials=(1, 2.7),
                                  weights=(1.0, 0.25))))

    # correct — rising two-note chime
    made.append(write('correct', seq(
        (0.00, tone(N['E5'], 0.20, amp=0.42, decay=0.18)),
        (0.09, tone(N['A5'], 0.30, amp=0.45, decay=0.28)))))

    # star earned — bright triad sparkle
    made.append(write('star', seq(
        (0.00, tone(N['C6'], 0.16, amp=0.36, decay=0.14)),
        (0.07, tone(N['E6'], 0.18, amp=0.36, decay=0.16)),
        (0.14, tone(N['G6'], 0.34, amp=0.40, decay=0.30)))))

    # gentle "not yet" — a soft low blip that does NOT sound like a buzzer;
    # children hear harsh error tones as punishment and stop taking risks
    made.append(write('retry', seq(
        (0.00, tone(N['D5'], 0.14, amp=0.30, attack=0.006, decay=0.12,
                    partials=(1, 2), weights=(1.0, 0.2))),
        (0.10, tone(N['A4'], 0.22, amp=0.26, attack=0.006, decay=0.20,
                    partials=(1, 2), weights=(1.0, 0.2))))))

    # island complete — little fanfare
    made.append(write('fanfare', seq(
        (0.00, tone(N['C5'], 0.18, amp=0.34, decay=0.16)),
        (0.10, tone(N['E5'], 0.18, amp=0.36, decay=0.16)),
        (0.20, tone(N['G5'], 0.20, amp=0.38, decay=0.18)),
        (0.32, tone(N['C6'], 0.55, amp=0.46, decay=0.50)),
        (0.34, tone(N['E6'], 0.55, amp=0.28, decay=0.50)))))

    # creature unlock — shimmering arpeggio, the biggest moment in the app
    made.append(write('unlock', seq(
        (0.00, tone(N['C6'], 0.14, amp=0.30, decay=0.12)),
        (0.06, tone(N['E6'], 0.14, amp=0.32, decay=0.12)),
        (0.12, tone(N['G6'], 0.14, amp=0.34, decay=0.12)),
        (0.18, tone(N['C7'], 0.60, amp=0.42, decay=0.55, vib=0.004)),
        (0.26, tone(N['E6'], 0.55, amp=0.22, decay=0.50)),
        (0.40, tone(N['A6'], 0.45, amp=0.24, decay=0.42)))))

    # page turn — airy swish
    made.append(write('page', seq(
        (0.00, tone(N['G5'], 0.11, amp=0.20, attack=0.02, decay=0.09,
                    partials=(1, 3.3, 5.1), weights=(0.5, 0.4, 0.3))),
        (0.05, tone(N['C6'], 0.12, amp=0.18, attack=0.02, decay=0.10,
                    partials=(1, 3.3), weights=(0.5, 0.3))))))

    # streak / daily quest bonus
    made.append(write('bonus', seq(
        (0.00, tone(N['G5'], 0.16, amp=0.34, decay=0.14)),
        (0.09, tone(N['B5'], 0.16, amp=0.34, decay=0.14)),
        (0.18, tone(N['D6'], 0.16, amp=0.36, decay=0.14)),
        (0.27, tone(N['G6'], 0.50, amp=0.44, decay=0.46)))))

    print(f'wrote {len(made)} sound effects to {OUT}')
    for m in made:
        size = os.path.getsize(m)
        print(f'  {os.path.basename(m):<14} {size/1024:5.1f} KB')
    return 0


if __name__ == '__main__':
    raise SystemExit(build())
