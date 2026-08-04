// Games and quests — the engagement layer.
//
// The rule that made Wonder Lab's four games cheap: A GAME IS A NEW VIEW OVER
// EXISTING DATA, NOT NEW CONTENT. Every one of these is built from the
// generators and the named mistakes that already exist. None of them needs a
// single authored problem.
//
//   Bigger or Smaller   two expressions, pick the larger. The best estimation
//                       drill there is, because working both out exactly is
//                       slower than seeing it.
//   Spot the Slip       a worked answer that is wrong, and the child names WHY.
//                       Free, because every generator already carries its named
//                       mistakes. Enormously effective: recognising an error is
//                       a different and harder skill than not making it.
//   Beat the Clock      fluency needs speed, but a timer against an external
//                       standard is where children learn to hate math. This
//                       races the child's OWN previous best and nothing else.
//                       No leaderboard, no comparison to a sibling.
//   Listen Up           hear a number, tap it. Pure number sense, and the only
//                       screen where the audio corpus is the question rather
//                       than an accessibility aid.
//
// QUESTS are the journey layer. A quest is a short route through the skill map
// with a reason — "everything you need to split a pizza fairly" — so the map
// has paths through it and not just a to-do list. Each stop is a POINTER at a
// skill that already exists plus one line of framing, so this file adds almost
// no new text, only the route.

const QUESTS = [
  {
    id: 'pizza', name: 'Split It Fairly', glyph: '🍕', tint: 'fr',
    intro: 'Everything you need to share something out so nobody can complain.',
    outro: 'Fair shares are the whole idea of a fraction. The rest is notation.',
    stops: [
      { s: 'fr.halves', note: 'Start with two people and one pizza.' },
      { s: 'geo.partition', note: 'Now cut it properly — equal parts, or it is not a fraction.' },
      { s: 'fr.thirds', note: 'Three people. Harder to cut, same idea.' },
      { s: 'fr.name', note: 'Give the share its name.' },
      { s: 'fr.cmp.same', note: 'Who got more? Same-sized slices makes this easy.' },
      { s: 'fr.cmp.unlike', note: 'And the trap: more slices means smaller slices.' },
    ],
  },
  {
    id: 'shop', name: 'A Trip to the Shop', glyph: '🛒', tint: 'mt',
    intro: 'Money is the only math that argues back if you get it wrong.',
    outro: 'Every one of these you can practice for real, in a shop, this week.',
    stops: [
      { s: 'mt.coins', note: 'What each coin is worth. Nothing else works without this.' },
      { s: 'mt.money.cnt', note: 'Count a handful.' },
      { s: 'as.add2d.rg', note: 'Two things in the basket. This is where carrying earns its keep.' },
      { s: 'mt.money.chg', note: 'Hand over a note and count the change back.' },
      { s: 'mt.money.dec', note: 'Now written the way the receipt writes it.' },
    ],
  },
  {
    id: 'clock', name: 'Where the Time Goes', glyph: '🕰️', tint: 'mt',
    intro: 'A clock is the only place we still count in sixties.',
    outro: 'Sixty minutes, sixty seconds, twenty-four hours. None of it is decimal, and that is why it catches people out.',
    stops: [
      { s: 'mt.time.hour', note: 'The two hands, and which is which.' },
      { s: 'mt.time.5', note: 'Five at a time round the face.' },
      { s: 'mt.time.min', note: 'Every minute now.' },
      { s: 'mt.elapsed', note: 'And the real question: how long until?' },
      { s: 'mt.convert', note: 'Sixty, not a hundred. This is the step everyone trips on.' },
    ],
  },
  {
    id: 'build', name: 'Build a Box', glyph: '📦', tint: 'geo',
    intro: 'From a flat sheet to a solid thing, one measurement at a time.',
    outro: 'Perimeter, area, volume — a length, a covering, a filling. Three different questions people mix up constantly.',
    stops: [
      { s: 'mt.perimeter', note: 'Walk round the outside first.' },
      { s: 'mt.area.cnt', note: 'Now cover the inside. Count the squares.' },
      { s: 'mt.area.form', note: 'Then stop counting and multiply.' },
      { s: 'mt.volume', note: 'Give it a third dimension.' },
      { s: 'mt.surface', note: 'And unfold it again to see what it is wrapped in.' },
    ],
  },
  {
    id: 'tables', name: 'The Whole Times Table', glyph: '✖️', tint: 'md',
    intro: 'Not by chanting. By the fact that most of it you already know.',
    outro: 'Twelve times twelve is 144 facts, and by the time you get here you know almost all of them twice over.',
    stops: [
      { s: 'md.groups', note: 'What multiplying actually is.' },
      { s: 'md.arrays', note: 'The same thing in rows — and why order does not matter.' },
      { s: 'md.f.2510', note: 'The easy three tables. Nearly half the grid, free.' },
      { s: 'md.f.34', note: 'Doubling twice gets you fours.' },
      { s: 'md.f.69', note: 'Nines have a trick. Look at the digits.' },
      { s: 'md.f.78', note: 'The genuinely hard corner. There are only a few left.' },
      { s: 'md.f.all', note: 'All of it, mixed up.' },
    ],
  },
  {
    id: 'belowzero', name: 'Below Zero', glyph: '🌡️', tint: 'npv',
    intro: 'The number line does not stop at zero, and everything you know still works.',
    outro: 'Owing three pounds and having minus three pounds are the same fact written two ways.',
    stops: [
      { s: 'npv.integers', note: 'Where the negatives live.' },
      { s: 'npv.abs', note: 'How far from zero, ignoring which side.' },
      { s: 'as.integers', note: 'Adding and taking away across zero.' },
      { s: 'geo.coord4', note: 'And a grid that goes all four ways.' },
    ],
  },
];

