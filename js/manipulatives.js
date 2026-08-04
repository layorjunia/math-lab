// Manipulatives — the diagram-backed skills.
//
// Every diagram is generated SVG, never a fetched image: a clock face, a set of
// coins, an array of dots, a fraction bar, a number line, an angle, a bar
// chart. They register straight into GEN alongside the arithmetic generators,
// so tools/check_generators.py holds them to exactly the same standard.
//
// Two traps, both already paid for in a sibling project:
//
//   * AN SVG <rect> WITH NO WIDTH/HEIGHT PAINTS NOTHING. It does not warn, it
//     does not error, the diagram simply loses its ground and every shape drawn
//     on top floats on the page background. S.rect() takes both as required
//     positionals for that reason.
//   * RENDER IT AND LOOK AT IT. Code that produces clean, valid SVG of entirely
//     the wrong thing is the normal failure mode, not the exotic one. Every
//     diagram type here has been screenshotted at least once.
//
// Colours come from the app's CSS variables, so a diagram themes with the app
// and never hardcodes a background the page might not have.

const S = {
  wrap(w, h, body) {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"
      xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">${body}</svg>`;
  },
  rect(x, y, w, h, fill, stroke, extra) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}"
      fill="${fill || 'none'}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}
      ${extra || ''}/>`;
  },
  circle(cx, cy, r, fill, stroke, sw) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill || 'none'}"
      ${stroke ? `stroke="${stroke}" stroke-width="${sw || 2}"` : ''}/>`;
  },
  line(x1, y1, x2, y2, stroke, sw, extra) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${stroke}" stroke-width="${sw || 2}" stroke-linecap="round" ${extra || ''}/>`;
  },
  poly(pts, fill, stroke) {
    return `<polygon points="${pts.map(p => p.join(',')).join(' ')}"
      fill="${fill || 'none'}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}
      stroke-linejoin="round"/>`;
  },
  path(d, fill, stroke, sw, extra) {
    return `<path d="${d}" fill="${fill || 'none'}"
      ${stroke ? `stroke="${stroke}" stroke-width="${sw || 2}"` : ''}
      stroke-linecap="round" ${extra || ''}/>`;
  },
  text(x, y, s, size, fill, anchor) {
    return `<text x="${x}" y="${y}" font-size="${size || 14}"
      fill="${fill || 'var(--text)'}" text-anchor="${anchor || 'middle'}"
      font-family="system-ui,-apple-system,sans-serif" font-weight="600"
      dominant-baseline="middle">${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  },
  emoji(x, y, s, size) {
    return `<text x="${x}" y="${y}" font-size="${size || 18}"
      font-family="system-ui,-apple-system,sans-serif">${s}</text>`;
  },
  wedge(cx, cy, r, a0, a1, fill, stroke) {
    const p = a => [cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const big = (a1 - a0) > Math.PI ? 1 : 0;
    return S.path(`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${big} 1 ${x1} ${y1} Z`, fill, stroke);
  },
  INK: 'var(--line-2)', ON: 'var(--amber)', DIM: 'var(--dim)',
  TXT: 'var(--text)', FILL: 'var(--ink-3)',
};

(function () {
  const ri = (r, a, b) => G.ri(r, a, b);
  const pick = (r, xs) => G.pick(r, xs);
  const round = n => Math.round(n * 100) / 100;   // SVG coords only, never answers

  /* ══ FRACTIONS OF A SHAPE ═════════════════════════════════════════════ */

  function bar(d, n) {
    const w = 300, h = 58;
    let s = S.rect(0, 0, w, h, S.FILL, null);
    for (let i = 0; i < n; i++) s += S.rect(round(i * w / d), 0, round(w / d), h, S.ON, null);
    for (let i = 1; i < d; i++) s += S.line(round(i * w / d), 0, round(i * w / d), h, S.INK, 2);
    s += S.rect(0, 0, w, h, 'none', S.INK);
    return S.wrap(w, h, s);
  }

  function pie(d, n) {
    const R = 62, cx = R + 3, cy = R + 3;
    let s = S.circle(cx, cy, R, S.FILL, null);
    for (let i = 0; i < n; i++) {
      s += S.wedge(cx, cy, R, i * 2 * Math.PI / d, (i + 1) * 2 * Math.PI / d, S.ON, null);
    }
    for (let i = 0; i < d; i++) {
      const a = i * 2 * Math.PI / d - Math.PI / 2;
      s += S.line(cx, cy, round(cx + R * Math.cos(a)), round(cy + R * Math.sin(a)), S.INK, 2);
    }
    s += S.circle(cx, cy, R, 'none', S.INK);
    return S.wrap(2 * cx, 2 * cy, s);
  }

  const shapeFor = (r, d, n) => (r() < 0.5 ? bar(d, n) : pie(d, n));

  GEN['fr.halves'] = r => {
    const d = pick(r, [2, 4]);
    return { q: 'How many equal parts is this cut into?', fmt: 'number',
             svg: shapeFor(r, d, 0), a: d, d,
             hint: 'Count the pieces. They are all the same size.',
             slips: G.slips(d, [{ v: d - 1, tag: 'count.off1' }, { v: d + 1, tag: 'count.off1' }]) };
  };

  const fracNamer = dens => r => {
    const d = pick(r, dens), n = ri(r, 1, d - 1);
    return { q: 'What fraction is shaded?', fmt: 'fraction', svg: shapeFor(r, d, n),
             a: { n, d }, d,
             hint: 'The bottom number is how many pieces the whole is cut into. The top is how many are coloured.',
             slips: G.slips({ n, d }, [{ v: { n: d, d: n }, tag: 'op.invert' },
                                       { v: { n: d - n, d }, tag: 'op.swapped' },
                                       { v: { n, d: d - n }, tag: 'frac.commondenom' }]) };
  };
  GEN['fr.thirds'] = fracNamer([2, 3, 4]);
  GEN['fr.name'] = fracNamer([2, 3, 4, 6, 8]);

  GEN['geo.partition'] = r => {
    const d = pick(r, [2, 3, 4]);
    return { q: 'How many equal parts?', fmt: 'number', svg: shapeFor(r, d, 0), a: d, d,
             hint: 'Count the sections.',
             slips: G.slips(d, [{ v: d - 1, tag: 'count.off1' }, { v: d + 1, tag: 'count.off1' }]) };
  };

  GEN['fr.numline'] = r => {
    const d = pick(r, [2, 3, 4, 6, 8]);
    const n = ri(r, 1, d * 2 - 1);
    const w = 320, y = 42;
    let s = S.line(20, y, w - 20, y, S.INK, 3);
    for (let i = 0; i <= d * 2; i++) {
      const x = round(20 + (w - 40) * i / (d * 2));
      const tall = i % d === 0;
      s += S.line(x, y - (tall ? 12 : 7), x, y + (tall ? 12 : 7), S.INK, 2);
      if (tall) s += S.text(x, y + 26, i / d, 13, S.DIM);
    }
    const px = round(20 + (w - 40) * n / (d * 2));
    s += S.path(`M ${px} ${y - 27} L ${px - 7} ${y - 15} L ${px + 7} ${y - 15} Z`, S.ON, null);
    return { q: 'What number is the arrow pointing at?', fmt: 'fraction',
             svg: S.wrap(w, 76, s), a: G.frac(n, d), d,
             hint: 'Count the small steps from zero. Each step is one of those parts.',
             slips: G.slips(G.frac(n, d), [{ v: { n, d: d * 2 }, tag: 'pv.digit' },
                                           { v: { n: d, d: n }, tag: 'op.invert' }]) };
  };

  /* ══ CLOCKS ═══════════════════════════════════════════════════════════ */

  function clockFace(min) {
    const cx = 76, cy = 76, R = 66;
    let s = S.circle(cx, cy, R, S.FILL, S.INK, 3);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 - Math.PI / 2;
      s += S.text(round(cx + (R - 15) * Math.cos(a)), round(cy + (R - 15) * Math.sin(a)),
                  i === 0 ? 12 : i, 13, S.DIM);
      s += S.line(round(cx + (R - 5) * Math.cos(a)), round(cy + (R - 5) * Math.sin(a)),
                  round(cx + R * Math.cos(a)), round(cy + R * Math.sin(a)), S.INK, 2);
    }
    const ha = (min % 720) / 720 * 2 * Math.PI - Math.PI / 2;
    const ma = (min % 60) / 60 * 2 * Math.PI - Math.PI / 2;
    s += S.line(cx, cy, round(cx + 33 * Math.cos(ha)), round(cy + 33 * Math.sin(ha)), S.TXT, 5);
    s += S.line(cx, cy, round(cx + 51 * Math.cos(ma)), round(cy + 51 * Math.sin(ma)), S.ON, 3);
    s += S.circle(cx, cy, 4, S.TXT, null);
    return S.wrap(2 * cx, 2 * cy, s);
  }

  const label = t => `${Math.floor(t / 60) % 12 || 12}:${String(t % 60).padStart(2, '0')}`;

  const clockGen = step => r => {
    const h = ri(r, 1, 12);
    const m = step === 30 ? pick(r, [0, 30]) : (step === 5 ? ri(r, 0, 11) * 5 : ri(r, 0, 59));
    const t = h * 60 + m;
    // Distractors are the real confusions: hour and minute hands read the wrong
    // way round, and an hour counted as 100 minutes.
    const wrong = [...new Set([label(t + (step === 30 ? 30 : step === 5 ? 5 : 1)),
                               label(t + 60), label(t - 60)])].filter(x => x !== label(t));
    return { q: 'What time is it?', fmt: 'choice',
             options: G.shuffle(r, [label(t), ...wrong.slice(0, 3)]),
             svg: clockFace(t), a: label(t), d: m,
             hint: 'The short hand is the hour. The long hand is the minutes.',
             slips: G.slips(label(t), [{ v: label(t + 60), tag: 'time.60' },
                                       { v: label(t + (step || 1)), tag: 'count.off1' }]) };
  };

  GEN['mt.time.hour'] = clockGen(30);
  GEN['mt.time.5'] = clockGen(5);
  GEN['mt.time.min'] = clockGen(1);

  GEN['mt.elapsed'] = r => {
    const start = ri(r, 1, 10) * 60 + ri(r, 0, 11) * 5;
    const mins = pick(r, [30, 45, 60, 75, 90, 105, 120, 150]);
    return { q: `It is ${label(start)}. How many minutes until ${label(start + mins)}?`,
             fmt: 'number',
             svg: `<span style="display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center"
                     >${clockFace(start)}${clockFace(start + mins)}</span>`,
             a: mins, d: mins,
             hint: 'Count on in whole hours first, then the extra minutes.',
             slips: G.slips(mins, [{ v: Math.floor(mins / 60) * 100 + mins % 60, tag: 'time.60' },
                                   { v: mins - 60, tag: 'count.off1' }]) };
  };

  /* ══ MONEY ════════════════════════════════════════════════════════════ */

  const COINS = [{ v: 25, n: 'quarter', r: 25 }, { v: 10, n: 'dime', r: 18 },
                 { v: 5, n: 'nickel', r: 22 }, { v: 1, n: 'penny', r: 20 }];

  function coinRow(coins, hideValue) {
    let x = 4, s = '';
    coins.forEach(c => {
      s += S.circle(x + c.r, 30, c.r, c.v === 1 ? '#c08457' : '#c5c8cd', '#7e848b', 2);
      s += S.text(x + c.r, 30, hideValue ? '?' : c.v + '¢', 12, '#20242a');
      x += c.r * 2 + 8;
    });
    return S.wrap(Math.max(64, x), 60, s);
  }

  GEN['mt.coins'] = r => {
    const c = pick(r, COINS);
    const others = COINS.filter(x => x.v !== c.v);
    return { q: `This is a ${c.n}. How many cents is it worth?`, fmt: 'number',
             svg: coinRow([c], true), a: c.v, d: c.v,
             hint: 'A penny is 1, a nickel 5, a dime 10, a quarter 25.',
             slips: G.slips(c.v, others.map(o => ({ v: o.v, tag: 'unknown' }))) };
  };

  GEN['mt.money.cnt'] = r => {
    const n = ri(r, 2, 6);
    const coins = Array.from({ length: n }, () => pick(r, COINS));
    const total = coins.reduce((s, c) => s + c.v, 0);
    return { q: 'How much is this altogether?', fmt: 'money', svg: coinRow(coins),
             a: total, d: total,
             hint: 'Start with the biggest coins and count on from there.',
             slips: G.slips(total, [{ v: total - coins[0].v, tag: 'count.off1' },
                                    { v: n, tag: 'unknown' }]) };
  };

  /* ══ LENGTH ═══════════════════════════════════════════════════════════ */

  GEN['mt.len.cmp'] = r => {
    const lens = G.shuffle(r, [70, 130, 195, 245]).slice(0, 3);
    const names = ['A', 'B', 'C'];
    let s = '';
    lens.forEach((L, i) => {
      s += S.rect(28, 12 + i * 34, L, 20, S.ON, S.INK);
      s += S.text(14, 22 + i * 34, names[i], 14, S.DIM);
    });
    const longest = names[lens.indexOf(Math.max(...lens))];
    const shortest = names[lens.indexOf(Math.min(...lens))];
    return { q: 'Which one is longest?', fmt: 'choice', options: names,
             svg: S.wrap(285, 12 + 3 * 34, s), a: longest, d: 1,
             hint: 'They all start in the same place, so look at which one reaches furthest.',
             slips: G.slips(longest, [{ v: shortest, tag: 'op.swapped' }]) };
  };

  GEN['mt.len.inch'] = r => {
    const n = ri(r, 2, 11);
    const w = 340, x0 = 20, step = (w - 40) / 12;
    let s = S.rect(x0, 44, round(12 * step), 24, S.FILL, S.INK);
    for (let i = 0; i <= 12; i++) {
      s += S.line(round(x0 + i * step), 44, round(x0 + i * step), 56, S.INK, 1.5);
      s += S.text(round(x0 + i * step), 64, i, 10, S.DIM);
    }
    s += S.rect(x0, 18, round(n * step), 20, S.ON, S.INK);
    return { q: 'How many inches long is the bar?', fmt: 'number', svg: S.wrap(w, 78, s),
             a: n, d: n,
             hint: 'Line the left end up with zero and read where the right end lands.',
             slips: G.slips(n, [{ v: n + 1, tag: 'count.off1' }, { v: n - 1, tag: 'count.off1' }]) };
  };

  /* ══ GROUPS, ARRAYS, AREA, VOLUME ═════════════════════════════════════ */

  function dots(rows, cols, grouped) {
    const cell = 24, pad = 10, rowGap = grouped ? 8 : 0;
    const w = cols * cell + pad * 2, h = rows * (cell + rowGap) + pad * 2;
    let s = '';
    for (let y = 0; y < rows; y++) {
      if (grouped) s += S.rect(pad - 3, pad + y * (cell + rowGap) - 2, cols * cell + 6, cell + 4,
                               'none', S.INK, 'rx="11" opacity=".65"');
      for (let x = 0; x < cols; x++) {
        s += S.circle(pad + x * cell + cell / 2, pad + y * (cell + rowGap) + cell / 2, 8, S.ON, null);
      }
    }
    return S.wrap(w, h, s);
  }

  GEN['md.groups'] = r => {
    const g = ri(r, 2, 5), each = ri(r, 2, 10);
    return { q: `${g} groups of ${each}. How many altogether?`, fmt: 'number',
             svg: dots(g, each, true), a: g * each, d: g * each,
             hint: `Add ${each} to itself ${g} times, or count them all.`,
             slips: G.slips(g * each, [{ v: g + each, tag: 'op.swapped' },
                                       { v: g * each - each, tag: 'count.off1' }]) };
  };

  GEN['md.arrays'] = r => {
    const rows = ri(r, 2, 5), cols = ri(r, 2, 5);
    return { q: 'How many dots are there?', fmt: 'number', svg: dots(rows, cols),
             a: rows * cols, d: rows * cols,
             hint: 'Rows times columns — you do not have to count one by one.',
             slips: G.slips(rows * cols, [{ v: rows + cols, tag: 'op.swapped' },
                                          { v: rows * cols - 1, tag: 'count.off1' }]) };
  };

  GEN['mt.area.cnt'] = r => {
    const w = ri(r, 2, 10), h = ri(r, 2, 8), c = w > 7 ? 20 : 26;
    let s = S.rect(8, 8, w * c, h * c, S.ON, null);
    for (let i = 1; i < w; i++) s += S.line(8 + i * c, 8, 8 + i * c, 8 + h * c, S.INK, 1);
    for (let j = 1; j < h; j++) s += S.line(8, 8 + j * c, 8 + w * c, 8 + j * c, S.INK, 1);
    s += S.rect(8, 8, w * c, h * c, 'none', S.INK);
    return { q: 'How many squares cover this shape?', fmt: 'number',
             svg: S.wrap(w * c + 16, h * c + 16, s), a: w * h, d: w * h,
             hint: 'Count one row, then multiply by how many rows there are.',
             slips: G.slips(w * h, [{ v: 2 * (w + h), tag: 'perim.area' },
                                    { v: w + h, tag: 'op.swapped' }]) };
  };

  GEN['mt.perimeter'] = r => {
    const w = ri(r, 1, 20), h = ri(r, 1, 20);
    let s = S.rect(34, 24, 150, 74, S.FILL, S.INK);
    s += S.text(109, 14, `${w} in`, 13, S.DIM);
    s += S.text(109, 110, `${w} in`, 13, S.DIM);
    s += S.text(18, 61, `${h} in`, 13, S.DIM);
    s += S.text(200, 61, `${h} in`, 13, S.DIM);
    return { q: 'What is the perimeter?', fmt: 'number', svg: S.wrap(220, 122, s),
             a: 2 * (w + h), d: 2 * (w + h),
             hint: 'Walk all the way round the outside and add every side.',
             slips: G.slips(2 * (w + h), [{ v: w * h, tag: 'perim.area' },
                                          { v: w + h, tag: 'count.off1' }]) };
  };

  GEN['mt.area.form'] = r => {
    const w = ri(r, 2, 20), h = ri(r, 2, 20);
    const findSide = r() < 0.4;
    let s = S.rect(34, 24, 150, 74, S.FILL, S.INK);
    s += S.text(109, 14, `${w} in`, 13, S.DIM);
    s += S.text(18, 61, findSide ? '?' : `${h} in`, 13, findSide ? S.ON : S.DIM);
    if (findSide) s += S.text(109, 61, `area ${w * h}`, 14, S.TXT);
    const svg = S.wrap(220, 112, s);
    if (findSide) {
      return { q: `The area is ${w * h} square inches and one side is ${w} inches. How long is the other side?`,
               fmt: 'number', svg, a: h, d: w * h,
               hint: 'Divide the area by the side you already know.',
               slips: G.slips(h, [{ v: w * h, tag: 'op.invert' },
                                  { v: w * h - w, tag: 'op.swapped' }]) };
    }
    return { q: 'What is the area of this rectangle?', fmt: 'number', svg, a: w * h, d: w * h,
             hint: 'Area is length times width.',
             slips: G.slips(w * h, [{ v: 2 * (w + h), tag: 'perim.area' },
                                    { v: w + h, tag: 'op.swapped' }]) };
  };

  function boxFig(a, b, c) {
    const d = 26;
    let s = S.poly([[40, 46], [150, 46], [150, 120], [40, 120]], S.FILL, S.INK);
    s += S.poly([[40, 46], [40 + d, 46 - d], [150 + d, 46 - d], [150, 46]], S.FILL, S.INK);
    s += S.poly([[150, 46], [150 + d, 46 - d], [150 + d, 120 - d], [150, 120]], S.FILL, S.INK);
    s += S.text(95, 134, `${a} in`, 12, S.DIM);
    s += S.text(24, 83, `${b} in`, 12, S.DIM);
    s += S.text(186, 74, `${c} in`, 12, S.DIM);
    return S.wrap(210, 146, s);
  }

  GEN['mt.volume'] = r => {
    const a = ri(r, 1, 20), b = ri(r, 1, 20), c = ri(r, 1, 20);
    return { q: 'What is the volume of this box?', fmt: 'number', svg: boxFig(a, b, c),
             a: a * b * c, d: a * b * c,
             hint: 'Length times width times height.',
             slips: G.slips(a * b * c, [{ v: a * b, tag: 'mult.partial' },
                                        { v: 2 * (a * b + b * c + a * c), tag: 'perim.area' },
                                        { v: a + b + c, tag: 'op.swapped' }]) };
  };

  GEN['mt.surface'] = r => {
    const a = ri(r, 1, 15), b = ri(r, 1, 15), c = ri(r, 1, 15);
    let s = S.rect(60, 8, 44, 30, S.FILL, S.INK);
    s += S.rect(16, 38, 44, 44, S.FILL, S.INK);
    s += S.rect(60, 38, 44, 44, S.ON, S.INK);
    s += S.rect(104, 38, 44, 44, S.FILL, S.INK);
    s += S.rect(148, 38, 44, 44, S.FILL, S.INK);
    s += S.rect(60, 82, 44, 30, S.FILL, S.INK);
    const area = 2 * (a * b + b * c + a * c);
    return { q: `This net folds into a box ${a} by ${b} by ${c} inches. What is its surface area?`,
             fmt: 'number', svg: S.wrap(206, 122, s), a: area, d: area,
             hint: 'Six faces, in three matching pairs. Find one of each pair, add them, then double.',
             slips: G.slips(area, [{ v: a * b * c, tag: 'perim.area' },
                                   { v: a * b + b * c + a * c, tag: 'count.off1' }]) };
  };

  GEN['mt.area.tri'] = r => {
    const base = ri(r, 1, 30), h = ri(r, 1, 30);
    const para = r() < 0.4;
    let s;
    if (para) {
      s = S.poly([[36, 100], [146, 100], [176, 30], [66, 30]], S.FILL, S.INK);
      s += S.line(66, 30, 66, 100, S.DIM, 1.5, 'stroke-dasharray="4 3"');
    } else {
      s = S.poly([[36, 100], [166, 100], [106, 26]], S.FILL, S.INK);
      s += S.line(106, 26, 106, 100, S.DIM, 1.5, 'stroke-dasharray="4 3"');
    }
    s += S.text(101, 114, `base ${base}`, 12, S.DIM);
    s += S.text(para ? 44 : 128, 66, `h ${h}`, 12, S.DIM);
    const svg = S.wrap(206, 126, s);
    if (para) {
      return { q: 'What is the area of this parallelogram?', fmt: 'number', svg,
               a: base * h, d: base * h,
               hint: 'Base times height — exactly like a rectangle.',
               slips: G.slips(base * h, [{ v: 2 * (base + h), tag: 'perim.area' },
                                         { v: base + h, tag: 'op.swapped' }]) };
    }
    // Half of an odd product is a genuine .5, so the answer is exact tenths.
    // NEVER a float: base*h/2 would be 22.5 exactly here but 0.1+0.2 arithmetic
    // is banned throughout, and scaled integers keep the rule with no exceptions.
    const tenths = base * h * 5;
    return { q: 'What is the area of this triangle?', fmt: 'decimal1', svg,
             a: { v: tenths, dp: 1 }, d: base * h,
             hint: 'Half of base times height — a triangle is half of its rectangle.',
             slips: G.slips({ v: tenths, dp: 1 },
               [{ v: { v: base * h * 10, dp: 1 }, tag: 'perim.area' },
                { v: { v: 2 * (base + h) * 10, dp: 1 }, tag: 'perim.area' }]) };
  };

  /* ══ SHAPES ═══════════════════════════════════════════════════════════ */

  function ngon(n, cx, cy, rad, rot) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (rot || 0) + i * 2 * Math.PI / n - Math.PI / 2;
      pts.push([Math.round(cx + rad * Math.cos(a)), Math.round(cy + rad * Math.sin(a))]);
    }
    return pts;
  }

  const SHAPES2D = {
    Circle: () => S.circle(70, 60, 48, S.FILL, S.INK),
    Triangle: () => S.poly(ngon(3, 70, 64, 52), S.FILL, S.INK),
    Square: () => S.rect(22, 12, 96, 96, S.FILL, S.INK),
    Rectangle: () => S.rect(8, 24, 124, 72, S.FILL, S.INK),
    Pentagon: () => S.poly(ngon(5, 70, 62, 50), S.FILL, S.INK),
    Hexagon: () => S.poly(ngon(6, 70, 60, 50), S.FILL, S.INK),
    Trapezoid: () => S.poly([[14, 100], [126, 100], [100, 24], [40, 24]], S.FILL, S.INK),
    Rhombus: () => S.poly([[70, 10], [126, 60], [70, 110], [14, 60]], S.FILL, S.INK),
  };

  const namer = (table, w, h, q, hint) => r => {
    const names = Object.keys(table);
    const name = pick(r, names);
    const others = G.shuffle(r, names.filter(n => n !== name)).slice(0, 3);
    return { q, fmt: 'choice', options: G.shuffle(r, [name, ...others]),
             svg: S.wrap(w, h, table[name]()), a: name, d: names.indexOf(name), hint,
             slips: G.slips(name, others.map(o => ({ v: o, tag: 'unknown' }))) };
  };

  GEN['geo.shapes2d'] = namer(SHAPES2D, 140, 120, 'What shape is this?',
    'Count the sides and the corners.');

  const SHAPES3D = {
    Cube: () => S.rect(30, 40, 70, 70, S.FILL, S.INK) +
      S.poly([[30, 40], [56, 18], [126, 18], [100, 40]], S.FILL, S.INK) +
      S.poly([[100, 40], [126, 18], [126, 88], [100, 110]], S.FILL, S.INK),
    Sphere: () => S.circle(72, 64, 46, S.FILL, S.INK) +
      S.path('M 26 64 A 46 18 0 0 0 118 64', 'none', S.DIM, 1.5),
    Cone: () => S.poly([[72, 16], [118, 98], [26, 98]], S.FILL, S.INK) +
      S.path('M 26 98 A 46 13 0 0 0 118 98', 'none', S.DIM, 1.5),
    Cylinder: () => S.rect(30, 30, 84, 66, S.FILL, S.INK) +
      S.path('M 30 30 A 42 13 0 0 1 114 30', 'none', S.INK, 2) +
      S.path('M 30 96 A 42 13 0 0 0 114 96', 'none', S.INK, 2),
    Pyramid: () => S.poly([[72, 14], [126, 102], [18, 102]], S.FILL, S.INK) +
      S.line(72, 14, 92, 86, S.DIM, 1.5) + S.line(18, 102, 92, 86, S.DIM, 1.5),
    'Rectangular prism': () => S.rect(24, 46, 90, 56, S.FILL, S.INK) +
      S.poly([[24, 46], [46, 24], [136, 24], [114, 46]], S.FILL, S.INK) +
      S.poly([[114, 46], [136, 24], [136, 80], [114, 102]], S.FILL, S.INK),
  };

  GEN['geo.shapes3d'] = namer(SHAPES3D, 150, 120, 'What solid is this?',
    'Look at the flat faces, and whether any side is curved.');

  const QUADS = {
    Square: () => S.poly([[34, 20], [124, 20], [124, 110], [34, 110]], S.FILL, S.INK),
    Rectangle: () => S.poly([[14, 34], [142, 34], [142, 100], [14, 100]], S.FILL, S.INK),
    Rhombus: () => S.poly([[78, 14], [136, 66], [78, 116], [20, 66]], S.FILL, S.INK),
    Parallelogram: () => S.poly([[16, 104], [106, 104], [140, 30], [50, 30]], S.FILL, S.INK),
    Trapezoid: () => S.poly([[14, 106], [142, 106], [112, 30], [44, 30]], S.FILL, S.INK),
  };

  GEN['geo.quads'] = namer(QUADS, 156, 130, 'What is this four-sided shape called?',
    'Look at which sides are the same length, and which are parallel.');

  const TRIS = {
    Equilateral: () => S.poly(ngon(3, 90, 70, 54), S.FILL, S.INK),
    Isosceles: () => S.poly([[30, 112], [150, 112], [90, 22]], S.FILL, S.INK),
    Scalene: () => S.poly([[18, 112], [162, 112], [124, 26]], S.FILL, S.INK),
    Right: () => S.poly([[30, 112], [150, 112], [30, 26]], S.FILL, S.INK) +
      S.rect(30, 98, 14, 14, 'none', S.DIM),
  };

  GEN['geo.triangles'] = namer(TRIS, 180, 130, 'What kind of triangle is this?',
    'Look at the side lengths, and whether one corner is a square corner.');

  GEN['geo.sides'] = r => {
    const n = ri(r, 3, 8);
    const askV = r() < 0.4;
    return { q: askV ? 'How many corners does this shape have?'
                     : 'How many sides does this shape have?',
             fmt: 'number', svg: S.wrap(140, 132, S.poly(ngon(n, 70, 66, 52), S.FILL, S.INK)),
             a: n, d: n,
             hint: 'A shape has the same number of corners as it has sides.',
             slips: G.slips(n, [{ v: n - 1, tag: 'count.off1' }, { v: n + 1, tag: 'count.off1' }]) };
  };

  GEN['geo.symmetry'] = r => {
    const table = [['Square', 4], ['Rectangle', 2], ['Triangle', 3],
                   ['Pentagon', 5], ['Hexagon', 6], ['Rhombus', 2]];
    const [name, lines] = pick(r, table);
    return { q: `How many lines of symmetry does this ${name.toLowerCase()} have?`,
             fmt: 'number', svg: S.wrap(140, 120, SHAPES2D[name]()), a: lines, d: lines,
             hint: 'A line of symmetry folds the shape exactly onto itself.',
             slips: G.slips(lines, [{ v: lines - 1, tag: 'count.off1' },
                                    { v: lines * 2, tag: 'count.off1' }]) };
  };

  /* ══ ANGLES AND LINES ═════════════════════════════════════════════════ */

  GEN['geo.angles'] = r => {
    const kind = pick(r, ['Acute', 'Right', 'Obtuse']);
    const deg = kind === 'Right' ? 90 : kind === 'Acute' ? ri(r, 15, 85) : ri(r, 95, 170);
    const cx = 34, cy = 108, L = 140, a = -deg * Math.PI / 180;
    let s = S.line(cx, cy, cx + L, cy, S.INK, 3);
    s += S.line(cx, cy, round(cx + L * Math.cos(a)), round(cy + L * Math.sin(a)), S.INK, 3);
    const R = 34;
    s += S.path(`M ${cx + R} ${cy} A ${R} ${R} 0 0 ${deg > 180 ? 1 : 0} `
              + `${round(cx + R * Math.cos(a))} ${round(cy + R * Math.sin(a))}`, 'none', S.ON, 2);
    if (kind === 'Right') s += S.rect(cx, cy - 15, 15, 15, 'none', S.DIM);
    return { q: 'Is this angle acute, right or obtuse?', fmt: 'choice',
             options: ['Acute', 'Right', 'Obtuse'], svg: S.wrap(190, 126, s), a: kind, d: deg,
             hint: 'A right angle is a square corner. Smaller is acute, bigger is obtuse.',
             slips: G.slips(kind, [{ v: kind === 'Acute' ? 'Obtuse' : 'Acute', tag: 'op.swapped' }]) };
  };

  GEN['geo.anglerule'] = r => {
    const onLine = r() < 0.5;
    const total = onLine ? 180 : 90;
    const a = ri(r, 15, total - 15);
    const rad = -a * Math.PI / 180;
    let s;
    if (onLine) {
      s = S.line(20, 92, 205, 92, S.INK, 3);
      s += S.line(112, 92, round(112 + 78 * Math.cos(rad)), round(92 + 78 * Math.sin(rad)), S.INK, 3);
      s += S.text(152, 78, `${a}°`, 13, S.ON);
      s += S.text(72, 78, '?', 16, S.TXT);
    } else {
      s = S.line(30, 100, 190, 100, S.INK, 3) + S.line(30, 100, 30, 18, S.INK, 3);
      s += S.line(30, 100, round(30 + 92 * Math.cos(rad)), round(100 + 92 * Math.sin(rad)), S.INK, 3);
      s += S.rect(30, 85, 15, 15, 'none', S.DIM);
      s += S.text(88, 90, `${a}°`, 13, S.ON);
      s += S.text(48, 52, '?', 16, S.TXT);
    }
    return { q: onLine ? 'These two angles sit on a straight line. What is the missing one?'
                       : 'These two angles make a right angle. What is the missing one?',
             fmt: 'number', svg: S.wrap(215, 122, s), a: total - a, d: a,
             hint: onLine ? 'Angles on a straight line add up to 180 degrees.'
                          : 'A right angle is 90 degrees altogether.',
             slips: G.slips(total - a, [{ v: (onLine ? 90 : 180) - a, tag: 'unknown' },
                                        { v: a, tag: 'op.swapped' },
                                        { v: 360 - a, tag: 'unknown' }]) };
  };

  GEN['geo.lines'] = r => {
    const kind = pick(r, ['Parallel', 'Perpendicular', 'Intersecting']);
    let s;
    if (kind === 'Parallel') s = S.line(20, 40, 190, 40, S.INK, 3) + S.line(20, 92, 190, 92, S.INK, 3);
    else if (kind === 'Perpendicular') {
      s = S.line(20, 66, 190, 66, S.INK, 3) + S.line(105, 12, 105, 120, S.INK, 3);
      s += S.rect(105, 51, 15, 15, 'none', S.DIM);
    } else s = S.line(20, 22, 190, 108, S.INK, 3) + S.line(20, 100, 190, 32, S.INK, 3);
    return { q: 'What kind of lines are these?', fmt: 'choice',
             options: ['Parallel', 'Perpendicular', 'Intersecting'],
             svg: S.wrap(210, 132, s), a: kind, d: 1,
             hint: 'Parallel lines never meet. Perpendicular lines cross at a square corner.',
             slips: G.slips(kind, [{ v: kind === 'Parallel' ? 'Intersecting' : 'Parallel',
                                     tag: 'unknown' }]) };
  };

  /* ══ COORDINATES AND INEQUALITIES ═════════════════════════════════════ */

  function gridPlot(lo, hi, px, py) {
    const n = hi - lo, cell = Math.min(20, 230 / n);
    const padL = 26, padB = 22, padT = 10, padR = 10;
    const W = n * cell + padL + padR, H = n * cell + padT + padB;
    const X = v => round(padL + (v - lo) * cell);
    const Y = v => round(H - padB - (v - lo) * cell);
    const every = n > 12 ? 2 : 1;          // -10..10 every unit is unreadable
    let s = S.rect(padL, padT, round(n * cell), round(n * cell), S.FILL, null);
    for (let i = 0; i <= n; i++) {
      const v = lo + i, axis = v === 0;
      s += S.line(X(v), padT, X(v), H - padB, axis ? S.DIM : S.INK, axis ? 2 : 0.6);
      s += S.line(padL, Y(v), W - padR, Y(v), axis ? S.DIM : S.INK, axis ? 2 : 0.6);
      // Numbers on both axes. Without them the grid is unreadable and the
      // question is unanswerable — it shipped that way until the contact sheet
      // showed it, which is exactly what the contact sheet is for.
      if (v % every === 0) {
        if (v !== 0 || lo === 0) s += S.text(X(v), H - padB + 11, v, 9, S.DIM);
        if (v !== 0 || lo === 0) s += S.text(padL - 11, Y(v), v, 9, S.DIM);
      }
    }
    s += S.rect(padL, padT, round(n * cell), round(n * cell), 'none', S.INK);
    s += S.circle(X(px), Y(py), 6, S.ON, null);
    return S.wrap(W, H, s);
  }

  GEN['geo.coord'] = r => {
    const x = ri(r, 0, 10), y = ri(r, 0, 10);
    return { q: 'What are the coordinates of the dot?', fmt: 'coord',
             svg: gridPlot(0, 10, x, y), a: { x, y }, d: x + y,
             hint: 'Along the corridor first, then up the stairs. x always comes first.',
             slips: G.slips({ x, y }, [{ v: { x: y, y: x }, tag: 'coord.swapped' }]) };
  };

  GEN['geo.coord4'] = r => {
    const x = ri(r, -10, 10), y = ri(r, -10, 10);
    return { q: 'What are the coordinates of the dot?', fmt: 'coord',
             svg: gridPlot(-10, 10, x, y), a: { x, y }, d: Math.abs(x) + Math.abs(y),
             hint: 'Left of the middle line is a negative x. Below it is a negative y.',
             slips: G.slips({ x, y }, [{ v: { x: y, y: x }, tag: 'coord.swapped' },
                                       { v: { x: -x, y }, tag: 'neg.sign' }]) };
  };

  GEN['alg.inequal'] = r => {
    const v = ri(r, -8, 8);
    const dir = pick(r, ['>', '<', '≥', '≤']);
    const closed = dir === '≥' || dir === '≤';
    const right = dir === '>' || dir === '≥';
    const W = 320, y = 42, lo = -10, hi = 10;
    const X = n => round(20 + (W - 40) * (n - lo) / (hi - lo));
    let s = S.line(20, y, W - 20, y, S.INK, 3);
    for (let n = lo; n <= hi; n += 2) {
      s += S.line(X(n), y - 7, X(n), y + 7, S.INK, 2);
      s += S.text(X(n), y + 22, n, 11, S.DIM);
    }
    s += S.line(X(v), y, right ? W - 20 : 20, y, S.ON, 5);
    s += S.circle(X(v), y, 7, closed ? S.ON : 'var(--ink)', S.ON, 3);
    const flip = right ? '<' : '>';
    const openClosed = closed ? (right ? '>' : '<') : (right ? '≥' : '≤');
    return { q: 'Which inequality does this show?', fmt: 'choice',
             options: G.shuffle(r, [`x ${dir} ${v}`, `x ${flip} ${v}`, `x ${openClosed} ${v}`]),
             svg: S.wrap(W, 74, s), a: `x ${dir} ${v}`, d: Math.abs(v),
             hint: 'An open circle means "not that number itself". A filled one includes it.',
             slips: G.slips(`x ${dir} ${v}`, [{ v: `x ${flip} ${v}`, tag: 'op.swapped' },
                                              { v: `x ${openClosed} ${v}`, tag: 'unknown' }]) };
  };

  /* ══ DATA ═════════════════════════════════════════════════════════════ */

  const ICONS = ['\u{1F34E}', '\u{1F431}', '⭐', '\u{1F41B}'];
  const LABELS = ['Apples', 'Cats', 'Stars', 'Bugs'];

  function pictograph(counts, scale) {
    const rowH = 30, W = 340;
    let s = '';
    counts.forEach((n, i) => {
      s += S.text(4, 16 + i * rowH, LABELS[i], 12, S.DIM, 'start');
      for (let k = 0; k < n / scale; k++) s += S.emoji(66 + k * 24, 22 + i * rowH, ICONS[i]);
    });
    return S.wrap(W, counts.length * rowH + 6, s);
  }

  GEN['da.picture'] = r => {
    const n = ri(r, 3, 4);
    const counts = Array.from({ length: n }, () => ri(r, 1, 9));
    const w = ri(r, 0, n - 1);
    return { q: `How many ${LABELS[w].toLowerCase()} are there?`, fmt: 'number',
             svg: pictograph(counts, 1), a: counts[w], d: counts[w],
             hint: 'Count the pictures in that row.',
             slips: G.slips(counts[w], [{ v: counts[w] + 1, tag: 'count.off1' },
                                        { v: counts.reduce((a, b) => a + b, 0), tag: 'unknown' }]) };
  };

  GEN['da.scaled'] = r => {
    const scale = pick(r, [2, 5, 10]);
    const counts = Array.from({ length: 4 }, () => scale * ri(r, 1, 8));
    const w = ri(r, 0, 3);
    return { q: `Each picture stands for ${scale}. How many ${LABELS[w].toLowerCase()}?`,
             fmt: 'number', svg: pictograph(counts, scale), a: counts[w], d: counts[w],
             hint: `Count the pictures in that row, then multiply by ${scale}.`,
             slips: G.slips(counts[w], [{ v: counts[w] / scale, tag: 'unit.direction' },
                                        { v: counts[w] + scale, tag: 'count.off1' }]) };
  };

  function barChart(counts, step) {
    const W = 320, H = 168, base = H - 28, pad = 34;
    const max = Math.ceil(Math.max(...counts) / step) * step;
    const bw = (W - pad - 12) / counts.length;
    let s = S.line(pad, base, W - 8, base, S.INK, 2) + S.line(pad, 12, pad, base, S.INK, 2);
    for (let g = 0; g <= max; g += step) {
      const y = round(base - (base - 20) * g / max);
      s += S.line(pad, y, W - 8, y, S.INK, 0.6);
      s += S.text(pad - 12, y, g, 10, S.DIM);
    }
    counts.forEach((n, i) => {
      const h = round((base - 20) * n / max);
      s += S.rect(round(pad + i * bw + 9), round(base - h), round(bw - 18), h, S.ON, null);
      s += S.text(round(pad + i * bw + bw / 2), base + 13, LABELS[i], 10, S.DIM);
    });
    return S.wrap(W, H, s);
  }

  GEN['da.bar'] = r => {
    const counts = Array.from({ length: 4 }, () => ri(r, 1, 20));
    const i = ri(r, 0, 3);
    let j = ri(r, 0, 3);
    while (j === i) j = ri(r, 0, 3);
    if (r() < 0.45 && counts[i] !== counts[j]) {
      const hiI = counts[i] >= counts[j] ? i : j, loI = counts[i] >= counts[j] ? j : i;
      const diff = counts[hiI] - counts[loI];
      return { q: `How many more ${LABELS[hiI].toLowerCase()} than ${LABELS[loI].toLowerCase()}?`,
               fmt: 'number', svg: barChart(counts, 5), a: diff, d: counts[hiI],
               hint: 'Read both bars, then subtract.',
               slips: G.slips(diff, [{ v: counts[hiI] + counts[loI], tag: 'op.swapped' },
                                     { v: counts[hiI], tag: 'unknown' }]) };
    }
    return { q: `How many ${LABELS[i].toLowerCase()}?`, fmt: 'number',
             svg: barChart(counts, 5), a: counts[i], d: counts[i],
             hint: 'Follow the top of that bar across to the numbers on the left.',
             slips: G.slips(counts[i], [{ v: counts[i] + 1, tag: 'count.off1' },
                                        { v: counts[i] - 1, tag: 'count.off1' }]) };
  };

  GEN['da.tally'] = r => {
    const n = ri(r, 3, 30);
    let s = '', x = 12;
    for (let k = 0; k < n; k++) {
      if (k % 5 === 4) { s += S.line(x - 31, 14, x + 3, 44, S.TXT, 3); x += 20; }
      else { s += S.line(x, 12, x, 46, S.TXT, 3); x += 9; }
    }
    return { q: 'How many is this?', fmt: 'number', svg: S.wrap(Math.max(80, x + 10), 58, s),
             a: n, d: n,
             hint: 'Each bundle with a line through it is five. Count the bundles in fives, then the leftovers.',
             slips: G.slips(n, [{ v: n - 1, tag: 'count.off1' },
                                { v: Math.ceil(n / 5), tag: 'unit.direction' }]) };
  };

  GEN['da.lineplot'] = r => {
    const den = pick(r, [2, 4]);
    const maxV = 4 * den;
    const vals = Array.from({ length: ri(r, 8, 16) }, () => ri(r, 0, maxV));
    const W = 320, y = 100;
    const X = v => round(24 + (W - 48) * v / maxV);
    let s = S.line(20, y, W - 20, y, S.INK, 2);
    for (let i = 0; i <= maxV; i++) {
      s += S.line(X(i), y - 5, X(i), y + 5, S.INK, i % den === 0 ? 2 : 1);
      if (i % den === 0) s += S.text(X(i), y + 18, i / den, 11, S.DIM);
    }
    const tally = {};
    vals.forEach(v => { tally[v] = (tally[v] || 0) + 1; });
    Object.entries(tally).forEach(([v, c]) => {
      for (let k = 0; k < c; k++) s += S.text(X(+v), y - 14 - k * 13, '✕', 11, S.ON);
    });
    const askV = +pick(r, Object.keys(tally));
    const shown = askV % den === 0 ? String(askV / den) : `${askV}/${den}`;
    return { q: `How many are at ${shown}?`, fmt: 'number', svg: S.wrap(W, 126, s),
             a: tally[askV], d: vals.length,
             hint: 'Count the crosses stacked above that mark.',
             slips: G.slips(tally[askV], [{ v: vals.length, tag: 'unknown' },
                                          { v: tally[askV] + 1, tag: 'count.off1' }]) };
  };

  GEN['da.linegraph'] = r => {
    const n = ri(r, 5, 10);
    const vals = Array.from({ length: n }, () => ri(r, 1, 20));
    const W = 320, H = 168, base = H - 28, pad = 32;
    const X = i => round(pad + (W - pad - 14) * i / (n - 1));
    const Y = v => round(base - (base - 18) * v / 20);
    let s = S.line(pad, base, W - 8, base, S.INK, 2) + S.line(pad, 12, pad, base, S.INK, 2);
    for (let g = 0; g <= 20; g += 5) {
      s += S.line(pad, Y(g), W - 8, Y(g), S.INK, 0.6);
      s += S.text(pad - 12, Y(g), g, 10, S.DIM);
    }
    s += S.path('M ' + vals.map((v, i) => `${X(i)} ${Y(v)}`).join(' L '), 'none', S.ON, 2.5);
    vals.forEach((v, i) => { s += S.circle(X(i), Y(v), 3.5, S.ON, null); });
    for (let i = 0; i < n; i++) s += S.text(X(i), base + 13, i + 1, 10, S.DIM);
    const ask = ri(r, 0, n - 1);
    return { q: `What was the value at ${ask + 1}?`, fmt: 'number', svg: S.wrap(W, H, s),
             a: vals[ask], d: n,
             hint: 'Go up from that number along the bottom until you reach the line.',
             slips: G.slips(vals[ask], [{ v: vals[ask] + 1, tag: 'count.off1' },
                                        { v: ask + 1, tag: 'coord.swapped' }]) };
  };

  GEN['da.prob'] = r => {
    const cols = [['red', 'var(--fr)'], ['blue', 'var(--geo)'], ['green', 'var(--da)']];
    const counts = [ri(r, 1, 6), ri(r, 1, 6), ri(r, 1, 6)];
    const total = counts.reduce((a, b) => a + b, 0);
    const w = ri(r, 0, 2);
    let s = '', x = 10;
    counts.forEach((c, i) => {
      for (let k = 0; k < c; k++) { s += S.circle(x + 13, 32, 12, cols[i][1], S.INK, 1.5); x += 28; }
    });
    return { q: `One is picked without looking. What is the chance it is ${cols[w][0]}?`,
             fmt: 'fraction', svg: S.wrap(Math.max(80, x + 10), 64, s),
             a: G.frac(counts[w], total), d: total,
             hint: 'How many of that colour, out of how many there are altogether.',
             slips: G.slips(G.frac(counts[w], total),
               [{ v: { n: counts[w], d: total - counts[w] }, tag: 'frac.commondenom' },
                { v: { n: total, d: counts[w] }, tag: 'op.invert' }]) };
  };

  /* ══ INTEGERS ON A NUMBER LINE ════════════════════════════════════════ */

  // npv.integers already has a generator in generators.js, but skills.json marks
  // it diagram-backed and it shipped without one. Comparing −2 and −9 without a
  // number line is exactly the case where a child reasons from the digits and
  // gets it backwards, so the line is the teaching, not decoration.
  const plainIntegers = GEN['npv.integers'];
  GEN['npv.integers'] = r => {
    const p = plainIntegers(r);
    const nums = (p.options || []).map(Number).filter(n => !Number.isNaN(n));
    const lo = -10 * Math.ceil(Math.max(1, ...nums.map(Math.abs)) / 10);
    const hi = -lo;
    const W = 330, y = 44;
    const X = n => round(18 + (W - 36) * (n - lo) / (hi - lo));
    let s = S.line(18, y, W - 18, y, S.INK, 3);
    for (let n = lo; n <= hi; n += (hi - lo) / 10) {
      s += S.line(X(n), y - 7, X(n), y + 7, n === 0 ? S.DIM : S.INK, n === 0 ? 3 : 2);
      s += S.text(X(n), y + 22, n, 11, S.DIM);
    }
    nums.forEach(n => {
      s += S.circle(X(n), y, 7, S.ON, null);
      s += S.text(X(n), y - 20, n, 12, S.ON);
    });
    return Object.assign({}, p, { svg: S.wrap(W, 76, s) });
  };

  /* ══ DECIMALS ON A HUNDRED GRID ═══════════════════════════════════════ */

  GEN['dp.tenths'] = r => {
    const tenths = r() < 0.5;
    const v = tenths ? ri(r, 1, 9) * 10 : ri(r, 1, 99);
    const cell = 22, cols = 10;
    let s = S.rect(8, 8, cols * cell, cols * cell, S.FILL, null);
    for (let k = 0; k < v; k++) {
      s += S.rect(8 + (k % cols) * cell, 8 + Math.floor(k / cols) * cell, cell, cell, S.ON, null);
    }
    for (let i = 1; i < cols; i++) {
      s += S.line(8 + i * cell, 8, 8 + i * cell, 8 + cols * cell, S.INK, i === 5 ? 1.6 : 0.7);
      s += S.line(8, 8 + i * cell, 8 + cols * cell, 8 + i * cell, S.INK, i === 5 ? 1.6 : 0.7);
    }
    s += S.rect(8, 8, cols * cell, cols * cell, 'none', S.INK);
    return { q: 'The whole square is 1. What decimal is shaded?', fmt: 'decimal2',
             svg: S.wrap(cols * cell + 16, cols * cell + 16, s), a: { v, dp: 2 }, d: v,
             hint: 'The square is a hundred small ones, so each little square is one hundredth.',
             slips: G.slips({ v, dp: 2 }, [{ v: { v, dp: 1 }, tag: 'pv.digit' },
                                           { v: { v: v * 10, dp: 2 }, tag: 'dec.places' }]) };
  };
})();

(function (root) { root.S = S; })(typeof globalThis !== 'undefined' ? globalThis : this);
