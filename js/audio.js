// AudioLib — plays pre-generated voice clips (audio/manifest.json).
//
// Copied from wonder-lab/js/audio.js. Nothing here uses the browser's speech
// synthesiser for real content: every sentence, number and operator word is a
// file rendered at build time by tools/gen_audio.py with a neural voice.
// resolve() returning 'tts' for shipped content is a build defect, not a
// fallback — it is a different voice on every device and silent on iOS until a
// user gesture. tools/audit_resolve.py fails the build on one.
//
// The math delta on top of the reference: an expression like "347 + 288" is one
// of millions of strings, so it cannot have its own clip. Expressions are
// composed from the number vocabulary by js/numspeak.js and played by
// speakParts(), which uses a much tighter gap than speakSeq — a number read
// with 220 ms holes between its parts sounds like a list being read.

// Where the clips are served from.
//
// The app runs on Vercel; the voice corpus stays in the GitHub repo and is
// served by GitHub Pages, which already fronts a CDN and sends
// `access-control-allow-origin: *` — that header is what lets the service
// worker cache these cross-origin clips as normal responses instead of opaque
// ones. Nothing is preloaded: a clip is fetched the first time a child presses
// Listen, so the corpus size is a hosting number, not a download.
//
// Same-origin locally and on Pages itself, absolute everywhere else, so a dev
// server plays the clips sitting next to it.
const AUDIO_BASE = (function () {
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('github.io')
      || location.protocol === 'file:') return 'audio/';
  return 'https://layorjunia.github.io/math-lab/audio/';
})();