// A quest can point at a skill that is not built yet. Filtering here rather
// than at render time keeps every screen from having to know about it, and a
// quest that loses a stop still runs.
function questStops(q) {
  return q.stops.filter(st => SKILL[st.s] && GEN[st.s]);
}

const Games = {
  LIST: [
    { id: 'bigger', name: 'Bigger or Smaller', glyph: '⚖️',
      blurb: 'Two sums. Pick the bigger one — without working them both out.' },
    { id: 'slip', name: 'Spot the Slip', glyph: '🔍',
      blurb: 'Somebody got this wrong. Say what they did.' },
    { id: 'clock', name: 'Beat the Clock', glyph: '⏱️',
      blurb: 'Ten questions against your own best time. Nobody else’s.' },
    { id: 'listen', name: 'Listen Up', glyph: '👂',
      blurb: 'Hear a number. Tap it.' },
  ],

  // Skills the child can be asked about right now: at or below their grade,
  // with a generator, unlocked.
  //
  // With the fallback, because a brand-new profile has nothing unlocked beyond
  // the root skills and the games came up empty on day one — the child taps
  // Play, gets a blank screen, and never taps it again. Games are practice, not
  // assessment, so a slightly-too-hard question here costs nothing.
  pool(fmts, match) {
    const g = Progress.p.grade;
    const ok = s => {
      if (!GEN[s.id]) return false;
      if (!fmts && !match) return true;
      try {
        const p = GEN[s.id](mulberry32(7));
        if (fmts && !fmts.includes(p.fmt)) return false;
        return !match || match(p);
      } catch (e) { return false; }
    };
    const inGrade = SKILLS.filter(s => s.g <= g && ok(s));
    const unlocked = inGrade.filter(s => Progress.unlocked(s.id));
    return unlocked.length >= 3 ? unlocked : inGrade;
  },

  draw(skillId, seed) {
    try { return GEN[skillId](mulberry32(seed >>> 0)); } catch (e) { return null; }
  },

  // A bare two-operand sum with the blank at the end. Anything else — a
  // sequence, a missing-addend, a worded question — is a different kind of
  // question and does not belong in a comparison.
  EXPR: /^-?[\d,]+(?:\.\d+)?\s*[+−\-×÷*/]\s*-?[\d,]+(?:\.\d+)?\s*=\s*▢$/,

  // ── Bigger or Smaller ──
  bigger(seed) {
    const pool = this.pool(['number'], p => Games.EXPR.test(p.q.trim()));
    if (pool.length < 2) return null;
    const r = mulberry32(seed >>> 0);
    let best = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const a = this.draw(G.pick(r, pool).id, seed + attempt * 31);
      const b = this.draw(G.pick(r, pool).id, seed + attempt * 71 + 13);
      if (!a || !b) continue;
      if (typeof a.a !== 'number' || typeof b.a !== 'number') continue;
      if (a.a === b.a) continue;
      if (!Games.EXPR.test(a.q.trim()) || !Games.EXPR.test(b.q.trim())) continue;
      const strip = q => q.replace(/\s*=\s*▢\s*$/, '');
      const pair = { left: strip(a.q), right: strip(b.q), lv: a.a, rv: b.a,
                     answer: a.a > b.a ? 'left' : 'right' };
      // Keep the CLOSEST pair found, not the first valid one. "135 versus 2"
      // needs no thought and drills nothing; the game is only an estimation
      // exercise when both sides are in the same neighbourhood.
      const ratio = Math.max(Math.abs(a.a), Math.abs(b.a), 1)
                  / Math.max(Math.min(Math.abs(a.a), Math.abs(b.a)), 1);
      if (ratio <= 2.5) return pair;
      if (!best || ratio < best.ratio) best = { pair, ratio };
    }
    return best ? best.pair : null;
  },

  // Which mistakes actually occur in a given strand. Built by sampling the
  // generators, so it stays true as generators change.
  _strandTags: null,
  strandTags(strand) {
    if (!this._strandTags) {
      this._strandTags = {};
      SKILLS.filter(s => GEN[s.id]).forEach(s => {
        const set = this._strandTags[s.s] || (this._strandTags[s.s] = new Set());
        for (let k = 0; k < 40; k++) {
          const p = this.draw(s.id, k * 17 + 3);
          (p && p.slips || []).forEach(x => {
            if (x.tag && x.tag !== 'unknown' && ERRORS[x.tag]) set.add(x.tag);
          });
        }
      });
    }
    return [...(this._strandTags[strand] || [])];
  },

  // ── Spot the Slip ──
  // Free: every generator already names the mistakes its distractors encode.
  slip(seed) {
    const pool = this.pool();
    const r = mulberry32(seed >>> 0);
    for (let attempt = 0; attempt < 60; attempt++) {
      const s = G.pick(r, pool);
      const p = this.draw(s.id, seed + attempt * 97);
      if (!p || !p.slips || p.slips.length < 1) continue;
      const real = p.slips.filter(x => x.tag && x.tag !== 'unknown' && ERRORS[x.tag]);
      if (!real.length) continue;
      const chosen = G.pick(r, real);

      // The wrong options have to be mistakes that could PLAUSIBLY happen on
      // this kind of question. Drawn from the whole catalogue, a place-value
      // question offers "an hour is not a hundred" as an option and the child
      // eliminates by topic instead of by reasoning — which makes the game
      // trivial and teaches nothing.
      //
      // Preference order: the other named mistakes on this very problem, then
      // mistakes that occur elsewhere in the same strand, then anything.
      const sameProblem = real.filter(x => x.tag !== chosen.tag).map(x => x.tag);
      const sameStrand = this.strandTags(s.s).filter(t => t !== chosen.tag);
      const anywhere = Object.keys(ERRORS).filter(t => t !== chosen.tag && t !== 'unknown');
      const others = [];
      [G.shuffle(r, [...new Set(sameProblem)]),
       G.shuffle(r, sameStrand),
       G.shuffle(r, anywhere)].forEach(src => {
        src.forEach(t => { if (others.length < 2 && !others.includes(t)) others.push(t); });
      });

      const shown = App.fmtAnswer(chosen.v, p.fmt);
      return { skill: s, q: p.q, svg: p.svg, wrong: shown,
               right: App.fmtAnswer(p.a, p.fmt),
               tag: chosen.tag,
               options: G.shuffle(r, [chosen.tag, ...others]) };
    }
    return null;
  },

  // ── Beat the Clock ──
  clockSet(seed, n) {
    const pool = this.pool(['number', 'choice']);
    const r = mulberry32(seed >>> 0);
    const out = [];
    for (let i = 0; out.length < (n || 10) && i < 400; i++) {
      const s = G.pick(r, pool);
      const p = this.draw(s.id, seed + i * 53 + 3);
      if (p && p.q.length <= 30) out.push({ skill: s, p });
    }
    return out;
  },

  // ── Listen Up ──
  listen(seed) {
    const r = mulberry32(seed >>> 0);
    const g = Progress.p.grade;
    const top = [20, 100, 1000, 10000, 100000, 1000000][g - 1] || 100;
    const n = G.ri(r, 1, top);
    const near = new Set([n]);
    // Distractors that are genuinely confusable BY EAR: the -teen/-ty pair, the
    // same digits in another order, and a neighbouring power of ten. Random
    // numbers would be eliminated on sight and teach nothing.
    const swaps = [
      n < 100 && n >= 13 && n <= 19 ? (n - 10) * 10 : null,
      n % 100 >= 20 && n % 100 < 100 && n % 10 === 0 ? n / 10 + 10 : null,
      Number(String(n).split('').reverse().join('')),
      n * 10, Math.floor(n / 10), n + 1, n - 1,
    ].filter(x => x && x > 0 && x !== n && x <= top * 10);
    swaps.forEach(x => { if (near.size < 4) near.add(x); });
    while (near.size < 4) near.add(G.ri(r, 1, top));
    return { n, options: G.shuffle(r, [...near]).slice(0, 4),
             parts: NumSpeak.number(n) };
  },
};

window.Games = Games;
window.QUESTS = QUESTS;
window.questStops = questStops;
