// Math Lab — problem generators.
//
// One seeded function per skill. This is the only implementation: the app calls
// these at runtime and tools/check_generators.py calls the SAME functions in
// node, ten thousand times each, asserting every invariant. There is no second
// copy in Python to drift out of step.
//
// A generator returns:
//   { q, fmt, a, slips, d, hint, parts }
//
//   q      the question as displayed
//   fmt    which keypad to show and how to parse what is typed (schema.js)
//   a      the answer, in EXACT arithmetic — never a float. Whole numbers are
//          ints, fractions are {n,d}, money is integer cents, decimals are
//          {v,dp} meaning v / 10^dp, times are minutes since midnight.
//   slips  named-mistake predicates: "if they typed this, here is what went
//          wrong". These are why a wrong answer produces a sentence instead of
//          a red cross. Every tag must exist in ERRORS.
//   d      difficulty, used to keep a ladder monotone within one skill
//   parts  optional narration override; otherwise numspeak reads `q`
//
// NO FLOATS. `0.1 + 0.2` is 0.30000000000000004 and a maths app that ships that
// is worse than no maths app. Decimals are scaled integers throughout; the only
// division allowed is one proven to be exact.

// ── seeded random ────────────────────────────────────────────────────────
// mulberry32: same seed, same problem, on every device and in the gate. A
// Math.random() generator cannot be tested, because the failing draw is gone.
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const G = {
  ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); },
  pick(r, xs) { return xs[Math.floor(r() * xs.length)]; },
  shuffle(r, xs) {
    const a = xs.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  // Draw until the predicate holds. Bounded: an impossible predicate must fail
  // the build loudly rather than hang the child's device.
  until(r, make, ok, tries) {
    for (let i = 0; i < (tries || 200); i++) {
      const v = make();
      if (ok(v)) return v;
    }
    throw new Error('generator could not satisfy its own constraint');
  },
  gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
  lcm(a, b) { return a / G.gcd(a, b) * b; },
  frac(n, d) { const g = G.gcd(n, d) || 1; return { n: n / g, d: d / g }; },
  digits(n) { return String(Math.abs(n)).split('').map(Number); },
  // "how many times does a column of this sum carry" — the constraint that
  // separates as.add2d.nr from as.add2d.rg, asserted by the gate.
  carries(a, b) {
    let c = 0, n = 0;
    while (a > 0 || b > 0) {
      if ((a % 10) + (b % 10) + c >= 10) { c = 1; n++; } else c = 0;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return n;
  },
  borrows(a, b) {
    let br = 0, n = 0;
    while (b > 0 || a > 0) {
      const t = (a % 10) - br, u = b % 10;
      if (t < u) { br = 1; n++; } else br = 0;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return n;
  },
  // Add without carrying, digit by digit — what a child produces when the
  // carry never happens. Used as a slip, so it must be a real wrong answer.
  addNoCarry(a, b) {
    let out = 0, mul = 1;
    while (a > 0 || b > 0) {
      out += ((a % 10) + (b % 10)) % 10 * mul;
      mul *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return out;
  },
  // Subtract taking the smaller digit from the larger in every column.
  subNoBorrow(a, b) {
    let out = 0, mul = 1;
    while (a > 0 || b > 0) {
      out += Math.abs((a % 10) - (b % 10)) * mul;
      mul *= 10; a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return out;
  },
  money(c) {
    return '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0');
  },
  dec(v, dp) {
    if (dp === 0) return String(v);
    const s = String(Math.abs(v)).padStart(dp + 1, '0');
    return (v < 0 ? '-' : '') + s.slice(0, -dp) + '.' + s.slice(-dp);
  },
  clock(min) {
    const h = Math.floor(min / 60) % 12 || 12;
    return h + ':' + String(min % 60).padStart(2, '0');
  },
  ord(n) {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  // Distinct, plausible, and never accidentally equal to the right answer.
  slips(a, list) {
    const out = [], seen = new Set([JSON.stringify(a)]);
    list.forEach(s => {
      const k = JSON.stringify(s.v);
      if (!seen.has(k) && s.v !== null && s.v !== undefined) { seen.add(k); out.push(s); }
    });
    return out;
  },
};

const GEN = {};

/* ══ NUMBER & PLACE VALUE ═══════════════════════════════════════════════ */

GEN['npv.count20'] = r => {
  const n = G.ri(r, 0, 19);
  const which = G.pick(r, ['after', 'before', 'between']);
  if (which === 'between') {
    const a = G.ri(r, 0, 18);
    return { q: `What number comes between ${a} and ${a + 2}?`, fmt: 'number',
             a: a + 1, d: a, hint: 'Count on from the first number.',
             slips: G.slips(a + 1, [{ v: a + 2, tag: 'count.off1' }, { v: a, tag: 'count.off1' }]) };
  }
  const after = which === 'after';
  const v = after ? n + 1 : Math.max(0, n - 1);
  return { q: `What number comes just ${which} ${n}?`, fmt: 'number', a: v, d: n,
           hint: after ? 'One more.' : 'One less.',
           slips: G.slips(v, [{ v: after ? n - 1 : n + 1, tag: 'op.swapped' },
                              { v: n, tag: 'count.off1' }]) };
};

GEN['npv.teens'] = r => {
  const ones = G.ri(r, 1, 9), n = 10 + ones;
  return { q: `${n} is ten and how many ones?`, fmt: 'number', a: ones, d: ones,
           hint: 'Take the ten away and count what is left.',
           slips: G.slips(ones, [{ v: n, tag: 'pv.digit' }, { v: 10, tag: 'pv.digit' }]) };
};

GEN['npv.count120'] = r => {
  const n = G.ri(r, 20, 118), step = G.pick(r, [1, 1, 2, 10]);
  return { q: `Count on ${step} from ${n}. What number do you land on?`, fmt: 'number',
           a: n + step, d: n, hint: `Start at ${n} and count ${step} more.`,
           slips: G.slips(n + step, [{ v: n - step, tag: 'op.swapped' },
                                     { v: n + step + 1, tag: 'count.off1' }]) };
};

GEN['npv.pv2'] = r => {
  const n = G.ri(r, 10, 99), tens = Math.floor(n / 10), ones = n % 10;
  const askTens = r() < 0.5;
  return { q: `In ${n}, how many ${askTens ? 'tens' : 'ones'} are there?`, fmt: 'number',
           a: askTens ? tens : ones, d: n,
           hint: 'The ones are the last digit. The tens are the one before it.',
           slips: G.slips(askTens ? tens : ones,
             [{ v: askTens ? ones : tens, tag: 'pv.digit' }, { v: n, tag: 'pv.digit' }]) };
};

GEN['npv.compare2'] = r => {
  const a = G.ri(r, 10, 99);
  const b = G.until(r, () => G.ri(r, 10, 99), x => x !== a);
  return { q: `Which sign goes between them?   ${a} ▢ ${b}`, fmt: 'choice',
           options: ['>', '<', '='], a: a > b ? '>' : '<', d: Math.abs(a - b),
           hint: 'Compare the tens first. Only if they match do the ones decide.',
           slips: G.slips(a > b ? '>' : '<', [{ v: a > b ? '<' : '>', tag: 'op.swapped' }]) };
};

GEN['npv.skip'] = r => {
  const step = G.pick(r, [2, 5, 10]);
  const start = step * G.ri(r, 1, Math.floor(180 / step));
  return { q: `Skip count by ${step}s: ${start}, ${start + step}, ${start + 2 * step}, ▢`,
           fmt: 'number', a: start + 3 * step, d: start,
           hint: `Each jump adds ${step}.`,
           slips: G.slips(start + 3 * step,
             [{ v: start + 2 * step + 1, tag: 'count.off1' },
              { v: start + 4 * step, tag: 'count.off1' }]) };
};

GEN['npv.pv3'] = r => {
  const n = G.ri(r, 100, 999);
  const place = G.pick(r, ['hundreds', 'tens', 'ones']);
  const idx = { hundreds: 0, tens: 1, ones: 2 }[place];
  const ds = G.digits(n);
  return { q: `In ${n}, which digit is in the ${place} place?`, fmt: 'number',
           a: ds[idx], d: n, hint: 'Count the columns from the right: ones, tens, hundreds.',
           slips: G.slips(ds[idx], [{ v: ds[(idx + 1) % 3], tag: 'pv.digit' },
                                    { v: ds[(idx + 2) % 3], tag: 'pv.digit' }]) };
};

GEN['npv.compare3'] = r => {
  const a = G.ri(r, 100, 999);
  const b = G.until(r, () => G.ri(r, 100, 999), x => x !== a);
  return { q: `Which sign goes between them?   ${a} ▢ ${b}`, fmt: 'choice',
           options: ['>', '<', '='], a: a > b ? '>' : '<', d: 999 - Math.abs(a - b),
           hint: 'Start at the hundreds and work right until the digits differ.',
           slips: G.slips(a > b ? '>' : '<', [{ v: a > b ? '<' : '>', tag: 'op.swapped' }]) };
};

GEN['npv.evenodd'] = r => {
  const n = G.ri(r, 0, 100);
  return { q: `Is ${n} even or odd?`, fmt: 'choice', options: ['Even', 'Odd'],
           a: n % 2 === 0 ? 'Even' : 'Odd', d: n,
           hint: 'Only the last digit matters. 0, 2, 4, 6, 8 are even.',
           slips: G.slips(n % 2 === 0 ? 'Even' : 'Odd',
             [{ v: n % 2 === 0 ? 'Odd' : 'Even', tag: 'op.swapped' }]) };
};

GEN['npv.round10'] = r => {
  const n = G.until(r, () => G.ri(r, 10, 999), x => x % 10 !== 0);
  const a = Math.round(n / 10) * 10;
  const down = Math.floor(n / 10) * 10;
  return { q: `Round ${n} to the nearest ten.`, fmt: 'number', a, d: n,
           hint: 'Look at the ones digit. 5 or more rounds up.',
           slips: G.slips(a, [{ v: a === down ? down + 10 : down, tag: 'round.wrongway' },
                              { v: Math.round(n / 100) * 100, tag: 'round.wrongplace' }]) };
};

GEN['npv.round100'] = r => {
  const n = G.until(r, () => G.ri(r, 100, 9999), x => x % 100 !== 0);
  const a = Math.round(n / 100) * 100;
  const down = Math.floor(n / 100) * 100;
  return { q: `Round ${n} to the nearest hundred.`, fmt: 'number', a, d: n,
           hint: 'Look at the tens digit. 5 or more rounds up.',
           slips: G.slips(a, [{ v: a === down ? down + 100 : down, tag: 'round.wrongway' },
                              { v: Math.round(n / 10) * 10, tag: 'round.wrongplace' }]) };
};

GEN['npv.pv4'] = r => {
  const n = G.ri(r, 1000, 10000);
  const place = G.pick(r, ['thousands', 'hundreds', 'tens', 'ones']);
  const pow = { ones: 1, tens: 10, hundreds: 100, thousands: 1000 }[place];
  const a = Math.floor(n / pow) % 10;
  return { q: `In ${n.toLocaleString('en-US')}, which digit is in the ${place} place?`,
           fmt: 'number', a, d: n,
           hint: 'Ones, tens, hundreds, thousands — counting from the right.',
           slips: G.slips(a, [{ v: Math.floor(n / (pow * 10)) % 10, tag: 'pv.digit' },
                              { v: Math.floor(n / Math.max(1, pow / 10)) % 10, tag: 'pv.digit' }]) };
};

GEN['npv.pv6'] = r => {
  const n = G.ri(r, 1000, 999999);
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
  const k = G.ri(r, 0, String(n).length - 1);
  const a = Math.floor(n / Math.pow(10, k)) % 10;
  return { q: `In ${n.toLocaleString('en-US')}, which digit is in the ${places[k]} place?`,
           fmt: 'number', a, d: n, hint: 'Count columns from the right.',
           slips: G.slips(a, [{ v: Math.floor(n / Math.pow(10, Math.min(5, k + 1))) % 10, tag: 'pv.digit' }]) };
};

GEN['npv.compare6'] = r => {
  const a = G.ri(r, 1000, 999999);
  const b = G.until(r, () => G.ri(r, 1000, 999999), x => x !== a);
  return { q: `Which is greater?`, fmt: 'choice',
           options: [a.toLocaleString('en-US'), b.toLocaleString('en-US')],
           a: (a > b ? a : b).toLocaleString('en-US'), d: 999999 - Math.abs(a - b),
           hint: 'The one with more digits wins. Same digits — compare from the left.',
           slips: G.slips((a > b ? a : b).toLocaleString('en-US'),
             [{ v: (a > b ? b : a).toLocaleString('en-US'), tag: 'pv.digit' }]) };
};

GEN['npv.round.any'] = r => {
  const pow = G.pick(r, [10, 100, 1000, 10000]);
  const names = { 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand' };
  const n = G.until(r, () => G.ri(r, pow, 999999), x => x % pow !== 0);
  const a = Math.round(n / pow) * pow;
  const down = Math.floor(n / pow) * pow;
  return { q: `Round ${n.toLocaleString('en-US')} to the nearest ${names[pow]}.`,
           fmt: 'number', a, d: pow,
           hint: `Underline the ${names[pow]} place, then look at the digit to its right.`,
           slips: G.slips(a, [{ v: a === down ? down + pow : down, tag: 'round.wrongway' },
                              { v: Math.round(n / (pow * 10)) * pow * 10, tag: 'round.wrongplace' }]) };
};

GEN['npv.powers10'] = r => {
  const k = G.ri(r, 1, 6), base = G.ri(r, 2, 9);
  const up = r() < 0.5;
  const n = base * Math.pow(10, G.ri(r, 0, 3));
  const a = up ? n * 10 : n * Math.pow(10, k) / Math.pow(10, k);
  if (up) {
    return { q: `${n.toLocaleString('en-US')} × 10 = ▢`, fmt: 'number', a: n * 10, d: k,
             hint: 'Every digit shifts one place to the left. Write a zero on the end.',
             slips: G.slips(n * 10, [{ v: n, tag: 'pv.digit' }, { v: n * 100, tag: 'pv.digit' }]) };
  }
  return { q: `What is 10${'⁰¹²³⁴⁵⁶'[k]} as a number?`, fmt: 'number', a: Math.pow(10, k), d: k,
           hint: `10 to the power ${k} is 1 followed by ${k} zeros.`,
           slips: G.slips(Math.pow(10, k), [{ v: 10 * k, tag: 'exp.multiplied' },
                                            { v: Math.pow(10, k - 1), tag: 'count.off1' }]) };
};

GEN['npv.integers'] = r => {
  const a = G.ri(r, -50, 50);
  const b = G.until(r, () => G.ri(r, -50, 50), x => x !== a);
  return { q: `Which is greater, ${a} or ${b}?`, fmt: 'choice',
           options: [String(a), String(b)], a: String(Math.max(a, b)), d: Math.abs(a - b),
           hint: 'Further right on the number line is greater. −2 is bigger than −9.',
           slips: G.slips(String(Math.max(a, b)),
             [{ v: String(Math.min(a, b)), tag: 'neg.sign' }]) };
};

GEN['npv.abs'] = r => {
  const n = G.until(r, () => G.ri(r, -50, 50), x => x !== 0);
  const askAbs = r() < 0.5;
  if (askAbs) {
    return { q: `What is |${n}| ?`, fmt: 'number', a: Math.abs(n), d: Math.abs(n),
             hint: 'Absolute value is the distance from zero, and distance is never negative.',
             slips: G.slips(Math.abs(n), [{ v: n, tag: 'neg.sign' }, { v: -Math.abs(n), tag: 'neg.sign' }]) };
  }
  return { q: `What is the opposite of ${n}?`, fmt: 'number', a: -n, d: Math.abs(n),
           hint: 'The opposite is the same distance from zero, on the other side.',
           slips: G.slips(-n, [{ v: n, tag: 'neg.sign' }, { v: Math.abs(n), tag: 'neg.sign' }]) };
};

GEN['npv.exponents'] = r => {
  const base = G.ri(r, 2, 12), k = G.ri(r, 0, 5);
  const a = Math.pow(base, k);
  return { q: `What is ${base}${'⁰¹²³⁴⁵'[k]} ?`, fmt: 'number', a, d: a,
           hint: `${base} to the power ${k} means ${k} copies of ${base} multiplied together.`,
           slips: G.slips(a, [{ v: base * k, tag: 'exp.multiplied' },
                              { v: Math.pow(base, Math.max(0, k - 1)), tag: 'count.off1' }]) };
};

/* ══ ADDITION & SUBTRACTION ═════════════════════════════════════════════ */

const addGen = (lo, hi, want, tagset) => r => {
  const [a, b] = G.until(r, () => {
    const x = G.ri(r, lo, hi), y = G.ri(r, lo, hi);
    return [x, y];
  }, ([x, y]) => want(x, y));
  const sum = a + b;
  return { q: `${a} + ${b} = ▢`, fmt: 'number', a: sum, d: sum,
           hint: 'Add the ones first, then the tens.',
           slips: G.slips(sum, [
             { v: G.addNoCarry(a, b), tag: 'carry.forgot' },
             { v: Math.abs(a - b), tag: 'op.swapped' },
             { v: sum + 10, tag: 'carry.extra' },
             { v: sum - 1, tag: 'count.off1' },
           ].filter(s => !tagset || tagset.includes(s.tag))) };
};

const subGen = (lo, hi, want) => r => {
  const [a, b] = G.until(r, () => {
    const x = G.ri(r, lo, hi), y = G.ri(r, lo, hi);
    return x >= y ? [x, y] : [y, x];
  }, ([x, y]) => want(x, y));
  const diff = a - b;
  return { q: `${a} − ${b} = ▢`, fmt: 'number', a: diff, d: a,
           hint: 'Start at the ones. If the top digit is smaller, borrow a ten.',
           slips: G.slips(diff, [
             { v: G.subNoBorrow(a, b), tag: 'borrow.forgot' },
             { v: a + b, tag: 'op.swapped' },
             { v: diff + 10, tag: 'borrow.neighbour' },
             { v: diff - 1, tag: 'count.off1' },
           ]) };
};

GEN['as.add10'] = addGen(0, 10, (a, b) => a + b <= 10);
GEN['as.sub10'] = subGen(0, 10, (a, b) => a <= 10 && b <= a);
GEN['as.add20'] = addGen(2, 18, (a, b) => a + b >= 11 && a + b <= 20 && Math.max(a, b) >= 5);
GEN['as.sub20'] = subGen(0, 20, (a, b) => a <= 20 && b <= a && b > 0);
GEN['as.add2d.nr'] = addGen(10, 89, (a, b) => G.carries(a, b) === 0 && a + b <= 99);
GEN['as.add2d.rg'] = addGen(10, 99, (a, b) => G.carries(a, b) >= 1);
GEN['as.sub2d.nr'] = subGen(10, 99, (a, b) => G.borrows(a, b) === 0 && b >= 10);
GEN['as.sub2d.rg'] = subGen(10, 99, (a, b) => G.borrows(a, b) === 1 && b >= 10);
GEN['as.add3d'] = addGen(100, 899, (a, b) => G.carries(a, b) >= 1 && a + b <= 999);
GEN['as.addmulti'] = addGen(1000, 499999, (a, b) => G.carries(a, b) >= 1 && a + b <= 1000000);
GEN['as.submulti'] = subGen(1000, 999999, (a, b) => G.borrows(a, b) >= 1 && b >= 1000);

GEN['as.bonds10'] = r => {
  const a = G.ri(r, 1, 9);
  return { q: `${a} + ▢ = 10`, fmt: 'number', a: 10 - a, d: a,
           hint: 'How many more to fill a ten frame?',
           slips: G.slips(10 - a, [{ v: 10 + a, tag: 'op.swapped' }, { v: 11 - a, tag: 'count.off1' }]) };
};

GEN['as.missadd'] = r => {
  const sum = G.ri(r, 5, 20), a = G.ri(r, 1, sum - 1);
  return { q: `${a} + ▢ = ${sum}`, fmt: 'number', a: sum - a, d: sum,
           hint: 'Count on from the number you have until you reach the total.',
           slips: G.slips(sum - a, [{ v: sum + a, tag: 'op.swapped' },
                                    { v: sum - a - 1, tag: 'count.off1' }]) };
};

GEN['as.jump100'] = r => {
  const n = G.ri(r, 100, 899), step = G.pick(r, [10, 100]);
  const up = r() < 0.5;
  const a = up ? n + step : n - step;
  return { q: `${n} ${up ? '+' : '−'} ${step} = ▢`, fmt: 'number', a, d: n,
           hint: step === 10 ? 'Only the tens digit changes.' : 'Only the hundreds digit changes.',
           slips: G.slips(a, [{ v: up ? n - step : n + step, tag: 'op.swapped' },
                              { v: up ? n + step * 10 : n - step * 10, tag: 'pv.digit' }]) };
};

GEN['as.subzero'] = r => {
  const a = G.until(r, () => G.ri(r, 101, 1000),
    x => String(x).length >= 3 && String(x).slice(1, -1).includes('0'));
  const b = G.until(r, () => G.ri(r, 11, a - 1), y => G.borrows(a, y) >= 1);
  return { q: `${a} − ${b} = ▢`, fmt: 'number', a: a - b, d: a,
           hint: 'A zero has nothing to lend. Keep going left until you find a digit above zero.',
           slips: G.slips(a - b, [{ v: G.subNoBorrow(a, b), tag: 'zero.borrow' },
                                  { v: a - b + 10, tag: 'borrow.neighbour' },
                                  { v: a + b, tag: 'op.swapped' }]) };
};

GEN['as.estimate'] = r => {
  const a = G.until(r, () => G.ri(r, 12, 899), x => x % 10 !== 0);
  const b = G.until(r, () => G.ri(r, 12, 899), x => x % 10 !== 0);
  const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
  return { q: `Round each to the nearest ten, then add:  ${a} + ${b}`, fmt: 'number',
           a: ra + rb, d: a + b, hint: 'Round first. Add the rounded numbers, not the real ones.',
           slips: G.slips(ra + rb, [{ v: a + b, tag: 'round.wrongplace' },
                                    { v: Math.round((a + b) / 100) * 100, tag: 'round.wrongplace' }]) };
};

GEN['as.integers'] = r => {
  const a = G.ri(r, -50, 50), b = G.ri(r, -50, 50);
  const minus = r() < 0.5;
  const ans = minus ? a - b : a + b;
  return { q: `${a} ${minus ? '−' : '+'} ${b < 0 ? '(' + b + ')' : b} = ▢`, fmt: 'number',
           a: ans, d: Math.abs(a) + Math.abs(b),
           hint: minus ? 'Taking away a negative adds.' : 'Moving right for positive, left for negative.',
           slips: G.slips(ans, [{ v: -ans, tag: 'neg.sign' },
                                { v: minus ? a + b : a - b, tag: 'neg.double' },
                                { v: Math.abs(a) + Math.abs(b), tag: 'neg.sign' }]) };
};

/* ══ MULTIPLICATION & DIVISION ══════════════════════════════════════════ */

const factGen = tables => r => {
  const t = G.pick(r, tables), o = G.ri(r, 0, 12);
  const flip = r() < 0.5;
  const [a, b] = flip ? [o, t] : [t, o];
  return { q: `${a} × ${b} = ▢`, fmt: 'number', a: a * b, d: a * b,
           hint: `${a} groups of ${b}.`,
           slips: G.slips(a * b, [{ v: a * b + t, tag: 'fact.near' },
                                  { v: Math.max(0, a * b - t), tag: 'fact.near' },
                                  { v: a + b, tag: 'op.swapped' }]) };
};

GEN['md.f.2510'] = factGen([2, 5, 10]);
GEN['md.f.34'] = factGen([3, 4]);
GEN['md.f.69'] = factGen([6, 9]);
GEN['md.f.78'] = factGen([7, 8]);
GEN['md.f.all'] = factGen([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

GEN['md.props'] = r => {
  const a = G.ri(r, 2, 12), b = G.ri(r, 2, 12);
  const kind = G.pick(r, ['commute', 'distribute']);
  if (kind === 'commute') {
    return { q: `${a} × ${b} = ${b} × ▢`, fmt: 'number', a, d: a * b,
             hint: 'Turning a times fact round does not change the answer.',
             slips: G.slips(a, [{ v: b, tag: 'op.swapped' }, { v: a * b, tag: 'fact.near' }]) };
  }
  const split = G.ri(r, 1, b - 1);
  return { q: `${a} × ${b} = (${a} × ${split}) + (${a} × ▢)`, fmt: 'number',
           a: b - split, d: a * b,
           hint: 'The two parts have to add back up to the number you split.',
           slips: G.slips(b - split, [{ v: split, tag: 'op.swapped' },
                                      { v: b, tag: 'fact.near' }]) };
};

GEN['md.div.f'] = r => {
  const d = G.ri(r, 1, 12), q = G.ri(r, 1, 12);
  return { q: `${d * q} ÷ ${d} = ▢`, fmt: 'number', a: q, d: d * q,
           hint: `How many ${d}s fit into ${d * q}?`,
           slips: G.slips(q, [{ v: d, tag: 'op.invert' }, { v: d * q, tag: 'op.invert' },
                              { v: q + 1, tag: 'fact.near' }]) };
};

GEN['md.div.rules'] = r => {
  const n = G.ri(r, 2, 144), kind = G.pick(r, ['one', 'self', 'zero']);
  if (kind === 'one') {
    return { q: `${n} ÷ 1 = ▢`, fmt: 'number', a: n, d: n,
             hint: 'Sharing between one person gives that person everything.',
             slips: G.slips(n, [{ v: 1, tag: 'op.invert' }]) };
  }
  if (kind === 'self') {
    return { q: `${n} ÷ ${n} = ▢`, fmt: 'number', a: 1, d: n,
             hint: 'Any number fits into itself exactly once.',
             slips: G.slips(1, [{ v: n, tag: 'op.invert' }, { v: 0, tag: 'op.invert' }]) };
  }
  return { q: `What is ${n} ÷ 0 ?`, fmt: 'choice',
           options: ['0', String(n), 'It has no answer'], a: 'It has no answer', d: n,
           hint: 'How many groups of nothing make ' + n + '? You could take groups of nothing forever.',
           slips: G.slips('It has no answer', [{ v: '0', tag: 'op.invert' },
                                               { v: String(n), tag: 'op.invert' }]) };
};

GEN['md.mult1d'] = r => {
  const a = G.ri(r, 12, 999), b = G.ri(r, 2, 9);
  const onesOnly = (a % 10) * b;
  return { q: `${a} × ${b} = ▢`, fmt: 'number', a: a * b, d: a * b,
           hint: 'Multiply each digit, starting at the ones, and carry.',
           slips: G.slips(a * b, [{ v: onesOnly, tag: 'mult.partial' },
                                  { v: G.addNoCarry(a * b, 0), tag: 'carry.forgot' },
                                  { v: a + b, tag: 'op.swapped' }]) };
};

GEN['md.mult2d'] = r => {
  const a = G.ri(r, 11, 99), b = G.ri(r, 11, 99);
  const ones = b % 10, tens = Math.floor(b / 10);
  return { q: `${a} × ${b} = ▢`, fmt: 'number', a: a * b, d: a * b,
           hint: 'Multiply by the ones, then by the tens — and shift that row one place left.',
           slips: G.slips(a * b, [{ v: a * ones + a * tens, tag: 'mult.noshift' },
                                  { v: a * ones, tag: 'mult.partial' },
                                  { v: a + b, tag: 'op.swapped' }]) };
};

GEN['md.mult3d'] = r => {
  const a = G.ri(r, 100, 999), b = G.ri(r, 11, 99);
  const ones = b % 10, tens = Math.floor(b / 10);
  return { q: `${a} × ${b} = ▢`, fmt: 'number', a: a * b, d: a * b,
           hint: 'Two rows: one for the ones digit, one for the tens — shifted one place left.',
           slips: G.slips(a * b, [{ v: a * ones + a * tens, tag: 'mult.noshift' },
                                  { v: a * ones, tag: 'mult.partial' }]) };
};

GEN['md.div1d'] = r => {
  const b = G.ri(r, 2, 9), q = G.ri(r, 2, Math.floor(999 / b));
  const rem = G.ri(r, 0, b - 1), a = q * b + rem;
  if (a > 999) return GEN['md.div1d'](r);
  if (rem === 0) {
    return { q: `${a} ÷ ${b} = ▢`, fmt: 'number', a: q, d: a,
             hint: 'Work left to right, one digit at a time.',
             slips: G.slips(q, [{ v: b, tag: 'op.invert' }, { v: q + 1, tag: 'fact.near' }]) };
  }
  return { q: `${a} ÷ ${b} = ▢ remainder ▢`, fmt: 'quotrem', a: { q, rem }, d: a,
           hint: 'Divide as far as you can. Whatever will not make another whole group is the remainder.',
           slips: G.slips({ q, rem }, [{ v: { q, rem: 0 }, tag: 'div.remainder.drop' },
                                       { v: { q: q + 1, rem: rem - b }, tag: 'div.remainder.big' }]) };
};

GEN['md.div2d'] = r => {
  const b = G.ri(r, 10, 99), q = G.ri(r, 2, Math.floor(9999 / b));
  const a = q * b;
  return { q: `${a.toLocaleString('en-US')} ÷ ${b} = ▢`, fmt: 'number', a: q, d: a,
           hint: 'Estimate how many times it goes, multiply back, subtract, bring down.',
           slips: G.slips(q, [{ v: b, tag: 'op.invert' },
                              { v: Number(String(q).replace('0', '')) || q + 1, tag: 'div.zero.skip' }]) };
};

GEN['md.factors'] = r => {
  const n = G.ri(r, 2, 100);
  const facs = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) facs.push(i);
  const prime = facs.length === 2;
  return { q: `Is ${n} prime or composite?`, fmt: 'choice', options: ['Prime', 'Composite'],
           a: n === 1 ? 'Composite' : (prime ? 'Prime' : 'Composite'), d: n,
           hint: 'A prime has exactly two factors: 1 and itself.',
           slips: G.slips(prime ? 'Prime' : 'Composite',
             [{ v: prime ? 'Composite' : 'Prime', tag: 'op.swapped' }]) };
};

GEN['md.primefact'] = r => {
  const n = G.until(r, () => G.ri(r, 4, 100), x => {
    for (let i = 2; i * i <= x; i++) if (x % i === 0) return true;
    return false;
  });
  let m = n, small = 2;
  while (m % small !== 0) small++;
  return { q: `What is the smallest prime factor of ${n}?`, fmt: 'number', a: small, d: n,
           hint: 'Try 2, then 3, then 5, then 7 — in order.',
           slips: G.slips(small, [{ v: n / small, tag: 'op.invert' }, { v: 1, tag: 'unknown' }]) };
};

GEN['md.gcflcm'] = r => {
  const a = G.ri(r, 2, 60), b = G.ri(r, 2, 60);
  const wantGcf = r() < 0.5;
  const g = G.gcd(a, b), l = G.lcm(a, b);
  return { q: `What is the ${wantGcf ? 'greatest common factor' : 'lowest common multiple'} of ${a} and ${b}?`,
           fmt: 'number', a: wantGcf ? g : l, d: Math.max(a, b),
           hint: wantGcf ? 'The biggest number that divides BOTH.' : 'The first number both count up to.',
           slips: G.slips(wantGcf ? g : l, [{ v: wantGcf ? l : g, tag: 'op.swapped' },
                                            { v: a * b, tag: 'op.swapped' }]) };
};

GEN['md.orderops'] = r => {
  const a = G.ri(r, 2, 12), b = G.ri(r, 2, 9), c = G.ri(r, 2, 9);
  const shape = G.pick(r, ['mul-add', 'paren', 'exp']);
  if (shape === 'mul-add') {
    return { q: `${a} + ${b} × ${c} = ▢`, fmt: 'number', a: a + b * c, d: a + b * c,
             hint: 'Multiplication happens before addition, wherever it sits.',
             slips: G.slips(a + b * c, [{ v: (a + b) * c, tag: 'ops.leftright' }]) };
  }
  if (shape === 'paren') {
    return { q: `(${a} + ${b}) × ${c} = ▢`, fmt: 'number', a: (a + b) * c, d: (a + b) * c,
             hint: 'Brackets first, always.',
             slips: G.slips((a + b) * c, [{ v: a + b * c, tag: 'ops.leftright' }]) };
  }
  const k = G.ri(r, 2, 3);
  return { q: `${a} + ${b}${'⁰¹²³'[k]} = ▢`, fmt: 'number', a: a + Math.pow(b, k),
           d: a + Math.pow(b, k), hint: 'Exponents before addition.',
           slips: G.slips(a + Math.pow(b, k), [{ v: a + b * k, tag: 'exp.multiplied' },
                                               { v: Math.pow(a + b, k), tag: 'ops.leftright' }]) };
};

/* ══ FRACTIONS ══════════════════════════════════════════════════════════ */

GEN['fr.equiv'] = r => {
  const d = G.ri(r, 2, 12), n = G.ri(r, 1, d - 1), k = G.ri(r, 2, 4);
  return { q: `${n}/${d} = ▢/${d * k}`, fmt: 'number', a: n * k, d: d,
           hint: `The bottom was multiplied by ${k}, so the top must be too.`,
           slips: G.slips(n * k, [{ v: n + k, tag: 'frac.commondenom' },
                                  { v: n, tag: 'frac.commondenom' }]) };
};

GEN['fr.cmp.same'] = r => {
  // d starts at 3, not 2: with halves there is only one numerator below the
  // denominator, so "pick a different one" is unsatisfiable and the generator
  // spins 200 times and throws. Constrain the draw, do not reject after it.
  const d = G.ri(r, 3, 12), a = G.ri(r, 1, d - 1);
  const b = G.until(r, () => G.ri(r, 1, d - 1), x => x !== a);
  return { q: `Which is greater, ${a}/${d} or ${b}/${d}?`, fmt: 'choice',
           options: [`${a}/${d}`, `${b}/${d}`], a: `${Math.max(a, b)}/${d}`, d: d,
           hint: 'Same size pieces — so more pieces is more.',
           slips: G.slips(`${Math.max(a, b)}/${d}`, [{ v: `${Math.min(a, b)}/${d}`, tag: 'op.swapped' }]) };
};

GEN['fr.whole'] = r => {
  const d = G.ri(r, 2, 12), w = G.ri(r, 1, 5);
  return { q: `How many ${d}ths make ${w === 1 ? '1 whole' : w + ' wholes'}?`, fmt: 'number',
           a: d * w, d: d * w, hint: `Each whole takes ${d} of them.`,
           slips: G.slips(d * w, [{ v: d, tag: 'count.off1' }, { v: d + w, tag: 'frac.commondenom' }]) };
};

GEN['fr.cmp.unlike'] = r => {
  const [d1, d2] = G.until(r, () => [G.ri(r, 2, 12), G.ri(r, 2, 12)], ([x, y]) => x !== y);
  const n1 = G.ri(r, 1, d1 - 1), n2 = G.ri(r, 1, d2 - 1);
  const left = n1 * d2, right = n2 * d1;
  if (left === right) return GEN['fr.cmp.unlike'](r);
  const win = left > right ? `${n1}/${d1}` : `${n2}/${d2}`;
  const lose = left > right ? `${n2}/${d2}` : `${n1}/${d1}`;
  return { q: `Which is greater, ${n1}/${d1} or ${n2}/${d2}?`, fmt: 'choice',
           options: [`${n1}/${d1}`, `${n2}/${d2}`], a: win, d: d1 * d2,
           hint: 'Give them the same bottom number first, then compare the tops.',
           slips: G.slips(win, [{ v: lose, tag: d1 > d2 === (left > right) ? 'frac.bigger.bottom' : 'op.swapped' }]) };
};

GEN['fr.as.same'] = r => {
  const d = G.ri(r, 2, 12), a = G.ri(r, 1, d - 1);
  const plus = r() < 0.5;
  const b = plus ? G.ri(r, 1, d - a > 0 ? d - a : 1) : G.ri(r, 1, a);
  const n = plus ? a + b : a - b;
  return { q: `${a}/${d} ${plus ? '+' : '−'} ${b}/${d} = ▢`, fmt: 'fraction',
           a: { n, d }, d: d, hint: 'Same bottom number: work on the tops only.',
           slips: G.slips({ n, d }, [{ v: { n, d: plus ? d + d : d }, tag: 'frac.addbottoms' },
                                     { v: { n: plus ? a - b : a + b, d }, tag: 'op.swapped' }]) };
};

GEN['fr.as.unlike'] = r => {
  const [d1, d2] = G.until(r, () => [G.ri(r, 2, 12), G.ri(r, 2, 12)], ([x, y]) => x !== y);
  const n1 = G.ri(r, 1, d1 - 1), n2 = G.ri(r, 1, d2 - 1);
  const L = G.lcm(d1, d2);
  const n = n1 * (L / d1) + n2 * (L / d2);
  return { q: `${n1}/${d1} + ${n2}/${d2} = ▢`, fmt: 'fraction', a: { n, d: L }, d: L,
           hint: 'Find a bottom number both fit into, rewrite both, then add the tops.',
           slips: G.slips({ n, d: L }, [{ v: { n: n1 + n2, d: d1 + d2 }, tag: 'frac.addbottoms' },
                                        { v: { n: n1 + n2, d: Math.max(d1, d2) }, tag: 'frac.commondenom' }]) };
};

GEN['fr.simplify'] = r => {
  const s = G.frac(G.ri(r, 1, 11), G.ri(r, 2, 12));
  const k = G.ri(r, 2, 8);
  const n = s.n * k, d = s.d * k;
  if (d > 100) return GEN['fr.simplify'](r);
  return { q: `Write ${n}/${d} in its simplest form.`, fmt: 'fraction', a: s, d: d,
           hint: 'Find the biggest number that divides both, then divide both by it.',
           slips: G.slips(s, [{ v: { n, d }, tag: 'frac.simplify' },
                              { v: { n: n / 2, d: d / 2 }, tag: 'frac.simplify' }]
             .filter(x => Number.isInteger(x.v.n) && Number.isInteger(x.v.d))) };
};

GEN['fr.mixed'] = r => {
  const d = G.ri(r, 2, 12), w = G.ri(r, 1, 10), n = G.ri(r, 1, d - 1);
  return { q: `Write ${w} ${n}/${d} as an improper fraction.`, fmt: 'fraction',
           a: { n: w * d + n, d }, d: w * d + n,
           hint: 'Multiply the whole by the bottom, add the top, keep the bottom.',
           slips: G.slips({ n: w * d + n, d },
             [{ v: { n: w + n, d }, tag: 'frac.mixed.convert' },
              { v: { n: w * d, d }, tag: 'frac.mixed.convert' },
              { v: { n: w * n, d }, tag: 'frac.mixed.convert' }]) };
};

GEN['fr.mult.whole'] = r => {
  const d = G.ri(r, 2, 12), n = G.ri(r, 1, d - 1), w = G.ri(r, 2, 12);
  return { q: `${w} × ${n}/${d} = ▢`, fmt: 'fraction', a: { n: n * w, d }, d: w * d,
           hint: 'Multiply the top by the whole number. The bottom does not change.',
           slips: G.slips({ n: n * w, d }, [{ v: { n: n * w, d: d * w }, tag: 'frac.addbottoms' },
                                            { v: { n, d: d * w }, tag: 'frac.addbottoms' }]) };
};

GEN['fr.mult.frac'] = r => {
  const d1 = G.ri(r, 2, 12), n1 = G.ri(r, 1, d1 - 1);
  const d2 = G.ri(r, 2, 12), n2 = G.ri(r, 1, d2 - 1);
  return { q: `${n1}/${d1} × ${n2}/${d2} = ▢`, fmt: 'fraction',
           a: G.frac(n1 * n2, d1 * d2), d: d1 * d2,
           hint: 'Tops times tops, bottoms times bottoms.',
           slips: G.slips(G.frac(n1 * n2, d1 * d2),
             [{ v: G.frac(n1 * n2, G.lcm(d1, d2)), tag: 'frac.commondenom' },
              { v: G.frac(n1 * d2, d1 * n2), tag: 'frac.invert' }]) };
};

GEN['fr.div.unit'] = r => {
  const d = G.ri(r, 2, 12), w = G.ri(r, 2, 12);
  return { q: `${w} ÷ 1/${d} = ▢`, fmt: 'number', a: w * d, d: w * d,
           hint: `How many ${d}ths fit into ${w} wholes?`,
           slips: G.slips(w * d, [{ v: Math.round(w / d) === w / d ? w / d : null, tag: 'frac.invert' },
                                  { v: w + d, tag: 'op.swapped' }]) };
};

GEN['fr.div.frac'] = r => {
  const d1 = G.ri(r, 2, 12), n1 = G.ri(r, 1, d1 - 1);
  const d2 = G.ri(r, 2, 12), n2 = G.ri(r, 1, d2 - 1);
  return { q: `${n1}/${d1} ÷ ${n2}/${d2} = ▢`, fmt: 'fraction',
           a: G.frac(n1 * d2, d1 * n2), d: d1 * d2,
           hint: 'Keep the first, change to times, flip the second.',
           slips: G.slips(G.frac(n1 * d2, d1 * n2),
             [{ v: G.frac(n1 * n2, d1 * d2), tag: 'frac.invert' },
              { v: G.frac(d1 * n2, n1 * d2), tag: 'op.invert' }]) };
};

/* ══ DECIMALS, PERCENT & RATIO ══════════════════════════════════════════ */

GEN['dp.dec.frac'] = r => {
  const dp = G.pick(r, [1, 2]);
  const v = G.ri(r, 1, Math.pow(10, dp) - 1);
  const den = Math.pow(10, dp);
  return { q: `Write ${G.dec(v, dp)} as a fraction in its simplest form.`, fmt: 'fraction',
           a: G.frac(v, den), d: den,
           hint: dp === 1 ? 'One decimal place means tenths.' : 'Two decimal places means hundredths.',
           slips: G.slips(G.frac(v, den), [{ v: { n: v, d: den }, tag: 'frac.simplify' },
                                           { v: { n: v, d: dp === 1 ? 100 : 10 }, tag: 'pv.digit' }]) };
};

GEN['dp.compare'] = r => {
  const a = G.ri(r, 1, 9999), b = G.until(r, () => G.ri(r, 1, 9999), x => x !== a);
  return { q: `Which is greater, ${G.dec(a, 2)} or ${G.dec(b, 2)}?`, fmt: 'choice',
           options: [G.dec(a, 2), G.dec(b, 2)], a: G.dec(Math.max(a, b), 2), d: Math.abs(a - b),
           hint: 'Compare tenths first, then hundredths. More digits does not mean bigger.',
           slips: G.slips(G.dec(Math.max(a, b), 2),
             [{ v: G.dec(Math.min(a, b), 2), tag: 'dec.compare.length' }]) };
};

GEN['dp.addsub'] = r => {
  const a = G.ri(r, 1, 99999), b = G.ri(r, 1, 99999);
  const plus = r() < 0.5;
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  const v = plus ? a + b : hi - lo;
  return { q: `${G.dec(plus ? a : hi, 2)} ${plus ? '+' : '−'} ${G.dec(plus ? b : lo, 2)} = ▢`,
           fmt: 'decimal2', a: { v, dp: 2 }, d: v,
           hint: 'Line up the decimal points, not the last digits.',
           slips: G.slips({ v, dp: 2 },
             [{ v: { v: plus ? G.addNoCarry(a, b) : G.subNoBorrow(hi, lo), dp: 2 }, tag: 'dec.align' },
              { v: { v: plus ? Math.abs(a - b) : a + b, dp: 2 }, tag: 'op.swapped' }]) };
};

GEN['dp.mult'] = r => {
  const a = G.ri(r, 10, 999), b = G.ri(r, 10, 999);   // each is x.xx after scaling
  const v = a * b;                                    // 4 decimal places
  return { q: `${G.dec(a, 2)} × ${G.dec(b, 2)} = ▢`, fmt: 'decimal4', a: { v, dp: 4 }, d: v,
           hint: 'Multiply as whole numbers, then count the decimal places in BOTH factors.',
           slips: G.slips({ v, dp: 4 }, [{ v: { v, dp: 2 }, tag: 'dec.places' },
                                         { v: { v, dp: 3 }, tag: 'dec.places' }]) };
};

GEN['dp.div'] = r => {
  const b = G.ri(r, 2, 99), q = G.ri(r, 2, 999);
  const a = b * q;                                   // exact by construction
  return { q: `${G.dec(a, 2)} ÷ ${b} = ▢`, fmt: 'decimal2', a: { v: q, dp: 2 }, d: a,
           hint: 'Divide as normal and keep the decimal point directly above where it started.',
           slips: G.slips({ v: q, dp: 2 }, [{ v: { v: q * 10, dp: 2 }, tag: 'dec.places' },
                                            { v: { v: q, dp: 1 }, tag: 'dec.places' }]) };
};

GEN['dp.round'] = r => {
  const v = G.ri(r, 1, 999999), src = 3;
  const to = G.pick(r, [1, 2]);
  const pow = Math.pow(10, src - to);
  const rounded = Math.round(v / pow);
  const down = Math.floor(v / pow);
  return { q: `Round ${G.dec(v, src)} to ${to === 1 ? 'one decimal place' : 'two decimal places'}.`,
           fmt: to === 1 ? 'decimal1' : 'decimal2', a: { v: rounded, dp: to }, d: v,
           hint: 'Look at the very next digit. 5 or more rounds up.',
           slips: G.slips({ v: rounded, dp: to },
             [{ v: { v: rounded === down ? down + 1 : down, dp: to }, tag: 'round.wrongway' },
              { v: { v: Math.round(v / Math.pow(10, src)), dp: 0 }, tag: 'round.wrongplace' }]) };
};

GEN['dp.percent'] = r => {
  const p = G.ri(r, 1, 100);
  return { q: `Write ${p}% as a fraction in its simplest form.`, fmt: 'fraction',
           a: G.frac(p, 100), d: p, hint: 'Percent means "out of a hundred".',
           slips: G.slips(G.frac(p, 100), [{ v: { n: p, d: 100 }, tag: 'frac.simplify' },
                                           { v: { n: p, d: 10 }, tag: 'pv.digit' }]) };
};

GEN['dp.percent.of'] = r => {
  const p = G.pick(r, [1, 5, 10, 20, 25, 50, 75]);
  // Whole-number answers only at this stage. Rather than draw and reject —
  // which for p = 1 needs a multiple of 100 and fails most of the time — build
  // the smallest step that always divides exactly, and pick a multiple of it.
  const step = 100 / G.gcd(p, 100);
  const n = step * G.ri(r, 1, Math.floor(1000 / step));
  return { q: `What is ${p}% of ${n}?`, fmt: 'number', a: n * p / 100, d: n,
           hint: `${p}% means ${p} hundredths. Find one hundredth first, then take ${p} of them.`,
           slips: G.slips(n * p / 100, [{ v: n * p, tag: 'dec.places' },
                                        { v: Math.round(n / p), tag: 'op.invert' }]) };
};

GEN['dp.ratio'] = r => {
  const a = G.ri(r, 1, 12), b = G.ri(r, 1, 12), k = G.ri(r, 2, 8);
  if (a * k > 100 || b * k > 100) return GEN['dp.ratio'](r);
  return { q: `${a} : ${b}  =  ${a * k} : ▢`, fmt: 'number', a: b * k, d: a * b,
           hint: `The first part was multiplied by ${k}. Do the same to the second.`,
           slips: G.slips(b * k, [{ v: b + k, tag: 'frac.commondenom' },
                                  { v: b, tag: 'frac.commondenom' }]) };
};

GEN['dp.rate'] = r => {
  const per = G.ri(r, 2, 50), units = G.ri(r, 2, 20);
  const total = per * units;
  return { q: `${units} of them cost ${G.money(total * 100)}. What does one cost?`, fmt: 'money',
           a: per * 100, d: total,
           hint: 'Divide the total by how many there were.',
           slips: G.slips(per * 100, [{ v: total * 100, tag: 'op.invert' },
                                      { v: units * 100, tag: 'op.invert' }]) };
};

/* ══ MEASUREMENT, TIME & MONEY ══════════════════════════════════════════ */

GEN['mt.capacity'] = r => {
  const table = [['cups', 'pint', 2], ['pints', 'quart', 2], ['quarts', 'gallon', 4],
                 ['ounces', 'pound', 16]];
  const [small, big, k] = G.pick(r, table);
  const n = G.ri(r, 1, 8);
  return { q: `How many ${small} are in ${n} ${n === 1 ? big : big + 's'}?`, fmt: 'number',
           a: n * k, d: n * k, hint: `One ${big} is ${k} ${small}.`,
           slips: G.slips(n * k, [{ v: n, tag: 'unit.mixed' },
                                  { v: Math.round(n / k) || 1, tag: 'unit.direction' }]) };
};

GEN['mt.convert'] = r => {
  const table = [['inches', 'foot', 12], ['feet', 'yard', 3], ['ounces', 'pound', 16],
                 ['cups', 'pint', 2], ['pints', 'quart', 2], ['quarts', 'gallon', 4],
                 ['seconds', 'minute', 60], ['minutes', 'hour', 60]];
  const [small, big, k] = G.pick(r, table);
  const down = r() < 0.5;
  if (down) {
    const n = G.ri(r, 2, 12);
    return { q: `${n} ${big}s = ▢ ${small}`, fmt: 'number', a: n * k, d: n * k,
             hint: `Going to a smaller unit gives more of them, so multiply by ${k}.`,
             slips: G.slips(n * k, [{ v: Math.round(n / k) || 1, tag: 'unit.direction' },
                                    { v: n + k, tag: 'unit.mixed' }]) };
  }
  const m = G.ri(r, 2, 12);
  return { q: `${m * k} ${small} = ▢ ${big}s`, fmt: 'number', a: m, d: m * k,
           hint: `Going to a bigger unit gives fewer of them, so divide by ${k}.`,
           slips: G.slips(m, [{ v: m * k * k, tag: 'unit.direction' },
                              { v: m * k, tag: 'unit.direction' }]) };
};

GEN['mt.money.chg'] = r => {
  const paid = G.pick(r, [100, 500, 1000]);
  const cost = G.ri(r, 5, paid - 5);
  return { q: `You pay with ${G.money(paid)} for something costing ${G.money(cost)}. How much change?`,
           fmt: 'money', a: paid - cost, d: paid,
           hint: 'Count on from the price up to what you handed over.',
           slips: G.slips(paid - cost, [{ v: cost, tag: 'op.swapped' },
                                        { v: G.subNoBorrow(paid, cost), tag: 'borrow.forgot' }]) };
};

GEN['mt.money.dec'] = r => {
  const a = G.ri(r, 100, 99999), b = G.ri(r, 100, 99999);
  return { q: `${G.money(a)} + ${G.money(b)} = ▢`, fmt: 'money', a: a + b, d: a + b,
           hint: 'Add the cents first. Every 100 cents becomes a dollar.',
           slips: G.slips(a + b, [{ v: G.addNoCarry(a, b), tag: 'carry.forgot' },
                                  { v: Math.abs(a - b), tag: 'op.swapped' }]) };
};

/* ══ PATTERNS & ALGEBRA ═════════════════════════════════════════════════ */

GEN['alg.equal'] = r => {
  const a = G.ri(r, 1, 10), b = G.ri(r, 1, 10);
  const off = G.pick(r, [0, 0, 1, -1, 2]);
  const shown = a + b + off;
  return { q: `True or false?   ${a} + ${b} = ${shown}`, fmt: 'choice',
           options: ['True', 'False'], a: off === 0 ? 'True' : 'False', d: a + b,
           hint: 'The equals sign means both sides are worth exactly the same.',
           slips: G.slips(off === 0 ? 'True' : 'False',
             [{ v: off === 0 ? 'False' : 'True', tag: 'count.off1' }]) };
};

GEN['alg.pattern'] = r => {
  const kind = G.pick(r, ['AB', 'AAB', 'ABC']);
  const syms = G.shuffle(r, ['🔺', '🔵', '🟩', '⬛', '⭐']).slice(0, 3);
  const unit = { AB: [syms[0], syms[1]], AAB: [syms[0], syms[0], syms[1]],
                 ABC: [syms[0], syms[1], syms[2]] }[kind];
  const len = G.ri(r, 5, 8);
  const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const next = unit[len % unit.length];
  return { q: `What comes next?   ${seq.join(' ')} ▢`, fmt: 'choice',
           options: G.shuffle(r, syms.slice(0, Math.max(2, unit.length))), a: next, d: unit.length,
           hint: 'Find the part that keeps repeating, then carry on from where it stopped.',
           slips: G.slips(next, [{ v: seq[len - 1], tag: 'count.off1' }]) };
};

GEN['alg.pat.num'] = r => {
  const step = G.until(r, () => G.ri(r, -10, 10), x => x !== 0);
  const start = G.ri(r, Math.max(1, -step * 4), 100);
  const seq = [0, 1, 2, 3].map(i => start + step * i);
  if (seq.some(x => x < 0)) return GEN['alg.pat.num'](r);
  return { q: `${seq.join(', ')}, ▢`, fmt: 'number', a: start + step * 4, d: Math.abs(step),
           hint: 'Work out what changes from one number to the next.',
           slips: G.slips(start + step * 4,
             [{ v: start + step * 3, tag: 'count.off1' },
              { v: start + step * 5, tag: 'count.off1' },
              { v: start - step * 4, tag: 'op.swapped' }]) };
};

GEN['alg.unknown'] = r => {
  const a = G.ri(r, 2, 12), b = G.ri(r, 2, 12);
  const div = r() < 0.5;
  if (div) {
    return { q: `▢ ÷ ${a} = ${b}`, fmt: 'number', a: a * b, d: a * b,
             hint: 'Multiply back to undo the division.',
             slips: G.slips(a * b, [{ v: Math.round(b / a) || 1, tag: 'op.invert' },
                                    { v: b - a, tag: 'op.swapped' }]) };
  }
  return { q: `${a} × ▢ = ${a * b}`, fmt: 'number', a: b, d: a * b,
           hint: 'Divide the answer by the number you already have.',
           slips: G.slips(b, [{ v: a * b, tag: 'op.invert' }, { v: a * b - a, tag: 'op.swapped' }]) };
};

GEN['alg.rule'] = r => {
  const op = G.pick(r, ['+', '−', '×']);
  const k = op === '×' ? G.ri(r, 2, 9) : G.ri(r, 2, 25);
  const apply = x => op === '+' ? x + k : op === '−' ? x - k : x * k;
  const ins = [G.ri(r, k + 1, 20), G.ri(r, k + 1, 30), G.ri(r, k + 1, 40)];
  const ask = G.ri(r, k + 1, 50);
  if (apply(ask) > 500) return GEN['alg.rule'](r);
  const rows = ins.map(i => `${i} → ${apply(i)}`).join('   ');
  return { q: `Same rule every time:   ${rows}.   Now ${ask} → ▢`, fmt: 'number',
           a: apply(ask), d: k,
           hint: 'Work out what happens to the first number to make the second.',
           slips: G.slips(apply(ask), [{ v: ask + k, tag: 'unknown' },
                                       { v: ask * k, tag: 'unknown' },
                                       { v: ask - k, tag: 'unknown' }]) };
};

GEN['alg.express'] = r => {
  const a = G.ri(r, 2, 12), b = G.ri(r, 1, 30), x = G.ri(r, 1, 20);
  const plus = r() < 0.5;
  const v = plus ? a * x + b : a * x - b;
  if (v < 0) return GEN['alg.express'](r);
  return { q: `If n = ${x}, what is ${a}n ${plus ? '+' : '−'} ${b}?`, fmt: 'number', a: v, d: v,
           hint: `${a}n means ${a} times n. Multiply before you add or subtract.`,
           slips: G.slips(v, [{ v: plus ? (a + x) * 1 + b : a + x - b, tag: 'ops.leftright' },
                              { v: plus ? a * (x + b) : a * (x - b), tag: 'ops.leftright' }]) };
};

GEN['alg.solve1'] = r => {
  const kind = G.pick(r, ['add', 'mul']);
  if (kind === 'add') {
    const a = G.ri(r, 1, 50), x = G.ri(r, 1, 50);
    return { q: `Solve:   x + ${a} = ${x + a}`, fmt: 'number', a: x, d: x + a,
             hint: `Take ${a} off both sides.`,
             slips: G.slips(x, [{ v: x + a + a, tag: 'op.swapped' },
                                { v: x + a, tag: 'unknown' }]) };
  }
  const a = G.ri(r, 2, 12), x = G.ri(r, 2, 12);
  return { q: `Solve:   ${a}x = ${a * x}`, fmt: 'number', a: x, d: a * x,
           hint: `Divide both sides by ${a}.`,
           slips: G.slips(x, [{ v: a * x * a, tag: 'op.invert' },
                              { v: a * x - a, tag: 'op.swapped' }]) };
};

GEN['alg.varrel'] = r => {
  const k = G.ri(r, 2, 9), rows = G.ri(r, 3, 5);
  const ask = rows + G.ri(r, 1, 4);
  const tbl = Array.from({ length: rows }, (_, i) => `(${i + 1}, ${(i + 1) * k})`).join('  ');
  return { q: `Each x gives one y:   ${tbl}.   When x = ${ask}, what is y?`, fmt: 'number',
           a: ask * k, d: k,
           hint: 'Find what every x is multiplied by to get its y.',
           slips: G.slips(ask * k, [{ v: ask + k, tag: 'unknown' },
                                    { v: Math.round(ask / k) || 1, tag: 'op.invert' }]) };
};

/* ══ DATA ═══════════════════════════════════════════════════════════════ */

GEN['da.mean'] = r => {
  const n = G.ri(r, 3, 10);
  const mean = G.ri(r, 2, 100);
  // Built to divide exactly: a "mean" of 7.3333 teaches nothing at this stage.
  let vals = Array.from({ length: n }, () => G.ri(r, 1, 100));
  const diff = mean * n - vals.reduce((s, v) => s + v, 0);
  vals[0] += diff;
  if (vals[0] < 1 || vals[0] > 200) return GEN['da.mean'](r);
  vals = G.shuffle(r, vals);
  return { q: `What is the mean of ${vals.join(', ')}?`, fmt: 'number', a: mean, d: n,
           hint: 'Add them all up, then share the total between how many there are.',
           slips: G.slips(mean, [{ v: vals.reduce((s, v) => s + v, 0), tag: 'div.remainder.drop' },
                                 { v: n, tag: 'op.invert' }]) };
};

GEN['da.mmr'] = r => {
  const n = G.pick(r, [5, 7, 9, 11]);
  const vals = G.shuffle(r, Array.from({ length: n }, () => G.ri(r, 1, 100)));
  const sorted = vals.slice().sort((a, b) => a - b);
  const wantRange = r() < 0.5;
  const median = sorted[(n - 1) / 2];
  const range = sorted[n - 1] - sorted[0];
  return { q: `Find the ${wantRange ? 'range' : 'median'} of ${vals.join(', ')}.`, fmt: 'number',
           a: wantRange ? range : median, d: n,
           hint: wantRange ? 'Biggest take away smallest.' : 'Put them in order first, then take the middle one.',
           slips: G.slips(wantRange ? range : median,
             [{ v: wantRange ? median : range, tag: 'op.swapped' },
              { v: vals[(n - 1) / 2], tag: 'unknown' }]) };
};

// Everything else is diagram-backed and lives in js/manipulatives.js, which
// registers its generators into GEN when it loads.

// Publish explicitly. A top-level `const` or `function` creates a lexical
// binding, NOT a property on the global object — which is bug #1 in the build
// guide (`const Sync` silently made every `window.Sync && …` guard false). It
// bites twice as hard here: tools/check_generators.py loads this file with
// eval() in node, where a bare `function mulberry32` stays local to the loader
// and every generator throws "mulberry32 is not defined" — 44,500 identical
// failures that look like a broken gate rather than a scoping rule.
(function (root) {
  root.GEN = GEN;
  root.G = G;
  root.mulberry32 = mulberry32;
})(typeof globalThis !== 'undefined' ? globalThis : this);
