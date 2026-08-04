// Progress, saved locally per profile.
//
// Wonder Lab's mechanic, with two changes that matter for math.
//
// 1. MASTERY NEEDS AN ACCURACY FLOOR, not just two right answers on two days.
//    The two-day rule is what stops mastery being farmed in one sitting and it
//    is kept exactly. But two correct answers is not evidence of a skill — a
//    child can get two right out of ten. So a skill is mastered when BOTH hold:
//    at least 10 attempts with 8 of the last 10 correct, AND correct on two
//    different days. Farm-proof and luck-proof.
//
// 2. STATE IS DERIVED, NEVER STORED. A stored `state` plus a decay rule is two
//    sources of truth, and they drift the moment a skill goes stale. state(id)
//    reads the record every time.
//
// Everything is local-first: every save hits localStorage synchronously and the
// app is fully usable signed out, offline, or with Firebase down. The cloud is
// a backup and a second device, never the source of truth mid-session.

const Store = {
  KEY: 'mathlab:v1',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* unreadable — start clean */ }
    return { profiles: {}, activeId: null };
  },

  save(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); }
    catch (e) { console.warn('save failed', e); }
  },

  newProfile(name, grade) {
    return {
      id: 'p' + Math.random().toString(36).slice(2, 10),
      name,
      p: {
        grade: grade || 1,
        skills: {},     // skillId -> { seen, right, wrong, days:[], last10:[], lastCorrect }
        errors: {},     // errorTag -> { n, last }
        deck: {},       // grade -> { day, served:[], idx }
        dayLog: [],     // [{ d, asked, right }] — the dashboard sparkline
        dayStreak: 0, lastDay: null, bestStreak: 0,
        notes: {},
        badges: [],
        readAloud: false,   // "read the problem to me" — off by default
      },
      updatedAt: Date.now(),
    };
  },

  dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
         + '-' + String(d.getDate()).padStart(2, '0');
  },

  daysSince(key) {
    if (!key) return Infinity;
    const [y, m, d] = String(key).split('-').map(Number);
    if (!y) return Infinity;
    const then = new Date(y, (m || 1) - 1, d || 1);
    return Math.floor((Date.now() - then.getTime()) / 86400000);
  },
};

