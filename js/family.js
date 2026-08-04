// The family summary — what the parent dashboard reads.
//
// WHY THIS FILE EXISTS. Progress lives at profiles/{uid}/apps/{app}, and the
// deployed Firestore rule on that path is:
//
//     allow read, write: if request.auth != null && request.auth.uid == uid;
//
// which means a parent signed in as themselves cannot read a child's document
// at all. There is also no way round it locally: the three apps are on three
// different Vercel origins, so one of them cannot read another's localStorage.
// A dashboard covering all three therefore needs a second, deliberately
// separate path that a parent is allowed to read.
//
// So each app additionally writes a SUMMARY here — counts and dates, never the
// full progress record — and the parent reads the summaries.
//
//     families/{FAMILY_CODE}/children/{childSlug}/apps/{appId}
//       { uid, name, app, summary, updatedAt }
//
// Rules this needs (SYNC.md has the full block to paste into the console):
//
//     match /families/{code}/children/{child}/apps/{app} {
//       allow read:  if request.auth != null;
//       allow write: if request.auth != null
//                    && request.resource.data.uid == request.auth.uid;
//     }
//
// A child can only ever write their own summary, because the uid in the
// document has to match the uid doing the writing. Any signed-in member of the
// family can read. Nothing sensitive is here — it is how many skills are
// mastered and when someone last practised.
//
// Copy this file verbatim into wonder-lab and unicorn-reading-academy when
// their summaries get added; only summarise() differs per app.

const FAMILY_CODE = 'homeschool';
const APP_ID = 'math-lab';

const Family = {
  slug(name) {
    return String(name || '').trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'child';
  },

  col(db) {
    return db.collection('families').doc(FAMILY_CODE).collection('children');
  },

  doc(db, childSlug, appId) {
    return this.col(db).doc(childSlug).collection('apps').doc(appId || APP_ID);
  },

  // Small enough to write on every save without thinking about it. Everything
  // here is DERIVED — the dashboard never needs the problem-level record, and
  // keeping it out means a summary leak is not a progress leak.
  summarise(profile) {
    const p = profile.p || {};
    const skills = p.skills || {};
    const state = id => (skills[id] || {}).state || 'unseen';

    const byGrade = {}, byStrand = {};
    (typeof SKILLS !== 'undefined' ? SKILLS : []).forEach(s => {
      const g = byGrade[s.g] || (byGrade[s.g] = { total: 0, mastered: 0, known: 0, seen: 0 });
      const t = byStrand[s.s] || (byStrand[s.s] = { total: 0, mastered: 0, known: 0, seen: 0 });
      g.total++; t.total++;
      const st = state(s.id);
      if (st === 'mastered') { g.mastered++; t.mastered++; }
      else if (st === 'known') { g.known++; t.known++; }
      else if (st === 'seen') { g.seen++; t.seen++; }
    });

    // The five mistakes showing up most this fortnight. This is the single most
    // useful thing on the dashboard: not "63% correct" but "regrouping, eight
    // times this week".
    const errs = Object.entries(p.errors || {})
      .map(([tag, v]) => ({ tag, n: (v && v.n) || v || 0, last: (v && v.last) || null }))
      .filter(e => e.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);

    // Skills that were mastered and have gone quiet — the retention decay.
    const stale = Object.entries(skills)
      .filter(([, r]) => r.state === 'mastered' && r.lastCorrect &&
                         Store.daysSince(r.lastCorrect) >= 14)
      .map(([id]) => id).slice(0, 12);

    let right = 0, wrong = 0;
    Object.values(skills).forEach(r => { right += r.right || 0; wrong += r.wrong || 0; });

    return {
      grade: p.grade || null,
      byGrade, byStrand, errors: errs, stale,
      right, wrong,
      asked: right + wrong,
      dayStreak: p.dayStreak || 0,
      bestStreak: p.bestStreak || 0,
      lastDay: p.lastDay || null,
      days: (p.dayLog || []).slice(-30),   // [{d, asked, right}] for the sparkline
      badges: (p.badges || []).length,
    };
  },

  async publish(sync, profile) {
    if (!sync.uid || sync.status !== 'ready') return;
    await this.doc(sync.db, this.slug(profile.name)).set({
      uid: sync.uid,
      name: profile.name,
      app: APP_ID,
      summary: this.summarise(profile),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // Everything the dashboard needs: every child, every app that has published.
  // One collection-group read would be tidier but needs an index; this is two
  // shallow reads and there are three children at most.
  async readAll(sync) {
    await sync.ensureLoaded();
    const out = [];
    const kids = await this.col(sync.db).get();
    for (const kid of kids.docs) {
      const apps = await kid.ref.collection('apps').get();
      apps.forEach(a => {
        const d = a.data();
        out.push({
          child: kid.id,
          name: d.name || kid.id,
          app: a.id,
          summary: d.summary || {},
          updatedAt: d.updatedAt && d.updatedAt.toDate ? d.updatedAt.toDate() : null,
        });
      });
    }
    return out;
  },
};

window.Family = Family;
