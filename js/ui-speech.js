// Every line the app speaks that is not a skill name, a hint or an error
// explanation.
//
// This list exists so tools/gen_audio.py can guarantee a recording for each
// one. If a spoken string is not here (or in schema.js, skills.js or a
// generator's `hint`), it has no clip and would fall back to the browser voice
// — which is exactly the bug this pipeline is built to avoid. Add the string
// here when you add a spoken line.
//
// Rules for anything in this file:
//   * no runtime interpolation — a template like `Hi ${name}` can never have a
//     clip, so greetings stay generic
//   * no bare single letters or symbols; a voice reads "a" as "uh" and "×" as
//     nothing at all. Operators live in the number vocabulary (numspeak.js),
//     which renders them as words.
//   * no emoji
//   * numbers are fine — the manifest key is the text as DISPLAYED, and
//     tools/speech_forms.py turns it into something sayable before synthesis
//
// The identifier is never referenced anywhere. Its whole purpose is to be
// scraped at build time, and the scrape works by FILE PATH: moving or renaming
// this file without updating gen_audio.py causes total, silent loss of coverage
// with no import error and no crash.

const UI_PHRASES = [
  // praise — short, specific, never gushing
  'Right.', 'That is it.', 'Exactly right.', 'Correct.', 'Nicely done.',
  'Good — straight through.', 'That one was harder.',

  // getting it wrong, before the named mistake does the real work
  'Not this time.', 'Close.', 'Have another go.',

  // instructions
  'Type your answer.', 'Tap the answer.', 'Pick one.',
  'Type the top number, then the bottom number.',
  'Type how many, then the remainder.',
  'Type the across number first, then the up number.',
  'Press Check when you are ready.',

  // the deck
  'That is today’s deck finished.',
  'Come back tomorrow for a new one.',
  'A skill counts as mastered only after two different days.',
  'Here is today’s deck.',

  // the map
  'Not started', 'Started', 'Getting there', 'Mastered', 'Needs a look', 'Locked',
  'You need these first.', 'This unlocks.', 'Practice this.',
  'Everything here is ready for you.',

  // progress
  'Skills mastered', 'Right overall', 'Questions right', 'Best day streak',
  'The last three weeks.', 'Where you are.',
  'What has been tripping you up.',

  // screen names
  'Today', 'Map', 'Progress', 'Grown-ups', 'Math Lab',
  'First grade to sixth, one step at a time.',
  'What should we call you?', 'Which grade?',
  'You can change this whenever you like.',
];
