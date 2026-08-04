// The teaching.
//
// This app was a diagnosis engine before this file existed: a child met a skill
// by being tested on it, and the only explanation came AFTER a wrong answer.
// That is a quiz with good error messages, not a lesson.
//
// Every skill now has:
//   idea    what this is, in one or two plain sentences. Read first.
//   steps   the method, as short imperative steps.
//   ex      a WORKED EXAMPLE — a specific problem with every step shown and
//           the answer at the end. Authored, fixed text, so it can be narrated
//           (a runtime-interpolated worked example could never have a clip).
//   watch   the trap. Usually the same thing the named mistakes catch.
//
// The lesson is shown before the first problem of a skill the child has never
// met, is reachable any time from the map, and is one tap away from any wrong
// answer via "Show me how".
//
// Keep every string a literal. No interpolation — see RULE 5 in
// NEURAL-NARRATION.md.

const LESSONS = {

/* ══ NUMBER & PLACE VALUE ═══════════════════════════════════════════════ */

'npv.count20': {
  anchor: "Counting things out loud is matching one number word to one object. Point at each one as you say it and you cannot lose your place.",
  idea: "Each number is exactly one more than the one before. Counting on means starting at a number and taking steps forward from there.",
  steps: [
    { do: "Find the number you are starting from.", why: "You do not recount from one every time — that is the point of counting on." },
    { do: "Take one step forward for 'after', or one step back for 'before'." },
  ],
  ex: {
    q: "What comes just after 13?",
    steps: [
      { do: "Start at 13.", why: "The number you start on is where you are, not a step you have taken." },
      { do: "Take one step forward: 14.", why: "One more than thirteen." },
    ],
    a: "14",
  },
  turn: { q: "What comes just before 17?", ask: "Which way do you step for 'before'?", a: "16", why: "One step back from 17. Before means smaller." },
  watch: "The number you start on does not count as a step. From 13, one step lands on 14, not 15.",
},
'npv.teens': {
  anchor: "Thirteen is one bundle of ten with three loose ones beside it. Every teen number is a ten and some ones.",
  idea: "Teen numbers are the first place a number is built from a ten plus something. Sixteen is ten and six.",
  steps: [
    { do: "Take the ten out of the number.", why: "Every teen has exactly one ten in it." },
    { do: "What is left over is the ones." },
  ],
  ex: {
    q: "How many ones are in 16?",
    steps: [
      { do: "16 is one ten and some ones.", why: "All the teens are." },
      { do: "Take the ten away: 16 take 10 leaves 6.", why: "So sixteen is ten and six." },
    ],
    a: "6",
  },
  turn: { q: "How many ones are in 19?", ask: "Take the ten out first.", a: "9", why: "19 is one ten and nine ones." },
  watch: "The word says the ones first but the digits say the ten first. 'Sixteen' starts with six; 16 starts with the 1.",
},
'npv.count120': {
  anchor: "Counting past a hundred needs nothing new. The same ten digits go round again, with a hundreds column keeping score.",
  idea: "Counting on works the same at any size. Adding ten changes only the tens digit; adding one hundred changes only the hundreds.",
  steps: [
    { do: "Start at the number given." },
    { do: "Count on by the step size, one jump at a time.", why: "Adding a whole ten is one jump, not ten little ones." },
  ],
  ex: {
    q: "Count on 10 from 87.",
    steps: [
      { do: "Adding ten changes only the tens digit.", why: "The ones do not move — you are adding a whole bundle." },
      { do: "8 tens becomes 9 tens, and the 7 stays." },
    ],
    a: "97",
  },
  turn: { q: "Count on 10 from 95.", ask: "What happens when the tens roll over?", a: "105", why: "9 tens plus 1 ten is 10 tens, which is one hundred. So 95 becomes 105, not 15." },
  watch: "Crossing a hundred is where counting slips. After 99 comes 100, and after 109 comes 110.",
},
'npv.pv2': {
  fig: { kind: 'places', n: 47, hi: 1 },
  anchor: "Ten ones make a ten. When you get ten of something you bundle it up, and the bundle moves one place to the left.",
  idea: "Where a digit sits is what decides its value. In 47 the 4 is not worth four — it is worth forty, because it sits in the tens place.",
  steps: [
    { do: "Name the places from the RIGHT: ones first, then tens.", why: "Always from the right. The ones place is the anchor; counting from the left gives a different answer for every length of number." },
    { do: "Find the digit sitting in the place you were asked about." },
    { do: "Its value is that digit times what the place is worth.", why: "The place tells you the size of the bundle. Four bundles of ten is forty." },
  ],
  ex: {
    q: "In 47, how many tens are there, and what are they worth?",
    steps: [
      { do: "From the right: 7 is in the ones place, 4 is in the tens place.", why: "Two digits, so two places." },
      { do: "The digit in the tens place is 4.", why: "The question asked which digit, not what it is worth." },
      { do: "Four tens is 40.", why: "Each ten is a bundle of ten ones, so four of them is forty ones." },
    ],
    a: "4 tens, worth 40",
  },
  turn: { q: "In 83, the 8 is in the ▢ place and is worth ▢.", ask: "Name the places from the right first.", a: "tens place, worth 80", why: "8 sits second from the right, so it counts bundles of ten. Eight tens is eighty." },
  watch: "A digit and what it is worth are two different things. The digit is 4; its value is 40.",
},
'npv.compare2': {
  fig: { kind: 'places', n: 38, hi: 1 },
  anchor: "Two piles of coins. You do not count every coin — you look at whose pile has more tens first.",
  idea: "Compare the biggest place first. Tens beat ones, so a number with more tens is bigger no matter what the ones are.",
  steps: [
    { do: "Compare the tens digits.", why: "One extra ten outweighs any number of ones." },
    { do: "If the tens match, compare the ones." },
    { do: "The wide end of the sign faces the bigger number." },
  ],
  ex: {
    q: "Which sign goes between 38 and 51?",
    steps: [
      { do: "Tens first: 3 tens against 5 tens.", why: "Do not look at the ones yet." },
      { do: "3 tens is less than 5 tens, so 38 is smaller.", why: "Even 39 would lose to 51 — nine ones is not a whole ten." },
      { do: "The point of the sign faces the smaller number." },
    ],
    a: "38 < 51",
  },
  turn: { q: "Which sign goes between 64 and 61?", ask: "The tens match. What decides it?", a: "64 > 61", why: "Both have 6 tens, so the ones decide: 4 beats 1." },
  watch: "A bigger ones digit does not make a bigger number. 39 is smaller than 51, even though 9 beats 1.",
},
'npv.skip': {
  anchor: "Counting the legs on a room full of chairs, you go four, eight, twelve — not one at a time. Equal jumps.",
  idea: "Skip counting is counting in equal steps, and it is where the times tables come from. Counting in fives IS the five times table.",
  steps: [
    { do: "Work out the size of the jump by subtracting one term from the next.", why: "Check it against a second pair so you know the rule holds." },
    { do: "Add that same amount each time." },
  ],
  ex: {
    q: "Skip count by 5s: 15, 20, 25, then what?",
    steps: [
      { do: "From 15 to 20 is a jump of 5.", why: "And 20 to 25 is also 5, so the rule holds." },
      { do: "Add 5 to 25." },
    ],
    a: "30",
  },
  turn: { q: "Skip count by 10s: 40, 50, 60, then what?", ask: "What changes each jump?", a: "70", why: "Only the tens digit moves. Adding ten adds one whole bundle." },
  watch: "Counting in fives always lands on a 0 or a 5. If your answer ends in anything else, check the jump.",
},
'npv.pv3': {
  fig: { kind: 'places', n: 462, hi: 1 },
  anchor: "Ten ones make a ten, and ten tens make a hundred. Each new place is another bundling.",
  idea: "Every place to the left is worth ten times the one before it. That is the whole rule, and it never changes however long the number gets.",
  steps: [
    { do: "Name the places from the right: ones, tens, hundreds.", why: "Each step left multiplies by ten." },
    { do: "Find the digit in the place you were asked for." },
    { do: "Multiply that digit by what the place is worth." },
  ],
  ex: {
    q: "In 462, which digit is in the tens place, and what is it worth?",
    steps: [
      { do: "From the right: 2 is ones, 6 is tens, 4 is hundreds.", why: "Three digits, three places." },
      { do: "The tens place holds the 6." },
      { do: "Six tens is 60.", why: "So 462 is 400 and 60 and 2 put together." },
    ],
    a: "6, worth 60",
  },
  turn: { q: "In 508, what is the 5 worth?", ask: "Name the places from the right.", a: "500", why: "5 is third from the right, so it counts hundreds. The 0 in the tens place means there are no tens — it is holding the place open." },
  watch: "A zero is not nothing. In 508 it means there are no tens, and it holds the hundreds and ones apart. Drop it and you have 58.",
},
'npv.compare3': {
  anchor: "Two crowds. You count the hundreds first, and only if those tie do you bother with the tens.",
  idea: "Start at the biggest place and move right until the digits differ. The first difference decides it, and nothing further right can change it.",
  steps: [
    { do: "Compare the hundreds." },
    { do: "Same hundreds? Compare the tens. Same tens? Compare the ones." },
    { do: "Stop at the first column where they differ.", why: "Nothing to the right can outweigh a bigger hundreds or tens digit." },
  ],
  ex: {
    q: "Which is greater, 418 or 425?",
    steps: [
      { do: "Hundreds: both are 4.", why: "Tied, so move right." },
      { do: "Tens: 1 against 2.", why: "2 tens beats 1 ten." },
      { do: "So 425 is greater. The 8 in 418 never gets a vote.", why: "Eight ones cannot make up a whole missing ten." },
    ],
    a: "425",
  },
  turn: { q: "Which is greater, 507 or 570?", ask: "Where is the first difference?", a: "570", why: "Hundreds tie at 5. Tens: 0 against 7, so 570 wins." },
  watch: "Once you find the first column that differs, stop. Looking further right is how a correct comparison gets talked out of itself.",
},
'npv.evenodd': {
  anchor: "Line the counters up in twos. If every one has a partner the number is even; if one is left over on its own, it is odd.",
  idea: "An even number splits into two equal whole groups. An odd number always has one left over — and only the last digit decides which.",
  steps: [
    { do: "Look only at the last digit.", why: "The tens and hundreds are made of tens, and every ten splits evenly. Only the ones can leave a remainder." },
    { do: "0, 2, 4, 6 or 8 means even. 1, 3, 5, 7 or 9 means odd." },
  ],
  ex: {
    q: "Is 74 even or odd?",
    steps: [
      { do: "The last digit is 4.", why: "The 7 tens do not matter — seventy splits evenly into two thirty-fives." },
      { do: "4 is one of the even digits.", why: "Four counters pair up with none left over." },
    ],
    a: "Even",
  },
  turn: { q: "Is 73 even or odd?", ask: "Which digit decides?", a: "Odd", why: "The last digit is 3, and three counters leave one without a partner." },
  watch: "Odd digits inside the number do not make it odd. 73 is odd because of the 3, not the 7 — and 72 is even despite the 7.",
},
'npv.round10': {
  anchor: "Standing between two lamp posts, you say which one you are nearer to. Rounding is the same question asked about numbers.",
  idea: "Rounding swaps a number for the nearest tidy one. To the nearest ten, you pick whichever ten it is closer to.",
  steps: [
    { do: "Find the two tens it sits between.", why: "47 sits between 40 and 50." },
    { do: "Look at the ones digit — and only that one." },
    { do: "5 or more rounds up. 4 or less stays where it is.", why: "Five is exactly halfway, and the rule sends halfway upward so everyone does the same thing." },
  ],
  ex: {
    q: "Round 47 to the nearest ten.",
    steps: [
      { do: "47 sits between 40 and 50.", why: "Those are the only two possible answers." },
      { do: "The ones digit is 7.", why: "Seven is past halfway." },
      { do: "7 is 5 or more, so round up to 50.", why: "47 really is nearer 50 than 40." },
    ],
    a: "50",
  },
  turn: { q: "Round 32 to the nearest ten.", ask: "Which two tens, and which is it nearer?", a: "30", why: "32 sits between 30 and 40, and the ones digit 2 is less than 5, so it stays at 30." },
  watch: "Only the digit immediately to the right decides. Rounding 47 you look at the 7, and nothing else.",
},
'npv.round100': {
  anchor: "Same question, bigger lamp posts. Which hundred is this number nearer to?",
  idea: "Rounding to the nearest hundred works exactly like tens, one column further left. Now the TENS digit is the one that decides.",
  steps: [
    { do: "Find the two hundreds it sits between." },
    { do: "Look at the tens digit.", why: "One column right of the place you are rounding to — always." },
    { do: "5 or more rounds up." },
  ],
  ex: {
    q: "Round 362 to the nearest hundred.",
    steps: [
      { do: "362 sits between 300 and 400." },
      { do: "The tens digit is 6.", why: "The 2 on the end has no say at all." },
      { do: "6 is 5 or more, so round up to 400." },
    ],
    a: "400",
  },
  turn: { q: "Round 431 to the nearest hundred.", ask: "Which digit decides?", a: "400", why: "431 sits between 400 and 500. The tens digit is 3, which is less than 5, so it rounds down." },
  watch: "It is the tens digit that decides, not the ones. In 362 the 2 never gets a vote.",
},
'npv.pv4': {
  fig: { kind: 'places', n: 5283, hi: 2 },
  anchor: "Ten hundreds make a thousand — the same bundling one step further.",
  idea: "Where a digit sits decides its value. In 5,283 the 2 is not worth two, it is worth two hundred.",
  steps: [
    { do: "Name the places from the right: ones, tens, hundreds, thousands.", why: "Each place left is ten times the last." },
    { do: "Find the digit in the place asked for." },
    { do: "Multiply it by what that place is worth." },
  ],
  ex: {
    q: "In 5,283, which digit is in the hundreds place, and what is it worth?",
    steps: [
      { do: "From the right: 3 ones, 8 tens, 2 hundreds, 5 thousands.", why: "Four digits, four places." },
      { do: "The hundreds place holds the 2.", why: "That is the digit; its value is the next step." },
      { do: "Two hundreds is 200.", why: "So 5,283 is 5,000 and 200 and 80 and 3." },
    ],
    a: "The digit is 2, and it is worth 200",
  },
  turn: { q: "In 4,617, the 6 is in the ▢ place, worth ▢.", ask: "Name the places from the right, then say what the 6 counts.", a: "hundreds place, worth 600", why: "6 sits third from the right, so it counts bundles of one hundred." },
  watch: "The digit and its value are different. The digit is 2; what it is worth is 200. The comma only helps you read the number — it changes nothing.",
},
'npv.pv6': {
  fig: { kind: 'places', n: 348912, hi: 4 },
  anchor: "The places repeat in groups of three, and the comma marks where each group ends: ones, tens, hundreds — then thousands, ten thousands, hundred thousands.",
  idea: "Big numbers are not a new system. It is the same three places over again, counting thousands instead of ones.",
  steps: [
    { do: "Split the number at the comma.", why: "Everything left of it counts thousands." },
    { do: "Inside each group, read ones, tens, hundreds from the right." },
    { do: "Add the word 'thousand' to anything left of the comma." },
  ],
  ex: {
    q: "In 348,912, which digit is in the ten thousands place?",
    steps: [
      { do: "Split at the comma: 348 thousands, and 912.", why: "So the left group counts thousands." },
      { do: "Inside 348, from the right: 8 thousands, 4 ten thousands, 3 hundred thousands.", why: "The same ones-tens-hundreds pattern, one group up." },
      { do: "The ten thousands place holds the 4." },
    ],
    a: "4",
  },
  turn: { q: "In 706,215, what is the 7 worth?", ask: "Split at the comma first.", a: "700,000", why: "7 is in the hundred thousands place: seven hundred thousands." },
  watch: "Read the comma as the word 'thousand' and big numbers stop being frightening. 348,912 is 'three hundred forty-eight thousand, nine hundred twelve'.",
},
'npv.compare6': {
  anchor: "A number with more digits is bigger, full stop. Only when they are the same length do you have to look properly.",
  idea: "More digits always wins. Same number of digits means comparing from the left, place by place, until they differ.",
  steps: [
    { do: "Count the digits. More digits is bigger." },
    { do: "Same count? Compare from the LEFT.", why: "The leftmost digit is worth the most." },
    { do: "Stop at the first difference." },
  ],
  ex: {
    q: "Which is greater, 52,140 or 52,410?",
    steps: [
      { do: "Both have five digits, so length does not settle it." },
      { do: "From the left: 5 and 5 match, 2 and 2 match.", why: "Keep going right." },
      { do: "Next: 1 against 4. Four hundreds beats one hundred, so 52,410 wins." },
    ],
    a: "52,410",
  },
  turn: { q: "Which is greater, 9,876 or 10,002?", ask: "Count the digits first.", a: "10,002", why: "Five digits beats four. 10,002 is over ten thousand; 9,876 is not." },
  watch: "Do not compare from the right. Lining numbers up by their last digit is how a four-digit number gets mistaken for a bigger one.",
},
'npv.round.any': {
  anchor: "The same lamp-post question, asked about whichever column you like.",
  idea: "Rounding never changes. Underline the place you are rounding TO, look at the single digit to its right, and everything right of the underline becomes zero.",
  steps: [
    { do: "Underline the place you are rounding to.", why: "Do this first, before you look at any digit." },
    { do: "Look at the one digit immediately to its right." },
    { do: "5 or more rounds the underlined digit up; then zero out everything to the right." },
  ],
  ex: {
    q: "Round 6,482 to the nearest hundred.",
    steps: [
      { do: "The hundreds digit is 4. Underline it." },
      { do: "The digit to its right is 8.", why: "Only that one matters — not the 2." },
      { do: "8 is 5 or more, so the 4 becomes 5." },
      { do: "Everything right of the underline becomes zero: 6,500." },
    ],
    a: "6,500",
  },
  turn: { q: "Round 6,482 to the nearest thousand.", ask: "Which digit is underlined now, and which one decides?", a: "6,000", why: "The thousands digit is 6; the digit to its right is 4, which is less than 5, so it stays 6 and the rest go to zero." },
  watch: "Rounding to the wrong place gives a perfectly sensible number that answers a different question. Underline first.",
},
'npv.powers10': {
  anchor: "Slide every digit one place to the left and drop a zero in behind. That is what multiplying by ten does — it is not really a calculation at all.",
  idea: "Multiplying by ten shifts every digit one place left, because every place is worth ten times the one to its right. That shift is the whole reason our number system works.",
  steps: [
    { do: "To multiply by 10, shift the digits left and put a 0 in the ones place.", why: "Each digit moves into a column worth ten times more." },
    { do: "A power of ten is a 1 followed by that many zeros." },
  ],
  ex: {
    q: "What is 10 to the power 3?",
    steps: [
      { do: "The power says how many tens to multiply together: 10 x 10 x 10.", why: "Three copies of ten." },
      { do: "10 x 10 = 100, and 100 x 10 = 1,000." },
      { do: "So it is a 1 followed by three zeros.", why: "The power counts the zeros." },
    ],
    a: "1,000",
  },
  turn: { q: "What is 10 to the power 5?", ask: "How many zeros?", a: "100,000", why: "Five zeros after the 1." },
  watch: "The power counts the ZEROS, not the digits. 10 to the power 3 is 1,000 — four digits, three zeros.",
},
'npv.integers': {
  anchor: "A thermometer does not stop at zero. Below it the numbers keep going, counting how far below you are.",
  idea: "The number line runs both ways. Further RIGHT is always greater — which means with negatives, the bigger-looking digit is the smaller number.",
  steps: [
    { do: "Picture the line with zero in the middle." },
    { do: "Whichever number sits further right is greater.", why: "Right is always more, whatever the signs." },
  ],
  ex: {
    q: "Which is greater, -9 or -2?",
    steps: [
      { do: "-9 is nine steps LEFT of zero.", why: "Nine below zero." },
      { do: "-2 is only two steps left.", why: "Much closer to zero." },
      { do: "-2 sits further right, so -2 is greater.", why: "Two degrees below freezing is warmer than nine below." },
    ],
    a: "-2",
  },
  turn: { q: "Which is greater, -15 or 3?", ask: "Which side of zero is each one on?", a: "3", why: "Any positive number is greater than any negative one, because it is on the right-hand side of zero." },
  watch: "With negatives the big digit is the small number. -9 is LESS than -2, even though 9 is more than 2.",
},
'npv.abs': {
  anchor: "How far you are from home does not depend on which direction you walked. Three streets east and three streets west are both three streets.",
  idea: "Absolute value is distance from zero with the direction thrown away. Distance is never negative.",
  steps: [
    { do: "Ignore the sign." },
    { do: "What is left is how far the number is from zero." },
  ],
  ex: {
    q: "What is the absolute value of -7?",
    steps: [
      { do: "-7 sits seven steps from zero.", why: "On the left-hand side, but that is the direction, not the distance." },
      { do: "Distance has no sign, so the answer is 7." },
    ],
    a: "7",
  },
  turn: { q: "What is the opposite of -4?", ask: "Opposite means the same distance, other side.", a: "4", why: "-4 is four left of zero, so its opposite is four right of zero." },
  watch: "The opposite and the absolute value are different questions. The opposite of 7 is -7; the absolute value of 7 is 7.",
},
'npv.exponents': {
  anchor: "Folding a paper in half again and again: one fold gives 2 layers, two folds 4, three folds 8. Each fold doubles what you had.",
  idea: "An exponent counts how many COPIES of the base to multiply together. It does not tell you what to multiply the base by.",
  steps: [
    { do: "Read the small raised number as 'how many copies'." },
    { do: "Write them all out and multiply, one step at a time." },
  ],
  ex: {
    q: "What is 2 to the power 4?",
    steps: [
      { do: "Four copies of 2: 2 x 2 x 2 x 2.", why: "Not 2 times 4." },
      { do: "2 x 2 = 4." },
      { do: "4 x 2 = 8, and 8 x 2 = 16." },
    ],
    a: "16",
  },
  turn: { q: "What is 3 to the power 2?", ask: "How many copies of 3?", a: "9", why: "Two copies: 3 x 3." },
  watch: "It is not base times exponent. 2 to the power 4 is 16, not 8 — and the gap gets enormous fast.",
},

/* ══ ADDITION & SUBTRACTION ═════════════════════════════════════════════ */

'as.add10': {
  anchor: "Three counters and four counters pushed together make one pile. Adding is joining and then finding out how many.",
  idea: "Adding joins two amounts. Counting on from the bigger number is fewer steps and fewer chances to slip.",
  steps: [
    { do: "Start from the BIGGER number.", why: "Counting on three is quicker and safer than counting on six." },
    { do: "Count on by the smaller one." },
  ],
  ex: {
    q: "What is 6 + 3?",
    steps: [
      { do: "Start at 6, the bigger one.", why: "Even though the 3 is written second." },
      { do: "Count on three: seven, eight, nine.", why: "Three steps, not three plus six steps." },
    ],
    a: "9",
  },
  turn: { q: "What is 2 + 7?", ask: "Which number should you start from?", a: "9", why: "Start at 7 and count on two: eight, nine. Starting at 2 would take seven steps instead." },
  watch: "The order does not change the answer. 6 + 3 and 3 + 6 are both 9, so always start from the bigger one.",
},
'as.sub10': {
  anchor: "Take four counters away from a pile of nine and count what is left. Or line them up and see how much longer one row is.",
  idea: "Subtracting is taking away, or finding the gap between two numbers. Unlike adding, the order matters.",
  steps: [
    { do: "Start from the first number." },
    { do: "Count back by the second one.", why: "Or count UP from the smaller to the bigger, if the gap is small." },
  ],
  ex: {
    q: "What is 9 - 4?",
    steps: [
      { do: "Start at 9." },
      { do: "Count back four: eight, seven, six, five.", why: "Four steps back." },
      { do: "You could also count up from 4 to 9 — also five steps.", why: "Same answer, and easier when the numbers are close." },
    ],
    a: "5",
  },
  turn: { q: "What is 8 - 6?", ask: "Would counting back or counting up be quicker?", a: "2", why: "The numbers are close, so count up from 6: seven, eight. Two steps." },
  watch: "9 - 4 and 4 - 9 are not the same. Adding can be turned round; subtracting cannot.",
},
'as.bonds10': {
  fig: { kind: 'tenframe', filled: 7 },
  anchor: "A ten-frame with seven counters in it has three holes. Those pairs that fill a ten are worth knowing without thinking.",
  idea: "The pairs that make ten are the most useful facts in early math. Every later trick for adding across ten depends on knowing them instantly.",
  steps: [
    { do: "Ask how many more would fill a ten." },
    { do: "Count on from the number you have up to 10." },
  ],
  ex: {
    q: "7 + what = 10?",
    steps: [
      { do: "Picture seven counters in a ten-frame.", why: "Three holes left." },
      { do: "Count on from 7: eight, nine, ten.", why: "Three steps." },
      { do: "So 7 and 3 make 10.", why: "And that also tells you 3 and 7 make 10." },
    ],
    a: "3",
  },
  turn: { q: "6 + what = 10?", ask: "How many holes are left?", a: "4", why: "Six counters leaves four holes. And so 4 and 6 make ten as well." },
  watch: "These come in pairs. Learning 7 and 3 gets you 3 and 7 free — there are far fewer of these to learn than it looks.",
},
'as.add20': {
  fig: { kind: 'tenframe', filled: 8, extra: 5 },
  anchor: "Seven counters and five more. Move two of the five across to fill the ten-frame, and you can see at a glance it is ten and three.",
  idea: "When a sum crosses ten, make the ten first and add what is left over. This is where carrying comes from, met before the notation.",
  steps: [
    { do: "Work out how many more the bigger number needs to reach ten." },
    { do: "Split the smaller number into that much, and the rest.", why: "This is why the number bonds to ten matter." },
    { do: "Ten plus the rest is easy to see." },
  ],
  ex: {
    q: "What is 8 + 5?",
    steps: [
      { do: "8 needs 2 more to make 10." },
      { do: "Split the 5 into 2 and 3.", why: "The 2 fills the ten; the 3 is left over." },
      { do: "8 + 2 = 10, and 3 more.", why: "Ten and three is thirteen — you can see it without counting." },
    ],
    a: "13",
  },
  turn: { q: "What is 7 + 6?", ask: "How many does 7 need to reach ten?", a: "13", why: "7 needs 3, so split the 6 into 3 and 3. That gives 10 and 3." },
  watch: "Counting on your fingers works but breaks down past ten. Making the ten scales all the way to column addition.",
},
'as.sub20': {
  fig: { kind: 'tenframe', filled: 10, extra: 5 },
  anchor: "Fifteen counters, take away seven. Take five off to land exactly on ten, then take the other two.",
  idea: "Subtracting across ten works in reverse: get down to ten first, then take the rest. Landing on ten is the safe stopping point.",
  steps: [
    { do: "Take away enough to land exactly on 10." },
    { do: "Take away whatever is left of the number." },
  ],
  ex: {
    q: "What is 15 - 7?",
    steps: [
      { do: "15 down to 10 is 5." },
      { do: "Split the 7 into 5 and 2.", why: "The 5 gets you to ten." },
      { do: "10 take away the other 2 is 8." },
    ],
    a: "8",
  },
  turn: { q: "What is 13 - 5?", ask: "How far is 13 from ten?", a: "8", why: "13 down to 10 is 3, so split the 5 into 3 and 2. That leaves 10 - 2 = 8." },
  watch: "Counting back seven in one go is where the slips happen. Landing on ten first gives you a checkpoint.",
},
'as.missadd': {
  anchor: "You have six sweets and you want fourteen. How many more do you need? You do not start again — you count the gap.",
  idea: "A missing addend asks what fills the gap. It is subtraction asked from the other end, and counting UP is usually easier than taking away.",
  steps: [
    { do: "Count on from the number you have towards the total." },
    { do: "The number of steps you took is the answer.", why: "Going via ten makes it easier." },
  ],
  ex: {
    q: "6 + what = 14?",
    steps: [
      { do: "Count on from 6 up to 10: that is 4.", why: "Stop at ten deliberately." },
      { do: "Then 10 up to 14: that is 4 more." },
      { do: "4 and 4 makes 8 steps altogether." },
    ],
    a: "8",
  },
  turn: { q: "9 + what = 15?", ask: "Go via ten.", a: "6", why: "9 up to 10 is 1, then 10 up to 15 is 5. That is 6 steps." },
  watch: "The answer is the GAP, not the total. It has to be smaller than the number on the right of the equals sign.",
},
'as.add2d.nr': {
  fig: { kind: 'column', a: 34, b: 25, op: '+' },
  anchor: "Two piles of bundled tens and loose ones. Tip the loose ones together, tip the bundles together, and count each kind separately.",
  idea: "Two-digit addition is two small sums: add the ones, then add the tens. They stay separate because a ten and a one are different sizes.",
  steps: [
    { do: "Line the numbers up from the RIGHT.", why: "Ones under ones, tens under tens. Only digits worth the same can be added." },
    { do: "Add the ones column." },
    { do: "Add the tens column." },
  ],
  ex: {
    q: "What is 34 + 25?",
    steps: [
      { do: "Ones: 4 + 5 = 9.", why: "Under ten, so it fits in the ones column with nothing left over." },
      { do: "Tens: 3 + 2 = 5, which means 5 tens." },
      { do: "5 tens and 9 ones is 59." },
    ],
    a: "59",
  },
  turn: { q: "What is 42 + 36?", ask: "Do the ones first.", a: "78", why: "Ones: 2 + 6 = 8. Tens: 4 + 3 = 7. So 78." },
  watch: "Line up from the RIGHT, never the left. Ones under tens gives an answer that is wildly out.",
},
'as.add2d.rg': {
  fig: { kind: 'column', a: 47, b: 28, op: '+' },
  anchor: "Ten ones make a ten. If a column ever collects ten, you bundle it and the bundle moves one place left. That is all regrouping is.",
  idea: "When a column adds to ten or more, the ten does not vanish — it moves to the next column. Forgetting it makes your answer exactly ten too small.",
  steps: [
    { do: "Line the numbers up from the RIGHT, ones under ones.", why: "Only digits worth the same thing can be added together." },
    { do: "Add the ones. If they make ten or more, write the ones digit and carry the ten.", why: "Fifteen ones is one ten and five ones. The ten belongs in the tens column." },
    { do: "Add the tens, including the one you carried." },
  ],
  ex: {
    q: "What is 47 + 28?",
    steps: [
      { do: "Ones: 7 + 8 = 15.", why: "That is more than nine, so it will not fit in one column." },
      { do: "Write the 5 in the ones, carry the 1 into the tens.", why: "15 is one ten and five ones. The five stays; the ten moves." },
      { do: "Tens: 4 + 2 = 6, plus the carried 1 makes 7.", why: "Seven tens is seventy." },
      { do: "So the answer is 70 and 5." },
    ],
    a: "75",
  },
  turn: { q: "What is 36 + 27?", ask: "Do the ones first. What do you carry?", a: "63", why: "6 + 7 = 13, so write 3 and carry 1. Then 3 + 2 + 1 = 6 tens." },
  watch: "If you forget the carry you get 55 instead of 75 — exactly ten short. An answer that is ten out is almost always a missing carry.",
},
'as.sub2d.nr': {
  fig: { kind: 'column', a: 68, b: 23, op: '-' },
  anchor: "Six bundles of ten and eight loose ones. Take away two bundles and three loose ones — the bundles and the loose ones never mix.",
  idea: "Subtracting two-digit numbers is two small subtractions: the ones, then the tens. They stay separate because a ten and a one are different sizes.",
  steps: [
    { do: "Line them up from the RIGHT.", why: "Ones under ones, tens under tens." },
    { do: "Subtract the ones." },
    { do: "Subtract the tens." },
  ],
  ex: {
    q: "What is 68 - 23?",
    steps: [
      { do: "Ones: 8 - 3 = 5.", why: "The top digit is bigger, so no borrowing is needed." },
      { do: "Tens: 6 - 2 = 4, meaning 4 tens." },
      { do: "4 tens and 5 ones is 45." },
    ],
    a: "45",
  },
  turn: { q: "What is 79 - 34?", ask: "Do the ones first.", a: "45", why: "Ones: 9 - 4 = 5. Tens: 7 - 3 = 4. So 45." },
  watch: "Always take the bottom digit from the top one. If the top is smaller you cannot just flip them — you have to borrow, which is the next skill.",
},
'as.sub2d.rg': {
  fig: { kind: 'column', a: 52, b: 27, op: '-' },
  anchor: "A ten can always be unbundled back into ten ones. Borrowing does not change the number, it just writes it differently.",
  idea: "When the top digit is too small, unbundle a ten from the next column. 52 becomes 4 tens and 12 ones — still 52.",
  steps: [
    { do: "Line them up from the right." },
    { do: "If the top ones digit is smaller, take one ten from the tens column.", why: "The tens digit goes down by one; the ones go up by ten." },
    { do: "Now subtract each column." },
  ],
  ex: {
    q: "What is 52 - 27?",
    steps: [
      { do: "Ones: 2 take away 7 will not go.", why: "You cannot take seven from two without going below zero." },
      { do: "Unbundle a ten: the 5 tens become 4 tens, and the 2 ones become 12 ones.", why: "4 tens and 12 ones is 52 — the same number, written to make the subtraction possible." },
      { do: "Ones: 12 - 7 = 5." },
      { do: "Tens: 4 - 2 = 2, which is 20.", why: "Four tens, not five — one was lent to the ones." },
    ],
    a: "25",
  },
  turn: { q: "What is 61 - 38?", ask: "Which column has to borrow, and what does 6 become?", a: "23", why: "1 take 8 will not go, so 6 tens become 5 and the 1 becomes 11. 11 - 8 = 3, and 5 - 3 = 2 tens." },
  watch: "You cannot flip the digits round and do 7 - 2. Taking the small from the big in each column gives 35, and it is the most common wrong answer there is.",
},
'as.jump100': {
  anchor: "Adding a whole bundle of ten to a pile changes how many bundles you have and nothing else. The loose ones never move.",
  idea: "Adding ten or a hundred changes exactly one digit. Seeing that is faster and safer than working it out.",
  steps: [
    { do: "Adding 10 changes only the tens digit.", why: "The ones are untouched — you added a whole bundle, not loose ones." },
    { do: "Adding 100 changes only the hundreds digit." },
    { do: "Watch for a 9, which rolls over into the next column." },
  ],
  ex: {
    q: "What is 462 + 100?",
    steps: [
      { do: "Only the hundreds digit moves.", why: "The 6 tens and 2 ones are not involved." },
      { do: "4 hundreds becomes 5 hundreds." },
      { do: "So 562." },
    ],
    a: "562",
  },
  turn: { q: "What is 195 + 10?", ask: "What happens to the 9?", a: "205", why: "9 tens plus 1 ten is 10 tens, which is a whole hundred. So the hundreds go from 1 to 2 and the tens become 0." },
  watch: "A 9 in the column you are adding to rolls over. 195 + 10 is 205, not 105.",
},
'as.add3d': {
  fig: { kind: 'column', a: 285, b: 147, op: '+' },
  anchor: "Three columns of bundles now: hundreds, tens and ones. Every time a column reaches ten of something, it bundles up and moves left.",
  idea: "Three-digit addition is the same three steps with one more column. A carry can happen in more than one column, and each one must be added in.",
  steps: [
    { do: "Add the ones, carrying if they reach ten." },
    { do: "Add the tens, including any carry, and carry again if needed.", why: "A carry can happen twice in the same sum." },
    { do: "Add the hundreds." },
  ],
  ex: {
    q: "What is 285 + 147?",
    steps: [
      { do: "Ones: 5 + 7 = 12. Write 2, carry 1.", why: "Twelve ones is one ten and two ones." },
      { do: "Tens: 8 + 4 = 12, plus the carried 1 makes 13. Write 3, carry 1.", why: "Thirteen tens is one hundred and three tens." },
      { do: "Hundreds: 2 + 1 = 3, plus the carried 1 makes 4." },
    ],
    a: "432",
  },
  turn: { q: "What is 376 + 158?", ask: "How many times do you carry?", a: "534", why: "Twice. Ones: 6+8=14, write 4 carry 1. Tens: 7+5+1=13, write 3 carry 1. Hundreds: 3+1+1=5." },
  watch: "One carry is easy to remember; two is where it goes wrong. Write each carry down above the column it goes into.",
},
'as.subzero': {
  fig: { kind: 'column', a: 400, b: 137, op: '-' },
  anchor: "A zero has nothing to lend. To borrow past it you have to go further left, and every zero you pass turns into a 9.",
  idea: "Borrowing across a zero is the same unbundling, done twice: a thousand becomes ten hundreds, and one of those hundreds becomes ten tens.",
  steps: [
    { do: "Look left until you find a digit bigger than zero.", why: "That is the nearest column with something to lend." },
    { do: "Take one from it. Every zero you passed becomes 9.", why: "The borrowed hundred is unbundled into ten tens; nine stay behind and one goes on." },
    { do: "The ones column gets its ten. Now subtract." },
  ],
  ex: {
    q: "What is 400 - 137?",
    steps: [
      { do: "Ones: 0 take 7 will not go, and the tens are 0 too.", why: "Nothing next door to borrow from." },
      { do: "Go to the hundreds: 4 becomes 3.", why: "One hundred has been taken out to unbundle." },
      { do: "That hundred becomes 10 tens, and one of those becomes 10 ones. So the tens show 9 and the ones show 10.", why: "Nine tens stay; the tenth is broken into ones." },
      { do: "Now: 10 - 7 = 3, 9 - 3 = 6, 3 - 1 = 2." },
    ],
    a: "263",
  },
  turn: { q: "What is 500 - 246?", ask: "What do the 5 and the middle 0 become?", a: "254", why: "5 becomes 4, the 0 becomes 9, the last 0 becomes 10. Then 10-6=4, 9-4=5, 4-2=2." },
  watch: "This is the hardest subtraction there is. Cross out every digit you change and write the new one above it — trying to hold it in your head is where it goes wrong.",
},
'as.estimate': {
  anchor: "Before you buy three things, you round the prices in your head to see roughly what it will come to. You are not trying to be exact.",
  idea: "Estimating gives you a rough answer fast, so you notice when the exact one is wildly wrong. Round FIRST, then add the rounded numbers.",
  steps: [
    { do: "Round each number to the nearest ten." },
    { do: "Add the ROUNDED numbers, not the real ones.", why: "The whole point is that the sum is easy." },
  ],
  ex: {
    q: "Estimate 47 + 38 to the nearest ten.",
    steps: [
      { do: "47 rounds to 50.", why: "Ones digit 7, so up." },
      { do: "38 rounds to 40.", why: "Ones digit 8, so up." },
      { do: "50 + 40 = 90.", why: "The real answer is 85, so 90 is close enough to catch a wild mistake." },
    ],
    a: "90",
  },
  turn: { q: "Estimate 62 + 29.", ask: "Round each one first.", a: "90", why: "62 rounds to 60 and 29 rounds to 30. 60 + 30 = 90. The exact answer is 91." },
  watch: "An estimate is not meant to match exactly. Do not go back and correct it towards the real answer — that defeats the point.",
},
'as.addmulti': {
  fig: { kind: 'column', a: 4586, b: 2745, op: '+' },
  anchor: "However many columns there are, each one still bundles at ten and passes the bundle left. Nothing new is happening.",
  idea: "Long addition is not harder, only longer. Keeping the columns straight is the whole job.",
  steps: [
    { do: "Line the numbers up from the right." },
    { do: "Work right to left, carrying whenever a column reaches ten." },
  ],
  ex: {
    q: "What is 4,586 + 2,745?",
    steps: [
      { do: "Ones: 6 + 5 = 11. Write 1, carry 1." },
      { do: "Tens: 8 + 4 = 12, plus 1 is 13. Write 3, carry 1." },
      { do: "Hundreds: 5 + 7 = 12, plus 1 is 13. Write 3, carry 1." },
      { do: "Thousands: 4 + 2 = 6, plus 1 is 7." },
    ],
    a: "7,331",
  },
  turn: { q: "What is 1,908 + 2,095?", ask: "Take it one column at a time.", a: "4,003", why: "Ones: 8+5=13, write 3 carry 1. Tens: 0+9+1=10, write 0 carry 1. Hundreds: 9+0+1=10, write 0 carry 1. Thousands: 1+2+1=4." },
  watch: "Long numbers are not harder, just longer. If the columns drift the answer can be out by thousands.",
},
'as.submulti': {
  fig: { kind: 'column', a: 5304, b: 2167, op: '-' },
  anchor: "The same unbundling, repeated across more columns. A thousand becomes ten hundreds whenever you need it to.",
  idea: "Long subtraction is the borrowing you already know, applied column by column. Write every change down.",
  steps: [
    { do: "Line them up from the right." },
    { do: "Work right to left, borrowing wherever the top digit is too small." },
    { do: "Cross out and rewrite every digit you change.", why: "Holding borrows in your head is what breaks this." },
  ],
  ex: {
    q: "What is 5,304 - 2,167?",
    steps: [
      { do: "Ones: 4 is less than 7, so borrow from the tens. But the tens are 0.", why: "So the borrow has to come from further left." },
      { do: "Take one from the hundreds: 3 becomes 2, the 0 tens become 10, then lend one on so the tens show 9 and the ones show 14." },
      { do: "Ones: 14 - 7 = 7. Tens: 9 - 6 = 3." },
      { do: "Hundreds: 2 - 1 = 1. Thousands: 5 - 2 = 3." },
    ],
    a: "3,137",
  },
  turn: { q: "What is 4,000 - 1,236?", ask: "Every zero you pass becomes a 9.", a: "2,764", why: "4 becomes 3, the zeros become 9, 9 and 10. Then 10-6=4, 9-3=6, 9-2=7, 3-1=2." },
  watch: "Cross out and rewrite as you go. A borrow you remembered but did not write is the commonest cause of a wrong answer here.",
},
'as.integers': {
  anchor: "A number line laid flat with zero in the middle. Adding walks you right, subtracting walks you left, whichever side you started on.",
  idea: "Adding moves right, subtracting moves left. Subtracting a NEGATIVE moves right — two minus signs together make a plus.",
  steps: [
    { do: "Start at the first number on the line." },
    { do: "Adding a positive walks right; subtracting a positive walks left." },
    { do: "Subtracting a negative walks RIGHT.", why: "Taking away a debt leaves you better off." },
  ],
  ex: {
    q: "What is -3 - (-8)?",
    steps: [
      { do: "Start at -3.", why: "Three left of zero." },
      { do: "Taking away a negative is the same as adding.", why: "Two minus signs side by side make a plus." },
      { do: "So this is -3 + 8: walk eight steps right from -3.", why: "Three steps to reach zero, five more after that." },
    ],
    a: "5",
  },
  turn: { q: "What is 4 - 9?", ask: "Which side of zero do you land on?", a: "-5", why: "Walk nine steps left from 4. Four steps reach zero, and five more go past it." },
  watch: "Two minus signs next to each other make a plus. Reading -3 - (-8) as -3 - 8 flips the answer completely.",
},

/* ══ MULTIPLICATION & DIVISION ══════════════════════════════════════════ */

'md.groups': {
  fig: { kind: 'array', rows: 3, cols: 4, grouped: true },
  anchor: "Three plates with four biscuits on each. You could count all twelve one at a time, or you could count in fours.",
  idea: "Multiplying is adding the same amount over and over. The two numbers do different jobs: one says how many groups, the other says how big each group is.",
  steps: [
    { do: "Count how many groups there are." },
    { do: "Count how many are in one group.", why: "They must all be the same size, or it is not multiplying." },
    { do: "Add that amount once for every group." },
  ],
  ex: {
    q: "What are 3 groups of 4?",
    steps: [
      { do: "There are 3 groups.", why: "That is how many times to add." },
      { do: "Each group holds 4.", why: "That is what gets added." },
      { do: "4 + 4 + 4 = 12.", why: "Three fours. Written short, that is 3 x 4." },
    ],
    a: "12",
  },
  turn: { q: "What are 5 groups of 2?", ask: "What gets added, and how many times?", a: "10", why: "2 added five times: 2, 4, 6, 8, 10." },
  watch: "3 groups of 4 and 4 groups of 3 both come to 12, but they are different pictures. Three plates of four is not four plates of three.",
},
'md.arrays': {
  fig: { kind: 'array', rows: 3, cols: 5 },
  anchor: "Eggs in a box sit in rows. You do not count them one by one — you see three rows of four and know there are twelve.",
  idea: "An array is rows and columns. Turning it on its side does not change how many there are, which is exactly why 3 x 5 and 5 x 3 match.",
  steps: [
    { do: "Count how many rows." },
    { do: "Count how many are in one row." },
    { do: "Multiply them together.", why: "Rows times how-many-in-each." },
  ],
  ex: {
    q: "How many dots are in 3 rows of 5?",
    steps: [
      { do: "Three rows." },
      { do: "Five in each row." },
      { do: "3 x 5 = 15." },
      { do: "Turn the array on its side and it is 5 rows of 3 — still 15.", why: "Nothing was added or taken away, so the total cannot change." },
    ],
    a: "15",
  },
  turn: { q: "How many in 4 rows of 2?", ask: "And what is the same array turned sideways?", a: "8", why: "4 x 2 = 8, and turned round it is 2 rows of 4, which is also 8." },
  watch: "Turning an array is why order does not matter in multiplying. It is the one place that fact is obvious rather than something to memorize.",
},
'md.f.2510': {
  anchor: "Counting in twos, fives and tens is something you can already do out loud. Those three tables are that counting, written down.",
  idea: "The two, five and ten times tables cover nearly half the grid and each has a shortcut. Twos are doubles, tens add a zero, fives are half of tens.",
  steps: [
    { do: "Twos are doubles." },
    { do: "Tens are the digit with a zero after it.", why: "Multiplying by ten shifts everything one place left." },
    { do: "Fives are half of the tens.", why: "Ten sixes is 60, so five sixes is 30." },
  ],
  ex: {
    q: "What is 5 x 8?",
    steps: [
      { do: "Ten eights is 80.", why: "The easy one first." },
      { do: "Five is half of ten." },
      { do: "So halve 80, which is 40." },
    ],
    a: "40",
  },
  turn: { q: "What is 5 x 6?", ask: "Do the ten first.", a: "30", why: "Ten sixes is 60, and half of that is 30." },
  watch: "Every answer in the five times table ends in 0 or 5. If yours does not, check it.",
},
'md.f.34': {
  anchor: "Four of something is double, then double again. Doubling is the easiest thing to do in your head, so fours are nearly free.",
  idea: "Threes and fours build on the doubles you already have. Four is double-double; three is double plus one more lot.",
  steps: [
    { do: "To multiply by 4, double twice." },
    { do: "To multiply by 3, double and add one more lot.", why: "Three sevens is two sevens plus one seven." },
  ],
  ex: {
    q: "What is 4 x 7?",
    steps: [
      { do: "Double 7 is 14.", why: "That is 2 x 7." },
      { do: "Double 14 is 28.", why: "Doubling again gets you to 4 x 7." },
      { do: "So 4 x 7 = 28." },
    ],
    a: "28",
  },
  turn: { q: "What is 3 x 8?", ask: "Double, then add one more lot.", a: "24", why: "Double 8 is 16 (that is 2 x 8), and one more 8 makes 24." },
  watch: "Doubling twice is not the same as doubling once. 4 x 7 is 28, not 14.",
},
'md.f.69': {
  anchor: "Hold up ten fingers and fold down the fourth. You have three fingers, then six — 36. The nine times table does that every time.",
  idea: "Nines have a pattern that does the work: multiply by ten and take one lot away. The digits of every answer add up to nine, which gives you a free check.",
  steps: [
    { do: "For nines: multiply by ten, then subtract one lot." },
    { do: "For sixes: double the threes." },
    { do: "Check a nine answer by adding its digits — they should make 9." },
  ],
  ex: {
    q: "What is 9 x 6?",
    steps: [
      { do: "Ten sixes is 60." },
      { do: "Take one six away: 60 - 6 = 54.", why: "Nine sixes is one six short of ten sixes." },
      { do: "Check: 5 + 4 = 9.", why: "So the answer is almost certainly right." },
    ],
    a: "54",
  },
  turn: { q: "What is 9 x 7?", ask: "Ten lots, take one away — then check the digits.", a: "63", why: "70 - 7 = 63, and 6 + 3 = 9, so it checks out." },
  watch: "The digit-sum check only works for nines. It is worth using every single time you answer one.",
},
'md.f.78': {
  anchor: "By the time you get here, most of these you already know from the other side. 7 x 5 is the same fact as 5 x 7.",
  idea: "Sevens and eights are the last corner of the grid, and it is much smaller than it looks — everything else you have learned covers most of it already.",
  steps: [
    { do: "For eights, double three times." },
    { do: "For sevens, use the fives and add two more lots." },
    { do: "Remember you already know it from the other side." },
  ],
  ex: {
    q: "What is 7 x 6?",
    steps: [
      { do: "Five sixes is 30.", why: "The five times table is easy." },
      { do: "Two more sixes is 12." },
      { do: "30 + 12 = 42.", why: "Seven sixes is five sixes plus two sixes." },
    ],
    a: "42",
  },
  turn: { q: "What is 8 x 4?", ask: "Double three times, or use a fact you know.", a: "32", why: "Double 4 is 8, double 8 is 16, double 16 is 32. Or just: you already know 4 x 8." },
  watch: "There are only a handful of genuinely new facts here. Most of this corner you met from the other direction months ago.",
},
'md.f.all': {
  anchor: "A fact you know arrives without effort. A fact you work out takes a second — and that second is what makes long division feel impossible later.",
  idea: "Fluency means the answer arrives without calculating. Speed comes from knowing, not from hurrying.",
  steps: [
    { do: "Say the whole fact out loud, not just the answer.", why: "Saying 'seven eights are fifty-six' builds the fact; saying '56' does not." },
    { do: "If it does not come, use a fact you DO know and adjust." },
  ],
  ex: {
    q: "What is 8 x 7?",
    steps: [
      { do: "If it comes straight away, that is the answer." },
      { do: "If not: 8 x 5 = 40, which you know." },
      { do: "8 x 2 = 16, and 40 + 16 = 56.", why: "Five lots plus two lots is seven lots." },
    ],
    a: "56",
  },
  turn: { q: "What is 6 x 8?", ask: "Do you know it, or do you need to build it?", a: "48", why: "6 x 8 = 48. If it did not come: 6 x 4 = 24, doubled is 48." },
  watch: "The commonest slip is a neighbouring fact: 8 x 7 = 56 and 8 x 8 = 64. Being one row out looks right and is not.",
},
'md.props': {
  anchor: "Splitting a hard multiplication into two easy ones is what you already do in your head when you work out a tip.",
  idea: "Three rules make multiplying easier: order does not matter, grouping does not matter, and you can split one number into parts and multiply each.",
  steps: [
    { do: "Swap the numbers round if it helps.", why: "3 x 12 is easier read as 12 x 3." },
    { do: "Split a hard number into two easy ones." },
    { do: "Multiply each part, then add the results.", why: "The parts must add back to the number you started with." },
  ],
  ex: {
    q: "What is 6 x 8, by splitting?",
    steps: [
      { do: "Split the 8 into 5 and 3.", why: "Both are easy times tables." },
      { do: "6 x 5 = 30." },
      { do: "6 x 3 = 18." },
      { do: "30 + 18 = 48.", why: "Five lots plus three lots is eight lots." },
    ],
    a: "48",
  },
  turn: { q: "Split 7 x 6 into two easier products.", ask: "What could you split the 6 into?", a: "42", why: "Split 6 into 5 and 1: 7 x 5 = 35, plus 7 x 1 = 7. That gives 42." },
  watch: "The parts have to add back to the original. Splitting 8 into 5 and 4 gives nine lots, not eight.",
},
'md.div.f': {
  anchor: "Twelve biscuits shared onto three plates. How many on each? You are asking what times three makes twelve.",
  idea: "Every division fact is a multiplication fact read backwards. Unlike multiplying, the order matters.",
  steps: [
    { do: "Ask: what times the divisor makes this number?" },
    { do: "That answer is the quotient." },
    { do: "Check by multiplying back." },
  ],
  ex: {
    q: "What is 42 divided by 6?",
    steps: [
      { do: "Ask: six times what makes 42?", why: "Turning it into a times question you already know." },
      { do: "6 x 7 = 42." },
      { do: "So the answer is 7." },
      { do: "Check: 7 x 6 = 42." },
    ],
    a: "7",
  },
  turn: { q: "What is 56 divided by 8?", ask: "Which times fact do you need?", a: "7", why: "8 x 7 = 56, so 56 divided by 8 is 7." },
  watch: "Order matters here. 42 divided by 6 is 7, but 6 divided by 42 is not — sharing 6 between 42 people gives everyone less than one.",
},
'md.div.rules': {
  anchor: "Sharing twelve sweets between one person gives them all twelve. Sharing them between twelve people gives everyone one. Sharing them between nobody is not a question that has an answer.",
  idea: "A few divisions you can just know. Dividing by zero is not zero — it is a question with no answer at all.",
  steps: [
    { do: "Anything divided by 1 is itself.", why: "One group gets everything." },
    { do: "Anything divided by itself is 1.", why: "Each group gets exactly one." },
    { do: "Nothing can be divided by 0." },
  ],
  ex: {
    q: "What is 12 divided by 0?",
    steps: [
      { do: "Ask how many groups of nothing make 12.", why: "That is what dividing by zero means." },
      { do: "One group of nothing is nothing. A hundred groups of nothing is still nothing." },
      { do: "You could take groups of nothing forever and never reach 12.", why: "So there is no number that answers it." },
    ],
    a: "It has no answer",
  },
  turn: { q: "What is 37 divided by 37?", ask: "How many groups, each the size of the whole?", a: "1", why: "One group, and it holds everything." },
  watch: "Dividing by zero is not zero, and it is not infinity either. It is a question with no number for an answer.",
},
'md.mult1d': {
  anchor: "Six lots of thirty-four. Do the thirty and the four separately, then put them back together — which is exactly what the written method does.",
  idea: "Multiply each digit in turn and carry, the same way you carry when adding. Every digit gets multiplied, not just the first.",
  steps: [
    { do: "Multiply the ones digit. Carry if it goes over nine." },
    { do: "Multiply the tens digit and ADD the carry.", why: "Add the carry after multiplying, not before." },
    { do: "Keep going left through every digit." },
  ],
  ex: {
    q: "What is 34 x 6?",
    steps: [
      { do: "Ones: 4 x 6 = 24. Write 4, carry 2.", why: "Twenty-four ones is two tens and four ones." },
      { do: "Tens: 3 x 6 = 18.", why: "Eighteen tens." },
      { do: "Add the carried 2: 18 + 2 = 20 tens.", why: "The carry is added AFTER the multiplication." },
      { do: "So 20 tens and 4 ones is 204." },
    ],
    a: "204",
  },
  turn: { q: "What is 47 x 3?", ask: "What do you carry, and when do you add it?", a: "141", why: "Ones: 7 x 3 = 21, write 1 carry 2. Tens: 4 x 3 = 12, plus the carried 2 is 14." },
  watch: "The carry is ADDED after multiplying, never multiplied. In 34 x 6, it is 3 x 6 then + 2, not (3 + 2) x 6.",
},
'md.mult2d': {
  anchor: "Twenty-three rows of fourteen seats. Count fourteen rows of twenty and fourteen rows of three — or the other way round. Two easier sums, added.",
  idea: "Multiplying by a two-digit number is two multiplications added together: one by the ones, one by the tens. The tens row shifts left because you are multiplying by tens, not ones.",
  steps: [
    { do: "Multiply by the ones digit. Write that row." },
    { do: "Multiply by the TENS digit, starting one column left.", why: "Put a 0 in the ones place of that row first — it reminds you what you are really multiplying by." },
    { do: "Add the two rows." },
  ],
  ex: {
    q: "What is 23 x 14?",
    steps: [
      { do: "23 x 4 = 92.", why: "The ones row." },
      { do: "Now the tens: 23 x 1 ten, which is 23 x 10 = 230.", why: "Not 23 — you are multiplying by ten, so it shifts one place left." },
      { do: "92 + 230 = 322." },
    ],
    a: "322",
  },
  turn: { q: "What is 32 x 12?", ask: "What does the second row shift to?", a: "384", why: "32 x 2 = 64. Then 32 x 10 = 320. 64 + 320 = 384." },
  watch: "The second row MUST shift one place left. Without the shift you get 23 x 5 instead of 23 x 14, and the answer is far too small.",
},
'md.div2d': {
  anchor: "Sharing 736 sweets between 23 children. You cannot do it in your head, so you estimate, check, and correct — which is exactly what long division writes down.",
  idea: "Dividing by a two-digit number is the same four steps, with an estimate at each one. If the leftover is bigger than the divisor, the estimate was too low.",
  steps: [
    { do: "Estimate how many times the divisor fits.", why: "Rounding the divisor helps: 23 is roughly 20." },
    { do: "Multiply back and subtract." },
    { do: "If what is left is bigger than the divisor, go up one and try again.", why: "That is the built-in check." },
    { do: "Bring down the next digit and repeat." },
  ],
  ex: {
    q: "What is 736 divided by 23?",
    steps: [
      { do: "23 into 73: roughly 20 into 70, so try 3." },
      { do: "23 x 3 = 69. Take it off 73, leaving 4.", why: "4 is smaller than 23, so 3 was right." },
      { do: "Bring down the 6 to make 46." },
      { do: "23 into 46 goes exactly 2 times." },
    ],
    a: "32",
  },
  turn: { q: "What is 96 divided by 12?", ask: "Estimate first.", a: "8", why: "12 is roughly 10, and 10 into 96 is about 9. Try 8: 12 x 8 = 96 exactly." },
  watch: "If the leftover is bigger than the divisor, your estimate was too low. Go up one — that is the check built into the method.",
},
'md.mult3d': {
  anchor: "Nothing new — the same two rows, with a longer number on top.",
  idea: "Longer numbers are longer, not harder. The whole job is keeping the columns lined up.",
  steps: [
    { do: "Multiply by the ones digit." },
    { do: "Multiply by the tens digit, shifted one place left." },
    { do: "Add the two rows carefully." },
  ],
  ex: {
    q: "What is 214 x 32?",
    steps: [
      { do: "214 x 2 = 428.", why: "The ones row." },
      { do: "214 x 30 = 6,420.", why: "Three tens, so shift left and multiply by 3." },
      { do: "428 + 6,420 = 6,848." },
    ],
    a: "6,848",
  },
  turn: { q: "What is 123 x 21?", ask: "Two rows — what is the second one?", a: "2,583", why: "123 x 1 = 123. Then 123 x 20 = 2,460. Adding gives 2,583." },
  watch: "One digit out of line changes the answer by thousands. Squared paper, or write the columns wide apart.",
},
'md.div1d': {
  anchor: "Sharing 74 sweets between 5 children. You hand out tens first, then break the leftovers into ones — which is exactly what long division writes down.",
  idea: "Long division goes left to right in four repeating steps: divide, multiply back, subtract, bring down. Whatever is left at the end is the remainder.",
  steps: [
    { do: "Divide into the leftmost digit." },
    { do: "Multiply back and subtract to see what is left over.", why: "This is what makes the next step possible." },
    { do: "Bring down the next digit and repeat." },
    { do: "What cannot make another whole group is the remainder." },
  ],
  ex: {
    q: "What is 74 divided by 5?",
    steps: [
      { do: "5 into 7 goes 1 time.", why: "One ten each." },
      { do: "1 x 5 = 5, and 7 - 5 = 2 left over.", why: "Two tens still to share." },
      { do: "Bring down the 4 to make 24.", why: "Two tens and four ones is twenty-four ones." },
      { do: "5 into 24 goes 4 times, since 4 x 5 = 20, leaving 4." },
    ],
    a: "14 remainder 4",
  },
  turn: { q: "What is 47 divided by 4?", ask: "How much is left at the end?", a: "11 remainder 3", why: "4 into 4 goes 1, nothing left. Bring down the 7: 4 into 7 goes 1, leaving 3." },
  watch: "The remainder must always be SMALLER than the number you are dividing by. If it is not, the quotient can go up by one.",
},
'md.factors': {
  anchor: "Twelve counters can be laid out as 1x12, 2x6 or 3x4. Those pairs are its factors. Seven counters only make 1x7 — that is what prime means.",
  idea: "A factor divides in exactly, with nothing left. A prime has exactly two factors: 1 and itself.",
  steps: [
    { do: "Try dividing by 2, then 3, then 5, then 7, in order." },
    { do: "If any divides in exactly, it is composite." },
    { do: "You only need to test up to the square root.", why: "Past that, the pairs just repeat the other way round." },
  ],
  ex: {
    q: "Is 21 prime or composite?",
    steps: [
      { do: "Does 2 go in? No, 21 is odd." },
      { do: "Does 3 go in? Yes: 3 x 7 = 21." },
      { do: "It has factors besides 1 and itself, so it is composite." },
    ],
    a: "Composite",
  },
  turn: { q: "Is 23 prime or composite?", ask: "Which numbers do you need to test?", a: "Prime", why: "2, 3 and 4 do not go in, and 5 x 5 is already past 23, so you can stop. Only 1 and 23 divide it." },
  watch: "1 is not prime — it has only ONE factor, not two. And 2 is the only even prime.",
},
'md.primefact': {
  anchor: "Every whole number can be broken down into primes, like taking a Lego model apart into single bricks. And there is only one way to do it.",
  idea: "Every number is built from primes multiplied together, and only one set of primes will build it. Start dividing with the smallest prime that fits.",
  steps: [
    { do: "Try the primes in order: 2, 3, 5, 7, 11." },
    { do: "Divide by the first one that fits." },
    { do: "Keep going on whatever is left until only primes remain." },
  ],
  ex: {
    q: "What is the smallest prime factor of 45?",
    steps: [
      { do: "Does 2 divide 45? No — 45 is odd." },
      { do: "Does 3? Yes: 45 = 3 x 15.", why: "Digits 4+5=9, which is divisible by 3, so 45 is too." },
      { do: "So the smallest prime factor is 3." },
    ],
    a: "3",
  },
  turn: { q: "What is the smallest prime factor of 91?", ask: "Work up through the primes.", a: "7", why: "2, 3 and 5 do not divide 91. 7 does: 7 x 13 = 91." },
  watch: "Test the primes IN ORDER. Jumping to a factor you spotted gives a real factor that is not the smallest.",
},
'md.gcflcm': {
  anchor: "Two lengths of ribbon, 12 and 18 inches. The longest piece that measures both exactly is the GCF. The shortest length both can be cut into is the LCM.",
  idea: "The greatest common factor is the biggest number dividing BOTH. The lowest common multiple is the first number both count up to.",
  steps: [
    { do: "For the GCF, list what divides each and take the biggest shared one." },
    { do: "For the LCM, count up in each until they meet." },
    { do: "The GCF is never bigger than the smaller number; the LCM is never smaller than the bigger one.", why: "A quick sanity check on your answer." },
  ],
  ex: {
    q: "What is the GCF of 12 and 18?",
    steps: [
      { do: "12 divides by 1, 2, 3, 4, 6, 12." },
      { do: "18 divides by 1, 2, 3, 6, 9, 18." },
      { do: "Shared: 1, 2, 3 and 6." },
      { do: "The biggest shared one is 6." },
    ],
    a: "6",
  },
  turn: { q: "What is the LCM of 4 and 6?", ask: "Count up in each until they meet.", a: "12", why: "Fours: 4, 8, 12. Sixes: 6, 12. They meet at 12." },
  watch: "GCF and LCM are opposite questions. The GCF is at most the smaller number; the LCM is at least the bigger one.",
},
'md.orderops': {
  anchor: "Without an agreed order, 3 + 4 x 5 could be 35 or 23 and nobody would know which. The order is a convention so that everyone reads it the same way.",
  idea: "When a calculation has more than one operation there is a fixed order: brackets, then powers, then multiply and divide, then add and subtract.",
  steps: [
    { do: "Brackets first." },
    { do: "Then powers." },
    { do: "Then multiplication and division, left to right." },
    { do: "Then addition and subtraction, left to right." },
  ],
  ex: {
    q: "What is 3 + 4 x 5?",
    steps: [
      { do: "There is no bracket and no power." },
      { do: "Multiplication comes before addition, wherever it sits in the line.", why: "It does not matter that the + is written first." },
      { do: "4 x 5 = 20." },
      { do: "Then 3 + 20 = 23." },
    ],
    a: "23",
  },
  turn: { q: "What is (3 + 4) x 5?", ask: "What do the brackets change?", a: "35", why: "Brackets first: 3 + 4 = 7. Then 7 x 5 = 35. The brackets are what make the difference." },
  watch: "Working left to right gives 35 for 3 + 4 x 5, and it is wrong. The order is not the order it is written in.",
},

/* ══ FRACTIONS ══════════════════════════════════════════════════════════ */

'fr.halves': {
  anchor: "Fold a piece of paper down the middle and the two sides match exactly. Fold it unevenly and they do not — and then it is not halves at all.",
  idea: "A fraction is a whole cut into EQUAL parts. Equal means equal in size, and if the parts are not equal it is not a fraction.",
  steps: [
    { do: "Count the parts." },
    { do: "Check they are all the same size.", why: "Four uneven pieces are not fourths, however many there are." },
  ],
  ex: {
    q: "A circle cut into 4 equal parts.",
    steps: [
      { do: "Count round the circle: one, two, three, four." },
      { do: "Each piece looks the same size as the others.", why: "So each one is a fourth of the whole." },
      { do: "Four equal parts." },
    ],
    a: "4 equal parts",
  },
  turn: { q: "A rectangle cut into 2 equal parts. What is each piece called?", ask: "How many pieces make the whole?", a: "A half", why: "Two equal parts, so each one is one half." },
  watch: "Equal means the same SIZE. Pieces can be different shapes and still be equal — a square cut corner to corner gives two equal triangles.",
},
'fr.thirds': {
  fig: { kind: 'bar', d: 3, n: 1 },
  anchor: "Three children share one chocolate bar. Break it into three equal pieces and each child gets one third.",
  idea: "The bottom number says how many equal parts the whole was cut into. The top says how many of them you have.",
  steps: [
    { do: "Count ALL the parts. That is the bottom number.", why: "Including the shaded ones — it counts the whole, not the leftovers." },
    { do: "Count the shaded parts. That is the top." },
    { do: "Check the parts are equal." },
  ],
  ex: {
    q: "One part shaded out of three.",
    steps: [
      { do: "Three equal parts altogether, so the bottom number is 3.", why: "Each piece is one third of the whole." },
      { do: "One is shaded, so the top number is 1." },
      { do: "One third." },
    ],
    a: "1/3",
  },
  turn: { q: "Two parts shaded out of four.", ask: "Which number is the bottom, and why?", a: "2/4", why: "Four equal parts make the whole, so 4 is the bottom. Two are shaded, so 2 is the top." },
  watch: "The bottom counts ALL the parts, not just the unshaded ones. One shaded out of three is 1/3, not 1/2.",
},
'fr.name': {
  fig: { kind: 'bar', d: 8, n: 3 },
  anchor: "Cut a pizza into 8 equal slices and take 3. You have three eighths — three of the pieces that eight of make a whole.",
  idea: "The bottom number says what SIZE the pieces are, by counting how many make one whole. The top number says how many of them you have.",
  steps: [
    { do: "Count all the equal parts in the whole. That is the bottom number.", why: "It names the size of one piece. More pieces means each is smaller." },
    { do: "Count the shaded parts. That is the top number." },
    { do: "Check the parts really are all the same size.", why: "Unequal pieces are not a fraction at all." },
  ],
  ex: {
    q: "Three parts are shaded out of eight. What fraction is that?",
    steps: [
      { do: "The whole is cut into 8 equal parts, so the bottom is 8.", why: "Each piece is one eighth of the whole." },
      { do: "3 of them are shaded, so the top is 3." },
      { do: "That is three eighths.", why: "Three pieces, each one eighth in size." },
    ],
    a: "3/8",
  },
  turn: { q: "Two parts shaded out of six. What fraction?", ask: "Which number goes on the bottom, and why?", a: "2/6", why: "Six equal parts make the whole, so 6 is the bottom. Two are shaded, so 2 is the top." },
  watch: "The bottom counts ALL the parts, not just the empty ones. And a bigger bottom number means smaller pieces: one eighth is less than one third.",
},
'fr.numline': {
  anchor: "A ruler is a number line with fractions on it. The little marks between the inches are fourths and eighths of an inch.",
  idea: "A fraction is a number, so it has a place on the line. Count the GAPS between whole numbers, not the tick marks.",
  steps: [
    { do: "Count how many equal steps it takes to get from 0 to 1. That is the bottom number.", why: "Count gaps, not ticks. Four gaps means fourths, even though there are five ticks." },
    { do: "Count the steps from 0 to the arrow. That is the top." },
    { do: "Past 1 the counting simply carries on." },
  ],
  ex: {
    q: "The arrow is 3 steps along, and 4 steps make one whole.",
    steps: [
      { do: "From 0 to 1 takes 4 steps, so these are fourths.", why: "Four gaps between 0 and 1." },
      { do: "The arrow is on the third step." },
      { do: "Three fourths." },
    ],
    a: "3/4",
  },
  turn: { q: "The arrow is 5 steps along, and 4 steps make one whole. What number is it on?", ask: "What happens past 1?", a: "5/4", why: "Five fourths — that is one whole and one more fourth, which is past the 1 on the line." },
  watch: "Count the GAPS, not the ticks. Four gaps between 0 and 1 means fourths, and there are five ticks including both ends.",
},
'fr.equiv': {
  fig: { kind: 'bar', d: 9, n: 6 },
  anchor: "Half a pizza and two quarters of the same pizza are the same amount of pizza. The slices are cut differently; the food is identical.",
  idea: "The same amount can be written many ways. Cutting every piece into more pieces changes both numbers but not the value.",
  steps: [
    { do: "Whatever you multiply the bottom by, multiply the top by the same.", why: "Cutting each piece in two doubles how many pieces there are AND how many you hold." },
    { do: "The value is unchanged — only the way it is written." },
  ],
  ex: {
    q: "2/3 = what over 9?",
    steps: [
      { do: "The bottom went from 3 to 9.", why: "Each of the three pieces was cut into three." },
      { do: "3 to 9 is multiplying by 3." },
      { do: "So the top must be multiplied by 3 too: 2 x 3 = 6.", why: "Each of your two pieces also became three pieces." },
      { do: "2/3 = 6/9." },
    ],
    a: "6/9",
  },
  turn: { q: "1/4 = what over 12?", ask: "What was the bottom multiplied by?", a: "3/12", why: "4 to 12 is times 3, so the top goes from 1 to 3." },
  watch: "Both numbers must change by the same multiplier. Changing only one changes the value — 2/3 is not 6/3.",
},
'fr.cmp.same': {
  fig: { kind: 'bar', d: 8, n: 5 },
  anchor: "Two people with slices from the same pizza. Same-size slices, so more slices is simply more.",
  idea: "When the bottom numbers match, the pieces are the same size, so you only have to compare how many.",
  steps: [
    { do: "Check the bottom numbers are the same.", why: "If they are not, the pieces are different sizes and this does not work." },
    { do: "Compare the top numbers." },
  ],
  ex: {
    q: "Which is greater, 3/8 or 5/8?",
    steps: [
      { do: "Both are eighths, so every piece is the same size." },
      { do: "5 pieces against 3 pieces." },
      { do: "5/8 is greater." },
    ],
    a: "5/8",
  },
  turn: { q: "Which is greater, 2/6 or 4/6?", ask: "Are the pieces the same size?", a: "4/6", why: "Both are sixths, so the pieces match, and 4 pieces beats 2." },
  watch: "This shortcut ONLY works when the bottoms match. With different bottoms the pieces are different sizes and counting them proves nothing.",
},
'fr.whole': {
  fig: { kind: 'bar', d: 5, n: 5 },
  anchor: "Cut a cake into eight slices and put every slice back. You have the whole cake — eight eighths.",
  idea: "When the top and bottom match, you have one whole. Two wholes takes twice as many pieces.",
  steps: [
    { do: "Ask how many pieces make one whole. That is the bottom number." },
    { do: "Multiply by how many wholes you need." },
  ],
  ex: {
    q: "How many fifths make 2 wholes?",
    steps: [
      { do: "Five fifths make one whole.", why: "Because the bottom number is 5." },
      { do: "Two wholes needs twice as many." },
      { do: "5 x 2 = 10 fifths." },
    ],
    a: "10",
  },
  turn: { q: "How many fourths make 3 wholes?", ask: "How many in one whole first?", a: "12", why: "Four fourths make one whole, so three wholes takes 4 x 3 = 12." },
  watch: "Ten fifths is not ten. It is two — two wholes, written in fifths.",
},
'fr.cmp.unlike': {
  anchor: "One third of a chocolate bar or three eighths of the same bar? You cannot tell by looking at the numbers, because the pieces are different sizes.",
  idea: "Different bottoms mean different-sized pieces, so the tops cannot be compared until the pieces match.",
  steps: [
    { do: "Find a bottom number both fit into." },
    { do: "Rewrite both fractions with it." },
    { do: "Now the pieces match, so compare the tops." },
  ],
  ex: {
    q: "Which is greater, 2/3 or 3/5?",
    steps: [
      { do: "3 and 5 both go into 15.", why: "Fifteenths will work for both." },
      { do: "2/3 = 10/15.", why: "Times 5 top and bottom." },
      { do: "3/5 = 9/15.", why: "Times 3 top and bottom." },
      { do: "10 fifteenths beats 9, so 2/3 is greater." },
    ],
    a: "2/3",
  },
  turn: { q: "Which is greater, 1/3 or 1/4?", ask: "Which has the smaller pieces?", a: "1/3", why: "A bigger bottom number means MORE pieces in the whole, so each one is smaller. One third is a bigger piece than one fourth." },
  watch: "A bigger bottom number means a SMALLER piece. One eighth is less than one third, even though 8 is more than 3.",
},
'fr.as.same': {
  fig: { kind: 'bar', d: 8, n: 5 },
  anchor: "Three eighths of a pizza and two eighths more. Same-size slices, so you just count slices: five of them.",
  idea: "With the same-size pieces, adding fractions is only counting how many you have. The bottom number never changes.",
  steps: [
    { do: "Check the bottoms match." },
    { do: "Add or subtract the TOPS only." },
    { do: "Keep the bottom exactly as it was.", why: "It names the size of the piece, and the pieces did not change size." },
  ],
  ex: {
    q: "What is 3/8 + 2/8?",
    steps: [
      { do: "Both are eighths." },
      { do: "Three eighths and two more eighths is five eighths.", why: "Counting pieces, not changing them." },
      { do: "The bottom stays 8." },
    ],
    a: "5/8",
  },
  turn: { q: "What is 5/6 - 2/6?", ask: "What happens to the bottom number?", a: "3/6", why: "Nothing happens to it. Five sixths take away two sixths leaves three sixths." },
  watch: "Do not add the bottoms. Three eighths plus two eighths is five EIGHTHS, not five sixteenths — adding the bottoms would make the pieces smaller, which makes no sense.",
},
'fr.as.unlike': {
  anchor: "Half a pizza plus a third of the same pizza. The slices are different sizes, so you have to recut them both the same way before you can count.",
  idea: "You cannot add until the pieces are the same size. Find a bottom number both fit into, rewrite both, then add the tops.",
  steps: [
    { do: "Find a number both bottoms divide into.", why: "Multiplying them together always works, even if it is not the smallest." },
    { do: "Rewrite both fractions with that bottom." },
    { do: "Add the tops. The bottom stays put." },
  ],
  ex: {
    q: "What is 1/2 + 1/3?",
    steps: [
      { do: "2 and 3 both go into 6.", why: "Sixths will work for both." },
      { do: "1/2 = 3/6.", why: "Times 3 top and bottom." },
      { do: "1/3 = 2/6.", why: "Times 2 top and bottom." },
      { do: "3/6 + 2/6 = 5/6." },
    ],
    a: "5/6",
  },
  turn: { q: "What is 1/4 + 1/2?", ask: "What bottom number works for both?", a: "3/4", why: "Both fit into fourths: 1/2 is 2/4, so 1/4 + 2/4 = 3/4." },
  watch: "Adding straight across gives 2/5 for 1/2 + 1/3, which is SMALLER than the half you started with. Adding cannot make things smaller — that is your check.",
},
'fr.simplify': {
  fig: { kind: 'bar', d: 18, n: 12 },
  anchor: "Six pieces out of eight, and every piece can be paired up: it is the same as three out of four. Fewer, bigger pieces, same amount.",
  idea: "Simplifying writes the same value with the smallest possible numbers.",
  steps: [
    { do: "Find the biggest number dividing both top and bottom." },
    { do: "Divide both by it." },
    { do: "Halving repeatedly works too, as long as both stay whole numbers." },
  ],
  ex: {
    q: "Simplify 12/18.",
    steps: [
      { do: "What divides both 12 and 18? 2, 3 and 6 all do." },
      { do: "The biggest is 6." },
      { do: "12 divided by 6 is 2; 18 divided by 6 is 3." },
      { do: "So 12/18 = 2/3.", why: "Same amount, fewer pieces." },
    ],
    a: "2/3",
  },
  turn: { q: "Simplify 8/12.", ask: "What divides both?", a: "2/3", why: "4 divides both: 8 divided by 4 is 2, and 12 divided by 4 is 3." },
  watch: "Dividing by a smaller factor is not wrong, just not finished. 12/18 to 6/9 is correct but can go further.",
},
'fr.mixed': {
  anchor: "Two whole pizzas and three quarters of a third. Or: count every quarter you have, which is eleven of them. Same food, two ways of saying it.",
  idea: "A mixed number is wholes plus a part. An improper fraction is the same amount counted entirely in pieces.",
  steps: [
    { do: "Multiply the whole number by the bottom.", why: "That is how many pieces the wholes are worth." },
    { do: "Add the top you already have." },
    { do: "Keep the same bottom.", why: "The piece size never changed." },
  ],
  ex: {
    q: "Write 2 and 3/4 as an improper fraction.",
    steps: [
      { do: "Each whole is 4 fourths, so 2 wholes is 2 x 4 = 8 fourths." },
      { do: "Add the 3 fourths you already have: 8 + 3 = 11." },
      { do: "The bottom stays 4." },
      { do: "So 11/4." },
    ],
    a: "11/4",
  },
  turn: { q: "Write 1 and 2/5 as an improper fraction.", ask: "How many fifths in one whole?", a: "7/5", why: "One whole is 5 fifths, plus the 2 you have, makes 7 fifths." },
  watch: "The bottom NEVER changes. Only the top grows, because you are counting the same-sized pieces.",
},
'fr.mult.whole': {
  fig: { kind: 'bar', d: 5, n: 2 },
  anchor: "Three helpings of two fifths each. You are taking two fifths, three times over.",
  idea: "Multiplying a fraction by a whole number is taking that many of them. The pieces do not change size, so the bottom does not change.",
  steps: [
    { do: "Multiply the TOP by the whole number." },
    { do: "Leave the bottom alone.", why: "The size of the piece is unchanged — you just have more of them." },
  ],
  ex: {
    q: "What is 3 x 2/5?",
    steps: [
      { do: "Three lots of two fifths." },
      { do: "2 + 2 + 2 = 6 fifths." },
      { do: "So 6/5, which is more than one whole.", why: "Six fifths is one whole and one fifth." },
    ],
    a: "6/5",
  },
  turn: { q: "What is 4 x 1/3?", ask: "Does the bottom change?", a: "4/3", why: "No. Four lots of one third is four thirds — one whole and one third." },
  watch: "Do not multiply the bottom. 3 x 2/5 is 6/5, not 6/15 — multiplying the bottom would make the pieces smaller, which is the opposite of what taking more of them does.",
},
'fr.mult.frac': {
  anchor: "Half of a third of a cake. You cut the third in two, and what you end up with is smaller than either piece you started with.",
  idea: "Multiplying fractions means taking a part OF a part, so the answer is smaller than both. Multiply the tops, multiply the bottoms.",
  steps: [
    { do: "Multiply the tops together." },
    { do: "Multiply the bottoms together.", why: "No common bottom needed — that is only for adding." },
    { do: "Simplify if you can." },
  ],
  ex: {
    q: "What is 2/3 x 3/4?",
    steps: [
      { do: "Tops: 2 x 3 = 6." },
      { do: "Bottoms: 3 x 4 = 12." },
      { do: "That gives 6/12." },
      { do: "6 and 12 both divide by 6, so it simplifies to 1/2." },
    ],
    a: "1/2",
  },
  turn: { q: "What is 1/2 x 1/3?", ask: "Is the answer bigger or smaller than a half?", a: "1/6", why: "Smaller. Half of one third is one sixth — taking part of a part always shrinks it." },
  watch: "No common denominator here. Finding one is for ADDING; multiplying goes straight across.",
},
'fr.div.unit': {
  anchor: "How many quarter-cups fit in three cups? Small scoops, so a lot of them — twelve.",
  idea: "Dividing by a fraction asks how many of those pieces fit inside. Small pieces mean many fit, so the answer gets BIGGER.",
  steps: [
    { do: "Ask how many of the fraction fit in ONE whole.", why: "That is just the bottom number." },
    { do: "Multiply by how many wholes there are." },
  ],
  ex: {
    q: "What is 3 divided by 1/4?",
    steps: [
      { do: "How many fourths in one whole? Four." },
      { do: "There are 3 wholes." },
      { do: "3 x 4 = 12.", why: "Twelve quarter-pieces fit into three wholes." },
    ],
    a: "12",
  },
  turn: { q: "What is 2 divided by 1/5?", ask: "How many fifths in one whole?", a: "10", why: "Five fifths in each whole, and two wholes, so ten." },
  watch: "Dividing makes the answer BIGGER here, which feels wrong until you picture the pieces. Twelve small scoops really do come out of three cups.",
},
'fr.div.frac': {
  anchor: "How many halves fit into three quarters? Once, with a bit left over. Flipping and multiplying is the shortcut for that question.",
  idea: "To divide by a fraction, keep the first, change the sign to multiply, and flip the second. Only the second one flips.",
  steps: [
    { do: "Keep the first fraction exactly as it is." },
    { do: "Change the divide sign to a multiply." },
    { do: "Flip the SECOND fraction upside down.", why: "Its top and bottom swap; the first one does not move." },
    { do: "Multiply straight across." },
  ],
  ex: {
    q: "What is 1/2 divided by 1/4?",
    steps: [
      { do: "Keep 1/2." },
      { do: "Change to multiply." },
      { do: "Flip 1/4 to 4/1." },
      { do: "1/2 x 4/1 = 4/2, which is 2.", why: "Two quarters fit into one half." },
    ],
    a: "2",
  },
  turn: { q: "What is 3/4 divided by 1/2?", ask: "Which fraction flips?", a: "3/2", why: "Only the second. 3/4 x 2/1 = 6/4, which simplifies to 3/2." },
  watch: "Only the SECOND fraction flips. Flipping both, or flipping the first, gives a different answer entirely.",
},

/* ══ DECIMALS, PERCENT & RATIO ══════════════════════════════════════════ */

'dp.tenths': {
  anchor: "A hundred square shaded in. Seven whole columns is seven tenths; seven little squares is seven hundredths. Same digits, very different amounts.",
  idea: "A decimal is another way of writing a fraction whose bottom is ten or a hundred. The point separates whole things from parts of one.",
  steps: [
    { do: "The first place after the point is tenths.", why: "One tenth is one column of the hundred square." },
    { do: "The second place is hundredths.", why: "One hundredth is one little square." },
    { do: "Read it aloud as a fraction and the digits tell you what to write." },
  ],
  ex: {
    q: "The whole square is 1, and 70 little squares are shaded. What decimal is that?",
    steps: [
      { do: "70 out of 100 little squares is 70 hundredths." },
      { do: "Written as a decimal: 0.70." },
      { do: "That is also 7 whole columns, which is 7 tenths, or 0.7.", why: "0.70 and 0.7 are the same amount." },
    ],
    a: "0.70",
  },
  turn: { q: "36 little squares out of 100 are shaded. What decimal?", ask: "How many hundredths?", a: "0.36", why: "36 hundredths, which is written 0.36." },
  watch: "0.7 and 0.70 are the same. Extra zeros on the END of a decimal add nothing — but a zero in the MIDDLE changes everything.",
},
'dp.dec.frac': {
  anchor: "Say the decimal out loud and you have already said the fraction. 'Thirty-six hundredths' IS 36 over 100.",
  idea: "Decimals and fractions are two spellings of the same number. The number of decimal places tells you the bottom.",
  steps: [
    { do: "Say it aloud: 'thirty-six hundredths'." },
    { do: "Write exactly what you said as a fraction.", why: "One decimal place is tenths; two places is hundredths." },
    { do: "Simplify." },
  ],
  ex: {
    q: "Write 0.36 as a fraction in its simplest form.",
    steps: [
      { do: "Two decimal places, so hundredths: 36/100.", why: "Say it aloud — 'thirty-six hundredths'." },
      { do: "What divides both 36 and 100? 4 does." },
      { do: "36 divided by 4 is 9; 100 divided by 4 is 25." },
      { do: "So 9/25." },
    ],
    a: "9/25",
  },
  turn: { q: "Write 0.5 as a fraction in its simplest form.", ask: "How many decimal places?", a: "1/2", why: "One place means tenths: 5/10. Both divide by 5, giving 1/2." },
  watch: "The number of decimal places gives the bottom. One place is tenths, two is hundredths — not the other way round.",
},
'dp.compare': {
  anchor: "0.4 and 0.35 written down: the second looks longer, so it looks bigger. Shade them on hundred squares and 0.4 is plainly more.",
  idea: "Compare decimals place by place from the LEFT, exactly like whole numbers. More digits does not mean bigger.",
  steps: [
    { do: "Compare the whole-number parts first." },
    { do: "Then the tenths." },
    { do: "Then the hundredths.", why: "Stop at the first difference." },
  ],
  ex: {
    q: "Which is greater, 0.4 or 0.35?",
    steps: [
      { do: "Whole parts: both 0." },
      { do: "Tenths: 4 against 3." },
      { do: "4 tenths beats 3 tenths, so 0.4 wins.", why: "Whatever comes after cannot make up a whole missing tenth." },
      { do: "Writing 0.4 as 0.40 makes it obvious: 40 hundredths against 35." },
    ],
    a: "0.4",
  },
  turn: { q: "Which is greater, 0.09 or 0.1?", ask: "Line up the tenths.", a: "0.1", why: "0.1 is one tenth; 0.09 is zero tenths and nine hundredths. Comparing tenths first: 1 beats 0." },
  watch: "Longer is not bigger. 0.35 has more digits than 0.4 and is smaller. Fill the short one with a zero and compare.",
},
'dp.addsub': {
  anchor: "Adding money: you line up the decimal points because dollars must go under dollars and cents under cents.",
  idea: "Adding decimals is ordinary column addition, as long as the POINTS line up. Fill any gaps with zeros.",
  steps: [
    { do: "Line up the decimal points, not the last digits.", why: "The point marks where the whole numbers end." },
    { do: "Fill any short numbers with zeros so the columns are full." },
    { do: "Add as usual, and bring the point straight down." },
  ],
  ex: {
    q: "What is 3.60 + 12.45?",
    steps: [
      { do: "Line up the points: 3.60 above 12.45." },
      { do: "Hundredths: 0 + 5 = 5." },
      { do: "Tenths: 6 + 4 = 10. Write 0, carry 1." },
      { do: "Ones: 3 + 2 + 1 carried = 6. Tens: 1." },
    ],
    a: "16.05",
  },
  turn: { q: "What is 2.5 + 0.75?", ask: "What do you fill the gap with?", a: "3.25", why: "Write 2.5 as 2.50 so both have two places. Then 2.50 + 0.75 = 3.25." },
  watch: "Lining up the right-hand ends instead of the points is what ruins this. 2.5 + 0.75 lined up wrongly gives 0.325 or 8.25.",
},
'dp.mult': {
  anchor: "0.3 of 0.4 is a part of a part, so it must come out smaller than either. That is your check before you place the point.",
  idea: "Multiply as if the points were not there, then count the decimal places in BOTH numbers and give the answer that many.",
  steps: [
    { do: "Ignore the points and multiply the digits." },
    { do: "Count the decimal places in both numbers you multiplied." },
    { do: "Give the answer that many places." },
  ],
  ex: {
    q: "What is 0.3 x 0.4?",
    steps: [
      { do: "Ignore the points: 3 x 4 = 12." },
      { do: "0.3 has one place; 0.4 has one place. One and one is two." },
      { do: "So the answer needs two decimal places: 0.12." },
      { do: "Check: a part of a part should be smaller than both, and 0.12 is." },
    ],
    a: "0.12",
  },
  turn: { q: "What is 0.5 x 0.2?", ask: "How many places altogether?", a: "0.10", why: "5 x 2 = 10, and two decimal places gives 0.10, which is one tenth." },
  watch: "Multiplying two numbers below 1 makes them SMALLER. If your answer got bigger, the point is in the wrong place.",
},
'dp.div': {
  anchor: "Sharing $8.40 between 4 people. You share the dollars, then the cents — and the point never moves.",
  idea: "Dividing a decimal by a whole number works exactly like ordinary division, with the point in the answer directly above the point in the number.",
  steps: [
    { do: "Put the point in the ANSWER first, straight above where it is.", why: "Placing it afterwards is much harder to get right." },
    { do: "Then divide as usual, digit by digit." },
  ],
  ex: {
    q: "What is 8.4 divided by 4?",
    steps: [
      { do: "Put the point in the answer above the point in 8.4." },
      { do: "8 divided by 4 is 2." },
      { do: "4 tenths divided by 4 is 1 tenth." },
      { do: "So 2.1." },
    ],
    a: "2.1",
  },
  turn: { q: "What is 6.9 divided by 3?", ask: "Where does the point go?", a: "2.3", why: "Straight above the point in 6.9. Then 6 divided by 3 is 2, and 9 tenths divided by 3 is 3 tenths." },
  watch: "Put the point in the answer BEFORE you start dividing. Trying to place it at the end is where the digits end up in the wrong columns.",
},
'dp.round': {
  anchor: "Same lamp-post question as with whole numbers, just further right along the line.",
  idea: "Rounding a decimal follows exactly the same rule: find the place, look at the ONE digit after it, 5 or more rounds up.",
  steps: [
    { do: "Find the place you are rounding to." },
    { do: "Look at the single digit just after it.", why: "Nothing further along has any say." },
    { do: "5 or more rounds up; then drop everything after." },
  ],
  ex: {
    q: "Round 3.472 to one decimal place.",
    steps: [
      { do: "One decimal place is the 4." },
      { do: "The digit just after it is 7.", why: "The 2 on the end does not matter." },
      { do: "7 is 5 or more, so the 4 rounds up to 5." },
      { do: "Drop the rest: 3.5." },
    ],
    a: "3.5",
  },
  turn: { q: "Round 5.128 to two decimal places.", ask: "Which digit decides?", a: "5.13", why: "Two places is the 2. The digit after it is 8, which is 5 or more, so the 2 becomes 3." },
  watch: "Only the very next digit decides. Looking at 3.472 for one place, the 7 decides and the 2 is irrelevant.",
},
'dp.percent': {
  anchor: "A test marked out of 100. Getting 40 right is 40 percent — percent literally means 'out of a hundred'.",
  idea: "Percent is a fraction with the bottom already decided. Percent, decimal and fraction are three spellings of one number.",
  steps: [
    { do: "Write the percent over 100." },
    { do: "Simplify." },
    { do: "The same number as a decimal is the percent divided by 100." },
  ],
  ex: {
    q: "Write 40% as a fraction in its simplest form.",
    steps: [
      { do: "40 percent means 40 out of 100: 40/100." },
      { do: "What divides both? 20 does." },
      { do: "40 divided by 20 is 2; 100 divided by 20 is 5." },
      { do: "So 2/5 — and as a decimal that is 0.4.", why: "All three say the same thing." },
    ],
    a: "2/5",
  },
  turn: { q: "Write 25% as a fraction in its simplest form.", ask: "What is 25 out of 100?", a: "1/4", why: "25/100, and both divide by 25, giving 1/4." },
  watch: "Worth knowing by heart: 50% is a half, 25% a quarter, 10% a tenth. Those three cover most of the percentages you meet.",
},
'dp.percent.of': {
  anchor: "A 25% discount is taking a quarter off. Knowing that 25% IS a quarter is faster than any calculation.",
  idea: "Finding a percent of something means taking that many hundredths of it. The common ones are easier as fractions.",
  steps: [
    { do: "Find 1% by dividing by 100." },
    { do: "Multiply by how many percent you need." },
    { do: "Or use the fraction if it is one of the easy ones.", why: "50% is a half, 25% a quarter, 10% a tenth." },
  ],
  ex: {
    q: "What is 25% of 80?",
    steps: [
      { do: "1% of 80 is 0.8.", why: "Divide by 100." },
      { do: "25 lots of 0.8 is 20." },
      { do: "Quicker: 25% is a quarter, and a quarter of 80 is 20.", why: "Same answer, far less work." },
    ],
    a: "20",
  },
  turn: { q: "What is 10% of 60?", ask: "Is there a shortcut?", a: "6", why: "10% is a tenth, so just divide by 10." },
  watch: "Learn 50%, 25% and 10% as fractions. Almost every real percentage you meet is built from those three.",
},
'dp.ratio': {
  anchor: "A recipe for two people, scaled up for six. Everything gets multiplied by three — the flour AND the eggs, or it is a different recipe.",
  idea: "A ratio compares two amounts. Equivalent ratios are the same comparison scaled up or down, and BOTH sides must scale by the same amount.",
  steps: [
    { do: "Work out what the first part was multiplied by." },
    { do: "Multiply the second part by the same." },
    { do: "Adding to both sides does NOT work.", why: "Adding changes the comparison; multiplying preserves it." },
  ],
  ex: {
    q: "2 : 3 = 8 : what?",
    steps: [
      { do: "The first part went from 2 to 8." },
      { do: "2 to 8 is multiplying by 4." },
      { do: "So the second part is 3 x 4 = 12." },
      { do: "2 : 3 = 8 : 12." },
    ],
    a: "12",
  },
  turn: { q: "3 : 5 = 12 : what?", ask: "What was the first part multiplied by?", a: "20", why: "3 to 12 is times 4, so 5 becomes 5 x 4 = 20." },
  watch: "ADDING the same to both sides does not keep a ratio. 2:3 is not the same as 8:9 — you must multiply.",
},
'dp.rate': {
  anchor: "Two shops selling the same thing in different pack sizes. The only way to compare is to work out what one costs in each.",
  idea: "A unit rate is the cost or amount for exactly ONE. It is what makes two different-sized deals comparable.",
  steps: [
    { do: "Divide the total by how many there were." },
    { do: "The answer is for one item, so it must be smaller than the total." },
  ],
  ex: {
    q: "5 apples cost $2.00. What does one cost?",
    steps: [
      { do: "Share $2.00 between 5 apples." },
      { do: "200 cents divided by 5 is 40 cents." },
      { do: "So 40 cents each.", why: "Smaller than the total, as it must be." },
    ],
    a: "$0.40",
  },
  turn: { q: "4 pens cost $3.00. What does one cost?", ask: "Divide which way round?", a: "$0.75", why: "300 cents divided by 4 is 75 cents. Divide the total BY the number of items." },
  watch: "Divide by the number of items, not the other way round. One apple costs less than the whole bag — if your answer is bigger, you divided backwards.",
},

/* ══ MEASUREMENT, TIME & MONEY ══════════════════════════════════════════ */

'mt.time.hour': {
  anchor: "Two hands going round at different speeds. The short one takes twelve hours to go round once; the long one does it in an hour.",
  idea: "The SHORT hand gives the hour, the LONG hand the minutes. At half past, the short hand sits between two numbers — and the hour is the one it has already passed.",
  steps: [
    { do: "Look at the SHORT hand first.", why: "The hour matters more than the minutes." },
    { do: "The hour is the number it has passed, not the one ahead.", why: "It creeps forward all hour, so it is only ON a number exactly on the hour." },
    { do: "Long hand at the top is o'clock; straight down is half past." },
  ],
  ex: {
    q: "The short hand is between 3 and 4, and the long hand points at 6.",
    steps: [
      { do: "The short hand has passed the 3 but not reached the 4." },
      { do: "So the hour is 3.", why: "The one it has passed." },
      { do: "The long hand pointing straight down means half past." },
      { do: "Half past three, written 3:30." },
    ],
    a: "3:30",
  },
  turn: { q: "Short hand just past 8, long hand at the top. What time?", ask: "Which number has the short hand passed?", a: "8:00", why: "It has passed the 8, so the hour is 8, and the long hand at the top means o'clock." },
  watch: "At half past, the short hand is BETWEEN two numbers. Reading the one ahead makes every half-past an hour late.",
},
'mt.time.5': {
  anchor: "The numbers on the face do two jobs. For the short hand a 3 means three o'clock; for the long hand it means fifteen minutes.",
  idea: "The long hand counts in FIVES round the face. Pointing at the 4 means twenty minutes, not four.",
  steps: [
    { do: "Read the hour from the short hand." },
    { do: "Count round in fives to the long hand.", why: "Each number is five minutes further on." },
  ],
  ex: {
    q: "The short hand is just past 8, the long hand points at 4.",
    steps: [
      { do: "The hour is 8.", why: "The short hand has passed it." },
      { do: "Count round in fives to the 4: five, ten, fifteen, twenty." },
      { do: "So twenty minutes past eight: 8:20." },
    ],
    a: "8:20",
  },
  turn: { q: "Short hand past 2, long hand on the 9. What time?", ask: "Count in fives.", a: "2:45", why: "Five, ten, fifteen, twenty, twenty-five, thirty, thirty-five, forty, forty-five. So 2:45." },
  watch: "Same number, two jobs. The long hand on the 4 is twenty minutes; the short hand on the 4 is four o'clock.",
},
'mt.time.min': {
  anchor: "Between the big numbers are little marks, one for each minute. Sixty of them go all the way round.",
  idea: "Count in fives to the nearest number, then single minutes from there. The closer the long hand gets to the top, the closer the hour is to changing.",
  steps: [
    { do: "Read the hour from the short hand." },
    { do: "Count in fives to the nearest number." },
    { do: "Then count single marks from there." },
  ],
  ex: {
    q: "Short hand just past 2, long hand two marks past the 7.",
    steps: [
      { do: "The hour is 2." },
      { do: "Fives to the 7: five, ten, fifteen, twenty, twenty-five, thirty, thirty-five." },
      { do: "Two more single marks: thirty-six, thirty-seven." },
      { do: "So 2:37." },
    ],
    a: "2:37",
  },
  turn: { q: "Short hand nearly at 5, long hand one mark before the 12. What time?", ask: "How close is the hour to changing?", a: "4:59", why: "The hour has not changed until the long hand reaches the top, so it is still 4 — 4:59, one minute to five." },
  watch: "The hour does not change until the long hand reaches the 12. At 4:59 the short hand is almost touching the 5, and it is still four o'clock.",
},
'mt.elapsed': {
  anchor: "Working out how long a car journey took. You count the whole hours first, then the odd minutes — you never count sixty minutes at a time.",
  idea: "Elapsed time is the gap between two times. Time counts in sixties, not hundreds, which is what makes it awkward.",
  steps: [
    { do: "Count on in whole hours as far as you can without overshooting." },
    { do: "Then count the extra minutes." },
    { do: "Going via the o'clock is easiest." },
  ],
  ex: {
    q: "How long from 2:40 to 4:10?",
    steps: [
      { do: "From 2:40, one hour on is 3:40. Another hour is 4:40 — too far.", why: "So less than two hours." },
      { do: "Go to the o'clock instead: 2:40 to 3:00 is 20 minutes." },
      { do: "3:00 to 4:00 is one hour." },
      { do: "4:00 to 4:10 is 10 minutes. So 1 hour 30 minutes." },
    ],
    a: "1 hour 30 minutes",
  },
  turn: { q: "How long from 9:50 to 11:20?", ask: "Go via the o'clock.", a: "1 hour 30 minutes", why: "9:50 to 10:00 is 10 minutes, 10:00 to 11:00 is an hour, 11:00 to 11:20 is 20. That is 1 hour 30." },
  watch: "Minutes roll over at 60, not 100. From 3:50, twenty minutes later is 4:10 — not 3:70.",
},
'mt.coins': {
  anchor: "Coins are worth what they are worth, and the size of the coin is no guide at all. A dime is smaller than a nickel and worth twice as much.",
  idea: "Each coin has a fixed value that has to be known by sight. There is no rule to work it out from.",
  steps: [
    { do: "Learn the four: penny 1, nickel 5, dime 10, quarter 25." },
    { do: "Size tells you nothing.", why: "The dime is the smallest and worth more than the nickel." },
  ],
  ex: {
    q: "How much is a dime worth?",
    steps: [
      { do: "A dime is the small silver coin." },
      { do: "It is worth 10 cents.", why: "Even though it is smaller than the nickel, which is worth 5." },
    ],
    a: "10 cents",
  },
  turn: { q: "How much is a quarter worth?", ask: "The biggest silver one.", a: "25 cents", why: "Four quarters make a dollar, which is why it is called a quarter." },
  watch: "Size is no guide. The dime is smaller than the nickel and worth twice as much.",
},
'mt.money.cnt': {
  anchor: "Emptying a pocket of change onto the table. You sort the big coins first and count on from there — nobody counts a handful of change in ones.",
  idea: "Counting money is adding different values, so sort biggest first and count on.",
  steps: [
    { do: "Sort the coins biggest first." },
    { do: "Start from the largest and count on.", why: "Counting on from 25 is quicker than counting up to it." },
  ],
  ex: {
    q: "A quarter, a dime and two pennies.",
    steps: [
      { do: "Start with the quarter: 25." },
      { do: "Add the dime: 35." },
      { do: "Add the two pennies: 36, 37." },
      { do: "37 cents." },
    ],
    a: "37 cents",
  },
  turn: { q: "Two dimes and a nickel. How much?", ask: "Start with the biggest.", a: "25 cents", why: "10, 20, then 25." },
  watch: "Count the VALUE, not the coins. Four coins can be worth 4 cents or 100 depending which four.",
},
'mt.money.chg': {
  anchor: "The shopkeeper counts up from the price to what you handed over, putting coins in your hand as they go. That is subtraction done forwards.",
  idea: "Change is the gap between the price and what you paid. Counting UP is easier than taking away, and it is how it is done in a shop.",
  steps: [
    { do: "Start at the price." },
    { do: "Count up to the next round amount." },
    { do: "Then up to what you handed over. Add the steps." },
  ],
  ex: {
    q: "You pay with $1.00 for something costing 65 cents.",
    steps: [
      { do: "Start at 65." },
      { do: "Up to 70 is 5 cents." },
      { do: "70 up to 100 is 30 cents." },
      { do: "5 and 30 makes 35 cents change." },
    ],
    a: "35 cents",
  },
  turn: { q: "You pay $1.00 for something costing 80 cents.", ask: "Count up.", a: "20 cents", why: "80 up to 100 is 20." },
  watch: "Counting up avoids borrowing entirely, which is why shopkeepers do it that way.",
},
'mt.money.dec': {
  anchor: "A receipt writes money with a point: dollars on the left, cents on the right. It is decimals, with a name you already know.",
  idea: "Money written with a point is just decimals. Cents carry at 100, not at 10.",
  steps: [
    { do: "Line up the decimal points." },
    { do: "Add the cents, then the dollars." },
    { do: "Every 100 cents becomes one dollar." },
  ],
  ex: {
    q: "What is $3.75 + $2.60?",
    steps: [
      { do: "Cents: 75 + 60 = 135." },
      { do: "135 cents is one dollar and 35 cents.", why: "Cents carry at 100." },
      { do: "Dollars: 3 + 2 = 5, plus the carried 1 makes 6." },
      { do: "So $6.35." },
    ],
    a: "$6.35",
  },
  turn: { q: "What is $2.50 + $1.75?", ask: "When do the cents carry?", a: "$4.25", why: "50 + 75 = 125 cents, which is $1.25. So one dollar carries: 2 + 1 + 1 = 4, and 25 cents left." },
  watch: "Cents carry at 100, not 10. 75 + 60 cents is $1.35, not $1.35 written as 135 cents in the cents column.",
},
'mt.len.cmp': {
  anchor: "Two pencils held side by side with their ends level. If they do not start level, the comparison means nothing.",
  idea: "To compare lengths fairly, everything must start from the same line. Then whichever reaches furthest is longest.",
  steps: [
    { do: "Line the starting ends up." },
    { do: "See which one reaches furthest." },
  ],
  ex: {
    q: "Three bars all starting from the same line.",
    steps: [
      { do: "They all start together on the left.", why: "So the comparison is fair." },
      { do: "Follow each one to its right-hand end." },
      { do: "Whichever ends furthest right is longest." },
    ],
    a: "The one reaching furthest",
  },
  turn: { q: "Two sticks, one starting further along than the other. Can you compare them by their right-hand ends?", ask: "What has to be true first?", a: "No", why: "They must start level first. Otherwise a shorter stick placed further along could look longer." },
  watch: "If they do not start level the comparison is meaningless. Line them up first, every time.",
},
'mt.len.inch': {
  anchor: "A ruler measures from the ZERO, not from the end of the plastic. There is usually a little gap before the 0 mark.",
  idea: "Line the left end of the object up with 0 and read the number at the other end.",
  steps: [
    { do: "Put the left end exactly on the 0.", why: "Not on the end of the ruler, and not on the 1." },
    { do: "Read the number at the right-hand end." },
  ],
  ex: {
    q: "A bar running from 0 to 7 on the ruler.",
    steps: [
      { do: "The left end sits on the 0." },
      { do: "Follow it to the right-hand end." },
      { do: "It lands on the 7, so it is 7 inches long." },
    ],
    a: "7 inches",
  },
  turn: { q: "A bar from 0 to 5. How long?", ask: "Where does it start?", a: "5 inches", why: "It starts at 0 and ends at 5, so it is 5 inches." },
  watch: "Starting at the 1 instead of the 0 makes everything an inch too short. Check the left end before reading the right.",
},
'mt.capacity': {
  anchor: "A gallon jug fills four quart bottles. Each quart fills two pints, and each pint fills two cups. It is bundling again, with liquid.",
  idea: "Each unit holds twice or four times the one below. Going to a SMALLER unit always gives you MORE of them.",
  steps: [
    { do: "2 cups make a pint; 2 pints make a quart; 4 quarts make a gallon." },
    { do: "Going smaller, multiply. Going bigger, divide." },
  ],
  ex: {
    q: "How many cups are in 3 pints?",
    steps: [
      { do: "One pint is 2 cups." },
      { do: "Three pints is 3 lots of 2." },
      { do: "3 x 2 = 6 cups.", why: "More cups than pints, because a cup is smaller." },
    ],
    a: "6 cups",
  },
  turn: { q: "How many quarts are in 2 gallons?", ask: "Bigger or smaller unit?", a: "8 quarts", why: "A quart is smaller than a gallon, so there are more of them: 2 x 4 = 8." },
  watch: "Going to a smaller unit gives MORE of them. If your number went down, you divided when you should have multiplied.",
},
'mt.convert': {
  anchor: "Twelve inches in a foot, sixteen ounces in a pound. Converting is asking how many of the small one make the big one, then scaling.",
  idea: "Find how many small units make one big unit. Going to smaller units, MULTIPLY. Going to bigger units, DIVIDE.",
  steps: [
    { do: "Find the conversion: how many small make one big." },
    { do: "Going to smaller units, multiply.", why: "More of them, because each is smaller." },
    { do: "Going to bigger units, divide." },
  ],
  ex: {
    q: "How many inches are in 4 feet?",
    steps: [
      { do: "One foot is 12 inches." },
      { do: "Inches are smaller than feet, so there will be more of them.", why: "So multiply." },
      { do: "4 x 12 = 48 inches." },
    ],
    a: "48 inches",
  },
  turn: { q: "How many feet are in 36 inches?", ask: "Which way this time?", a: "3 feet", why: "Feet are bigger, so there are fewer of them: divide. 36 divided by 12 is 3." },
  watch: "A bigger unit always gives a smaller number. If the number went the wrong way, you multiplied when you should have divided.",
},
'mt.perimeter': {
  anchor: "Putting a fence round a garden. You need the total length of all four sides — that is the perimeter.",
  idea: "Perimeter is the distance all the way round the outside. Add every side, including the ones not labelled.",
  steps: [
    { do: "Find the length of EVERY side.", why: "On a rectangle, opposite sides are equal, so two labels give you four sides." },
    { do: "Add them all up." },
  ],
  ex: {
    q: "A rectangle 5 by 3.",
    steps: [
      { do: "The four sides are 5, 3, 5 and 3.", why: "Opposite sides of a rectangle are equal." },
      { do: "5 + 3 + 5 + 3 = 16." },
      { do: "Or: 5 + 3 = 8, doubled is 16.", why: "Two long sides and two short ones." },
    ],
    a: "16",
  },
  turn: { q: "A rectangle 7 by 2. What is the perimeter?", ask: "How many sides are there?", a: "18", why: "Four sides: 7 + 2 + 7 + 2 = 18. Or (7 + 2) doubled." },
  watch: "A rectangle has FOUR sides. Adding only the two labelled ones gives half the answer.",
},
'mt.area.cnt': {
  anchor: "Tiling a floor. Area is how many tiles it takes to cover it, and you count them in rows rather than one at a time.",
  idea: "Area is how much surface is covered, counted in squares. Count one row, then multiply by the number of rows.",
  steps: [
    { do: "Count the squares in one row." },
    { do: "Count how many rows there are." },
    { do: "Multiply." },
  ],
  ex: {
    q: "A rectangle 4 squares across and 3 down.",
    steps: [
      { do: "One row holds 4 squares." },
      { do: "There are 3 rows." },
      { do: "4 x 3 = 12 squares." },
    ],
    a: "12 squares",
  },
  turn: { q: "A rectangle 5 across and 2 down. What is the area?", ask: "Rows times how many in each.", a: "10 squares", why: "5 in a row, 2 rows, so 10." },
  watch: "Perimeter is a walk round the edge; area is covering the inside. They answer different questions and give different numbers.",
},
'mt.area.form': {
  anchor: "Once you can see that area is rows of squares, you can stop counting and multiply. The formula is the shortcut for the tiling.",
  idea: "Area is length times width. To find a missing side, divide the area by the side you know.",
  steps: [
    { do: "Multiply the two sides for the area." },
    { do: "For a missing side, divide the area by the side you have.", why: "Because multiplying and dividing undo each other." },
    { do: "Area is measured in SQUARE units.", why: "You are counting squares." },
  ],
  ex: {
    q: "The area is 24 and one side is 6. What is the other side?",
    steps: [
      { do: "Something times 6 makes 24." },
      { do: "24 divided by 6 = 4." },
      { do: "So the other side is 4." },
      { do: "Check: 6 x 4 = 24." },
    ],
    a: "4",
  },
  turn: { q: "A rectangle 7 by 3. What is the area?", ask: "Multiply or divide?", a: "21", why: "Both sides are known, so multiply: 7 x 3 = 21 square units." },
  watch: "Area is in SQUARE units because you are counting squares. Perimeter is in plain units because you are walking a line.",
},
'mt.volume': {
  anchor: "Filling a box with sugar cubes. One layer covers the bottom; then you stack layers until it is full.",
  idea: "Volume is how much space something fills, counted in unit cubes. One layer, times the number of layers.",
  steps: [
    { do: "Multiply length by width to get ONE layer." },
    { do: "Multiply by the height for all the layers." },
    { do: "Volume is in CUBIC units.", why: "Three measurements multiplied, not two." },
  ],
  ex: {
    q: "A box 4 by 3 by 2.",
    steps: [
      { do: "One layer is 4 x 3 = 12 cubes.", why: "That covers the bottom." },
      { do: "The height is 2, so there are 2 layers." },
      { do: "12 x 2 = 24 cubes." },
    ],
    a: "24",
  },
  turn: { q: "A box 5 by 2 by 3. What is the volume?", ask: "One layer first.", a: "30", why: "One layer is 5 x 2 = 10, and there are 3 layers, so 30." },
  watch: "Volume needs THREE measurements multiplied. Multiplying only two gives you the area of one face.",
},
'mt.surface': {
  anchor: "Wrapping a present. You need enough paper to cover every face — and a box has six of them, in three matching pairs.",
  idea: "Surface area is the total of all the outside faces. Six faces in three matching pairs: find one of each pair, add, then double.",
  steps: [
    { do: "A box has 6 faces, in 3 matching pairs.", why: "Front matches back, top matches bottom, left matches right." },
    { do: "Find the area of one of each pair." },
    { do: "Add those three, then double." },
  ],
  ex: {
    q: "A box 3 by 2 by 4.",
    steps: [
      { do: "One pair of faces is 3 x 2 = 6." },
      { do: "Another pair is 2 x 4 = 8." },
      { do: "The last pair is 3 x 4 = 12." },
      { do: "6 + 8 + 12 = 26, doubled is 52.", why: "Because each of those has a matching one on the other side." },
    ],
    a: "52",
  },
  turn: { q: "A cube with edges of 2. What is its surface area?", ask: "How many faces, and how big is each?", a: "24", why: "Six faces, each 2 x 2 = 4. So 6 x 4 = 24." },
  watch: "Surface area covers the OUTSIDE and is in square units. Volume fills the inside and is in cubic units.",
},
'mt.area.tri': {
  anchor: "Draw a rectangle and cut it corner to corner. Each half is a triangle with the same base and height — and exactly half the area.",
  idea: "A triangle is half the rectangle it fits inside. A parallelogram is the whole of it. The height is the straight-up distance, not the slanted side.",
  steps: [
    { do: "For a parallelogram: base times height.", why: "Slide the slanted end across and it becomes a rectangle." },
    { do: "For a triangle: base times height, then halve." },
    { do: "Use the perpendicular height, not the slanted edge." },
  ],
  ex: {
    q: "A triangle with base 6 and height 4.",
    steps: [
      { do: "The rectangle round it would be 6 x 4 = 24." },
      { do: "The triangle is exactly half of that.", why: "Cut the rectangle corner to corner and you get two identical triangles." },
      { do: "24 divided by 2 = 12." },
    ],
    a: "12",
  },
  turn: { q: "A parallelogram with base 5 and height 3. What is the area?", ask: "Do you halve it?", a: "15", why: "No. A parallelogram is the whole rectangle, not half: 5 x 3 = 15." },
  watch: "The height is the straight-up distance between the base and the top, not the length of the slanted side.",
},

/* ══ GEOMETRY ═══════════════════════════════════════════════════════════ */

'geo.shapes2d': {
  anchor: "Trace round a shape with your finger and count the corners as you turn. The number of turns is the number of sides.",
  idea: "Flat shapes are named by how many straight sides they have. Counting sides and corners tells you which one it is.",
  steps: [
    { do: "Count the sides, going round once." },
    { do: "A shape has as many corners as sides." },
    { do: "Check whether the sides are all the same length.", why: "That is what separates a square from a rectangle." },
  ],
  ex: {
    q: "A shape with 6 straight sides.",
    steps: [
      { do: "Count round: six straight sides." },
      { do: "So six corners as well." },
      { do: "Six sides is a hexagon." },
    ],
    a: "Hexagon",
  },
  turn: { q: "A shape with 4 equal sides and 4 square corners. What is it?", ask: "How many sides, and are they equal?", a: "A square", why: "Four equal sides and four right angles. It is also a rectangle and a rhombus — those names all fit." },
  watch: "A square IS a rectangle — a rectangle with all four sides equal. The names overlap on purpose.",
},
'geo.shapes3d': {
  anchor: "A cereal box, a ball, an ice-cream cone. Solid shapes take up space, and you name them by their faces.",
  idea: "Solids are named by their faces and whether any surface is curved.",
  steps: [
    { do: "Look for flat faces and count them." },
    { do: "Look for any curved surface." },
    { do: "Check whether the flat faces are squares." },
  ],
  ex: {
    q: "A solid with 6 square faces.",
    steps: [
      { do: "Six faces, all flat." },
      { do: "Every face is a square." },
      { do: "That is a cube.", why: "A cube is the special box where every face is a square." },
    ],
    a: "Cube",
  },
  turn: { q: "A solid with one flat circular face and a curved surface coming to a point. What is it?", ask: "One flat face, one point.", a: "A cone", why: "The flat face is the circle at the bottom; the curved surface runs up to the tip." },
  watch: "A cube is a special rectangular prism — the one where every face is a square. Both names are true of it.",
},
'geo.sides': {
  anchor: "Put your finger on one corner and go round the shape once. Every time you turn, that is a corner, and every straight run between turns is a side.",
  idea: "A shape always has the same number of corners as sides. Start at a corner and mark it so you know when you have gone round once.",
  steps: [
    { do: "Start at one corner and mark it.", why: "So you know where you began." },
    { do: "Go round once, counting the sides." },
    { do: "The corners will come to the same number." },
  ],
  ex: {
    q: "A pentagon.",
    steps: [
      { do: "Start at a corner and go round." },
      { do: "Five straight sides." },
      { do: "And therefore five corners.", why: "Every side ends at a corner, and every corner starts a new side." },
    ],
    a: "5",
  },
  turn: { q: "How many corners does a hexagon have?", ask: "How many sides does it have?", a: "6", why: "Six sides, so six corners. They always match." },
  watch: "Losing your place going round is the only way to get this wrong. Mark your starting corner.",
},
'geo.partition': {
  anchor: "Cutting a sandwich for two people. Down the middle gives halves; corner to corner also gives halves — different shapes, same size.",
  idea: "Cutting a shape into equal parts is where fractions come from. Equal means equal in SIZE, not necessarily the same shape.",
  steps: [
    { do: "Count the pieces." },
    { do: "Check they are the same size.", why: "Not necessarily the same shape — a square cut corner to corner gives two equal triangles." },
  ],
  ex: {
    q: "A rectangle cut into 3 strips.",
    steps: [
      { do: "Count the strips: three." },
      { do: "They are all the same width, so the same size." },
      { do: "Three equal parts — each one is a third." },
    ],
    a: "3 equal parts",
  },
  turn: { q: "A square cut corner to corner. Are the two pieces equal?", ask: "Same shape, or same size?", a: "Yes", why: "They are both triangles of exactly the same size, so each is one half — even though they point different ways." },
  watch: "Equal parts must be the same SIZE. They can be different shapes and still be equal halves.",
},
'geo.quads': {
  anchor: "A square, a rectangle and a diamond all have four sides. What separates them is which sides are equal and whether the corners are square.",
  idea: "Every four-sided shape is a quadrilateral. Which one it is depends on the sides and the angles, and the names overlap.",
  steps: [
    { do: "Are all four sides equal?" },
    { do: "Are the corners square?" },
    { do: "Are opposite sides parallel?" },
  ],
  ex: {
    q: "Opposite sides equal and parallel, all four corners square.",
    steps: [
      { do: "Four square corners." },
      { do: "Opposite sides equal, but not all four the same." },
      { do: "That is a rectangle.", why: "If all four were equal it would also be a square." },
    ],
    a: "Rectangle",
  },
  turn: { q: "Four equal sides but no square corners. What is it?", ask: "Equal sides, slanted corners.", a: "A rhombus", why: "A rhombus is a pushed-over square: equal sides, but the corners are not right angles." },
  watch: "The names overlap deliberately. A square is a rectangle AND a rhombus AND a parallelogram, all at once.",
},
'geo.symmetry': {
  anchor: "Fold a shape along a line. If the two halves land exactly on each other with nothing sticking out, that line is a line of symmetry.",
  idea: "A line of symmetry folds the shape exactly onto itself. Every corner has to land on another corner.",
  steps: [
    { do: "Imagine folding along the line." },
    { do: "Check every corner lands on a corner.", why: "If anything sticks out, that line does not count." },
    { do: "Try each possible line." },
  ],
  ex: {
    q: "A rectangle.",
    steps: [
      { do: "Fold top to bottom: the two halves match.", why: "One line." },
      { do: "Fold left to right: they match too.", why: "Two lines." },
      { do: "Fold corner to corner: they do NOT match.", why: "The diagonal fold leaves corners hanging off." },
      { do: "So a rectangle has two." },
    ],
    a: "2",
  },
  turn: { q: "How many lines of symmetry does a square have?", ask: "Does the diagonal work this time?", a: "4", why: "Yes — on a square the diagonals DO fold exactly, so there are four: two through the sides and two through the corners." },
  watch: "A rectangle has two, not four. The diagonal fold only works when all four sides are equal.",
},
'geo.angles': {
  anchor: "The corner of a piece of paper is a right angle. Hold it against any corner and you can see at once whether that corner is smaller or bigger.",
  idea: "An angle measures a TURN. A right angle is a square corner — a quarter turn. The length of the arms makes no difference at all.",
  steps: [
    { do: "Compare the angle to a square corner." },
    { do: "Smaller than square is acute; bigger is obtuse." },
    { do: "Ignore how long the arms are.", why: "Only the opening between them counts." },
  ],
  ex: {
    q: "An angle noticeably smaller than a square corner.",
    steps: [
      { do: "Hold a square corner against it." },
      { do: "The angle opens less than the square corner does." },
      { do: "Less than a right angle is acute." },
    ],
    a: "Acute",
  },
  turn: { q: "An angle that opens more than a square corner but less than a straight line. What is it?", ask: "Compare it to a right angle.", a: "Obtuse", why: "Bigger than 90 degrees but less than 180." },
  watch: "Long arms do not make a big angle. Two short lines can make a wide angle and two long ones a narrow angle.",
},
'geo.lines': {
  anchor: "Railway tracks never meet — parallel. A road crossing them squarely is perpendicular. A road crossing at a slant just intersects.",
  idea: "Parallel lines never meet. Perpendicular lines cross at a square corner. Perpendicular lines ARE intersecting lines — a special kind.",
  steps: [
    { do: "Do they ever meet? If not, parallel." },
    { do: "Do they cross squarely? If so, perpendicular." },
    { do: "Crossing at any other angle is just intersecting." },
  ],
  ex: {
    q: "Two lines crossing at a square corner.",
    steps: [
      { do: "They do meet, so they are not parallel." },
      { do: "The corner where they cross is square." },
      { do: "So they are perpendicular.", why: "And also intersecting — perpendicular is a special kind of intersecting." },
    ],
    a: "Perpendicular",
  },
  turn: { q: "Two lines the same distance apart all the way along. What are they?", ask: "Will they ever meet?", a: "Parallel", why: "Staying the same distance apart means they never meet, however far you extend them." },
  watch: "Perpendicular lines are also intersecting lines. The names are not mutually exclusive.",
},
'geo.triangles': {
  anchor: "Triangles get sorted two ways at once: by their sides, and by their angles. A triangle can have a name from each list.",
  idea: "By sides: all three equal is equilateral, exactly two is isosceles, none is scalene. By angles: one right angle makes it a right triangle.",
  steps: [
    { do: "Compare the three side lengths." },
    { do: "Look for a square corner." },
    { do: "A triangle can have a name from both lists." },
  ],
  ex: {
    q: "A triangle with one square corner.",
    steps: [
      { do: "One corner is a right angle." },
      { do: "So it is a right triangle." },
      { do: "If two of its sides were also equal it would be a right isosceles triangle.", why: "Both names at once." },
    ],
    a: "Right",
  },
  turn: { q: "A triangle with all three sides the same length. What is it?", ask: "Sides or angles?", a: "Equilateral", why: "All three sides equal makes it equilateral — and all three angles are equal too, at 60 degrees each." },
  watch: "A triangle can carry two names at once, like right AND isosceles. The two lists ask different questions.",
},
'geo.anglerule': {
  anchor: "Two angles sitting together on a straight line always make a half turn between them. Knowing one gives you the other for free.",
  idea: "Angles that sit together add to a fixed total: 180 on a straight line, 90 in a square corner. Subtract to find the missing one.",
  steps: [
    { do: "Decide which total applies: a straight line is 180, a right angle 90.", why: "Getting this wrong is the whole difficulty." },
    { do: "Subtract the angle you were given." },
  ],
  ex: {
    q: "Two angles sit on a straight line, and one is 130 degrees.",
    steps: [
      { do: "A straight line is a half turn: 180 degrees." },
      { do: "The two angles together must make 180." },
      { do: "180 - 130 = 50." },
      { do: "Check: 130 + 50 = 180." },
    ],
    a: "50",
  },
  turn: { q: "Two angles make a right angle, and one is 35. What is the other?", ask: "Which total applies here?", a: "55", why: "A right angle is 90, so 90 - 35 = 55." },
  watch: "Check which total applies before subtracting. A straight line is 180; a square corner is only 90.",
},
'geo.coord': {
  anchor: "Finding a seat in a theatre: row and number. A coordinate is an address, and the order is agreed so everyone finds the same seat.",
  idea: "A coordinate is how far ACROSS, then how far UP. The order is fixed — across always comes first.",
  steps: [
    { do: "Count ACROSS from zero first." },
    { do: "Then count UP." },
    { do: "Write them in that order, in brackets.", why: "Along the corridor, then up the stairs." },
  ],
  ex: {
    q: "A dot 3 across and 5 up.",
    steps: [
      { do: "From 0, count 3 along the bottom." },
      { do: "Then count 5 upwards." },
      { do: "Written across-first: (3, 5)." },
    ],
    a: "(3, 5)",
  },
  turn: { q: "A dot 1 across and 4 up. What are its coordinates?", ask: "Which number comes first?", a: "(1, 4)", why: "Across first, always. (1, 4) and (4, 1) are different places on the grid." },
  watch: "(3, 5) and (5, 3) are different points. Along the corridor, then up the stairs.",
},
'geo.coord4': {
  anchor: "Extend the grid left and down past zero and you get four quadrants. Negative coordinates are just addresses on the other side.",
  idea: "Left of the middle line is a negative x. Below it is a negative y. The signs matter as much as the numbers.",
  steps: [
    { do: "Count across from zero: right is positive, left is negative." },
    { do: "Count up or down: up is positive, down is negative." },
    { do: "Across first, still." },
  ],
  ex: {
    q: "A dot 2 left and 4 down.",
    steps: [
      { do: "2 to the left of zero is -2." },
      { do: "4 below zero is -4." },
      { do: "Across first: (-2, -4)." },
    ],
    a: "(-2, -4)",
  },
  turn: { q: "A dot 3 right and 2 down. What are its coordinates?", ask: "Which one is negative?", a: "(3, -2)", why: "Right is positive so x is 3; down is negative so y is -2." },
  watch: "(2, -4) and (-2, 4) are completely different corners of the grid. The signs are not decoration.",
},

/* ══ DATA & GRAPHS ══════════════════════════════════════════════════════ */

'da.picture': {
  anchor: "A row of apple pictures, one for each apple. Counting the pictures counts the apples.",
  idea: "A picture graph shows amounts with one picture per thing. Find the right ROW first, then count.",
  steps: [
    { do: "Find the row the question names.", why: "Read the label — this is where it usually goes wrong." },
    { do: "Count the pictures in that row." },
  ],
  ex: {
    q: "The Cats row has 6 pictures.",
    steps: [
      { do: "Find the row labelled Cats.", why: "Not the first row, not the longest — the one named." },
      { do: "Count along it: six pictures." },
      { do: "One picture is one cat, so six cats." },
    ],
    a: "6",
  },
  turn: { q: "The Stars row has 4 pictures. How many stars?", ask: "Which row, and how many pictures?", a: "4", why: "Four pictures in the Stars row, one star each." },
  watch: "Read the LABEL first. Counting the wrong row gives a real number that answers a different question.",
},
'da.tally': {
  anchor: "Counting cars going past, you make a mark for each one and stroke through every fifth. Bundles of five are far easier to count than a row of single marks.",
  idea: "Tally marks are counted in fives. The stroke across is the FIFTH mark, not an extra one.",
  steps: [
    { do: "Count the bundles in fives." },
    { do: "Add on any loose marks." },
    { do: "A bundle is five, not six.", why: "The diagonal is the fifth mark, drawn across the other four." },
  ],
  ex: {
    q: "Three bundles and two single marks.",
    steps: [
      { do: "Three bundles, five each: 5, 10, 15." },
      { do: "Two loose marks left over." },
      { do: "15 + 2 = 17." },
    ],
    a: "17",
  },
  turn: { q: "Four bundles and one single mark. How many?", ask: "Count the bundles first.", a: "21", why: "Four fives is 20, plus one more is 21." },
  watch: "The diagonal stroke IS the fifth mark, not a sixth. A bundle is always exactly five.",
},
'da.bar': {
  anchor: "A bar graph turns numbers into heights so you can see at a glance which is biggest, without reading a single number.",
  idea: "Read a bar by following its top across to the scale. 'How many more' means read BOTH bars and subtract.",
  steps: [
    { do: "Find the bar the question names." },
    { do: "Follow its top across to the number scale." },
    { do: "For 'how many more', read both and subtract." },
  ],
  ex: {
    q: "How many more Stars than Cats?",
    steps: [
      { do: "Find the Stars bar and read its height off the scale." },
      { do: "Find the Cats bar and read that one too." },
      { do: "Subtract the smaller from the bigger.", why: "'How many more' is always a difference." },
    ],
    a: "The difference between them",
  },
  turn: { q: "A bar reaches halfway between 10 and 20 on the scale. What does it show?", ask: "What are the marks worth?", a: "15", why: "Halfway between 10 and 20 is 15. Check what each gridline is worth before reading." },
  watch: "'How many more' means subtract. Reading one bar answers a different question and is the commonest slip here.",
},
'da.scaled': {
  anchor: "When the numbers get big, drawing one picture per thing is silly. So one picture stands for five or ten, and the key tells you which.",
  idea: "One picture stands for several. Count the pictures, then MULTIPLY by what the key says.",
  steps: [
    { do: "Read the key first: how much is one picture worth?" },
    { do: "Count the pictures in the row." },
    { do: "Multiply." },
  ],
  ex: {
    q: "Each picture stands for 5, and a row has 4 pictures.",
    steps: [
      { do: "The key says one picture is 5." },
      { do: "Count the pictures: 4." },
      { do: "4 x 5 = 20.", why: "Twenty, not four." },
    ],
    a: "20",
  },
  turn: { q: "Each picture stands for 10, and a row has 3 pictures. How many?", ask: "What does the key say?", a: "30", why: "Three pictures, ten each, so 30." },
  watch: "Forgetting the key gives an answer far too small — you report the number of pictures instead of the number of things.",
},
'da.lineplot': {
  anchor: "Everyone in the class writes their height on a line, stacking a cross above their number. The tallest stack shows the commonest value.",
  idea: "A line plot stacks one mark per item above its value, so you can see where the data clusters.",
  steps: [
    { do: "Find the value on the line." },
    { do: "Count the marks stacked above it." },
  ],
  ex: {
    q: "Three crosses above the 2.",
    steps: [
      { do: "Find 2 on the number line." },
      { do: "Count the crosses stacked above it: three." },
      { do: "So three items had the value 2." },
    ],
    a: "3",
  },
  turn: { q: "Two crosses above the 5. How many items had that value?", ask: "Count the stack.", a: "2", why: "Two crosses means two items." },
  watch: "Count the MARKS, not the height of the stack measured against anything. Each mark is one item.",
},
'da.linegraph': {
  anchor: "A temperature chart through the day. The line between the points shows the trend — going up, going down, staying flat.",
  idea: "A line graph shows change over time. Go UP from the bottom axis to the line, then ACROSS to the scale.",
  steps: [
    { do: "Find the point on the bottom axis." },
    { do: "Go straight up to the line." },
    { do: "Read straight across to the scale on the left.", why: "Up then across — doing it the other way swaps the two numbers." },
  ],
  ex: {
    q: "What was the value at 4?",
    steps: [
      { do: "Find 4 along the bottom." },
      { do: "Go straight up until you hit the line." },
      { do: "Read across to the left-hand scale." },
    ],
    a: "The number on the scale",
  },
  turn: { q: "The line is halfway between 5 and 10 above the point 3. What is the value?", ask: "What is halfway?", a: "7.5", why: "Halfway between 5 and 10 is 7.5. Check what the gridlines are worth first." },
  watch: "Read UP from the bottom, then ACROSS to the left. Doing it the other way round answers a different question.",
},
'da.mean': {
  anchor: "Four children with different numbers of sweets pool them and share them out equally. What each ends up with is the mean.",
  idea: "The mean levels everything off. Add it all up, then share between how many there are.",
  steps: [
    { do: "Add every value." },
    { do: "Divide by HOW MANY values there are.", why: "Not by the biggest one, and not by the last one." },
    { do: "The mean always lands between the smallest and biggest.", why: "A useful check." },
  ],
  ex: {
    q: "What is the mean of 4, 8 and 6?",
    steps: [
      { do: "Add: 4 + 8 + 6 = 18." },
      { do: "There are 3 values." },
      { do: "18 divided by 3 = 6." },
      { do: "6 sits between 4 and 8, so it is believable." },
    ],
    a: "6",
  },
  turn: { q: "What is the mean of 2, 4, 6 and 8?", ask: "How many values?", a: "5", why: "They add to 20, and there are 4 of them, so 20 divided by 4 = 5." },
  watch: "Divide by HOW MANY there are. Dividing by the biggest value is a common slip and gives a nonsense answer.",
},
'da.mmr': {
  anchor: "Line everyone up by height. The person in the middle is the median. The gap between shortest and tallest is the range.",
  idea: "The median is the middle value ONCE THEY ARE IN ORDER. The range is biggest minus smallest.",
  steps: [
    { do: "Put the values in order first.", why: "This is not optional — the middle of an unsorted list is meaningless." },
    { do: "The median is the middle one." },
    { do: "The range is the biggest take away the smallest." },
  ],
  ex: {
    q: "Find the median of 7, 2, 9, 4, 5.",
    steps: [
      { do: "Put them in order: 2, 4, 5, 7, 9.", why: "This step is the whole job." },
      { do: "Five values, so the middle is the third." },
      { do: "The third one is 5." },
    ],
    a: "5",
  },
  turn: { q: "Find the range of 7, 2, 9, 4, 5.", ask: "Biggest and smallest.", a: "7", why: "Biggest is 9, smallest is 2, so the range is 9 - 2 = 7." },
  watch: "You MUST sort first for the median. The middle of the unsorted list is just whichever number happened to be written third.",
},
'da.prob': {
  anchor: "A bag with three red counters and five blue. Reaching in without looking, red is less likely — and 'how much less' is a fraction.",
  idea: "Probability counts the ways you can get what you want, out of ALL the ways anything can happen.",
  steps: [
    { do: "Count the ones you want. That is the top." },
    { do: "Count everything altogether. That is the bottom.", why: "Including the ones you want — it is the total, not the others." },
    { do: "Write it as a fraction and simplify." },
  ],
  ex: {
    q: "3 red counters out of 8 altogether.",
    steps: [
      { do: "Three are red, so the top is 3." },
      { do: "There are 8 counters in total, so the bottom is 8.", why: "All of them, red ones included." },
      { do: "So the chance is 3/8." },
    ],
    a: "3/8",
  },
  turn: { q: "2 green out of 10 counters. What is the chance of green?", ask: "What goes on the bottom?", a: "2/10", why: "The total, 10, goes on the bottom. That simplifies to 1/5." },
  watch: "The bottom is the TOTAL, including the ones you want. Three red out of eight is 3/8, not 3/5.",
},

/* ══ PATTERNS & ALGEBRA ═════════════════════════════════════════════════ */

'alg.pattern': {
  anchor: "A string of beads: red, blue, red, blue. Once you spot the repeating bit, you can say what colour any bead will be.",
  idea: "A repeating pattern has a UNIT that keeps coming round. Find the unit and you can carry on forever.",
  steps: [
    { do: "Find the shortest part that repeats.", why: "Look for the smallest one, not just the last thing you saw." },
    { do: "Work out where in the unit the pattern stopped." },
    { do: "Carry on from there." },
  ],
  ex: {
    q: "Circle, square, circle, square — what comes next?",
    steps: [
      { do: "The repeating unit is circle-square.", why: "Two items, then it starts again." },
      { do: "The pattern ended on a square, which is the end of the unit." },
      { do: "So the unit starts again: circle." },
    ],
    a: "Circle",
  },
  turn: { q: "Red, red, blue, red, red, blue — what comes next?", ask: "What is the repeating unit?", a: "Red", why: "The unit is red-red-blue, three long. It ended on blue, so the unit starts again with red." },
  watch: "Look for the SHORTEST repeating unit. Guessing from the last item alone gets it wrong whenever the unit is longer than two.",
},
'alg.equal': {
  anchor: "A balance scale with weights on both sides. The equals sign means the two sides weigh the same — not 'here comes the answer'.",
  idea: "The equals sign means 'the same as'. Both sides must balance, and it can be read in either direction.",
  steps: [
    { do: "Work out the left side." },
    { do: "Work out the right side." },
    { do: "Ask whether they are the same." },
  ],
  ex: {
    q: "Is 5 + 3 = 9 true?",
    steps: [
      { do: "Left side: 5 + 3 = 8." },
      { do: "Right side: 9." },
      { do: "8 and 9 are not the same, so the scale does not balance." },
      { do: "The statement is false." },
    ],
    a: "False",
  },
  turn: { q: "Is 4 + 2 = 2 + 4 true?", ask: "Work out both sides.", a: "True", why: "Left is 6, right is 6. Both sides weigh the same, so it balances." },
  watch: "The equals sign is a balance, not an arrow. 8 = 5 + 3 is just as correct as 5 + 3 = 8.",
},
'alg.pat.num': {
  anchor: "Stacking chairs: each one adds the same height. Knowing that step lets you work out any stack without counting.",
  idea: "A number pattern changes by the same amount each time. Finding that step is the whole job — and you must check it twice.",
  steps: [
    { do: "Subtract one term from the next to find the step." },
    { do: "Check the step against a SECOND pair.", why: "One pair could be a coincidence." },
    { do: "Add the step on." },
  ],
  ex: {
    q: "4, 9, 14, 19 — what comes next?",
    steps: [
      { do: "9 - 4 = 5.", why: "So the step might be 5." },
      { do: "Check: 14 - 9 = 5 as well.", why: "Two pairs agree, so the rule holds." },
      { do: "19 + 5 = 24." },
    ],
    a: "24",
  },
  turn: { q: "20, 17, 14, 11 — what comes next?", ask: "Is the step up or down?", a: "8", why: "17 - 20 is -3, so the pattern goes DOWN by 3 each time. 11 - 3 = 8." },
  watch: "Check the step between at least two pairs before trusting it. Patterns can go down as well as up.",
},
'alg.unknown': {
  anchor: "You know six bags hold 42 marbles altogether. How many in each bag? You undo the multiplying by dividing.",
  idea: "A missing number in a times or divide fact is found by doing the OPPOSITE operation. Multiplying and dividing undo each other.",
  steps: [
    { do: "Decide what is being done to the missing number." },
    { do: "Do the opposite to the other side." },
    { do: "Check by putting your answer back in." },
  ],
  ex: {
    q: "6 x what = 42?",
    steps: [
      { do: "The missing number is being multiplied by 6." },
      { do: "The opposite of multiplying by 6 is dividing by 6." },
      { do: "42 divided by 6 = 7." },
      { do: "Check: 6 x 7 = 42." },
    ],
    a: "7",
  },
  turn: { q: "What divided by 4 = 8?", ask: "Which operation undoes dividing?", a: "32", why: "Multiplying. If something divided by 4 gives 8, then 8 x 4 = 32." },
  watch: "Adding and subtracting undo each other, and so do multiplying and dividing. Picking the wrong one gives an answer that is wildly out.",
},
'alg.rule': {
  anchor: "A machine with a number going in and a different one coming out. Every number goes through the same machine, so one rule explains every row.",
  idea: "An input-output table hides one rule that every row obeys. Find it from one row, then TEST it on another.",
  steps: [
    { do: "Compare an input with its output." },
    { do: "Guess the rule." },
    { do: "Test it on a second row before trusting it.", why: "A rule that fits one row may fail the next." },
  ],
  ex: {
    q: "2 goes to 7, 3 goes to 8. What does 5 go to?",
    steps: [
      { do: "2 to 7 is adding 5.", why: "Or multiplying by 3.5 — which is why the check matters." },
      { do: "Test on the next row: 3 + 5 = 8. Correct.", why: "Adding 5 works for both, so that is the rule." },
      { do: "So 5 + 5 = 10." },
    ],
    a: "10",
  },
  turn: { q: "1 goes to 3, 2 goes to 6, 3 goes to 9. What does 5 go to?", ask: "Test your rule on a second row.", a: "15", why: "Times 3 fits every row: 1x3=3, 2x3=6, 3x3=9. So 5x3=15." },
  watch: "A rule that fits one row may fail the next. Always test on a second row — 2 to 7 could be 'add 5' or 'times 3.5'.",
},
'alg.express': {
  anchor: "A letter is a box waiting for a number. Once you know what goes in the box, everything else is arithmetic you can already do.",
  idea: "A letter stands for a number you do not know yet. Working out an expression means putting the number back in and following the order of operations.",
  steps: [
    { do: "Replace the letter with its value." },
    { do: "A number written against a letter means MULTIPLY.", why: "3n is 3 times n." },
    { do: "Follow the order of operations: multiply before adding." },
  ],
  ex: {
    q: "If n = 4, what is 3n + 2?",
    steps: [
      { do: "3n means 3 times n.", why: "The multiplication sign is left out, but it is there." },
      { do: "n is 4, so 3n is 3 x 4 = 12." },
      { do: "Then add 2: 12 + 2 = 14.", why: "Multiplying comes before adding." },
    ],
    a: "14",
  },
  turn: { q: "If n = 5, what is 2n - 3?", ask: "What does 2n mean?", a: "7", why: "2n is 2 x 5 = 10, then take away 3, giving 7." },
  watch: "3n means 3 times n, and the multiplying happens BEFORE the adding. Working left to right gives the wrong answer.",
},
'alg.solve1': {
  anchor: "A balance scale with an unknown weight on one side. Take the same amount off both pans and it still balances — that is how you find the unknown.",
  idea: "Solving means getting the letter alone by doing the SAME thing to both sides. Whatever you do to one side you must do to the other.",
  steps: [
    { do: "Decide what is being done to the letter." },
    { do: "Do the opposite — to BOTH sides.", why: "Only doing it to one side breaks the balance." },
    { do: "Check by putting your answer back in." },
  ],
  ex: {
    q: "Solve x + 7 = 12.",
    steps: [
      { do: "7 is being added to x." },
      { do: "The opposite is subtracting 7." },
      { do: "Take 7 off BOTH sides: x = 12 - 7.", why: "The scale stays balanced." },
      { do: "x = 5. Check: 5 + 7 = 12." },
    ],
    a: "5",
  },
  turn: { q: "Solve 3x = 12.", ask: "What is being done to x, and what undoes it?", a: "4", why: "x is multiplied by 3, so divide both sides by 3: x = 4. Check: 3 x 4 = 12." },
  watch: "Whatever you do to one side you must do to the other, or the balance breaks and the answer is wrong.",
},
'alg.inequal': {
  anchor: "A sign saying 'you must be over 12 to ride'. That is not one age — it is every age above twelve, and twelve itself does not count.",
  idea: "An inequality shows a RANGE of answers, not one. The circle says whether the end point is included.",
  steps: [
    { do: "An OPEN circle means that number is not included." },
    { do: "A FILLED circle means it is." },
    { do: "The line shows which way the answers go." },
  ],
  ex: {
    q: "An open circle at 3, with the line going right.",
    steps: [
      { do: "The circle is open, so 3 itself is not included." },
      { do: "The line goes right, so the answers are bigger than 3." },
      { do: "That is x > 3.", why: "Greater than, but not equal to." },
    ],
    a: "x > 3",
  },
  turn: { q: "A filled circle at 5, line going left. What inequality is that?", ask: "What does filled mean?", a: "x is less than or equal to 5", why: "Filled means 5 itself counts, and the line going left means smaller. So x is at most 5." },
  watch: "Open circle is > or <. Filled circle is the 'or equal to' version. The circle is the whole difference.",
},
'alg.varrel': {
  anchor: "The cost of apples depends on how many you buy. Change one and the other changes with it, by a fixed rule.",
  idea: "When two quantities change together, one depends on the other by a fixed rule. Find it and check it on every pair given.",
  steps: [
    { do: "Compare each pair to find the rule." },
    { do: "Check it against EVERY pair, not just the first." },
    { do: "Apply it to the value you were asked about." },
  ],
  ex: {
    q: "(1, 3), (2, 6), (3, 9). What is y when x is 5?",
    steps: [
      { do: "1 goes to 3 — that could be times 3, or add 2." },
      { do: "Check on the next pair: 2 goes to 6. Times 3 works; add 2 would give 4.", why: "So the rule is times 3." },
      { do: "Check the third: 3 x 3 = 9. Correct." },
      { do: "So when x is 5, y is 5 x 3 = 15." },
    ],
    a: "15",
  },
  turn: { q: "(1, 5), (2, 10), (3, 15). What is y when x is 4?", ask: "Test your rule on all three pairs.", a: "20", why: "Times 5 fits every pair, so 4 x 5 = 20." },
  watch: "Check the rule against every pair given. The first pair alone almost always allows more than one rule.",
},
};

// Not every skill needs a lesson of its own — a few are the same idea at a
// bigger size. These borrow the lesson of the skill they extend, so the child
// always gets teaching rather than a blank screen.
const LESSON_ALIAS = {
  'fr.mult.whole': 'fr.mult.whole',
};

function lessonFor(id) {
  return LESSONS[id] || LESSONS[LESSON_ALIAS[id]] || null;
}

(function (root) {
  root.LESSONS = LESSONS;
  root.lessonFor = lessonFor;
})(typeof globalThis !== 'undefined' ? globalThis : this);
