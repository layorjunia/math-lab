// numspeak — turn a number or an expression into a list of manifest keys.
//
// Wonder Lab has ~3,900 fixed strings, so every string is one clip and
// stitching is banned: prose assembled from word clips sounds like a list being
// read. Maths cannot work that way. "347 + 288" is one of millions of
// expressions and can never have its own recording.
//
// So the corpus is split. Prose is one clip per string, exactly like Wonder
// Lab. Numbers are a composed vocabulary:
//
//   * every integer 0-1,000 is a WHOLE clip — "three hundred forty-seven" is
//     one recording with natural prosody, not five words stitched together.
//     1,001 clips, measured at 6.4 KB each, so about 7 MB for the lot.
//   * above a thousand, compose: 4,271 is "four" + "thousand" + "two hundred
//     seventy-one" — three clips, which is roughly how a person reads it aloud
//     anyway, with a real pause at the thousand.
//   * fractions get their own whole clips ("three fourths"), because "three"
//     then "fourths" with a gap between them sounds like two answers.
//
// US reading throughout: "three hundred forty-seven", no "and". In American
// usage "and" is the decimal point — "three and seven tenths" — so putting it
// in a whole number teaches the wrong thing in a maths app.
//
// THIS FILE HAS A PYTHON TWIN, tools/numspeak.py, and they must agree string
// for string. The generator renders whatever the Python says; the app looks up
// whatever the JS says. A divergence is silent — the lookup misses, one line
// speaks in the browser voice, nothing is logged, and on iOS it is simply
// silent. tools/check_numspeak.py proves they agree and takes a second.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
              'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
              'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
              'eighty', 'ninety'];

// Denominator names. Index is the denominator; [singular, plural].
const DENOM = {
  2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'],
  5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'],
  8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'],
  11: ['eleventh', 'elevenths'], 12: ['twelfth', 'twelfths'],
  16: ['sixteenth', 'sixteenths'], 20: ['twentieth', 'twentieths'],
  25: ['twenty-fifth', 'twenty-fifths'], 50: ['fiftieth', 'fiftieths'],
  100: ['hundredth', 'hundredths'], 1000: ['thousandth', 'thousandths'],
};

