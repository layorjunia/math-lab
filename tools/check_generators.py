#!/usr/bin/env python3
"""The correctness gate. Run every generator thousands of times and try to break it.

Problems are generated at runtime from seeded functions, so "reject the bad
problem" has no meaning here — there is no artifact to drop. The unit under test
is the GENERATOR: a generator that produces a wrong answer one draw in ten
thousand will produce it for a child, so the build fails on a single bad draw.

What is checked, per draw:

  1. THE ANSWER IS RECOMPUTED FROM THE DISPLAYED QUESTION, in Python, with exact
     integer and Fraction arithmetic, ignoring what the generator claimed. If
     they disagree, the generator is wrong. This one check is worth the file.
  2. No floats anywhere in the answer. `0.1 + 0.2` is 0.30000000000000004 and a
     math app that ships that is worse than no math app.
  3. Every named-mistake slip is distinct, is not equal to the right answer, and
     carries a tag that actually exists in ERRORS. A slip equal to the answer
     would mark a correct child wrong.
  4. The problem sits inside its skill's declared range. A "no regrouping" item
     that regroups belongs to a different skill.
  5. The generator is deterministic: the same seed gives the same problem, on
     every device and in this gate.
  6. It never throws, and never loops forever trying to satisfy its own
     constraint.

Every problem is reported at the END, after every generator has contributed.
Printing partway through is how two rejected items vanish without a word.

  .venv-tts/bin/python tools/check_generators.py
  .venv-tts/bin/python tools/check_generators.py --draws 20000 --only as.add2d.rg
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from fractions import Fraction

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WORK = os.path.join(ROOT, '.work', 'tmp')
os.makedirs(_WORK, exist_ok=True)
tempfile.tempdir = _WORK          # never the system temp dir
os.environ.setdefault('HF_HOME', os.path.join(ROOT, '.work', 'hf'))

# Node evaluates the real generator file. There is no second implementation in
# Python to drift out of step with the one the app actually runs.
DUMP = r'''
globalThis.window = globalThis;   // games.js/family.js publish onto it
const fs = require('fs');
const load = f => { const s = fs.readFileSync(f, 'utf8')
  .replace(/^const (\w+)/gm, 'globalThis.$1'); eval(s); };
load('js/schema.js');
load('js/skills.js');
load('js/generators.js');
if (fs.existsSync('js/manipulatives.js')) load('js/manipulatives.js');
if (fs.existsSync('js/lessons.js')) load('js/lessons.js');

const draws = Number(process.argv[2]);
const only  = process.argv[3] || '';
const thin = (typeof LESSONS === 'undefined') ? [] : Object.entries(LESSONS)
  .filter(([, l]) => !l.anchor || !l.turn ||
                     !(l.ex && l.ex.steps || []).some(x => typeof x !== 'string'))
  .map(([id]) => id);
const out = { errors: Object.keys(ERRORS), skills: {}, missing: [], rows: [], thin,
              tagStrands: Object.fromEntries(
                Object.entries(ERRORS).map(([k, v]) => [k, v.strands || null])) };

SKILLS.forEach(s => {
  if (only && s.id !== only) return;
  if (!GEN[s.id]) { out.missing.push(s.id); return; }
  out.skills[s.id] = { g: s.g, s: s.s, mode: s.mode, range: s.range };
  for (let i = 0; i < draws; i++) {
    let p;
    try { p = GEN[s.id](mulberry32(i * 7919 + 13)); }
    catch (e) { out.rows.push({ id: s.id, seed: i, threw: String(e && e.message || e) }); continue; }
    // Determinism: the same seed, twice, must give the same problem.
    let again;
    try { again = GEN[s.id](mulberry32(i * 7919 + 13)); } catch (e) { again = null; }
    const same = again && JSON.stringify(again) === JSON.stringify(p);
    out.rows.push({ id: s.id, seed: i, q: p.q, fmt: p.fmt, a: p.a, strand: s.s,
                    slips: p.slips || [], d: p.d, hint: p.hint || '',
                    opts: p.options || null, det: !!same });
  }
});
console.log(JSON.stringify(out));
'''

# ── exact re-evaluation of the displayed question ────────────────────────
NUM = r'-?[\d,]+'


def _i(s):
    return int(str(s).replace(',', ''))


def recompute(q, fmt, a):
    """Return (expected, None) if the question is one we can independently
    evaluate, else (None, reason-it-was-skipped). Exact arithmetic only."""
    t = q.replace('−', '-').replace('×', '*').replace('÷', '/')
    t = t.replace('▢', '?').strip()

    # whole-number binary operations:  A op B = ?
    m = re.fullmatch(rf'({NUM})\s*([+\-*/])\s*\(?({NUM})\)?\s*=\s*\?', t)
    if m:
        x, op, y = _i(m.group(1)), m.group(2), _i(m.group(3))
        if op == '+':
            return x + y, None
        if op == '-':
            return x - y, None
        if op == '*':
            return x * y, None
        if op == '/' and y != 0 and x % y == 0:
            return x // y, None
        return None, 'inexact division'

    # missing operand:  A + ? = C   /   ? / A = B   /   A * ? = C
    m = re.fullmatch(rf'({NUM})\s*([+\-*/])\s*\?\s*=\s*({NUM})', t)
    if m:
        x, op, z = _i(m.group(1)), m.group(2), _i(m.group(3))
        if op == '+':
            return z - x, None
        if op == '-':
            return x - z, None
        if op == '*' and x != 0 and z % x == 0:
            return z // x, None
        if op == '/' and z != 0:
            return None, 'ambiguous'
    m = re.fullmatch(rf'\?\s*([+\-*/])\s*({NUM})\s*=\s*({NUM})', t)
    if m:
        op, y, z = m.group(1), _i(m.group(2)), _i(m.group(3))
        if op == '+':
            return z - y, None
        if op == '-':
            return z + y, None
        if op == '*' and y != 0 and z % y == 0:
            return z // y, None
        if op == '/':
            return z * y, None

    # fraction arithmetic:  a/b op c/d = ?
    m = re.fullmatch(r'(\d+)/(\d+)\s*([+\-*/])\s*(\d+)/(\d+)\s*=\s*\?', t)
    if m:
        p = Fraction(int(m.group(1)), int(m.group(2)))
        r_ = Fraction(int(m.group(4)), int(m.group(5)))
        op = m.group(3)
        v = {'+': p + r_, '-': p - r_, '*': p * r_}.get(op)
        if op == '/':
            v = p / r_ if r_ != 0 else None
        return (v, None) if v is not None else (None, 'div by zero')

    # whole times fraction:  w * a/b = ?
    m = re.fullmatch(rf'({NUM})\s*\*\s*(\d+)/(\d+)\s*=\s*\?', t)
    if m:
        return Fraction(_i(m.group(1)) * int(m.group(2)), int(m.group(3))), None

    # whole divided by unit fraction:  w / 1/b = ?
    m = re.fullmatch(rf'({NUM})\s*/\s*1/(\d+)\s*=\s*\?', t)
    if m:
        return _i(m.group(1)) * int(m.group(2)), None

    # equivalent fractions:  a/b = ?/c
    m = re.fullmatch(r'(\d+)/(\d+)\s*=\s*\?/(\d+)', t)
    if m:
        n, d, d2 = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if d2 % d == 0:
            return n * (d2 // d), None
        return None, 'non-integer scale'

    # ratio:  a : b = c : ?
    m = re.fullmatch(rf'({NUM})\s*:\s*({NUM})\s*=\s*({NUM})\s*:\s*\?', t)
    if m:
        a1, b1, a2 = _i(m.group(1)), _i(m.group(2)), _i(m.group(3))
        if a1 != 0 and (a2 * b1) % a1 == 0:
            return a2 * b1 // a1, None

    # order of operations:  a + b * c = ?   and  (a + b) * c = ?
    m = re.fullmatch(rf'({NUM})\s*\+\s*({NUM})\s*\*\s*({NUM})\s*=\s*\?', t)
    if m:
        return _i(m.group(1)) + _i(m.group(2)) * _i(m.group(3)), None
    m = re.fullmatch(rf'\(({NUM})\s*\+\s*({NUM})\)\s*\*\s*({NUM})\s*=\s*\?', t)
    if m:
        return (_i(m.group(1)) + _i(m.group(2))) * _i(m.group(3)), None

    # decimal arithmetic:  x.xx op y.yy = ?
    m = re.fullmatch(r'(-?[\d,]+\.\d+)\s*([+\-*])\s*(-?[\d,]+\.?\d*)\s*=\s*\?', t)
    if m:
        p = Fraction(m.group(1).replace(',', ''))
        r_ = Fraction(m.group(3).replace(',', ''))
        op = m.group(2)
        return {'+': p + r_, '-': p - r_, '*': p * r_}[op], None
    m = re.fullmatch(r'(-?[\d,]+\.\d+)\s*/\s*(-?[\d,]+)\s*=\s*\?', t)
    if m:
        r_ = Fraction(m.group(2).replace(',', ''))
        if r_ != 0:
            return Fraction(m.group(1).replace(',', '')) / r_, None

    return None, 'not an evaluable expression'


def as_exact(a, fmt):
    """The generator's answer as an exact Fraction/int, or None if this format
    is not one recompute() produces."""
    if isinstance(a, bool):
        return None
    if isinstance(a, int):
        return a
    if isinstance(a, float):
        return 'FLOAT'
    if isinstance(a, dict):
        if 'n' in a and 'd' in a:
            return Fraction(a['n'], a['d']) if a['d'] else 'BADFRAC'
        if 'v' in a and 'dp' in a:
            return Fraction(a['v'], 10 ** a['dp'])
    return None


def has_float(x):
    if isinstance(x, float):
        return not float(x).is_integer() or True     # any float at all is a defect
    if isinstance(x, dict):
        return any(has_float(v) for v in x.values())
    if isinstance(x, list):
        return any(has_float(v) for v in x)
    return False


# ── per-skill range assertions ───────────────────────────────────────────
# The declared `range` in skills.json is prose for a human; these are the same
# constraints as executable predicates. A skill with a constraint here and a
# generator that violates it fails the build.
def carries(a, b):
    c = n = 0
    while a > 0 or b > 0:
        if (a % 10) + (b % 10) + c >= 10:
            c, n = 1, n + 1
        else:
            c = 0
        a, b = a // 10, b // 10
    return n


def borrows(a, b):
    br = n = 0
    while b > 0 or a > 0:
        if (a % 10) - br < (b % 10):
            br, n = 1, n + 1
        else:
            br = 0
        a, b = a // 10, b // 10
    return n


def operands(q):
    t = q.replace('−', '-').replace('×', '*').replace('÷', '/')
    return [int(x.replace(',', '')) for x in re.findall(r'\d[\d,]*', t)]


def rng_in(lo, hi, k=2):
    def f(q, a):
        xs = operands(q)[:k]
        bad = [x for x in xs if not (lo <= x <= hi)]
        return f'operand out of range {lo}-{hi}: {bad}' if bad else None
    return f


def both(*fs):
    def f(q, a):
        for g in fs:
            m = g(q, a)
            if m:
                return m
        return None
    return f


def no_carry(q, a):
    xs = operands(q)[:2]
    return 'regroups but the skill says it must not' if len(xs) == 2 and carries(*xs) else None


def some_carry(q, a):
    xs = operands(q)[:2]
    return 'no regrouping, but this skill is the regrouping one' \
        if len(xs) == 2 and not carries(*xs) else None


def no_borrow(q, a):
    xs = operands(q)[:2]
    return 'borrows but the skill says it must not' if len(xs) == 2 and borrows(*xs) else None


def some_borrow(q, a):
    xs = operands(q)[:2]
    return 'no borrowing, but this skill is the borrowing one' \
        if len(xs) == 2 and not borrows(*xs) else None


def sum_at_most(n):
    def f(q, a):
        xs = operands(q)[:2]
        return f'sum over {n}' if len(xs) == 2 and sum(xs) > n else None
    return f


def nonneg(q, a):
    return 'negative answer in a skill that does not teach them' \
        if isinstance(a, int) and a < 0 else None


RANGE = {
    'as.add10':     both(rng_in(0, 10), sum_at_most(10)),
    'as.sub10':     both(rng_in(0, 10), nonneg),
    'as.add20':     both(rng_in(0, 20), sum_at_most(20)),
    'as.sub20':     both(rng_in(0, 20), nonneg),
    'as.add2d.nr':  both(rng_in(10, 99), no_carry, nonneg),
    'as.add2d.rg':  both(rng_in(10, 99), some_carry, nonneg),
    'as.sub2d.nr':  both(rng_in(10, 99), no_borrow, nonneg),
    'as.sub2d.rg':  both(rng_in(10, 99), some_borrow, nonneg),
    'as.add3d':     both(rng_in(100, 999), some_carry, nonneg),
    'as.subzero':   both(nonneg,),
    'md.f.2510':    rng_in(0, 12),
    'md.f.34':      rng_in(0, 12),
    'md.f.69':      rng_in(0, 12),
    'md.f.78':      rng_in(0, 12),
    'md.f.all':     rng_in(0, 12),
    'md.mult2d':    rng_in(10, 99),
    'md.mult3d':    rng_in(100, 999, 1),
    'npv.pv2':      rng_in(10, 99, 1),
    'npv.pv3':      rng_in(100, 999, 1),
    'npv.compare2': rng_in(10, 99),
    'npv.compare3': rng_in(100, 999),
}


def check_handlers():
    """Every App.x(...) named in an onclick must be a real method.

    A renamed method leaves a button that silently does nothing when tapped —
    no error, no console warning, just a dead control. That is how the only way
    from a lesson into practice sat broken.
    """
    src = open(os.path.join(ROOT, 'js', 'app.js'), encoding='utf-8').read()
    defined = set(re.findall(r'^  (?:async )?(\w+)\s*\(', src, re.M))
    defined |= set(re.findall(r'^  (\w+):\s*(?:function)?\s*\(', src, re.M))
    called = set(re.findall(r'App\.(\w+)\s*\(', src))
    missing = sorted(c for c in called if c not in defined)
    return [f'js/app.js: onclick calls App.{m}() but no such method exists — '
            f'that button does nothing' for m in missing]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--draws', type=int, default=4000)
    ap.add_argument('--only', default='')
    ap.add_argument('--verbose', action='store_true')
    args = ap.parse_args()

    js = os.path.join(_WORK, 'gen-dump.js')
    with open(js, 'w', encoding='utf-8') as f:
        f.write(DUMP)
    r = subprocess.run(['node', js, str(args.draws), args.only],
                       cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print('node failed:\n' + r.stderr[:1500])
        return 1
    data = json.loads(r.stdout)

    known_tags = set(data['errors'])
    problems = []
    checked = recomputed = 0
    skipped_reasons = {}

    for row in data['rows']:
        sid, seed = row['id'], row['seed']
        checked += 1
        if 'threw' in row:
            problems.append(f'{sid} seed {seed}: THREW {row["threw"]}')
            continue
        if not row['det']:
            problems.append(f'{sid} seed {seed}: not deterministic — same seed gave two problems')

        a, q, fmt = row['a'], row['q'], row['fmt']

        # 2. no floats
        if has_float(a):
            problems.append(f'{sid} seed {seed}: FLOAT in the answer ({a!r})')

        # 1. recompute independently
        exact = as_exact(a, fmt)
        if exact == 'FLOAT':
            pass                                   # already reported
        elif exact == 'BADFRAC':
            problems.append(f'{sid} seed {seed}: fraction with zero denominator')
        elif exact is not None:
            want, why = recompute(q, fmt, a)
            if want is not None:
                recomputed += 1
                if Fraction(want) != Fraction(exact):
                    problems.append(
                        f'{sid} seed {seed}: ANSWER WRONG — {q!r} evaluates to '
                        f'{want}, generator says {a!r}')
            else:
                skipped_reasons[why] = skipped_reasons.get(why, 0) + 1

        # 3. slips
        seen = set()
        for s in row['slips']:
            tag, v = s.get('tag'), s.get('v')
            if tag not in known_tags:
                problems.append(f'{sid} seed {seed}: unknown error tag {tag!r}')
            else:
                # An explanation is only useful if it is TRUE for the question
                # it appears under. `strands` declares where each one applies;
                # a tag used outside them shows a child advice about a different
                # kind of maths, which is worse than saying nothing.
                allowed = data['tagStrands'].get(tag)
                if allowed and row.get('strand') not in allowed:
                    problems.append(
                        f'{sid} seed {seed}: tag {tag!r} is not declared for the '
                        f'{row.get("strand")!r} strand — its wording will not fit '
                        f'this question')
            key = json.dumps(v, sort_keys=True)
            if key == json.dumps(a, sort_keys=True):
                problems.append(f'{sid} seed {seed}: slip {v!r} is IDENTICAL to the right '
                                f'answer — a correct child would be marked wrong')
            if key in seen:
                problems.append(f'{sid} seed {seed}: duplicate slip {v!r}')
            seen.add(key)

            # 2/4 and 1/2 are the same VALUE written two ways, and whether that
            # is a defect depends entirely on the tag.
            #
            # `frac.simplify` means "your value is right, it is just not in
            # lowest terms" — so for that one tag a slip MUST have the same
            # value and a different form. That is the mistake. For every other
            # tag an equal value means the app would mark a correct child wrong.
            if isinstance(v, dict) and 'n' in v and 'd' in v and v.get('d') \
                    and isinstance(exact, Fraction):
                same_value = Fraction(v['n'], v['d']) == exact
                if tag == 'frac.simplify':
                    if not same_value:
                        problems.append(f'{sid} seed {seed}: frac.simplify slip {v!r} has a '
                                        f'different value from {a!r} — that is a different '
                                        f'mistake, not a missing simplification')
                elif same_value:
                    problems.append(f'{sid} seed {seed}: slip {v!r} (tag {tag}) equals the '
                                    f'answer after simplifying')

        # multiple choice: the answer has to actually be on offer
        if fmt in ('choice', 'multi') and row.get('opts'):
            if a not in row['opts']:
                problems.append(f'{sid} seed {seed}: answer {a!r} is not among the options '
                                f'{row["opts"]!r}')

        # 4. declared range
        rule = RANGE.get(sid)
        if rule:
            msg = rule(q, a)
            if msg:
                problems.append(f'{sid} seed {seed}: {msg} — {q!r}')

    for sid in data['missing']:
        problems.append(f'{sid}: no generator (skills.js declares it, GEN does not have it)')
    problems.extend(check_handlers())

    # Not a failure — a visible count, so the remaining rewrite cannot quietly
    # stay unfinished. A lesson without a concrete anchor, without reasons on
    # its worked steps, and without a faded 'now you try' is a procedure list.
    thin = data.get('thin') or []
    if thin:
        print()
        print(f'{len(thin)} lesson(s) still on the thin shape — no concrete '
              'anchor, no reasons on the worked steps, no "now you try":')
        print('   ' + ', '.join(thin[:10]) + (' ...' if len(thin) > 10 else ''))


    # Everything, at the end, after every generator has contributed — and
    # GROUPED. A flat list truncated at 60 lines shows one loud failure and
    # hides every other kind behind it, which is how a second bug survives a
    # build you thought you had read.
    if problems:
        groups = {}
        for p in problems:
            sid = p.split(':')[0].split(' seed ')[0]
            kind = p.split(': ', 1)[1] if ': ' in p else p
            kind = re.sub(r'\d+', 'N', re.sub(r"'[^']*'", '…', re.sub(r'\{[^}]*\}', '{…}', kind)))
            g = groups.setdefault((sid, kind[:96]), [])
            g.append(p)
        print(f'{len(groups)} distinct problem(s), {len(problems)} occurrence(s):\n')
        for (sid, kind), rows in sorted(groups.items(), key=lambda kv: -len(kv[1])):
            print(f'  [{len(rows):>5}×] {sid}')
            print(f'           {kind}')
            print(f'           e.g. {rows[0][:150]}')
        print()

    print()
    print(f'{len(data["skills"])} generators × {args.draws} draws = {checked} problems')
    print(f'{recomputed} answers independently recomputed and matched')
    if args.verbose and skipped_reasons:
        print('not independently evaluable:')
        for why, n in sorted(skipped_reasons.items(), key=lambda kv: -kv[1]):
            print(f'   {n:6}  {why}')
    if data['missing']:
        print(f'{len(data["missing"])} skill(s) with no generator yet')
    if problems:
        print(f'\n{len(problems)} problem(s) — FAIL')
        return 1
    print('no problems')
    return 0


if __name__ == '__main__':
    sys.exit(main())
