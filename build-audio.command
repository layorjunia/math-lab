#!/bin/bash
# Rebuild the narration corpus. Double-click me.
#
# Order matters: gen_audio writes the manifest that everything downstream reads,
# and the two audits are cheap gates that catch the failures which are otherwise
# completely silent — a norm() divergence (one line in the browser voice) and a
# missing clip or expression part (one word of an answer in a stranger's voice).
set -e
cd "$(dirname "$0")"
PY=.venv-tts/bin/python

$PY tools/gen_sfx.py
$PY tools/gen_audio.py "$@"
$PY tools/check_norm.py
$PY tools/audit_resolve.py

echo
echo "Rendered and audited. Now listen to the prose:"
echo "  .venv-tts/bin/python tools/verify_phrases.py"
echo "And read tools/audio-suspect-report.json — anything in it is a clip that"
echo "does not transcribe back to what it should say."
read -n1 -p "done - press any key"
