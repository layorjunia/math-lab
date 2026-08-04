// Math Lab — app shell.
//
// Five screens, all driven off the skill graph:
//   Today  a FINITE dealt deck, interleaved across skills. Finite on purpose:
//          an endless scroll trains skimming, a deck that runs out gives a
//          clean stop and a reason to come back tomorrow.
//   Map    the skill graph as a map — what is mastered, what is next, and for
//          anything locked, exactly which prerequisite is missing.
//   Report the child's own progress.
//   Grown-ups  the parent dashboard, across every app in the suite.
//
// The answer is TYPED, not chosen, for anything whose answer is a number.
// Multiple choice on arithmetic teaches elimination rather than computation,
// and four options hand over the plausible wrong answers for free. The named
// mistakes still run — as predicates against whatever was actually typed, which
// also means an error nobody anticipated shows up as a no-match instead of
// silently landing in a bucket it does not belong to.

const App = {
  tab: 'today',
  cur: null,          // the problem on screen
  typed: '',
  typed2: '',
  focus2: false,      // typing into the second box (denominator / remainder)
  answered: false,

  // ── boot ──
  init() {
    this.checkForUpdate();          // unawaited on purpose — never blocks boot
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    const has = Progress.init();
    if (has) { Progress.touchDay(); Progress.commit(); this.go('today'); }
    else this.welcome();
  },

  // An installed service worker plus edge HTML caching can pin a device to an
  // old build for hours with no error anywhere. Compare the id baked into the
  // page against version.json fetched no-store; on a mismatch bin every cache
  // and reload exactly once.
  async checkForUpdate() {
    try {
      const meta = document.querySelector('meta[name="build"]');
      const running = meta ? meta.getAttribute('content') : null;
      const res = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const { build } = await res.json();
      if (!build || !running || build === running) return;
      if (sessionStorage.getItem('mathlab-updating') === build) return;   // never loop
      sessionStorage.setItem('mathlab-updating', build);
      for (const k of await caches.keys()) await caches.delete(k);
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      location.replace(location.pathname + '?b=' + build);
    } catch (e) { /* offline: keep running what we have */ }
  },

  el(html) {
    document.getElementById('app').innerHTML = `<div class="screen">${html}</div>`;
    window.scrollTo(0, 0);
  },

  esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  go(tab) {
    this.tab = tab;
    this.resetSay();
    ({ today: () => this.today(), map: () => this.map(), play: () => this.play(),
       quests: () => this.quests(),
       report: () => this.report(), parent: () => this.parent() }[tab]
      || (() => this.today()))();
    this.renderNav();
  },

  renderNav() {
    const items = [['today', '🎯', 'Today'], ['quests', '🧭', 'Quests'],
                   ['map', '🗺️', 'Map'], ['play', '🎲', 'Play'],
                   ['report', '📈', 'Progress'], ['parent', '👋', 'Grown-ups']];
    // Six destinations is one more than a thumb bar wants, so Grown-ups drops
    // off the bar on a phone and is reached from Progress instead.
    const onPhone = window.matchMedia('(max-width: 560px)').matches;
    const shown = onPhone ? items.filter(i => i[0] !== 'parent') : items;
    document.getElementById('nav').innerHTML = shown.map(([k, ic, label]) =>
      `<button class="${this.tab === k ? 'on' : ''}" onclick="App.go('${k}')">
        <span class="n-ic">${ic}</span>${label}</button>`).join('');
  },

  // ── Listen buttons ──
  // Narration is opt-in per block, never automatic. Long text goes through an
  // index rather than into the onclick attribute: a string containing an
  // apostrophe would otherwise break the handler it is embedded in.
  _sayReg: [], _saying: null,
  resetSay() { this._sayReg = []; this._saying = null; AudioLib.stop(); },

  listenBtn(...parts) {
    const clean = parts.filter(p => p && String(p).trim());
    if (!clean.length) return '';
    const i = this._sayReg.push(clean) - 1;
    return `<button class="listen" data-say="${i}" aria-label="Listen"
      onclick="event.stopPropagation();App.say(${i})">
      <span class="ic">▶</span><span class="lbl">Listen</span></button>`;
  },

  // An expression has no clip of its own — it is composed from the number
  // vocabulary by numspeak. Prose has its own recording.
  listenExpr(text) {
    const parts = NumSpeak.expr(text);
    if (!parts.length) return '';
    const i = this._sayReg.push({ parts }) - 1;
    return `<button class="listen" data-say="${i}" aria-label="Listen"
      onclick="event.stopPropagation();App.say(${i})">
      <span class="ic">▶</span><span class="lbl">Listen</span></button>`;
  },

  say(i) {
    const item = this._sayReg[i];
    if (!item) return;
    if (this._saying === i) { AudioLib.stop(); this._saying = null; return this.syncListen(); }
    this._saying = i;
    this.syncListen();
    const done = Array.isArray(item)
      ? AudioLib.speakSeq(item)
      : AudioLib.speakParts(item.parts);
    done.then(() => {
      if (this._saying === i) { this._saying = null; this.syncListen(); }
    });
  },

  // Repaint the buttons in place. A full re-render would clear what the child
  // has already typed into the answer box.
  syncListen() {
    document.querySelectorAll('.listen').forEach(b => {
      const on = +b.dataset.say === this._saying;
      b.classList.toggle('on', on);
      b.querySelector('.ic').textContent = on ? '■' : '▶';
      b.querySelector('.lbl').textContent = on ? 'Stop' : 'Listen';
    });
  },

  // ── welcome ──
  welcome() {
    document.getElementById('nav').innerHTML = '';
    this.el(`
      <div style="padding:56px 6px 18px;text-align:center">
        <div style="font-size:3.6rem;line-height:1">🧮</div>
        <h1 style="margin-top:10px;font-size:2rem">Math Lab</h1>
        <p class="dim" style="margin-top:8px">First grade to sixth, one step at a time.</p>
      </div>
      <div class="card">
        <h2>What should we call you?</h2>
        <input id="nm" maxlength="18" placeholder="Your name"
          style="width:100%;margin-top:12px;padding:14px;border-radius:12px;
                 background:var(--ink-3);border:1px solid var(--line);
                 color:var(--text);font:inherit;font-size:1.05rem">
        <h2 style="margin-top:18px">Which grade?</h2>
        <p class="dim small" style="margin-top:4px">You can change this whenever you like.</p>
        <div class="opts two" style="grid-template-columns:repeat(3,1fr)">
          ${[1, 2, 3, 4, 5, 6].map(g =>
            `<button class="opt" data-g="${g}" onclick="App.pickGrade(${g})">${g}</button>`).join('')}
        </div>
        <button class="btn wide big" style="margin-top:16px" onclick="App.start()">Start</button>
      </div>`);
    this._grade = 1;
    setTimeout(() => {
      const i = document.getElementById('nm'); if (i) i.focus();
      this.pickGrade(1);
    }, 80);
  },

  pickGrade(g) {
    this._grade = g;
    // .sel, not .right: green means "you answered correctly" everywhere else
    // in this app, and reusing it for "selected" teaches the colour wrong.
    document.querySelectorAll('.opt[data-g]').forEach(b =>
      b.classList.toggle('sel', +b.dataset.g === g));
  },

  start() {
    const n = (document.getElementById('nm').value || '').trim() || 'Explorer';
    Progress.create(n, this._grade || 1);
    this.go('today');
  },

  // ── TODAY: the dealt deck ──
  today() {
    const p = Progress.p, deck = Progress.deck();
    const done = deck.idx >= deck.served.length;
    const streak = p.dayStreak > 1 ? `<span class="chip flame">🔥 ${p.dayStreak}</span>` : '';

    if (done) {
      const today = Store.dayKey();
      const log = (p.dayLog || []).find(d => d.d === today) || { asked: 0, right: 0 };
      return this.el(`
        ${this.bar('Today', streak)}
        <div class="card" style="text-align:center;padding:30px 18px">
          <div style="font-size:3rem">✅</div>
          <h2 style="margin-top:10px">That is today's deck finished.</h2>
          <p class="dim" style="margin-top:8px">
            ${log.right} right out of ${log.asked}. Come back tomorrow for a new one —
            a skill counts as mastered only after two different days.</p>
          <button class="btn ghost wide" style="margin-top:16px"
            onclick="App.go('report')">See what you have learned</button>
        </div>
        ${this.errorCard()}`);
    }

    const skillId = deck.served[deck.idx];
    this.serve(skillId, deck.seed + deck.idx * 101);
  },

  bar(title, right) {
    return `<div class="bar"><h1>${title}</h1><div class="grow"></div>${right || ''}</div>`;
  },

  // ── serving one problem ──
  serve(skillId, seed) {
    const s = SKILL[skillId];
    const gen = GEN[skillId];
    if (!gen) { this.next(); return; }
    let prob;
    try { prob = gen(mulberry32(seed >>> 0)); }
    catch (e) { this.next(); return; }

    this.cur = { p: prob, skill: s, seed };
    this.typed = ''; this.typed2 = ''; this.focus2 = false; this.answered = false;
    Progress.markSeen(skillId);
    this.paint();
  },

  paint() {
    const { p: prob, skill } = this.cur;
    const deck = Progress.deck();
    const pos = `${Math.min(deck.idx + 1, deck.served.length)} / ${deck.served.length}`;
    const wordy = prob.q.length > 42;
    const readAloud = Progress.p.readAloud;

    this.resetSay();
    // Word problems have their own recording; bare expressions are composed
    // from the number vocabulary.
    const listen = wordy && AudioLib.has(prob.q)
      ? this.listenBtn(prob.q) : this.listenExpr(prob.q);

    const body = `
      ${this.bar('Today', `<span class="chip mono">${pos}</span>`)}
      <div class="solve">
        <div class="prob" style="--c:var(--${skill.s})">
          <div class="skillname"><span class="dot"></span>${this.esc(skill.name)}</div>
          <div class="q ${wordy ? 'wordy' : ''}">${this.esc(prob.q)}</div>
          ${prob.svg || ''}
          <div style="margin-top:6px">${listen}</div>
          ${this.answerArea(prob)}
          <div id="verdict"></div>
        </div>
        <div id="pad">${this.answered ? '' : this.pad(prob)}</div>
      </div>`;
    this.el(body);
    if (readAloud && !this.answered) setTimeout(() => this.say(0), 250);
  },

  answerArea(prob) {
    if (prob.fmt === 'choice' || prob.fmt === 'multi') {
      const opts = prob.options || [];
      return `<div class="opts ${opts.length <= 3 ? 'two' : ''}" id="opts">
        ${opts.map((o, i) => `<button class="opt" data-o="${i}"
          onclick="App.chose(${i})">${this.esc(o)}</button>`).join('')}</div>`;
    }
    if (prob.fmt === 'fraction') {
      return `<div class="ansrow" style="margin-top:14px">
        <div class="fracbox">
          <input class="ans small" id="a1" inputmode="numeric" readonly value="${this.esc(this.typed)}">
          <div class="rule"></div>
          <input class="ans small" id="a2" inputmode="numeric" readonly value="${this.esc(this.typed2)}">
        </div></div>`;
    }
    if (prob.fmt === 'quotrem' || prob.fmt === 'coord') {
      const sep = prob.fmt === 'coord' ? ',' : 'r';
      const lead = prob.fmt === 'coord' ? '<span class="slash">(</span>' : '';
      const tail = prob.fmt === 'coord' ? '<span class="slash">)</span>' : '';
      return `<div class="ansrow" style="margin-top:14px">${lead}
        <input class="ans small" id="a1" inputmode="numeric" readonly value="${this.esc(this.typed)}">
        <span class="slash small dim">${sep}</span>
        <input class="ans small" id="a2" inputmode="numeric" readonly value="${this.esc(this.typed2)}">
        ${tail}</div>`;
    }
    const prefix = prob.fmt === 'money' ? '<span class="slash">$</span>' : '';
    return `<div class="ansrow" style="margin-top:14px">${prefix}
      <input class="ans" id="a1" inputmode="decimal" readonly value="${this.esc(this.typed)}"></div>`;
  },

  // A keypad rather than the OS keyboard: on a tablet the system keyboard
  // covers the problem the child is trying to read.
  pad(prob) {
    if (prob.fmt === 'choice' || prob.fmt === 'multi') return '';
    const dec = ['decimal1', 'decimal2', 'decimal4', 'money'].includes(prob.fmt);
    const two = ['fraction', 'quotrem', 'coord'].includes(prob.fmt);
    const neg = ['as.integers', 'npv.abs', 'npv.integers', 'geo.coord4']
      .includes(this.cur.skill.id);
    const extra = dec ? '.' : (neg ? '−' : (two ? '↹' : ''));
    return `<div class="keys">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n =>
        `<button class="key" onclick="App.k('${n}')">${n}</button>`).join('')}
      <button class="key ${extra ? '' : 'del'}" onclick="App.k('${extra || 'del'}')">${extra || '⌫'}</button>
      <button class="key" onclick="App.k('0')">0</button>
      ${extra ? `<button class="key del" onclick="App.k('del')">⌫</button>` : ''}
      <button class="key go ${extra ? 'wide' : 'wide'}" onclick="App.submit()">Check</button>
    </div>`;
  },

  k(ch) {
    if (this.answered) return;
    const two = ['fraction', 'quotrem', 'coord'].includes(this.cur.p.fmt);
    if (ch === '↹') { this.focus2 = !this.focus2; return this.repaintAns(); }
    const key = (two && this.focus2) ? 'typed2' : 'typed';
    if (ch === 'del') this[key] = this[key].slice(0, -1);
    else if (ch === '−') this[key] = this[key].startsWith('−') ? this[key].slice(1) : '−' + this[key];
    else if (ch === '.') { if (!this[key].includes('.')) this[key] += '.'; }
    else if (this[key].length < 9) this[key] += ch;
    // Typing the first box full moves to the second by itself; the ↹ key is
    // there for going back.
    if (two && !this.focus2 && this[key].length >= 1 && ch !== 'del') { /* stay */ }
    this.repaintAns();
    Sfx.play('tap', 0.25);
  },

  repaintAns() {
    const a1 = document.getElementById('a1'), a2 = document.getElementById('a2');
    if (a1) { a1.value = this.typed; a1.style.borderColor = this.focus2 ? '' : 'var(--amber)'; }
    if (a2) { a2.value = this.typed2; a2.style.borderColor = this.focus2 ? 'var(--amber)' : ''; }
  },

  chose(i) {
    if (this.answered) return;
    this.typed = this.cur.p.options[i];
    this.submit();
  },

  // ── parsing and comparing, exactly ──
  parse(fmt) {
    const t = this.typed.replace('−', '-').trim();
    const t2 = this.typed2.replace('−', '-').trim();
    if (fmt === 'choice' || fmt === 'multi') return this.typed || null;
    if (fmt === 'fraction') {
      if (!/^-?\d+$/.test(t) || !/^\d+$/.test(t2) || +t2 === 0) return null;
      return { n: +t, d: +t2 };
    }
    if (fmt === 'quotrem') {
      if (!/^-?\d+$/.test(t) || !/^\d+$/.test(t2)) return null;
      return { q: +t, rem: +t2 };
    }
    if (fmt === 'coord') {
      if (!/^-?\d+$/.test(t) || !/^-?\d+$/.test(t2)) return null;
      return { x: +t, y: +t2 };
    }
    if (fmt === 'money') {
      const m = t.match(/^(\d+)(?:\.(\d{1,2}))?$/);
      if (!m) return null;
      return +m[1] * 100 + (m[2] ? +(m[2].padEnd(2, '0')) : 0);
    }
    if (fmt && fmt.startsWith('decimal')) {
      const dp = +fmt.slice(7);
      const m = t.match(/^(-?)(\d*)(?:\.(\d*))?$/);
      if (!m || (!m[2] && !m[3])) return null;
      const frac = (m[3] || '').padEnd(dp, '0').slice(0, dp);
      return { v: (m[1] ? -1 : 1) * +((m[2] || '0') + frac), dp };
    }
    return /^-?\d+$/.test(t) ? +t : null;
  },

  // Fractions compare by VALUE, except where the question asked for simplest
  // form — there 14/10 is a real, named mistake and not a right answer.
  same(a, b, fmt, strict) {
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (typeof a === 'object' && typeof b === 'object') {
      if ('n' in a && 'n' in b) {
        if (strict) return a.n === b.n && a.d === b.d;
        return a.n * b.d === b.n * a.d;
      }
      if ('q' in a && 'q' in b) return a.q === b.q && a.rem === b.rem;
      if ('x' in a && 'x' in b) return a.x === b.x && a.y === b.y;
      if ('v' in a && 'v' in b) return a.v * Math.pow(10, b.dp) === b.v * Math.pow(10, a.dp);
      return false;
    }
    return a === b;
  },

  STRICT_FORM: ['fr.simplify', 'dp.dec.frac', 'dp.percent'],

  submit() {
    if (this.answered) return;
    const { p: prob, skill } = this.cur;
    const got = this.parse(prob.fmt);
    if (got === null) { Sfx.play('retry', 0.3); return; }

    const strict = this.STRICT_FORM.includes(skill.id);
    const right = this.same(got, prob.a, prob.fmt, strict);
    this.answered = true;

    // The named mistake, matched against what was actually typed.
    let tag = null;
    if (!right) {
      const hit = (prob.slips || []).find(s => this.same(got, s.v, prob.fmt, strict));
      tag = hit ? hit.tag : 'unknown';
    }
    Progress.record(skill.id, right, tag);
    Sfx.play(right ? 'correct' : 'retry', right ? 0.5 : 0.3);

    const pad = document.getElementById('pad'); if (pad) pad.innerHTML = '';
    if (prob.fmt === 'choice' || prob.fmt === 'multi') {
      document.querySelectorAll('.opt[data-o]').forEach(b => {
        const v = prob.options[+b.dataset.o];
        if (v === prob.a) b.classList.add('right');
        else if (v === this.typed && !right) b.classList.add('wrong');
      });
    }
    this.showVerdict(right, tag, prob);
  },

  showVerdict(right, tag, prob) {
    const v = document.getElementById('verdict');
    if (!v) return;
    const shown = this.fmtAnswer(prob.a, prob.fmt);

    if (right) {
      v.innerHTML = `<div class="verdict ok">
          <h3>Right — ${this.esc(shown)}</h3>
          <p>${this.esc(G.pick(mulberry32(Date.now() & 0xffff),
             ['That is it.', 'Exactly right.', 'Good — straight through.',
              'Correct.', 'Nicely done.']))}</p>
        </div>
        <button class="btn wide big" style="margin-top:12px" onclick="App.next()">Next</button>`;
    } else {
      const e = ERRORS[tag] || ERRORS.unknown;
      v.innerHTML = `<div class="verdict no">
          <h3>${this.esc(e.name)}</h3>
          <p>${this.esc(e.say)}</p>
          <div class="fix"><b>The step:</b> ${this.esc(e.fix)}</div>
          <div class="fix" style="border:none;padding-top:6px">
            The answer is <b>${this.esc(shown)}</b>.</div>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn ghost" style="flex:1" onclick="App.retry()">Try it again</button>
          <button class="btn" style="flex:1" onclick="App.next()">Next</button>
        </div>`;
    }
    // The explanation is the most valuable text in the app, so it gets a Listen
    // of its own rather than sharing the question's.
    const e = right ? null : (ERRORS[tag] || ERRORS.unknown);
    if (e) {
      const btn = this.listenBtn(e.name, e.say, e.fix);
      if (btn) v.querySelector('.verdict').insertAdjacentHTML('beforeend',
        `<div style="margin-top:10px">${btn}</div>`);
    }
  },

  fmtAnswer(a, fmt) {
    if (a && typeof a === 'object') {
      if ('n' in a) return `${a.n}/${a.d}`;
      if ('q' in a) return `${a.q} remainder ${a.rem}`;
      if ('x' in a) return `(${a.x}, ${a.y})`;
      if ('v' in a) return G.dec(a.v, a.dp);
    }
    if (fmt === 'money') return G.money(a);
    return String(a);
  },

  retry() {
    this.typed = ''; this.typed2 = ''; this.answered = false;
    this.paint();
  },

  next() {
    const deck = Progress.deck();
    deck.idx++;
    Progress.commit();
    this.go('today');
  },

  // ── the mistakes worth noticing ──
  errorCard() {
    const top = Progress.topErrors(4);
    if (!top.length) return '';
    return `<div class="card">
      <h2>What has been tripping you up</h2>
      <p class="dim small" style="margin-top:2px">The last three weeks.</p>
      <div style="margin-top:10px">
        ${top.map(e => `<div class="errrow">
            <span class="n">${e.n}×</span>
            <span class="t">${this.esc((ERRORS[e.tag] || ERRORS.unknown).name)}</span>
          </div>`).join('')}
      </div></div>`;
  },

  // ── MAP ──
  map() {
    const p = Progress.p;
    const grades = [1, 2, 3, 4, 5, 6];
    const g = p.grade;
    const c = Progress.counts(g);
    const total = SKILLS.filter(s => s.g === g).length;

    const strands = Object.keys(STRANDS).map(key => {
      const rows = SKILLS.filter(s => s.g === g && s.s === key);
      if (!rows.length) return '';
      const done = rows.filter(s => ['mastered', 'stale'].includes(Progress.state(s.id))).length;
      return `<div class="strand" style="--c:var(--${key})">
        <h2><span class="sw"></span>${this.esc(STRANDS[key].name)}
          <span class="n mono">${done}/${rows.length}</span></h2>
        <div class="sks">${rows.map(s => this.skillCard(s)).join('')}</div>
      </div>`;
    }).join('');

    this.el(`
      ${this.bar('Map')}
      <div class="card tight">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${grades.map(n => `<button class="chiptap ${n === g ? 'on' : ''}"
            onclick="App.setGrade(${n})">Grade ${n}</button>`).join('')}
        </div>
        <div class="meter" style="margin-top:12px">
          <i class="mastered" style="width:${(c.mastered + c.stale) / total * 100}%"></i>
          <i class="known"    style="width:${c.known / total * 100}%"></i>
          <i class="seen"     style="width:${c.seen / total * 100}%"></i>
        </div>
        <p class="dim small" style="margin-top:8px">
          ${c.mastered} mastered · ${c.known} getting there · ${c.stale} needs a look ·
          ${total - c.mastered - c.known - c.stale} to come</p>
      </div>
      ${strands}`);
  },

  skillCard(s) {
    const st = Progress.state(s.id);
    const locked = !Progress.unlocked(s.id) && st === 'unseen';
    const acc = Progress.accuracy(s.id);
    const label = { unseen: 'Not started', seen: 'Started', known: 'Getting there',
                    mastered: 'Mastered', stale: 'Needs a look' }[st];
    return `<button class="sk ${st} ${locked ? 'locked' : ''}" style="--c:var(--${s.s})"
      onclick="App.openSkill('${s.id}')">
      <span class="t">${this.esc(s.name)}</span>
      <span class="m"><span class="pip"></span>${locked ? 'Locked' : label}
        ${acc !== null ? `· <span class="mono">${Math.round(acc * 100)}%</span>` : ''}</span>
    </button>`;
  },

  openSkill(id) {
    const s = SKILL[id];
    const blockers = Progress.blockers(id);
    const st = Progress.state(id);
    const acc = Progress.accuracy(id);
    const r = Progress.p.skills[id];
    this.resetSay();
    this.el(`
      ${this.bar('Skill', `<button class="chiptap" onclick="App.go('map')">Back</button>`)}
      <div class="card" style="border-left:3px solid var(--${s.s})">
        <h2>${this.esc(s.name)}</h2>
        <p class="dim small mono" style="margin-top:4px">${this.esc(s.range)}</p>
        <p class="dim small" style="margin-top:8px">
          ${GRADES[s.g].name} · ${this.esc(STRANDS[s.s].name)}</p>
        ${r ? `<p style="margin-top:10px">Seen ${r.seen} · right ${r.right} · wrong ${r.wrong}
           ${acc !== null ? `· <b>${Math.round(acc * 100)}%</b>` : ''}</p>` : ''}
      </div>
      ${blockers.length ? `<div class="card">
        <h3>You need these first</h3>
        <div class="sks" style="margin-top:8px">
          ${blockers.map(b => this.skillCard(SKILL[b])).join('')}</div></div>` : ''}
      ${s.next.length ? `<div class="card">
        <h3>This unlocks</h3>
        <div class="sks" style="margin-top:8px">
          ${s.next.slice(0, 6).map(b => this.skillCard(SKILL[b])).join('')}</div></div>` : ''}
      ${GEN[id] && !blockers.length
        ? `<button class="btn wide big" onclick="App.practise('${id}')">Practise this</button>`
        : (blockers.length ? '' : `<p class="dim small">Coming soon.</p>`)}
    `);
  },

  practise(id) {
    this.tab = 'today';
    this.serve(id, (Date.now() % 100000) >>> 0);
    this.renderNav();
  },

  setGrade(g) { Progress.setGrade(g); this.go('map'); },


  // ── PLAY ──
  play() {
    this.el(`
      ${this.bar('Play')}
      <p class="dim small" style="margin-bottom:12px">
        Every one of these is built from the same problems as Today — a
        different way of looking at them, not extra homework.</p>
      ${Games.LIST.map(g => `<button class="card tight" style="width:100%;text-align:left;
          cursor:pointer;border:1px solid var(--line);color:var(--text);font:inherit"
          onclick="App.startGame('${g.id}')">
          <h2 style="display:flex;align-items:center;gap:9px">
            <span style="font-size:1.4rem">${g.glyph}</span>${this.esc(g.name)}</h2>
          <p class="dim small" style="margin-top:4px">${this.esc(g.blurb)}</p>
        </button>`).join('')}`);
  },

  startGame(id) {
    this.game = { id, seed: (Date.now() % 100000) | 0, i: 0, right: 0, t0: Date.now() };
    this.tab = 'play';
    this.renderNav();
    this.gameStep();
  },

  gameStep() {
    const g = this.game;
    if (!g) return this.go('play');
    ({ bigger: () => this.gBigger(), slip: () => this.gSlip(),
       clock: () => this.gClock(), listen: () => this.gListen() }[g.id]
      || (() => this.go('play')))();
  },

  gameBar(title, n) {
    return this.bar(title, `<span class="chip mono">${this.game.i + 1} / ${n}</span>
      <button class="chiptap" onclick="App.go('play')">Stop</button>`);
  },

  gameDone(extra) {
    const g = this.game;
    this.el(`
      ${this.bar('Play')}
      <div class="card" style="text-align:center;padding:28px 18px">
        <div style="font-size:2.6rem">${g.right >= 8 ? '🎉' : '✅'}</div>
        <h2 style="margin-top:8px">${g.right} out of ${g.n || 10}</h2>
        ${extra || ''}
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn ghost" style="flex:1" onclick="App.startGame('${g.id}')">Again</button>
          <button class="btn" style="flex:1" onclick="App.go('play')">Done</button>
        </div>
      </div>`);
    this.game = null;
  },

  // Bigger or Smaller — estimation, not calculation.
  gBigger() {
    const g = this.game;
    g.n = 8;
    if (g.i >= g.n) return this.gameDone();
    const item = Games.bigger(g.seed + g.i * 137);
    if (!item) return this.go('play');
    g.cur = item;
    this.resetSay();
    this.el(`
      ${this.gameBar('Bigger or Smaller', g.n)}
      <div class="prob" style="--c:var(--md)">
        <div class="skillname"><span class="dot"></span>Which is bigger?</div>
        <div class="opts two" style="margin-top:16px">
          <button class="opt" style="font-size:1.3rem;padding:22px 10px" data-side="left"
            onclick="App.gBiggerPick('left')">${this.esc(item.left)}</button>
          <button class="opt" style="font-size:1.3rem;padding:22px 10px" data-side="right"
            onclick="App.gBiggerPick('right')">${this.esc(item.right)}</button>
        </div>
        <div id="verdict"></div>
      </div>`);
  },

  gBiggerPick(side) {
    const g = this.game, item = g.cur;
    if (g.locked) return;
    g.locked = true;
    const ok = side === item.answer;
    if (ok) g.right++;
    Sfx.play(ok ? 'correct' : 'retry', ok ? 0.5 : 0.3);
    document.querySelectorAll('.opt[data-side]').forEach(b => {
      b.classList.add(b.dataset.side === item.answer ? 'right' : 'wrong');
    });
    document.getElementById('verdict').innerHTML = `
      <div class="verdict ${ok ? 'ok' : 'no'}">
        <h3>${ok ? 'Right' : 'The other one'}</h3>
        <p><b>${this.esc(item.left)}</b> is ${item.lv}, <b>${this.esc(item.right)}</b> is ${item.rv}.</p>
      </div>
      <button class="btn wide big" style="margin-top:12px" onclick="App.gameNext()">Next</button>`;
  },

  gameNext() {
    this.game.i++;
    this.game.locked = false;
    this.gameStep();
  },

  // Spot the Slip — naming somebody else's mistake.
  gSlip() {
    const g = this.game;
    g.n = 6;
    if (g.i >= g.n) return this.gameDone();
    const item = Games.slip(g.seed + g.i * 211);
    if (!item) return this.go('play');
    g.cur = item;
    this.resetSay();
    this.el(`
      ${this.gameBar('Spot the Slip', g.n)}
      <div class="prob" style="--c:var(--fr)">
        <div class="skillname"><span class="dot"></span>${this.esc(item.skill.name)}</div>
        <div class="q ${item.q.length > 42 ? 'wordy' : ''}">${this.esc(item.q)}</div>
        ${item.svg || ''}
        <p style="margin-top:10px;font-size:1.15rem">
          Somebody answered <b style="color:var(--bad)">${this.esc(item.wrong)}</b>.</p>
        <p class="dim small" style="margin-top:4px">What did they do?</p>
        <div class="opts" style="margin-top:12px">
          ${item.options.map(t => `<button class="opt" data-tag="${t}"
            style="font-size:.98rem;text-align:left"
            onclick="App.gSlipPick('${t}')">${this.esc(ERRORS[t].name)}</button>`).join('')}
        </div>
        <div id="verdict"></div>
      </div>`);
  },

  gSlipPick(tag) {
    const g = this.game, item = g.cur;
    if (g.locked) return;
    g.locked = true;
    const ok = tag === item.tag;
    if (ok) g.right++;
    Sfx.play(ok ? 'correct' : 'retry', ok ? 0.5 : 0.3);
    document.querySelectorAll('.opt[data-tag]').forEach(b => {
      if (b.dataset.tag === item.tag) b.classList.add('right');
      else if (b.dataset.tag === tag) b.classList.add('wrong');
    });
    const e = ERRORS[item.tag];
    document.getElementById('verdict').innerHTML = `
      <div class="verdict ${ok ? 'ok' : 'no'}">
        <h3>${this.esc(e.name)}</h3>
        <p>${this.esc(e.say)}</p>
        <div class="fix"><b>The step:</b> ${this.esc(e.fix)}</div>
        <div class="fix" style="border:none;padding-top:6px">
          It should have been <b>${this.esc(item.right)}</b>.</div>
        <div style="margin-top:10px">${this.listenBtn(e.name, e.say, e.fix)}</div>
      </div>
      <button class="btn wide big" style="margin-top:12px" onclick="App.gameNext()">Next</button>`;
  },

  // Beat the Clock — against the child's own previous best, and nothing else.
  gClock() {
    const g = this.game;
    g.n = 10;
    if (!g.set) { g.set = Games.clockSet(g.seed, g.n); g.t0 = Date.now(); }
    if (g.i >= g.set.length) {
      const secs = Math.round((Date.now() - g.t0) / 1000);
      const key = 'g' + Progress.p.grade;
      const best = (Progress.p.bestTime || {})[key];
      const beat = g.right >= 8 && (!best || secs < best);
      if (beat) {
        Progress.p.bestTime = Progress.p.bestTime || {};
        Progress.p.bestTime[key] = secs;
        Progress.commit();
        Sfx.play('fanfare', 0.5);
      }
      return this.gameDone(`
        <p style="margin-top:8px;font-size:1.1rem">${secs} seconds</p>
        ${best ? `<p class="dim small" style="margin-top:4px">
            ${beat ? `Your best was ${best}. That is ${best - secs} seconds quicker.`
                   : `Your best is still ${best} seconds.`}</p>`
          : (g.right >= 8 ? '<p class="dim small" style="margin-top:4px">That is your first time — the one to beat.</p>'
                          : '<p class="dim small" style="margin-top:4px">Get eight right to set a time.</p>')}`);
    }
    const { skill, p } = g.set[g.i];
    g.cur = { skill, p };
    this.resetSay();
    const secs = Math.round((Date.now() - g.t0) / 1000);
    this.el(`
      ${this.gameBar('Beat the Clock', g.n)}
      <div class="prob" style="--c:var(--as)">
        <div class="skillname"><span class="dot"></span><span class="mono">${secs}s</span></div>
        <div class="q">${this.esc(p.q)}</div>
        ${p.svg || ''}
        ${p.fmt === 'choice'
          ? `<div class="opts ${p.options.length <= 3 ? 'two' : ''}">
              ${p.options.map((o, i) => `<button class="opt"
                onclick="App.gClockPick(${i})">${this.esc(o)}</button>`).join('')}</div>`
          : `<div class="ansrow" style="margin-top:14px">
              <input class="ans" id="a1" inputmode="numeric" readonly value=""></div>
             ${this.pad(p)}`}
      </div>`);
    this.typed = ''; this.typed2 = '';
  },

  gClockPick(i) {
    const g = this.game;
    const ok = g.cur.p.options[i] === g.cur.p.a;
    if (ok) g.right++;
    Progress.record(g.cur.skill.id, ok, null);
    Sfx.play(ok ? 'correct' : 'retry', ok ? 0.4 : 0.25);
    g.i++;
    this.gClock();
  },

  // Listen Up — the only screen where the audio IS the question.
  gListen() {
    const g = this.game;
    g.n = 8;
    if (g.i >= g.n) return this.gameDone();
    const item = Games.listen(g.seed + g.i * 313);
    g.cur = item;
    this.resetSay();
    const i = this._sayReg.push({ parts: item.parts }) - 1;
    this.el(`
      ${this.gameBar('Listen Up', g.n)}
      <div class="prob" style="--c:var(--da)">
        <div class="skillname"><span class="dot"></span>Which number did you hear?</div>
        <button class="btn big wide" style="margin-top:16px" onclick="App.say(${i})">
          ▶  Play it again</button>
        <div class="opts two" style="margin-top:14px">
          ${item.options.map(o => `<button class="opt" data-n="${o}"
            style="font-size:1.3rem" onclick="App.gListenPick(${o})">${o}</button>`).join('')}
        </div>
        <div id="verdict"></div>
      </div>`);
    setTimeout(() => this.say(i), 350);
  },

  gListenPick(n) {
    const g = this.game, item = g.cur;
    if (g.locked) return;
    g.locked = true;
    const ok = n === item.n;
    if (ok) g.right++;
    Sfx.play(ok ? 'correct' : 'retry', ok ? 0.5 : 0.3);
    document.querySelectorAll('.opt[data-n]').forEach(b => {
      if (+b.dataset.n === item.n) b.classList.add('right');
      else if (+b.dataset.n === n) b.classList.add('wrong');
    });
    document.getElementById('verdict').innerHTML = `
      <div class="verdict ${ok ? 'ok' : 'no'}">
        <h3>${ok ? 'Right' : 'It was ' + item.n}</h3>
      </div>
      <button class="btn wide big" style="margin-top:12px" onclick="App.gameNext()">Next</button>`;
  },

  // ── QUESTS ──
  quests() {
    this.resetSay();
    this.el(`
      ${this.bar('Quests')}
      <p class="dim small" style="margin-bottom:12px">
        Short routes through the map, each with a reason. Everything on a quest
        is a skill you can practise on its own — the quest is the order, and why.</p>
      ${QUESTS.map(q => {
        const stops = questStops(q);
        const done = stops.filter(st =>
          ['mastered', 'stale'].includes(Progress.state(st.s))).length;
        return `<button class="card tight" style="width:100%;text-align:left;cursor:pointer;
            color:var(--text);font:inherit;border-left:3px solid var(--${q.tint})"
            onclick="App.openQuest('${q.id}')">
            <h2 style="display:flex;align-items:center;gap:9px">
              <span style="font-size:1.3rem">${q.glyph}</span>${this.esc(q.name)}
              <span class="mono small dim" style="margin-left:auto">${done}/${stops.length}</span></h2>
            <p class="dim small" style="margin-top:4px">${this.esc(q.intro)}</p>
            <div class="meter" style="margin-top:9px">
              <i class="mastered" style="width:${stops.length ? done / stops.length * 100 : 0}%"></i>
            </div>
          </button>`;
      }).join('')}`);
  },

  openQuest(id) {
    const q = QUESTS.find(x => x.id === id);
    if (!q) return this.go('quests');
    const stops = questStops(q);
    this.resetSay();
    this.el(`
      ${this.bar(q.glyph + ' ' + this.esc(q.name),
        `<button class="chiptap" onclick="App.go('quests')">Back</button>`)}
      <div class="card" style="border-left:3px solid var(--${q.tint})">
        <p>${this.esc(q.intro)}</p>
        <div style="margin-top:10px">${this.listenBtn(q.intro)}</div>
      </div>
      ${stops.map((st, i) => {
        const s = SKILL[st.s];
        const state = Progress.state(st.s);
        const done = ['mastered', 'stale'].includes(state);
        return `<div class="card tight" style="border-left:3px solid var(--${s.s})">
          <p class="small dim" style="display:flex;align-items:center;gap:7px">
            <span class="mono">${i + 1}</span>
            <span class="pip" style="width:8px;height:8px;border-radius:50%;
              background:${done ? 'var(--good)' : state === 'known' ? 'var(--amber)' : 'var(--line-2)'}"></span>
            ${this.esc(STRANDS[s.s].name)}</p>
          <h3 style="margin-top:5px">${this.esc(s.name)}</h3>
          <p class="dim small" style="margin-top:4px;font-style:italic">${this.esc(st.note)}</p>
          <button class="btn ghost wide" style="margin-top:10px"
            onclick="App.practise('${st.s}')">${done ? 'Practise again' : 'Practise this'}</button>
        </div>`;
      }).join('')}
      <div class="card">
        <p>${this.esc(q.outro)}</p>
        <div style="margin-top:10px">${this.listenBtn(q.outro)}</div>
      </div>`);
  },

  // ── REPORT (the child's own) ──
  report() {
    const p = Progress.p;
    const days = (p.dayLog || []).slice(-21);
    const max = Math.max(1, ...days.map(d => d.asked));
    const all = Progress.counts();
    let right = 0, wrong = 0;
    Object.values(p.skills || {}).forEach(r => { right += r.right || 0; wrong += r.wrong || 0; });

    this.el(`
      ${this.bar('Progress', p.dayStreak > 1 ? `<span class="chip flame">🔥 ${p.dayStreak}</span>` : '')}
      <div class="grid2">
        <div class="stat"><b>${all.mastered}</b><span>Skills mastered</span></div>
        <div class="stat"><b>${right + wrong ? Math.round(right / (right + wrong) * 100) : 0}%</b>
          <span>Right overall</span></div>
        <div class="stat"><b>${right}</b><span>Questions right</span></div>
        <div class="stat"><b>${p.bestStreak || 0}</b><span>Best day streak</span></div>
      </div>
      <div class="card" style="margin-top:12px">
        <h2>The last three weeks</h2>
        <div class="spark">
          ${days.map(d => `<i class="${d.asked ? 'hot' : ''}"
            style="height:${Math.max(4, d.asked / max * 100)}%" title="${d.d}: ${d.right}/${d.asked}"></i>`).join('')}
        </div>
      </div>
      ${this.errorCard()}
      <div class="card">
        <h2>Where you are</h2>
        <div class="scroll-x"><table class="rep">
          <tr><th>Grade</th><th class="num">Mastered</th><th class="num">Started</th><th class="num">To come</th></tr>
          ${[1, 2, 3, 4, 5, 6].map(g => {
            const c = Progress.counts(g);
            const t = SKILLS.filter(s => s.g === g).length;
            return `<tr><td>${GRADES[g].name}</td>
              <td class="num">${c.mastered + c.stale}</td>
              <td class="num">${c.known + c.seen}</td>
              <td class="num">${t - c.mastered - c.stale - c.known - c.seen}</td></tr>`;
          }).join('')}
        </table></div>
      </div>`);
  },

  // ── PARENT DASHBOARD ──
  parent() {
    const p = Progress.p;
    this.el(`
      ${this.bar('Grown-ups')}
      <div class="card">
        <h2>${this.esc(Progress.profile.name)}</h2>
        <p class="dim small" style="margin-top:4px">
          ${GRADES[p.grade].name} · on this device</p>
        ${this.parentBody(Family.summarise(Progress.profile), 'math-lab')}
      </div>
      <div class="card">
        <h2>Every app</h2>
        <p class="dim small" style="margin-top:4px">
          Sign in to see Wonder Lab and Unicorn Reading Academy here too.</p>
        <div id="fam" style="margin-top:12px">
          ${window.Sync && Sync.uid
            ? '<p class="dim small">Loading…</p>'
            : `<button class="btn ghost wide" onclick="App.signInPrompt()">Sign in</button>`}
        </div>
      </div>
      <div class="card">
        <h2>Settings</h2>
        <label style="display:flex;align-items:center;gap:10px;margin-top:10px">
          <input type="checkbox" ${p.readAloud ? 'checked' : ''}
            onchange="Progress.p.readAloud=this.checked;Progress.commit()"
            style="width:20px;height:20px;accent-color:var(--amber)">
          <span>Read each problem out loud automatically</span>
        </label>
        <p class="dim small" style="margin-top:6px">
          Off by default. Every problem has a Listen button either way — this is
          for a child who reads less easily than they do maths.</p>
      </div>`);
    if (window.Sync && Sync.uid) this.loadFamily();
  },

  parentBody(sum, app) {
    const errs = (sum.errors || []).slice(0, 4);
    const byG = sum.byGrade || {};
    return `
      <div class="grid2" style="margin-top:12px">
        <div class="stat"><b>${Object.values(byG).reduce((s, g) => s + g.mastered, 0)}</b>
          <span>Skills mastered</span></div>
        <div class="stat"><b>${sum.asked ? Math.round(sum.right / sum.asked * 100) : 0}%</b>
          <span>Right overall</span></div>
      </div>
      ${errs.length ? `<h3 style="margin-top:16px">Mistakes to work on</h3>
        <div style="margin-top:6px">${errs.map(e => `<div class="errrow">
          <span class="n">${e.n}×</span>
          <span class="t">${this.esc((ERRORS[e.tag] || ERRORS.unknown).name)}<br>
            <span class="dim small">${this.esc((ERRORS[e.tag] || ERRORS.unknown).fix)}</span></span>
        </div>`).join('')}</div>` : ''}
      ${(sum.stale || []).length ? `<h3 style="margin-top:16px">Gone quiet — worth revisiting</h3>
        <p class="dim small" style="margin-top:4px">
          ${sum.stale.map(id => this.esc((SKILL[id] || {}).name || id)).join(' · ')}</p>` : ''}`;
  },

  async loadFamily() {
    try {
      const rows = await Family.readAll(Sync);
      const el = document.getElementById('fam');
      if (!el) return;
      if (!rows.length) { el.innerHTML = '<p class="dim small">Nothing published yet.</p>'; return; }
      const byChild = {};
      rows.forEach(r => (byChild[r.name] = byChild[r.name] || []).push(r));
      el.innerHTML = Object.entries(byChild).map(([name, apps]) => `
        <h3 style="margin-top:12px">${this.esc(name)}</h3>
        ${apps.map(a => `<div style="margin-top:6px">
          <p class="small"><b>${this.esc(a.app)}</b>
            <span class="dim">· ${a.updatedAt ? a.updatedAt.toLocaleDateString() : 'no date'}</span></p>
          ${a.app === 'math-lab' ? this.parentBody(a.summary, a.app) : ''}
        </div>`).join('')}`).join('');
    } catch (e) {
      const el = document.getElementById('fam');
      if (el) el.innerHTML = `<p class="dim small">Could not load: ${this.esc(e.message)}</p>`;
    }
  },

  // One account across every homeschool app. A name and four pictures, because
  // the child using this cannot type a password. THE PICTURE SET MUST MATCH
  // WONDER LAB'S CHARACTER FOR CHARACTER — the password is literally the four
  // emoji joined plus a salt, so a different set means the same child tapping
  // "the same four pictures" gets a different Firebase user, with no error
  // anywhere to show for it.
  CLOUD_EMOJI: ['🦖', '🐙', '🦋', '🐝', '🦉', '🐢', '🦈', '🐸',
                '🌋', '⭐', '🌈', '🍄', '🔬', '🧪', '🦴', '🪐'],
  _pin: [],

  signInPrompt() {
    this.resetSay();
    if (!window.Sync || !Sync.configured()) {
      return this.el(`${this.bar('Sign in')}
        <div class="card"><p class="dim">Cloud sync is not set up for this copy.
        Everything is still saved on this device.</p>
        <button class="btn ghost wide" style="margin-top:12px"
          onclick="App.go('parent')">Back</button></div>`);
    }
    if (Sync.uid) {
      return this.el(`${this.bar('Sign in')}
        <div class="card" style="text-align:center;padding:28px 18px">
          <div style="font-size:2.6rem">☁️</div>
          <h2 style="margin-top:8px">Signed in</h2>
          <p class="dim" style="margin-top:8px">Progress is backed up, and the
            same name and pictures work in Wonder Lab and the reading app.</p>
          <button class="btn ghost wide" style="margin-top:16px"
            onclick="App.signOut()">Sign out</button>
          <button class="btn ghost wide" style="margin-top:10px"
            onclick="App.go('parent')">Back</button>
        </div>`);
    }
    this._pin = [];
    this.el(`${this.bar('Sign in')}
      <div class="card">
        <h2>What is your name?</h2>
        <input id="cn" maxlength="18" placeholder="Your name" value="${
          this.esc(Progress.profile ? Progress.profile.name : '')}"
          style="width:100%;margin-top:12px;padding:14px;border-radius:12px;
                 background:var(--ink-3);border:1px solid var(--line);
                 color:var(--text);font:inherit;font-size:1.05rem">
        <h2 style="margin-top:18px">Tap four pictures</h2>
        <p class="dim small" style="margin-top:4px">
          The same four, in the same order, every time — and the same ones you
          use in the other apps.</p>
        <div id="pin" class="pin-row"></div>
        <div class="emoji-grid">
          ${this.CLOUD_EMOJI.map(e => `<button class="emoji-btn"
            onclick="App.pinTap('${e}')">${e}</button>`).join('')}
        </div>
        <div id="cloud-msg" class="dim small" style="margin-top:12px;min-height:1.3em"></div>
        <button class="btn wide big" style="margin-top:6px" onclick="App.doSignIn()">Sign in</button>
        <button class="btn ghost wide" style="margin-top:10px"
          onclick="App.go('parent')">Not now</button>
      </div>`);
    this.drawPin();
  },

  drawPin() {
    const el = document.getElementById('pin');
    if (!el) return;
    el.innerHTML = [0, 1, 2, 3].map(i =>
      `<span class="pin-slot ${this._pin[i] ? 'filled' : ''}">${this._pin[i] || ''}</span>`).join('');
  },

  pinTap(e) {
    if (this._pin.length >= 4) this._pin = [];
    this._pin.push(e);
    this.drawPin();
    Sfx.play('tap', 0.25);
  },

  async doSignIn() {
    const msg = document.getElementById('cloud-msg');
    const name = (document.getElementById('cn').value || '').trim();
    if (!name) { msg.textContent = 'Type your name first.'; return; }
    if (this._pin.length !== 4) { msg.textContent = 'Tap four pictures.'; return; }
    msg.textContent = 'Signing in…';
    try {
      await Sync.signIn(name, this._pin);
      // Pull only if the cloud copy is newer: a child who played on the tablet
      // this morning must not lose it by opening the laptop this afternoon.
      const cloud = await Sync.pull();
      if (cloud && cloud.progress && Progress.profile) {
        const mine = Progress.profile.updatedAt || 0;
        const theirs = cloud.updatedAt && cloud.updatedAt.toMillis
          ? cloud.updatedAt.toMillis() : 0;
        if (theirs > mine) {
          Progress.profile.p = cloud.progress;
          Progress.profile.name = cloud.name || Progress.profile.name;
        }
      }
      Progress.commit();
      Sync.watch(d => {
        if (d && d.progress && Progress.profile) {
          Progress.profile.p = d.progress;
          Store.save(Progress.data);
          if (this.tab === 'parent') this.parent();
        }
      });
      Sfx.play('unlock', 0.4);
      this.go('parent');
    } catch (e) {
      msg.textContent = e.message || 'Could not sign in.';
    }
  },

  async signOut() {
    await Sync.signOut();
    this.go('parent');
  },
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
