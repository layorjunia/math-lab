// Math Lab — content schema and vocabularies.
//
// The skill graph itself is generated into js/skills.js. This file holds the
// things a human writes: the grade bands, the answer formats, and — the
// important one — the catalogue of NAMED MISTAKES.

const GRADES = {
  1: { name: 'First grade',  short: 'G1' },
  2: { name: 'Second grade', short: 'G2' },
  3: { name: 'Third grade',  short: 'G3' },
  4: { name: 'Fourth grade', short: 'G4' },
  5: { name: 'Fifth grade',  short: 'G5' },
  6: { name: 'Sixth grade',  short: 'G6' },
};

// How the child answers. Typed entry is the default for anything whose answer
// is a number: multiple choice on arithmetic teaches elimination rather than
// computation, and listing four options hands over the plausible wrong answers
// for free. Choice is kept for questions whose answer is not a number.
const FORMATS = {
  number:   'type a whole number',
  fraction: 'type a numerator and a denominator',
  decimal:  'type a decimal',
  money:    'type an amount in dollars and cents',
  cents:    'type a whole number of cents',
  time:     'type a time',
  choice:   'pick one of the options',
  multi:    'pick every one that fits',
  point:    'tap a spot on the diagram',
};

/* ── The named mistakes ────────────────────────────────────────────────────
 *
 * This is the app's central editorial device, the way "how do we know this?"
 * is Wonder Lab's. Getting a question wrong should never produce "Not quite,
 * try again." It should produce the NAME of what went wrong:
 *
 *     You added the ones correctly, but the 1 didn't carry over.
 *
 * Every generator returns, alongside the right answer, a list of predicates:
 * "if they typed THIS, they made THAT mistake". Because the answer is typed
 * rather than chosen, the predicates run against whatever the child actually
 * wrote — so an error nobody anticipated shows up as a no-match, which is a
 * real signal rather than an invisible one.
 *
 * `say`  is what the child reads, addressed to them, naming the step.
 * `fix`  re-teaches that ONE step. Not the whole problem — the step.
 *
 * Tags are counted in Progress.p.errors, which is what lets the app notice
 * "regrouping, eight times this week" and deal a targeted set.
 */
