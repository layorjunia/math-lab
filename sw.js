// Offline cache for Math Lab.
// CACHE is rewritten by tools/stamp_version.py on every deploy.
const CACHE = 'mathlab-20260804-1052-5628f14';
const SHELL = [
  '.', 'index.html', 'css/style.css', 'manifest.json',
  'js/schema.js', 'js/skills.js', 'js/numspeak.js', 'js/generators.js',
  'js/manipulatives.js', 'js/ui-speech.js', 'js/games.js',
  'js/store.js', 'js/audio.js', 'js/app.js',
  // Same-origin only when the app itself is on Pages. On Vercel the manifest
  // lives on the audio origin, so it is fetched and cached at runtime by the
  // cross-origin branch below; the player awaits its own fetch either way.
  ...(location.origin.endsWith('github.io') ? ['audio/manifest.json'] : []),
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The app is served from Vercel; the voice clips stay in the GitHub repo and
// are served by Pages. Those requests are CROSS-ORIGIN, so they have to be
// allowed through explicitly — the blanket same-origin bail below would
// otherwise skip every clip and offline playback would silently never work.
// Pages sends `access-control-allow-origin: *`, so these cache as normal
// responses rather than opaque ones.
const AUDIO_ORIGIN = 'https://layorjunia.github.io';

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const ourAudio = url.origin === AUDIO_ORIGIN && /\/audio\//.test(url.pathname);
  if (!sameOrigin && !ourAudio) return;

  // Immutable media. Cache-first, filled lazily on first use: the corpus must
  // never be precached, but a clip already heard has to come back instantly and
  // has to work on a tablet with no signal.
  if (/\/audio\//.test(url.pathname) && /\.(m4a|mp3)$/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)
      .then(res => { const c = res.clone();
                     caches.open(CACHE).then(k => k.put(e.request, c)); return res; })));
    return;
  }

  // App code is network-first so updates land. cache:'reload' matters: a plain
  // fetch here can be answered from the browser's own HTTP cache, which
  // silently keeps serving the old index.html after a deploy.
  e.respondWith(
    fetch(e.request, { cache: 'reload' })
      .then(res => { const c = res.clone();
                     caches.open(CACHE).then(k => k.put(e.request, c)); return res; })
      .catch(() => fetch(e.request).catch(() =>
        caches.match(e.request, { ignoreSearch: true })))
  );
});
