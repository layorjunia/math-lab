#!/bin/bash
# Play the clips the machine could not vouch for. Double-click me.
#
# tools/verify-* reports are a WORKLIST, not a gate: the recogniser mishears
# correct audio constantly, and "cent" is a homophone of "sent" so no amount of
# transcription will settle it. The only thing that settles it is an ear.
set -e
cd "$(dirname "$0")/.."
python3 tools/build_listen_page.py
open .work/listen.html
