#!/bin/bash
# Deploy the Firestore rules. Double-click me.
#
# This is the one step Claude cannot do: it needs a Google login, and it changes
# the security rules of a project that Wonder Lab and the reading app also use.
# The first run opens a browser to sign in; after that it is instant.
#
# The profiles/{uid} block is IDENTICAL to what is already live. The only
# addition is families/{code}, which is what lets the parent dashboard see all
# three apps.
set -e
cd "$(dirname "$0")"

if ! command -v firebase >/dev/null 2>&1; then
  echo "Installing the Firebase CLI (one time)…"
  npm install -g firebase-tools
fi

firebase login
echo
echo "── the rules that will be deployed ──"
cat firestore.rules
echo
read -p "Deploy these to project homeschool-apps? [y/N] " ok
[ "$ok" = "y" ] || { echo "Nothing deployed."; exit 0; }

firebase deploy --only firestore:rules --project homeschool-apps
echo
echo "Done. The Parents tab can now show Wonder Lab and Unicorn alongside Math Lab."
read -n1 -p "press any key"