const AudioLib = {
  manifest: null,      // { words: {normalised text -> file}, engine, voice }
  ready: false,
  _current: null,
  _queueToken: 0,
  _unlocked: false,

  init() {
    // Keep the promise, do not fire and forget: a very first tap on a cold load
    // would otherwise resolve against a null manifest and speak in the browser
    // voice. _playLater awaits this.
    //
    // Version the manifest by build id. Without it the browser (and the service
    // worker, and Pages' own cache) happily serve the previous manifest after a
    // re-render: the new clips sit on the server, fileFor misses every one of
    // them, and the app quietly speaks in the browser voice while sounding
    // perfect on a fresh load.
    const meta = document.querySelector('meta[name="build"]');
    const build = (meta && meta.getAttribute('content')) || '';
    this.loading = fetch(AUDIO_BASE + 'manifest.json' + (build ? '?v=' + encodeURIComponent(build) : ''))
      .then(r => r.ok ? r.json() : null)
      .then(m => { this.manifest = m; this.ready = !!m; })
      .catch(() => { this.manifest = null; });
    // iOS will not play audio before a user gesture. Both event types are
    // needed: an iPad tap fires touchend, a trackpad test fires click.
    const unlock = () => {
      if (this._unlocked) return;
      this._unlocked = true;
      const a = new Audio();
      a.muted = true;
      a.play().catch(() => {});
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchend', unlock);
    document.addEventListener('click', unlock);
  },

  // Must match norm() in tools/gen_audio.py character for character. A
  // divergence is not an error — it is a lookup miss, and one line speaks in
  // the browser voice with nothing logged. tools/check_norm.py proves it.
  norm(text) {
    return String(text).toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  fileFor(text) {
    if (!this.manifest) return null;
    const k = this.norm(text);
    return this.manifest.words[k] || this.manifest.words[k.replace(/'/g, '')] || null;
  },

  // Resolve text to playable items and report HOW it was resolved.
  //   'clip'     one pre-generated recording — the good case
  //   'stitched' several word clips concatenated — acceptable only for a bare
  //              word list, never for prose
  //   'tts'      browser fallback — a build defect for shipped content
  resolve(text) {
    const f = this.fileFor(text);
    if (f) return { kind: 'clip', items: [{ file: f }] };

    const words = this.norm(text).split(/[^a-z']+/).filter(Boolean);
    const found = words.map(w => this.manifest &&
      (this.manifest.words[w] || this.manifest.words[w.replace(/'/g, '')]));
    if (words.length >= 1 && found.every(Boolean)) {
      const items = [];
      found.forEach((file, i) => {
        if (i) items.push({ gap: 90 });
        items.push({ file });
      });
      return { kind: 'stitched', items };
    }
    return { kind: 'tts', items: [{ tts: text }] };
  },

  _itemsFor(text, opts) {
    const r = this.resolve(text);
    if (r.kind === 'tts' && opts && opts.rate) r.items[0].rate = opts.rate;
    return r.items;
  },

  stop() {
    this._queueToken++;
    if (this._current) { this._current.pause(); this._current = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  },

  _playFile(file) {
    return new Promise(resolve => {
      const a = new Audio(AUDIO_BASE + file);
      this._current = a;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
  },

  // Resolves when whatever is currently speaking has finished. Screen changes
  // wait on this instead of a fixed timer — otherwise the next screen's audio
  // cancels the praise line halfway through, heard as it being "cut off".
  _done: Promise.resolve(),
  done() { return this._done; },

  // Takes a thunk rather than a list: items have to be resolved AFTER the
  // manifest lands, or a cold-start tap resolves every string to 'tts'.
  _playLater(makeItems) {
    this.stop();
    const token = this._queueToken;
    this._done = (async () => {
      await (this.loading || Promise.resolve()).catch(() => {});
      if (token !== this._queueToken) return;
      for (const it of makeItems()) {
        if (token !== this._queueToken) return;
        if (it.gap) { await new Promise(r => setTimeout(r, it.gap)); continue; }
        if (it.file) { await this._playFile(it.file); continue; }
        if (it.tts != null) { await this._tts(it.tts, it.rate); }
      }
    })();
    return this._done;
  },

  _tts(text, rate) {
    return new Promise(resolve => {
      if (!window.speechSynthesis) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith('en'));
      const v = vs.find(x => /Samantha/i.test(x.name)) || vs[0];
      if (v) u.voice = v;
      u.rate = rate || 0.92; u.pitch = 1.05;
      u.onend = resolve; u.onerror = resolve;
      speechSynthesis.speak(u);
      setTimeout(resolve, 8000);
    });
  },

  speak(text, opts) { return this._playLater(() => this._itemsFor(text, opts)); },

  // Separate sentences, read as separate sentences.
  speakSeq(texts) {
    return this._playLater(() => {
      const items = [];
      texts.forEach((t, i) => {
        if (i) items.push({ gap: 220 });
        items.push(...this._itemsFor(t));
      });
      return items;
    });
  },

  // Parts of ONE utterance — the pieces of a number or an expression coming
  // back from numspeak.js. 70 ms rather than speakSeq's 220: "three hundred and
  // forty-seven | plus | two hundred and eighty-eight" has to sound like one
  // read number, not three separate answers.
  speakParts(parts, gap) {
    return this._playLater(() => {
      const items = [];
      parts.forEach((t, i) => {
        if (i) items.push({ gap: gap == null ? 70 : gap });
        items.push(...this._itemsFor(t));
      });
      return items;
    });
  },

  // Does this string have a recording? A Listen button asks before it offers
  // itself, so a missing clip is a button that is not there rather than a
  // button that speaks in a stranger's voice.
  has(text) { return !!this.fileFor(text); },
  hasAll(parts) { return parts.every(p => !!this.fileFor(p)); },
};

// Sound effects are deliberately separate from speech: _playLater calls stop()
// on its first line, so routing a ding through it would silence the praise the
// same handler just started. A fresh Audio per call also lets rapid taps stack.
const Sfx = {
  enabled: true,
  play(name, volume) {
    if (!this.enabled) return;
    try {
      const a = new Audio(AUDIO_BASE + 'sfx/' + name + '.m4a');
      a.volume = volume == null ? 0.7 : volume;
      a.play().catch(() => {});
    } catch (e) { /* audio not available yet */ }
  }
};

AudioLib.init();