const ERRORS = {
  // ── carrying and borrowing ──
  'carry.forgot': {
    name: 'The carry went missing',
    say: "The ones column is right, but when it came to ten or more, the extra ten didn't move over to the tens column.",
    fix: 'When a column makes 10 or more, write the ones digit and carry the ten to the next column.',
  },
  'carry.extra': {
    name: 'Carried when you did not need to',
    say: 'A ten got carried over from a column that added up to less than ten.',
    fix: 'Only carry when a column reaches 10. Under 10, the whole answer stays in that column.',
  },
  'borrow.forgot': {
    name: 'Subtracted the wrong way round',
    say: 'In one column the smaller digit was taken away from the bigger one, whichever way round they actually were.',
    fix: 'If the top digit is smaller, borrow ten from the column to its left first. You cannot flip them.',
  },
  'borrow.neighbour': {
    name: 'Borrowed but did not pay it back',
    say: 'The ten was borrowed correctly, but the column it came from still shows its old digit.',
    fix: 'Borrowing takes one away from the next column. Cross it out and write it one smaller.',
  },
  'zero.borrow': {
    name: 'Stuck on the zero',
    say: 'Borrowing across a zero went wrong — a zero has nothing to give, so you have to go one column further.',
    fix: 'Keep going left until you find a digit above zero. Borrow from there, and every zero on the way becomes a 9.',
  },
  'op.swapped': {
    name: 'The other operation',
    strands: ['as', 'md', 'fr', 'dp', 'alg', 'mt', 'npv', 'da'],
    say: 'That is the answer to the opposite sign — adding where the question subtracts, or the other way round.',
    fix: 'Read the sign before you start. Say it out loud if it helps.',
  },
  'pick.opposite': {
    name: 'The opposite of what was asked',
    strands: ['npv', 'mt', 'da', 'geo', 'fr', 'dp', 'alg', 'as', 'md'],
    say: 'That is the right comparison read the wrong way round — the smaller one where the question asked for the bigger, or the other way about.',
    fix: 'Read the question again and find the word that says which one you want: bigger, smaller, longest, most.',
  },
  'count.off1': {
    name: 'Out by one',
    strands: ['npv', 'as', 'md', 'fr', 'mt', 'geo', 'da', 'alg', 'dp'],
    say: 'One away from the right answer — something got counted twice, or missed.',
    fix: 'Count again slowly, keeping track of where you started and where you stopped.',
  },
  // Counting ON is its own mistake and deserves its own words. The advice
  // below is only true for a sequence, which is why it is no longer attached
  // to every skill that can be out by one.
  'seq.start': {
    name: 'Started the count in the wrong place',
    strands: ['npv', 'alg'],
    say: 'The counting is right but it began one step out.',
    fix: 'When you count on, the number you start at is not a step. The first jump lands on the next one.',
  },
  'place.misaligned': {
    name: 'Columns out of line',
    say: 'The digits were added in the wrong columns — ones under tens.',
    fix: 'Line the numbers up from the RIGHT. Ones under ones, tens under tens.',
  },

  // ── times tables and division ──
  'fact.near': {
    name: 'A neighbouring fact',
    say: 'That is a real answer from this times table, just not this one — one row up or down.',
    fix: 'Count the groups again, then say the whole fact out loud.',
  },
  'mult.partial': {
    name: 'Only half multiplied',
    say: 'The ones were multiplied but the tens were left out, so the answer is far too small.',
    fix: 'Every digit on the bottom multiplies every digit on the top. Nothing gets skipped.',
  },
  'mult.noshift': {
    name: 'The second row did not shift',
    say: 'The tens row was written directly under the ones row, so it counted as ones.',
    fix: 'When you multiply by the tens digit, start one column to the left. Put a 0 in the ones place first.',
  },
  'div.remainder.drop': {
    name: 'Remainder thrown away',
    say: 'The division is right but the leftover was dropped — it does not just disappear.',
    fix: 'Whatever will not fit into another whole group is the remainder. Write it down.',
  },
  'div.remainder.big': {
    name: 'Remainder too big',
    say: 'The remainder is as big as the divisor, or bigger — which means another whole group still fits.',
    fix: 'If the remainder is bigger than what you are dividing by, the quotient needs to go up.',
  },
  'div.zero.skip': {
    name: 'A zero got skipped',
    say: 'A zero in the middle of the answer was left out, so every digit after it slid one place.',
    fix: 'If what you are dividing into is too small, write a 0 in the answer and bring down the next digit.',
  },
  'op.invert': {
    name: 'Divided the wrong way',
    strands: ['md', 'alg', 'dp', 'da', 'mt', 'fr'],
    say: 'The divisor and the dividend swapped places.',
    fix: 'The number being shared out goes inside. The number of groups goes outside.',
  },
  'frac.flipped': {
    name: 'Top and bottom swapped',
    strands: ['fr', 'dp', 'da', 'mt'],
    say: 'The two numbers are right but they are the wrong way up.',
    fix: 'The BOTTOM says how many pieces the whole is cut into. The TOP says how many you have.',
  },
  'frac.wrongden': {
    name: 'The wrong bottom number',
    strands: ['fr', 'dp'],
    say: 'The pieces were counted correctly but named as the wrong size.',
    fix: 'Count how many equal steps make ONE whole. That is the bottom number.',
  },

  // ── place value and rounding ──
  'pv.digit': {
    name: 'The wrong column',
    strands: ['npv', 'as', 'dp', 'md'],
    say: 'That digit is real, it is just in a different place than the one the question asked about.',
    fix: 'Count the columns from the right: ones, tens, hundreds, thousands.',
  },
  'round.wrongway': {
    name: 'Rounded the wrong way',
    say: 'The right place was rounded, but it went up when it should go down, or down when it should go up.',
    fix: 'Look only at the digit to the RIGHT. 5 or more goes up, 4 or less stays.',
  },
  'round.wrongplace': {
    name: 'Rounded to the wrong place',
    say: 'That is a correct rounding — of a different column than the question asked for.',
    fix: 'Underline the place you are rounding TO before you look at anything else.',
  },

  // ── fractions ──
  'frac.addbottoms': {
    name: 'The bottoms got added too',
    say: 'The denominators were added together. They name what size the pieces are, so they do not add.',
    fix: 'Same bottom number: add only the tops. Three eighths plus two eighths is five eighths, not five sixteenths.',
  },
  'frac.commondenom': {
    name: 'Different-sized pieces',
    say: 'These were added straight across, but the two fractions are cut into different-sized pieces.',
    fix: 'Make the bottoms match first, then add the tops.',
  },
  'frac.invert': {
    name: 'The second fraction did not flip',
    say: 'Dividing by a fraction means multiplying by its flip, and this one stayed the right way up.',
    fix: 'Keep the first, change the sign to times, flip the second.',
  },
  'frac.simplify': {
    name: 'Right, but not in lowest terms',
    say: 'The value is correct — it can still be written more simply.',
    fix: 'Find the biggest number that divides both top and bottom, and divide by it.',
  },
  'frac.bigger.bottom': {
    name: 'Bigger bottom, smaller piece',
    say: 'The fraction with the bigger bottom number was picked as the bigger one, but a bigger bottom means MORE pieces, so each one is smaller.',
    fix: 'One eighth of a pizza is smaller than one third. More slices, smaller slices.',
  },
  'frac.mixed.convert': {
    name: 'The whole number got lost',
    say: 'Turning the mixed number into an improper fraction went wrong — the whole numbers did not all come across.',
    fix: 'Multiply the whole by the bottom, add the top, keep the same bottom.',
  },

  // ── decimals ──
  'dec.align': {
    name: 'Decimal points out of line',
    say: 'The digits were lined up at the right-hand end instead of at the decimal point.',
    fix: 'Line up the decimal points, not the last digits. Fill the gaps with zeros.',
  },
  'dec.places': {
    name: 'The point is in the wrong place',
    say: 'The digits are right but the decimal point has moved.',
    fix: 'Count the decimal places in BOTH numbers you multiplied, and give the answer that many.',
  },
  'dec.compare.length': {
    name: 'Longer is not bigger',
    say: 'The decimal with more digits was chosen as the bigger one. Length is not size.',
    fix: 'Compare place by place from the left: tenths first, then hundredths.',
  },

  // ── measurement and time ──
  'unit.direction': {
    strands: ['mt', 'da', 'dp'],
    name: 'Converted the wrong way',
    say: 'The conversion happened, but upside down — a bigger unit should give a smaller number, not a larger one.',
    fix: 'Going to a SMALLER unit gives MORE of them, so multiply. Going bigger, divide.',
  },
  'unit.mixed': {
    strands: ['mt'],
    name: 'Two units, added straight',
    say: 'Two different units were added together without converting one first.',
    fix: 'Make both the same unit, then add.',
  },
  'time.60': {
    strands: ['mt'],
    name: 'An hour is not a hundred',
    say: 'The minutes rolled over at 100 instead of at 60.',
    fix: 'Sixty minutes make an hour. After :59 comes the next hour, not :60.',
  },
  'perim.area': {
    strands: ['mt', 'geo'],
    name: 'Perimeter and area swapped',
    say: 'That is the other measurement — the distance round the edge instead of the space inside, or the other way round.',
    fix: 'Perimeter is a walk round the outside, so add. Area is covering the inside, so multiply.',
  },

  // ── geometry, integers, order of operations ──
  'angle.otherscale': {
    strands: ['geo'],
    name: 'The protractor’s other scale',
    say: 'A protractor has two rings of numbers, and this reading came off the wrong one.',
    fix: 'Start from the zero that sits on one arm of the angle, and read round from there.',
  },
  'coord.swapped': {
    strands: ['geo', 'da'],
    name: 'x and y swapped',
    say: 'The two coordinates went in the other order.',
    fix: 'Along the corridor, then up the stairs. x first, always.',
  },
  'neg.sign': {
    name: 'The minus sign dropped off',
    say: 'The size of the answer is right but the sign is not.',
    fix: 'Subtracting a bigger number from a smaller one lands below zero.',
  },
  'neg.double': {
    name: 'Two minuses',
    say: 'Subtracting a negative was treated as subtracting.',
    fix: 'Taking away a negative adds. Two minuses next to each other make a plus.',
  },
  'ops.leftright': {
    name: 'Left to right',
    say: 'The operations were done in the order they were written rather than in the order the rules give.',
    fix: 'Brackets, then exponents, then × and ÷, then + and −.',
  },
  'exp.multiplied': {
    name: 'Multiplied instead of powered',
    say: 'The base and the exponent were multiplied together instead of the base being used that many times.',
    fix: '2⁵ means 2 × 2 × 2 × 2 × 2, not 2 × 5.',
  },


  // ── reading a clock ──
  // These were `time.60` and `count.off1`, whose sentences are about minute
  // arithmetic and counting on. Neither describes misreading a hand.
  'clock.hour': {
    name: 'The hour hand, one hour on',
    strands: ['mt'],
    say: 'The minutes are right, but the hour is one too far ahead.',
    fix: 'The short hand only points straight AT a number on the hour. The rest of the time it sits between two numbers, and the hour is the one it has already passed.',
  },
  'clock.back': {
    name: 'The hour hand, one hour back',
    strands: ['mt'],
    say: 'The minutes are right, but the hour is one too early.',
    fix: 'Find the two numbers the short hand sits between. The hour is the smaller one — the one it has passed.',
  },
  'clock.minutes': {
    name: 'The minutes came out wrong',
    strands: ['mt'],
    say: 'The hour is right. The long hand was read as the wrong number of minutes.',
    fix: 'The long hand counts in FIVES. Pointing at the 3 means fifteen minutes, not three.',
  },
  'sym.count': {
    name: 'Not every fold works',
    strands: ['geo'],
    say: 'That is close, but not every line you counted folds the shape exactly onto itself.',
    fix: 'A line of symmetry has to land every corner on another corner. Try folding along each one in your head.',
  },
  'shape.name': {
    name: 'A different shape',
    strands: ['geo'],
    say: 'That is a real shape — it is not this one.',
    fix: 'Count the sides, then the corners, and check whether any sides are the same length.',
  },
  'read.chart': {
    name: 'Read off the wrong place',
    strands: ['da'],
    say: 'That number is on the chart, just not the one the question asked for.',
    fix: 'Find the label the question names FIRST, then read straight across or straight up from it.',
  },

  'gave.given': {
    name: 'That was the number you were given',
    strands: ['geo', 'mt', 'da', 'npv', 'alg', 'md', 'as', 'fr', 'dp'],
    say: 'That number is in the question already — it is the one you were told, not the one you were asked to find.',
    fix: 'Read the question again and put your finger on the part with the question mark. That is what has to be worked out.',
  },
  'stat.other': {
    name: 'The other measure',
    strands: ['da'],
    say: 'That is a correct answer — to the other question. The median and the range are different things.',
    fix: 'The median is the middle value once they are in order. The range is the biggest take away the smallest.',
  },

  // ── the catch-all ──
  'unknown': {
    name: 'Something else',
    strands: ['npv', 'as', 'md', 'fr', 'dp', 'mt', 'geo', 'da', 'alg'],
    say: 'That is not one of the usual slips, so it is worth working through together.',
    fix: 'Try the problem again one step at a time, saying each step out loud.',
  },
};

// Deck shape. Finite on purpose: an endless scroll trains skimming, and a deck
// that runs out gives a clean stop and a reason to come back tomorrow.
const DECK = {
  size: 16,
  minSkills: 5,        // never fewer than this many DIFFERENT skills in a deck
  maxSkills: 6,        // nor more — 16 cards over 16 skills never reaches mastery
  newSkills: 1,        // at most one brand-new skill per day
  reviewSkills: 3,     // interleaved with three the child has already met
  staleDays: 14,       // a mastered skill untouched this long comes back round
};

// Mastery. Wonder Lab's rule — correct twice on two different days — is hostile
// to farming but not to luck. On a typed answer luck matters less than it does
// on four options, but a child can still stumble into two right answers. So an
// accuracy floor sits alongside the two-day rule, and BOTH have to hold.
const MASTERY = {
  minAttempts: 10,
  window: 10,          // measured over the last 10 attempts at that skill
  minRight: 8,
  minDays: 2,
};