const Progress = {
  data: null, profile: null,

  init() {
    this.data = Store.load();
    const a = this.data.activeId && this.data.profiles[this.data.activeId];
    if (a) this.profile = a;
    return !!a;
  },

  use(id) {
    this.profile = this.data.profiles[id];
    this.data.activeId = id;
    this.touchDay();
    this.commit();
  },

  create(name, grade) {
    const p = Store.newProfile(name, grade);
    this.data.profiles[p.id] = p;
    this.data.activeId = p.id;
    this.profile = p;
    this.touchDay();
    this.commit();
    return p;
  },

  commit() {
    if (this.profile) this.profile.updatedAt = Date.now();
    Store.save(this.data);
    if (window.Sync && Sync.uid && this.profile) Sync.schedulePush(this.profile);
  },

  get p() { return this.profile.p; },

  // ── daily streak ──
  touchDay() {
    const p = this.p, today = Store.dayKey();
    if (p.lastDay === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    p.dayStreak = (p.lastDay === Store.dayKey(y)) ? (p.dayStreak || 0) + 1 : 1;
    p.bestStreak = Math.max(p.bestStreak || 0, p.dayStreak);
    p.lastDay = today;
    p.dayLog = (p.dayLog || []).slice(-59);
    p.dayLog.push({ d: today, asked: 0, right: 0 });
  },

  // ── per-skill record ──
  rec(id) {
    const p = this.p;
    if (!p.skills[id]) {
      p.skills[id] = { seen: 0, right: 0, wrong: 0, days: [], last10: [], lastCorrect: null };
    }
    const r = p.skills[id];
    if (!r.last10) r.last10 = [];      // records written before last10 existed
    if (!r.days) r.days = [];
    return r;
  },

  markSeen(id) {
    const r = this.rec(id);
    r.seen++;
    this.commit();
  },

  // The only place an attempt is recorded. `tag` is the named mistake, or null
  // when the answer was right or nothing matched.
  record(id, correct, tag) {
    const r = this.rec(id), today = Store.dayKey();
    if (correct) {
      r.right++;
      r.lastCorrect = today;
      if (!r.days.includes(today)) r.days.push(today);
    } else {
      r.wrong++;
      if (tag) {
        const e = this.p.errors[tag] || (this.p.errors[tag] = { n: 0, last: null });
        e.n++; e.last = today;
      }
    }
    r.last10.push(correct ? 1 : 0);
    if (r.last10.length > MASTERY.window) r.last10 = r.last10.slice(-MASTERY.window);

    const log = (this.p.dayLog || []).find(d => d.d === today);
    if (log) { log.asked++; if (correct) log.right++; }
    this.commit();
  },

  // Derived, every time. Never stored.
  //   unseen    never came up
  //   seen      came up, not answered right enough yet
  //   known     answering it correctly, not yet proven over time
  //   mastered  accuracy floor AND two different days
  //   stale     was mastered, untouched long enough to need a look
  state(id) {
    const r = this.p.skills[id];
    if (!r) return 'unseen';
    const n = (r.right || 0) + (r.wrong || 0);
    if (!n) return r.seen ? 'seen' : 'unseen';

    const last = r.last10 || [];
    const hits = last.reduce((s, v) => s + v, 0);
    const mastered = n >= MASTERY.minAttempts
                  && last.length >= MASTERY.window
                  && hits >= MASTERY.minRight
                  && (r.days || []).length >= MASTERY.minDays;

    if (mastered) {
      return Store.daysSince(r.lastCorrect) >= DECK.staleDays ? 'stale' : 'mastered';
    }
    if (r.right > 0) return 'known';
    return 'seen';
  },

  accuracy(id) {
    const r = this.p.skills[id];
    if (!r) return null;
    const n = (r.right || 0) + (r.wrong || 0);
    return n ? r.right / n : null;
  },

  // Anything two or more grades below where the child says they are is ASSUMED
  // KNOWN until the app has evidence otherwise.
  //
  // Without this a nine-year-old who picks grade 3 is handed "what comes after
  // 11", sixteen times, because every grade-3 skill is locked behind an
  // untouched grade-1 chain. Insisting they prove counting to 20 first is not
  // rigour, it is an insult, and they close the app. The evidence arrives the
  // moment they get something wrong: a missed prerequisite is pulled straight
  // back into the deck by weakPrereqs() below.
  assumed(id) {
    const s = SKILL[id];
    // One full grade below. A child who says they are in grade 3 starts on
    // grade-3 work; grade-2 material returns the moment something depends on it
    // and they get it wrong (weakPrereqs), not as a toll gate on day one.
    return !!s && s.g <= (this.p.grade || 1) - 1;
  },

  ok(id) {
    return ['known', 'mastered', 'stale'].includes(this.state(id)) || this.assumed(id);
  },

  // A skill is available when every one of its prerequisites is at least known
  // (or assumed). Nothing is hidden — a locked skill stays visible on the map
  // with its missing prerequisite named, because "what do I need first" is the
  // question the map exists to answer.
  unlocked(id) {
    const s = SKILL[id];
    if (!s) return false;
    return s.pre.every(p => this.ok(p));
  },

  blockers(id) {
    const s = SKILL[id];
    if (!s) return [];
    return s.pre.filter(p => !this.ok(p));
  },

  // Prerequisites of a skill the child is getting wrong. This is what turns a
  // wrong answer into a route back down the ladder rather than just a tally.
  weakPrereqs(id, out) {
    out = out || [];
    (SKILL[id] ? SKILL[id].pre : []).forEach(p => {
      const acc = this.accuracy(p);
      const st = this.state(p);
      if (st === 'unseen' || st === 'stale' || (acc !== null && acc < 0.6)) {
        if (!out.includes(p)) { out.push(p); this.weakPrereqs(p, out); }
      }
    });
    return out;
  },

  counts(grade) {
    const out = { unseen: 0, seen: 0, known: 0, mastered: 0, stale: 0 };
    SKILLS.filter(s => !grade || s.g === grade).forEach(s => { out[this.state(s.id)]++; });
    return out;
  },

  // ── the daily deck ──
  //
  // Finite, and interleaved. Blocked practice — twenty of the same skill in a
  // row — produces better accuracy inside the session and worse retention a
  // week later, so the deck mixes one new skill with three the child has
  // already met, plus anything that has gone stale.
  buildDeck() {
    const p = this.p, grade = p.grade, today = Store.dayKey();
    p.deck = p.deck || {};
    const held = p.deck[grade];
    if (held && held.day === today && held.served.length) return held;

    // At or one grade below. Anything older only enters through weakPrereqs()
    // below — i.e. because the child is actually getting something wrong that
    // depends on it, not as filler.
    const atLevel = SKILLS.filter(s => s.g === grade || s.g === grade - 1);
    const pool = (atLevel.length >= DECK.minSkills ? atLevel
                                                   : SKILLS.filter(s => s.g <= grade))
                 .filter(s => GEN[s.id]);
    const st = id => this.state(id);
    const add = (list, ids) => ids.forEach(id => { if (!list.includes(id)) list.push(id); });

    // Priority order. Each group contributes distinct skills until the deck has
    // enough DIFFERENT ones — the failure this replaces dealt one skill sixteen
    // times, which is drilling, not practice.
    const chosen = [];

    // 1. anything mastered that has gone quiet
    add(chosen, pool.filter(s => st(s.id) === 'stale').map(s => s.id).slice(0, 2));

    // 2. prerequisites of whatever is currently going badly — the route back
    //    down the ladder when a wrong answer says the foundation is soft
    const struggling = pool
      .filter(s => { const a = this.accuracy(s.id); return a !== null && a < 0.6; })
      .map(s => s.id);
    struggling.slice(0, 2).forEach(id =>
      add(chosen, this.weakPrereqs(id).filter(p => GEN[p]).slice(0, 2)));
    add(chosen, struggling.slice(0, 2));

    // 3. skills already met, at or near the child's own grade first
    const review = pool.filter(s => ['seen', 'known'].includes(st(s.id)))
      .sort((a, b) => Math.abs(b.g - grade) - Math.abs(a.g - grade))
      .map(s => s.id);
    add(chosen, this.shuffle(review).slice(0, DECK.reviewSkills));

    // 4. something new — the shallowest unlocked skill AT the child's grade
    const fresh = pool
      .filter(s => st(s.id) === 'unseen' && this.unlocked(s.id))
      .sort((a, b) => (grade - a.g) - (grade - b.g) || a.depth - b.depth)
      .map(s => s.id);
    add(chosen, fresh.slice(0, DECK.newSkills));

    // Day one has no history at all, so top up from the front of the fresh list
    // until the deck has enough variety to be worth doing.
    add(chosen, fresh.slice(0, DECK.minSkills));

    // Day one at grade 1 has only the handful of root skills unlocked, which is
    // the ladder behaving correctly but makes for a thin deck. Look one step
    // ahead: a skill whose only unmet prerequisites are already in this deck is
    // fair game today, because they will have been practiced by the time it
    // comes up.
    if (chosen.length < DECK.minSkills) {
      const reachable = pool.filter(s => GEN[s.id] && st(s.id) === 'unseen'
        && !chosen.includes(s.id)
        && s.pre.every(pre => this.ok(pre) || chosen.includes(pre)));
      add(chosen, reachable.sort((a, b) => a.depth - b.depth).map(s => s.id)
        .slice(0, DECK.minSkills - chosen.length));
    }
    // Absolute last resort, and only if the level-appropriate pool is somehow
    // empty: anything at all with a generator.
    if (!chosen.length) {
      add(chosen, SKILLS.filter(s => s.g <= grade && GEN[s.id])
        .sort((a, b) => (grade - a.g) - (grade - b.g) || a.depth - b.depth)
        .slice(0, DECK.minSkills).map(s => s.id));
    }

    // Cap the variety. Sixteen cards spread over sixteen skills is one attempt
    // each, and mastery needs ten — so a deck like that can never move anything
    // forward however long the child works. Five or six skills at three cards
    // apiece is a session that actually converges.
    const deck = chosen.slice(0, DECK.maxSkills);

    // Round-robin rather than blocks: two cards of the same skill never sit
    // next to each other. Blocked practice gives better accuracy inside the
    // session and worse retention a week later.
    const served = [];
    for (let i = 0; served.length < DECK.size; i++) {
      served.push(deck[i % deck.length]);
      if (i > DECK.size * 4) break;
    }
    p.deck[grade] = { day: today, served, idx: 0, seed: (Date.now() % 100000) | 0 };
    this.commit();
    return p.deck[grade];
  },

  shuffle(xs) {
    const a = xs.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  deck() { return this.buildDeck(); },

  // Top mistakes over the last fortnight — what drives the targeted set.
  topErrors(n) {
    return Object.entries(this.p.errors || {})
      .map(([tag, v]) => ({ tag, n: v.n || 0, last: v.last }))
      .filter(e => e.n > 0 && Store.daysSince(e.last) <= 21)
      .sort((a, b) => b.n - a.n)
      .slice(0, n || 5);
  },

  setGrade(g) { this.p.grade = g; this.commit(); },
};

window.Progress = Progress;
window.Store = Store;
