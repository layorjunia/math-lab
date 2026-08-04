#!/bin/bash
# Gate, stamp, publish. Double-click me.
#
# set -e so a failed gate stops the deploy. Stamping BEFORE the commit is what
# makes installed devices notice the new build; stamp after and every iPad keeps
# running the old one forever with no error anywhere.
set -e
cd "$(dirname "$0")"

PY=python3
[ -x .venv-tts/bin/python ] && PY=.venv-tts/bin/python

echo "── skill graph ──"
$PY tools/build_skills.py
echo
echo "── correctness gate ──"
$PY tools/check_generators.py --draws 4000
echo
if [ -f audio/manifest.json ]; then
  echo "── audio gates ──"
  $PY tools/check_norm.py
  $PY tools/audit_resolve.py
  echo
fi
echo "── stamp ──"
$PY tools/stamp_version.py

# gh reverts to illuminatedrones on session restart. Everything personal goes on
# Layor Junia, so switch and VERIFY rather than assume.
gh auth switch -u layorjunia >/dev/null 2>&1 || true
WHO=$(gh api user --jq .login)
if [ "$WHO" != "layorjunia" ]; then
  echo "gh is authenticated as '$WHO', not layorjunia — stopping."; exit 1
fi

git add -A
git commit -m "${1:-content + build}" || echo "(nothing to commit)"
git push origin main
gh api repos/layorjunia/math-lab/pages/builds -X POST --silent || true
vercel deploy --prod --yes --scope layor-junia
read -n1 -p "deployed - press any key"