const NumSpeak = {
  // 0-999 as one English string. The unit of a clip.
  under1000(n) {
    if (n < 20) return ONES[n];
    if (n < 100) {
      const t = TENS[Math.floor(n / 10)];
      return n % 10 ? t + '-' + ONES[n % 10] : t;
    }
    const h = ONES[Math.floor(n / 100)] + ' hundred';
    const rest = n % 100;
    return rest ? h + ' ' + this.under1000(rest) : h;
  },

  // A whole number as an array of manifest keys.
  number(n) {
    n = Math.trunc(n);
    if (n < 0) return ['negative'].concat(this.number(-n));
    if (n <= 1000) return [n === 1000 ? 'one thousand' : this.under1000(n)];

    const out = [];
    const scales = [[1000000000, 'billion'], [1000000, 'million'], [1000, 'thousand']];
    let rest = n;
    for (const [size, word] of scales) {
      if (rest >= size) {
        const count = Math.floor(rest / size);
        // The count itself is at most 999 here, so it is a single clip.
        out.push(this.under1000(count % 1000));
        if (count >= 1000) {
          // e.g. 1,234,567,000 — recurse for the leading group.
          out.length = 0;
          out.push(...this.number(count), word);
        } else {
          out.push(word);
        }
        rest = rest % size;
      }
    }
    if (rest > 0) out.push(this.under1000(rest));
    return out;
  },

  // Digits after the point are read one at a time. "point seventy-five" is the
  // single most common way for a maths app to teach a child to misread a
  // decimal, so it is structurally impossible here.
  decimal(v, dp) {
    const neg = v < 0;
    v = Math.abs(v);
    const pow = Math.pow(10, dp);
    const whole = Math.floor(v / pow);
    const frac = String(v % pow).padStart(dp, '0');
    const out = neg ? ['negative'] : [];
    out.push(...this.number(whole));
    if (dp > 0) {
      out.push('point');
      for (const ch of frac) out.push(ONES[Number(ch)]);
    }
    return out;
  },

  // "three fourths" is ONE clip. Composed from "three" + "fourths" it sounds
  // like two separate answers with a hole between them.
  fractionWords(n, d) {
    const names = DENOM[d];
    if (!names || n > 20) return null;
    if (d === 2 && n === 1) return 'one half';
    return this.under1000(n) + ' ' + (n === 1 ? names[0] : names[1]);
  },

  fraction(n, d) {
    const one = this.fractionWords(n, d);
    if (one) return [one];
    // Outside the pre-rendered set, fall back to "n over d", which is how a
    // teacher reads an unusual fraction aloud anyway.
    return this.number(n).concat(['over'], this.number(d));
  },

  mixed(w, n, d) {
    return this.number(w).concat(['and'], this.fraction(n, d));
  },

  money(cents) {
    const d = Math.floor(Math.abs(cents) / 100), c = Math.abs(cents) % 100;
    const out = cents < 0 ? ['negative'] : [];
    if (d || !c) out.push(...this.number(d), d === 1 ? 'dollar' : 'dollars');
    if (c) out.push(...this.number(c), c === 1 ? 'cent' : 'cents');
    return out;
  },

  clock(min) {
    const h = Math.floor(min / 60) % 12 || 12, m = min % 60;
    if (m === 0) return this.number(h).concat(["o'clock"]);
    if (m < 10) return this.number(h).concat(['oh'], this.number(m));
    return this.number(h).concat(this.number(m));
  },

  OPS: {
    '+': 'plus', '−': 'minus', '-': 'minus', '×': 'times', 'x': 'times',
    '*': 'times', '÷': 'divided by', '/': 'divided by', '=': 'equals',
    '>': 'is greater than', '<': 'is less than', ':': 'to', '%': 'percent',
    '▢': 'what',
  },

  // Read a displayed question aloud. Anything the composer cannot name is
  // dropped rather than guessed at — tools/audit_resolve.py then fails the
  // build on the gap, which is how a missing word gets noticed at build time
  // instead of in a child's ear.
  expr(text) {
    const out = [];
    // Longest tokens first: a mixed number and a fraction both start with a
    // digit, and 2 1/2 must not be read as "two, one, divided by, two".
    const re = /(-?\d+)\s+(\d+)\/(\d+)|(-?\d+)\/(\d+)|\$(\d+)\.(\d{2})|(-?\d[\d,]*)\.(\d+)|(-?\d[\d,]*)|([+\-−×÷x*=><:%▢])|([A-Za-z']+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1] !== undefined) out.push(...this.mixed(+m[1], +m[2], +m[3]));
      else if (m[4] !== undefined) out.push(...this.fraction(+m[4], +m[5]));
      else if (m[6] !== undefined) out.push(...this.money(+m[6] * 100 + +m[7]));
      else if (m[8] !== undefined) {
        const dec = m[9];
        out.push(...this.decimal(Number(m[8].replace(/,/g, '') + dec) *
                                (m[8].startsWith('-') ? 1 : 1), dec.length));
      } else if (m[10] !== undefined) out.push(...this.number(+m[10].replace(/,/g, '')));
      else if (m[11] !== undefined) { const w = this.OPS[m[11]]; if (w) out.push(w); }
      else if (m[12] !== undefined) out.push(m[12].toLowerCase());
    }
    return out;
  },

  // Every distinct clip the number vocabulary needs. tools/gen_audio.py renders
  // exactly this list, so the app can never ask for a key that was not built.
  vocabulary() {
    const v = new Set();
    for (let i = 0; i <= 1000; i++) v.add(i === 1000 ? 'one thousand' : this.under1000(i));
    ['thousand', 'million', 'billion', 'point', 'and', 'negative', 'oh', 'over',
     'plus', 'minus', 'take away', 'times', 'multiplied by', 'divided by',
     'equals', 'is', 'is greater than', 'is less than', 'is equal to', 'what',
     'percent', 'dollar', 'dollars', 'cent', 'cents', "o'clock", 'remainder',
     'to', 'past', 'quarter past', 'half past', 'quarter to', 'a m', 'p m',
    ].forEach(w => v.add(w));
    // fraction names
    Object.keys(DENOM).forEach(d => {
      for (let n = 1; n <= 20; n++) {
        const w = this.fractionWords(n, Number(d));
        if (w) v.add(w);
      }
    });
    // imperial units, singular and plural — imperial first, this is a US home
    [['inch', 'inches'], ['foot', 'feet'], ['yard', 'yards'], ['mile', 'miles'],
     ['ounce', 'ounces'], ['pound', 'pounds'], ['cup', 'cups'], ['pint', 'pints'],
     ['quart', 'quarts'], ['gallon', 'gallons'], ['second', 'seconds'],
     ['minute', 'minutes'], ['hour', 'hours'], ['day', 'days'], ['week', 'weeks'],
     ['month', 'months'], ['year', 'years'], ['degree', 'degrees'],
     ['square inch', 'square inches'], ['square foot', 'square feet'],
     ['cubic inch', 'cubic inches'],
    ].forEach(([a, b]) => { v.add(a); v.add(b); });
    return [...v].sort();
  },
};

(function (root) { root.NumSpeak = NumSpeak; root.DENOM = DENOM; })(
  typeof globalThis !== 'undefined' ? globalThis : this);
