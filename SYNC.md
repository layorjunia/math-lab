# Cloud sync, the parent dashboard, and hosting

## One account, every app

A child types their name and taps four pictures. That becomes a Firebase Auth
email/password login, derived in `js/firebase-config.js`, copied byte for byte
from Wonder Lab:

```js
HOMESCHOOL_AUTH.email('Lael')                  // lael@homeschool.family
HOMESCHOOL_AUTH.password(['🦖','🐙','🦋','🐝']) // 🦖🐙🦋🐝-homeschool-v1
```

**This derivation must stay byte-identical in every homeschool app.** It is the
whole mechanism by which one login is shared. Never change the salt once real
accounts exist — it locks every child out of their own data.

> `unicorn-reading-academy/js/sync.js` still uses the OLD derivation and
> therefore still mints separate accounts. Wonder Lab and Math Lab agree.

## Storage layout

```
profiles/{uid}/apps/math-lab
  { name, progress, deviceId, updatedAt: serverTimestamp }
```

One document per app under one uid, so two apps share a login without ever
overwriting each other.

## The parent dashboard needs a second path

The deployed rule on `profiles/{uid}` is `request.auth.uid == uid`, which means
**a parent signed in as themselves cannot read a child's document at all**. Nor
can the apps read each other locally: they are on three different Vercel
origins, so localStorage is not shared. A dashboard covering all three apps
therefore needs a path a parent is allowed to read.

Each app writes a small **summary** — counts and dates, never the full progress
record — to:

```
families/{familyCode}/children/{childSlug}/apps/{appId}
  { uid, name, app, summary, updatedAt }
```

### Firestore rules — paste this whole block into the console

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Progress. Private to the child it belongs to. The {document=**} wildcard
    // is required, or the per-app subdocuments are unreachable and every write
    // fails with a permission error.
    match /profiles/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // The family summary the parent dashboard reads. A child can only ever
    // write their OWN summary, because the uid inside the document has to match
    // the uid doing the writing. Any signed-in family member can read.
    match /families/{code}/children/{child}/apps/{app} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

Until that block is deployed, the dashboard shows this device's own child only —
which is exactly what it does today, with no errors.

## Sync policy

* **Local first, always.** Every save hits `localStorage` synchronously. The app
  is fully usable signed out, offline, or with Firebase down.
* **On sign-in:** pull the cloud copy; it replaces local only if newer.
* **On save:** debounced 2 s push, so a burst of taps is one write.
* **Realtime:** `onSnapshot` picks up the child's other device; `deviceId`
  filters out the echo of this device's own writes.
* **On page hide:** flush any pending debounce.

## Hosting

Static site, no build step. Vercel serves the repo root; `vercel.json` sets
cache headers only.

The voice corpus is served by **GitHub Pages**, not Vercel — `.vercelignore`
excludes `audio/` and `js/audio.js` resolves an absolute base off Pages. Pages
sends `access-control-allow-origin: *`, which is what lets the service worker
cache those cross-origin clips as normal responses rather than opaque ones.

`vercel.json` looks sparse because Vercel's schema **rejects unknown keys**,
including the `"//"` comment convention — a deploy fails outright with "should
NOT have additional property". So the reasoning lives here:

* `/icons/*` is immutable — cached for a year.
* `/version.json` must never be cached, or the update self-heal can never detect
  a new build and every installed device stays pinned to the old one.
* `/sw.js` must never be stale, or the service worker cannot ship its own
  replacement.
