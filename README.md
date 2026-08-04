# Math Lab

Math from first grade to sixth, for the homeschool suite. A skill map, a finite
daily deck, four games, and — the point of the whole thing — an app that **names
the mistake** instead of marking the answer wrong.

Live: <https://math-lab-nu.vercel.app>

## What makes it different from a worksheet

* **The answer is typed, not chosen.** Multiple choice on arithmetic teaches
  elimination rather than computation, and four options hand over the plausible
  wrong answers for free. Choice is kept only for questions whose answer is not
  a number.
* **Every wrong answer is diagnosed.** Each generator carries a list of *named
  mistakes* — "this is what you get if you add the ones and forget to carry" —
  and they run as predicates against whatever the child actually typed. The app
  says what went wrong and re-teaches that one step, not the whole problem.
  Tags are tallied, so it can notice "regrouping, eight times this week".
* **Mastery is farm-proof AND luck-proof.** Two correct answers on two different
  days (so it cannot be manufactured in one sitting) *and* eight of the last ten
  correct (so it cannot be stumbled into).
* **Skills go stale.** A skill mastered and then untouched for a fortnight drops
  back into the deck by itself.

## Layout

```
index.html          script tags, cache-busted with ?v=<build>
sw.js               service worker, three cache strategies
version.json        the update self-heal reads this
css/style.css       one file, mobile-first, breakpoints at 720/860/1500
js/
  schema.js         grades, answer formats, THE NAMED MISTAKES
  skills.js         GENERATED — the skill graph (tools/build_skills.py)
  generators.js     88 seeded arithmetic generators
  manipulatives.js  42 diagram-backed generators, all generated SVG
  numspeak.js       number -> manifest keys (the math delta on narration)
  games.js          four games and six quests
  ui-speech.js      the spoken-UI registry — every line, so each gets a clip
  store.js          progress, mastery, the daily deck
  family.js         the summary the parent dashboard reads
  sync.js           cloud sync    firebase-config.js  shared credentials
  audio.js          the clip player
  app.js            every screen
tools/              build + audio pipeline (never shipped)
audio/              pre-rendered clips (served by GitHub Pages — see SYNC.md)
```

## The gates

Nothing ships without these. `deploy.command` runs them with `set -e`.

```bash
python3 tools/build_skills.py        # refuses to write a broken skill graph
python3 tools/check_generators.py    # recomputes every answer independently
.venv-tts/bin/python tools/check_norm.py       # the two norm() twins agree
.venv-tts/bin/python tools/audit_resolve.py    # every spoken string has a clip
```

`check_generators.py` is the important one. It runs every generator thousands of
times and **recomputes the answer from the displayed expression in exact
`Fraction` arithmetic, ignoring what the generator claimed**. It also proves no
answer is a float, that no distractor equals the right answer, that every
problem sits inside its skill's declared range, and that the same seed gives the
same problem. It has already caught five real bugs.

```bash
python3 tools/check_generators.py --draws 10000
# 130 generators × 10000 draws = 1,300,000 problems
```

## Audio

Every line is a pre-rendered neural clip (Piper, `en_US-lessac-high`). The
browser synthesiser is never used — `resolve()` returning `tts` is a build
defect, not a fallback.

The corpus is in two halves. **Prose** is one clip per string. **Numbers** are a
composed vocabulary: every integer 0–1,000 is a whole clip, and larger numbers
and expressions are assembled from them by `numspeak.js`, because "347 + 288" is
one of millions of strings and can never have a recording of its own.

Short words are where this voice drifts, and a math app is made of short words.
Measured before the pipeline was written: rendered in isolation, *three* came
back as "FREE!" and *six* as "Sex."; across the six documented rates, *three*
was wrong on three draws in six. So every short clip is rendered, listened to
with faster-whisper, and re-rolled until it transcribes back correctly.

```bash
./build-audio.command            # render, then audit
./deploy.command "what changed"  # gate, stamp, push, deploy
```

Playback is **opt-in per block** — a Listen button, never automatic. There is one
exception, off by default and remembered per profile: "read each problem out
loud", for a child who reads less easily than they do math.

## Rules that bite

* Stamp **before** the commit, or every installed device keeps running the old
  build with no error anywhere.
* `gh` reverts to `illuminatedrones` on session restart. `deploy.command`
  switches and **verifies** rather than assuming.
* Never hand-edit `js/skills.js` — edit `.work/skills.json` and rerun the
  builder.
* Never change `HOMESCHOOL_AUTH`'s salt once real accounts exist.
