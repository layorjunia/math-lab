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
  idea: 'Counting is saying the numbers in order, one for each thing. The next number is always one more than the one before it.',
  steps: ['Find the number you are starting from.', 'Say the next number after it, or the one just before it.'],
  ex: { q: 'What comes just after 13?', steps: ['Count from 13. The next number you say is 14.'], a: '14' },
  watch: 'The number you start on does not count as a step. Starting at 13 and taking one step lands on 14, not 15.',
},
'npv.teens': {
  idea: 'Every teen number is one ten and some ones. Thirteen is a ten and three more.',
  steps: ['Take one ten out of the number.', 'Whatever is left over is the ones.'],
  ex: { q: 'How many ones are in 16?', steps: ['16 is one ten and some ones.', 'Take the ten away: 16 take 10 is 6.'], a: '6' },
  watch: 'The word comes backwards from the digits. "Sixteen" says the six first, but it is written 1 then 6.',
},
'npv.count120': {
  idea: 'Counting past a hundred works exactly the same way. After 109 comes 110, and nothing changes about how you count.',
  steps: ['Start at the number given.', 'Count on by the step size, one jump at a time.'],
  ex: { q: 'Count on 10 from 87.', steps: ['Adding ten changes only the tens digit.', '8 tens becomes 9 tens, and the 7 stays.'], a: '97' },
  watch: 'Crossing a ten is where counting slips. After 99 comes 100, not 200.',
},
'npv.pv2': {
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
  idea: 'To compare two numbers, look at the biggest place first. Tens beat ones every time.',
  steps: ['Compare the tens digits.', 'If the tens are the same, compare the ones.', 'Point the arrow at the smaller number.'],
  ex: { q: 'Which sign goes between 38 and 51?', steps: ['Tens first: 3 tens against 5 tens.', '3 tens is less, so 38 is smaller.'], a: '38 < 51' },
  watch: 'The wide end of the sign faces the bigger number. The point faces the smaller one.',
},
'npv.skip': {
  idea: 'Skip counting is counting in equal jumps. It is the beginning of multiplying.',
  steps: ['Find the size of the jump.', 'Add that same amount each time.'],
  ex: { q: '15, 20, 25, then what?', steps: ['From 15 to 20 is a jump of 5.', 'Add 5 to 25.'], a: '30' },
  watch: 'Check the jump between two pairs, not just one, so you know the rule really holds.',
},
'npv.pv3': {
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
  idea: 'Comparing bigger numbers works the same way: start at the biggest place and move right until the digits differ.',
  steps: ['Compare the hundreds.', 'Same hundreds? Compare the tens.', 'Same tens? Compare the ones.'],
  ex: { q: 'Which is greater, 418 or 425?', steps: ['Hundreds are both 4.', 'Tens: 1 against 2. 2 is more.'], a: '425' },
  watch: 'Stop at the first column where they differ. Nothing further right can change the answer.',
},
'npv.evenodd': {
  idea: 'An even number can be split into two equal whole groups. An odd number always has one left over.',
  steps: ['Look only at the last digit.', '0, 2, 4, 6 or 8 means even. Anything else is odd.'],
  ex: { q: 'Is 74 even or odd?', steps: ['The last digit is 4.', '4 is one of the even digits.'], a: 'Even' },
  watch: 'Only the last digit matters. 73 is odd even though 7 and 3 are both odd digits — it is the 3 that decides.',
},
'npv.round10': {
  idea: 'Rounding replaces a number with a nearby tidy one. To the nearest ten means choosing whichever ten it is closest to.',
  steps: ['Find the two tens it sits between.', 'Look at the ones digit.', '5 or more rounds up. 4 or less stays.'],
  ex: { q: 'Round 47 to the nearest ten.', steps: ['47 sits between 40 and 50.', 'The ones digit is 7, which is 5 or more.'], a: '50' },
  watch: 'Look only at the digit immediately to the right of the place you are rounding to. Nothing further along matters.',
},
'npv.round100': {
  idea: 'Same idea, one column further left. To the nearest hundred you choose between the two hundreds it sits between.',
  steps: ['Find the two hundreds it sits between.', 'Look at the TENS digit.', '5 or more rounds up.'],
  ex: { q: 'Round 362 to the nearest hundred.', steps: ['362 sits between 300 and 400.', 'The tens digit is 6, which is 5 or more.'], a: '400' },
  watch: 'It is the tens digit that decides, not the ones. The 2 on the end never gets a vote.',
},
'npv.pv4': {
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
  idea: 'A number with more digits is always bigger. If they have the same number of digits, compare from the left.',
  steps: ['Count the digits. More digits wins.', 'Same count? Compare from the leftmost digit.'],
  ex: { q: 'Which is greater, 52,140 or 52,410?', steps: ['Both have five digits.', 'From the left: 5, 2 and 1 match... no — the third digit is 1 against 4.'], a: '52,410' },
  watch: 'Line them up in your head from the left, not the right.',
},
'npv.round.any': {
  idea: 'Rounding always works the same way whatever the place: look at the digit just to the right of it.',
  steps: ['Underline the place you are rounding TO.', 'Look at the digit immediately to its right.', '5 or more rounds up; everything to the right becomes zero.'],
  ex: { q: 'Round 6,482 to the nearest hundred.', steps: ['The hundreds digit is 4.', 'The digit to its right is 8, which is 5 or more.', 'So the 4 becomes 5 and the rest go to zero.'], a: '6,500' },
  watch: 'Rounding to the wrong place gives a perfectly sensible number that answers a different question.',
},
'npv.powers10': {
  idea: 'Multiplying by ten shifts every digit one column to the left. That is the whole of our number system in one move.',
  steps: ['To multiply by 10, shift the digits left and put a zero in the ones.', 'To divide by 10, shift them right.'],
  ex: { q: 'What is 10 to the power 3?', steps: ['That means three tens multiplied together: 10 x 10 x 10.', 'One followed by three zeros.'], a: '1,000' },
  watch: 'The power counts the ZEROS, not the total digits. 10 to the power 3 is 1000, which has four digits.',
},
'npv.integers': {
  idea: 'The number line does not stop at zero. Below it are the negative numbers, counting backwards.',
  steps: ['Picture the number line with zero in the middle.', 'Further RIGHT is always greater.'],
  ex: { q: 'Which is greater, -9 or -2?', steps: ['-9 is nine steps left of zero. -2 is only two steps left.', '-2 is further right.'], a: '-2' },
  watch: 'With negatives the bigger-looking digit is the smaller number. -9 is less than -2.',
},
'npv.abs': {
  idea: 'Absolute value is how far a number is from zero, ignoring which side it is on. Distance is never negative.',
  steps: ['Ignore the sign.', 'What is left is the distance from zero.'],
  ex: { q: 'What is the absolute value of -7?', steps: ['-7 is seven steps from zero.', 'Distance has no sign.'], a: '7' },
  watch: 'The opposite of a number and its absolute value are not the same. The opposite of 7 is -7; its absolute value is 7.',
},
'npv.exponents': {
  idea: 'An exponent is a shorthand for multiplying a number by itself. It counts how many copies, not what to multiply by.',
  steps: ['Read the small raised number as "how many copies".', 'Write them all out and multiply.'],
  ex: { q: 'What is 2 to the power 4?', steps: ['Four copies of 2: 2 x 2 x 2 x 2.', '2 x 2 = 4, x 2 = 8, x 2 = 16.'], a: '16' },
  watch: 'It is not the base times the exponent. 2 to the power 4 is 16, not 8.',
},

/* ══ ADDITION & SUBTRACTION ═════════════════════════════════════════════ */

'as.add10': {
  idea: 'Adding is putting two amounts together and counting how many there are altogether.',
  steps: ['Start from the bigger number.', 'Count on by the smaller one.'],
  ex: { q: 'What is 6 + 3?', steps: ['Start at 6.', 'Count on three: seven, eight, nine.'], a: '9' },
  watch: 'Counting on from the bigger number is fewer steps and fewer chances to slip.',
},
'as.sub10': {
  idea: 'Subtracting is taking some away, or finding the gap between two numbers.',
  steps: ['Start from the first number.', 'Count back by the second one.'],
  ex: { q: 'What is 9 - 4?', steps: ['Start at 9.', 'Count back four: eight, seven, six, five.'], a: '5' },
  watch: 'Order matters. 9 - 4 and 4 - 9 are not the same, unlike with adding.',
},
'as.bonds10': {
  idea: 'The pairs that make ten are worth knowing by heart. They make everything after this faster.',
  steps: ['Ask how many more are needed to fill a ten.', 'Count on from the number you have up to 10.'],
  ex: { q: '7 + what = 10?', steps: ['Count on from 7: eight, nine, ten.', 'That was three steps.'], a: '3' },
  watch: 'These come in pairs. If you know 7 and 3, you also know 3 and 7.',
},
'as.add20': {
  idea: 'When a sum goes past ten, make the ten first and then add what is left. This is the beginning of carrying.',
  steps: ['Fill up to ten first.', 'Add whatever is left over.'],
  ex: { q: 'What is 8 + 5?', steps: ['8 needs 2 more to make 10, so split the 5 into 2 and 3.', '8 + 2 = 10, and 3 left over.'], a: '13' },
  watch: 'Splitting the smaller number to fill a ten is faster and far more reliable than counting on your fingers.',
},
'as.sub20': {
  idea: 'Subtracting across ten works the same way in reverse: get down to ten first, then take the rest.',
  steps: ['Take away enough to land on ten.', 'Take away whatever is left.'],
  ex: { q: 'What is 15 - 7?', steps: ['15 down to 10 is 5, so split the 7 into 5 and 2.', '10 take away the other 2.'], a: '8' },
  watch: 'Landing on ten first is the trick. Counting back seven in one go is where mistakes creep in.',
},
'as.missadd': {
  idea: 'A missing addend asks what fills the gap. It is subtraction wearing a different hat.',
  steps: ['Count on from the number you have to the total.', 'The number of steps is the answer.'],
  ex: { q: '6 + what = 14?', steps: ['Count on from 6 to 14.', '6 to 10 is 4, and 10 to 14 is 4 more.'], a: '8' },
  watch: 'The answer is the GAP, not the total. It is smaller than the number on the right.',
},
'as.add2d.nr': {
  idea: 'Two-digit addition is just two small sums: add the ones, then add the tens.',
  steps: ['Line the numbers up from the right.', 'Add the ones column.', 'Add the tens column.'],
  ex: { q: 'What is 34 + 25?', steps: ['Ones: 4 + 5 = 9.', 'Tens: 3 + 2 = 5, which is 50.'], a: '59' },
  watch: 'Line up from the RIGHT. Ones under ones, tens under tens.',
},
'as.add2d.rg': {
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
  idea: 'Subtracting two-digit numbers is two small subtractions: the ones, then the tens.',
  steps: ['Line them up from the right.', 'Subtract the ones.', 'Subtract the tens.'],
  ex: { q: 'What is 68 - 23?', steps: ['Ones: 8 - 3 = 5.', 'Tens: 6 - 2 = 4, which is 40.'], a: '45' },
  watch: 'Always take the bottom number from the top one, never the other way round.',
},
'as.sub2d.rg': {
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
  idea: 'Adding ten or a hundred changes only one digit. Seeing that is much faster than working it out.',
  steps: ['Adding 10 changes only the tens digit.', 'Adding 100 changes only the hundreds digit.'],
  ex: { q: 'What is 462 + 100?', steps: ['Only the hundreds digit moves.', '4 hundreds becomes 5 hundreds.'], a: '562' },
  watch: 'When the digit is a 9 it rolls over. 195 + 10 is 205, not 105.',
},
'as.add3d': {
  idea: 'Three-digit addition is the same three steps, with one more column. Carrying works the same everywhere.',
  steps: ['Add the ones and carry if needed.', 'Add the tens and carry if needed.', 'Add the hundreds.'],
  ex: { q: 'What is 285 + 147?', steps: ['Ones: 5 + 7 = 12. Write 2, carry 1.', 'Tens: 8 + 4 = 12, plus 1 is 13. Write 3, carry 1.', 'Hundreds: 2 + 1 = 3, plus 1 is 4.'], a: '432' },
  watch: 'A carry can happen in more than one column, and each one has to be added in.',
},
'as.subzero': {
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
  idea: 'Estimating tells you roughly what the answer should be, so you notice when the exact one is wildly wrong.',
  steps: ['Round each number first.', 'Add the ROUNDED numbers, not the real ones.'],
  ex: { q: 'Estimate 47 + 38 to the nearest ten.', steps: ['47 rounds to 50. 38 rounds to 40.', '50 + 40.'], a: '90' },
  watch: 'The estimate is not meant to be the exact answer. Do not go back and correct it.',
},
'as.addmulti': {
  idea: 'However long the number, addition never changes: right to left, one column at a time, carrying when a column reaches ten.',
  steps: ['Line the numbers up from the right.', 'Work right to left, carrying as you go.'],
  ex: { q: 'What is 4,586 + 2,745?', steps: ['Ones: 6 + 5 = 11. Write 1, carry 1.', 'Tens: 8 + 4 = 12, plus 1 is 13. Write 3, carry 1.', 'Hundreds: 5 + 7 = 12, plus 1 is 13. Write 3, carry 1.', 'Thousands: 4 + 2 = 6, plus 1 is 7.'], a: '7,331' },
  watch: 'Long numbers are not harder, just longer. Keeping the columns straight is the whole job.',
},
'as.submulti': {
  idea: 'Long subtraction is the same borrowing you already know, repeated across more columns.',
  steps: ['Line them up from the right.', 'Work right to left, borrowing where the top digit is too small.'],
  ex: { q: 'What is 5,304 - 2,167?', steps: ['Ones: 4 is less than 7, borrow. 14 - 7 = 7.', 'Tens: 0 became 9 after the borrow chain. 9 - 6 = 3.', 'Hundreds: 2 (after lending) - 1 = 1.', 'Thousands: 5 - 2 = 3.'], a: '3,137' },
  watch: 'Cross out and rewrite every digit you change. Trying to hold the borrows in your head is where it falls apart.',
},
'as.integers': {
  idea: 'Adding moves right along the number line; subtracting moves left. Negative numbers just mean you start or move on the other side of zero.',
  steps: ['Start at the first number.', 'Adding a positive moves right; subtracting moves left.', 'Subtracting a NEGATIVE moves right — two minuses make a plus.'],
  ex: { q: 'What is -3 - (-8)?', steps: ['Taking away a negative is the same as adding.', 'So this is -3 + 8, which moves eight steps right from -3.'], a: '5' },
  watch: 'Two minus signs next to each other make a plus. Missing that flips the answer.',
},

/* ══ MULTIPLICATION & DIVISION ══════════════════════════════════════════ */

'md.groups': {
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
  idea: 'An array is rows and columns. It shows why the order of a times fact does not matter.',
  steps: ['Count the rows.', 'Count how many are in each row.', 'Multiply them.'],
  ex: { q: 'How many dots in 3 rows of 5?', steps: ['Three rows, five in each row.', 'Turn it on its side and it is five rows of three — same total.'], a: '15' },
  watch: 'Turning an array does not change how many dots there are. That is why 3 x 5 and 5 x 3 match.',
},
'md.f.2510': {
  idea: 'The two, five and ten times tables are the easy ones, and they cover nearly half the grid.',
  steps: ['Twos are doubles.', 'Tens are the digit with a zero after it.', 'Fives are half of the tens.'],
  ex: { q: 'What is 5 x 8?', steps: ['Ten eights is 80.', 'Five is half of ten, so halve it.'], a: '40' },
  watch: 'Fives always end in 0 or 5. If your answer does not, it is wrong.',
},
'md.f.34': {
  idea: 'Threes and fours build on what you have. Fours are just doubles of doubles.',
  steps: ['To multiply by 4, double twice.', 'To multiply by 3, double and add one more.'],
  ex: { q: 'What is 4 x 7?', steps: ['Double 7 is 14.', 'Double 14 is 28.'], a: '28' },
  watch: 'Doubling twice is not the same as doubling once. 4 x 7 is 28, not 14.',
},
'md.f.69': {
  idea: 'Nines have a pattern that does the work for you: the digits of every answer add up to nine.',
  steps: ['For nines, multiply by ten and take one lot away.', 'For sixes, double the threes.'],
  ex: { q: 'What is 9 x 6?', steps: ['Ten sixes is 60.', 'Take one six away.'], a: '54' },
  watch: 'Check a nine answer by adding its digits: 5 + 4 = 9. If it does not make 9, look again.',
},
'md.f.78': {
  idea: 'Sevens and eights are the last corner of the grid, and by now most of them you already know backwards from other tables.',
  steps: ['For eights, double three times.', 'For sevens, use the fives and add two more lots.'],
  ex: { q: 'What is 7 x 6?', steps: ['Five sixes is 30.', 'Two more sixes is 12.', '30 + 12.'], a: '42' },
  watch: 'There are only a handful of genuinely new facts here. Most of the grid you have met from the other side.',
},
'md.f.all': {
  idea: 'Fluency means the fact arrives without working it out. Speed comes from knowing, not from rushing.',
  steps: ['Say the whole fact, not just the answer.', 'If it does not come, use a fact you do know and adjust.'],
  ex: { q: 'What is 8 x 7?', steps: ['If it does not come straight away: 8 x 7 is 8 x 5 plus 8 x 2.', '40 + 16.'], a: '56' },
  watch: 'A neighbouring fact is the commonest slip: 8 x 7 = 56, and 8 x 8 = 64.',
},
'md.props': {
  idea: 'Three rules make multiplying easier: order does not matter, grouping does not matter, and you can split a number up.',
  steps: ['Swap the numbers round if it helps.', 'Split a hard number into two easy ones and multiply each.'],
  ex: { q: '6 x 8 using splitting', steps: ['Split the 8 into 5 and 3.', '6 x 5 = 30 and 6 x 3 = 18.', '30 + 18.'], a: '48' },
  watch: 'The parts you split into have to add back up to the number you started with.',
},
'md.div.f': {
  idea: 'Dividing asks how many equal groups fit. Every division fact is a times fact read backwards.',
  steps: ['Ask what times the divisor makes the number.', 'That is the answer.'],
  ex: { q: 'What is 42 divided by 6?', steps: ['Ask: six times what makes 42?', '6 x 7 = 42.'], a: '7' },
  watch: 'Unlike multiplying, order matters. 42 divided by 6 is not the same as 6 divided by 42.',
},
'md.div.rules': {
  idea: 'A few divisions have answers you can just know. Dividing by nothing is the one that has no answer at all.',
  steps: ['Anything divided by 1 is itself.', 'Anything divided by itself is 1.', 'Nothing can be divided by 0.'],
  ex: { q: 'What is 12 divided by 0?', steps: ['Ask how many groups of nothing make 12.', 'You could take groups of nothing forever and never get there.'], a: 'It has no answer' },
  watch: 'Dividing by zero is not zero. It is a question with no answer.',
},
'md.mult1d': {
  idea: 'To multiply a big number by a small one, multiply each digit in turn and carry, exactly like adding.',
  steps: ['Multiply the ones digit and carry if needed.', 'Multiply the tens digit and add the carry.', 'Keep going left.'],
  ex: { q: 'What is 34 x 6?', steps: ['Ones: 4 x 6 = 24. Write 4, carry 2.', 'Tens: 3 x 6 = 18, plus the carried 2 is 20.'], a: '204' },
  watch: 'Every digit gets multiplied. Doing only the ones gives an answer far too small.',
},
'md.mult2d': {
  idea: 'Multiplying by a two-digit number is two multiplications added together — one by the ones, one by the tens.',
  steps: ['Multiply by the ones digit.', 'Multiply by the tens digit, starting one column to the LEFT.', 'Add the two rows.'],
  ex: { q: 'What is 23 x 14?', steps: ['23 x 4 = 92.', '23 x 10 = 230.', '92 + 230.'], a: '322' },
  watch: 'The second row has to shift one place left, because you are multiplying by tens, not ones.',
},
'md.div2d': {
  idea: 'Dividing by a two-digit number is the same four steps as before — divide, multiply, subtract, bring down — with a bit of estimating to find each digit.',
  steps: ['Estimate how many times the divisor fits.', 'Multiply back and subtract.', 'Bring down the next digit and repeat.'],
  ex: { q: 'What is 736 divided by 23?', steps: ['23 into 73 goes about 3 times: 23 x 3 = 69. Take it off, leaving 4.', 'Bring down the 6 to make 46.', '23 into 46 goes exactly 2 times.'], a: '32' },
  watch: 'If a step leaves a number bigger than the divisor, your estimate was too low. Go up one and try again.',
},
'md.mult3d': {
  idea: 'Nothing new here — the same two rows, just longer numbers.',
  steps: ['Multiply by the ones.', 'Multiply by the tens, shifted one place left.', 'Add.'],
  ex: { q: 'What is 214 x 32?', steps: ['214 x 2 = 428.', '214 x 30 = 6,420.', '428 + 6,420.'], a: '6,848' },
  watch: 'Keep the columns lined up. One digit out of place changes the answer by thousands.',
},
'md.div1d': {
  idea: 'Long division works left to right: divide, multiply back, subtract, bring down the next digit.',
  steps: ['Divide into the leftmost digit.', 'Multiply back and subtract.', 'Bring down the next digit and repeat.', 'Whatever is left at the end is the remainder.'],
  ex: { q: 'What is 74 divided by 5?', steps: ['5 into 7 goes once, with 2 left over.', 'Bring down the 4 to make 24.', '5 into 24 goes 4 times, with 4 left over.'], a: '14 remainder 4' },
  watch: 'The remainder must always be SMALLER than what you are dividing by. If it is not, the answer can go up one.',
},
'md.factors': {
  idea: 'A factor divides into a number exactly. A prime has only two: one and itself.',
  steps: ['Try dividing by 2, then 3, then 5, then 7.', 'If nothing divides in exactly, it is prime.'],
  ex: { q: 'Is 21 prime or composite?', steps: ['2 does not go in. 3 does: 3 x 7 = 21.', 'So it has factors besides 1 and itself.'], a: 'Composite' },
  watch: 'You only have to test up to the square root. For 21, once you pass 4 you can stop.',
},
'md.primefact': {
  idea: 'Every whole number is built from primes multiplied together, and only one set of primes will do it.',
  steps: ['Divide by the smallest prime that fits.', 'Keep dividing the answer until only primes are left.'],
  ex: { q: 'What is the smallest prime factor of 45?', steps: ['2 does not divide 45.', '3 does: 45 = 3 x 15.'], a: '3' },
  watch: 'Test the primes in order: 2, 3, 5, 7, 11. Skipping one gives a factor that is not the smallest.',
},
'md.gcflcm': {
  idea: 'The greatest common factor is the biggest number that divides both. The lowest common multiple is the first number both count up to.',
  steps: ['For the GCF, list what divides each and take the biggest shared one.', 'For the LCM, count up in each until they meet.'],
  ex: { q: 'What is the GCF of 12 and 18?', steps: ['12 divides by 1, 2, 3, 4, 6, 12.', '18 divides by 1, 2, 3, 6, 9, 18.', 'The biggest they share is 6.'], a: '6' },
  watch: 'The GCF is never bigger than the smaller number. The LCM is never smaller than the bigger one.',
},
'md.orderops': {
  idea: 'When a sum has more than one operation, there is a fixed order. Without it the same sum would have different answers.',
  steps: ['Brackets first.', 'Then powers.', 'Then multiply and divide, left to right.', 'Then add and subtract, left to right.'],
  ex: { q: 'What is 3 + 4 x 5?', steps: ['Multiplication comes before addition, wherever it sits.', '4 x 5 = 20, then add 3.'], a: '23' },
  watch: 'Working left to right gives 35 here, and it is wrong. The order is not the order it is written in.',
},

/* ══ FRACTIONS ══════════════════════════════════════════════════════════ */

'fr.halves': {
  idea: 'A fraction is a whole thing cut into EQUAL parts. If the parts are not equal it is not a fraction at all.',
  steps: ['Count the parts.', 'Check they are all the same size.'],
  ex: { q: 'A circle cut into 4 equal parts', steps: ['Count round: one, two, three, four.', 'Each is the same size, so these are fourths.'], a: '4 equal parts' },
  watch: 'Equal means equal in SIZE, not just equal in number. Four uneven pieces are not fourths.',
},
'fr.thirds': {
  idea: 'The bottom number says how many equal parts the whole was cut into. The top says how many you have.',
  steps: ['Count all the parts. That is the bottom number.', 'Count the shaded ones. That is the top.'],
  ex: { q: 'One part shaded out of three', steps: ['Three equal parts altogether, so the bottom is 3.', 'One is shaded, so the top is 1.'], a: '1/3' },
  watch: 'The bottom counts ALL the parts, including the shaded ones — not just the empty ones.',
},
'fr.name': {
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
  idea: 'A fraction is a number, so it has a place on the number line — between the whole numbers.',
  steps: ['Count how many steps make ONE whole. That is the bottom number.', 'Count the steps from zero to the arrow. That is the top.'],
  ex: { q: 'The arrow is 3 steps along, where 4 steps make one whole', steps: ['Four steps to reach 1, so these are fourths.', 'The arrow is on the third step.'], a: '3/4' },
  watch: 'Count the steps between the whole numbers, not the tick marks. Four gaps means fourths, even though there are five ticks.',
},
'fr.equiv': {
  idea: 'The same amount can be written in different ways. Half a pizza and two quarters are the same pizza.',
  steps: ['Whatever you multiply the bottom by, multiply the top by the same.', 'The value has not changed — only how it is written.'],
  ex: { q: '2/3 = what over 9?', steps: ['The bottom went from 3 to 9, which is times 3.', 'So the top must be times 3 too: 2 x 3.'], a: '6/9' },
  watch: 'Both numbers have to change by the same multiplier. Changing only one changes the value.',
},
'fr.cmp.same': {
  idea: 'When the pieces are the same size, more pieces simply means more.',
  steps: ['Check the bottom numbers match.', 'Compare the top numbers.'],
  ex: { q: 'Which is greater, 3/8 or 5/8?', steps: ['Both are eighths, so the pieces are the same size.', '5 pieces beats 3.'], a: '5/8' },
  watch: 'This only works when the bottoms match. Otherwise the pieces are different sizes.',
},
'fr.whole': {
  idea: 'When the top and bottom are the same, you have one whole. Two wholes takes twice as many pieces.',
  steps: ['Ask how many pieces make one whole.', 'Multiply by how many wholes you need.'],
  ex: { q: 'How many fifths make 2 wholes?', steps: ['Five fifths make one whole.', 'Two wholes needs twice as many.'], a: '10' },
  watch: 'Ten fifths is not ten. It is two, written in fifths.',
},
'fr.cmp.unlike': {
  idea: 'Different bottoms mean different-sized pieces, so you cannot compare the tops until the pieces match.',
  steps: ['Rewrite both with the same bottom number.', 'Now compare the tops.'],
  ex: { q: 'Which is greater, 2/3 or 3/5?', steps: ['Use fifteenths: 2/3 is 10/15, and 3/5 is 9/15.', '10 fifteenths beats 9.'], a: '2/3' },
  watch: 'A bigger bottom number means SMALLER pieces. One eighth is less than one third.',
},
'fr.as.same': {
  idea: 'With the same-sized pieces, adding fractions is just adding how many you have.',
  steps: ['Check the bottoms match.', 'Add or subtract the tops.', 'Keep the bottom the same.'],
  ex: { q: 'What is 3/8 + 2/8?', steps: ['Both are eighths.', 'Three eighths and two more eighths is five eighths.'], a: '5/8' },
  watch: 'The bottom never changes. Three eighths plus two eighths is five EIGHTHS, not five sixteenths.',
},
'fr.as.unlike': {
  idea: 'Before you can add, the pieces have to be the same size. That means finding a common bottom number.',
  steps: ['Find a number both bottoms divide into.', 'Rewrite both fractions with it.', 'Add the tops.'],
  ex: { q: 'What is 1/2 + 1/3?', steps: ['Both 2 and 3 go into 6.', '1/2 is 3/6, and 1/3 is 2/6.', '3 sixths and 2 sixths.'], a: '5/6' },
  watch: 'Adding straight across gives 2/5 here, which is smaller than the 1/2 you started with. That is impossible.',
},
'fr.simplify': {
  idea: 'Simplifying writes a fraction with the smallest numbers that mean the same thing.',
  steps: ['Find the biggest number that divides both top and bottom.', 'Divide both by it.'],
  ex: { q: 'Simplify 12/18.', steps: ['6 divides both.', '12 divided by 6 is 2; 18 divided by 6 is 3.'], a: '2/3' },
  watch: 'Halving repeatedly gets there in the end, but only if both numbers stay whole.',
},
'fr.mixed': {
  idea: 'A mixed number is wholes plus a bit. An improper fraction is the same amount written entirely in pieces.',
  steps: ['Multiply the whole number by the bottom.', 'Add the top.', 'Keep the same bottom.'],
  ex: { q: 'Write 2 and 3/4 as an improper fraction.', steps: ['Two wholes is 2 x 4 = 8 fourths.', 'Add the 3 fourths you already have.'], a: '11/4' },
  watch: 'The bottom number never changes. Only the top grows.',
},
'fr.mult.whole': {
  idea: 'Multiplying a fraction by a whole number is just taking that many of them.',
  steps: ['Multiply the top by the whole number.', 'Leave the bottom alone.'],
  ex: { q: 'What is 3 x 2/5?', steps: ['Three lots of two fifths.', '2 + 2 + 2 = 6 fifths.'], a: '6/5' },
  watch: 'The bottom stays put. It names the size of the pieces, and the pieces have not changed size.',
},
'fr.mult.frac': {
  idea: 'Multiplying two fractions means taking a part OF a part, so the answer is smaller than both.',
  steps: ['Multiply the tops.', 'Multiply the bottoms.', 'Simplify if you can.'],
  ex: { q: 'What is 2/3 x 3/4?', steps: ['Tops: 2 x 3 = 6.', 'Bottoms: 3 x 4 = 12.', '6/12 simplifies.'], a: '1/2' },
  watch: 'No common bottom needed here — that is only for adding.',
},
'fr.div.unit': {
  idea: 'Dividing by a fraction asks how many of those pieces fit inside. Small pieces mean lots of them fit.',
  steps: ['Ask how many of the fraction fit into one whole.', 'Multiply by how many wholes there are.'],
  ex: { q: 'What is 3 divided by 1/4?', steps: ['Four quarters fit in one whole.', 'Three wholes holds three lots of four.'], a: '12' },
  watch: 'Dividing by a fraction makes the answer BIGGER. That feels wrong until you picture the pieces.',
},
'fr.div.frac': {
  idea: 'To divide by a fraction, flip it over and multiply. Flipping turns "how many fit" into a multiplication.',
  steps: ['Keep the first fraction.', 'Change divide to multiply.', 'Flip the second fraction upside down.'],
  ex: { q: 'What is 1/2 divided by 1/4?', steps: ['Keep 1/2, change to multiply, flip 1/4 to 4/1.', '1/2 x 4 = 4/2.'], a: '2' },
  watch: 'Only the SECOND fraction flips. Flipping both, or the first, gives a different answer.',
},

/* ══ DECIMALS, PERCENT & RATIO ══════════════════════════════════════════ */

'dp.tenths': {
  idea: 'A decimal is another way of writing a fraction whose bottom is ten or a hundred. The point separates whole things from parts.',
  steps: ['The first place after the point is tenths.', 'The second is hundredths.'],
  ex: { q: 'What decimal is 7 tenths?', steps: ['Tenths sit in the first place after the point.'], a: '0.7' },
  watch: 'A hundred-square shaded 70 out of 100 is 0.70, which is the same as 0.7.',
},
'dp.dec.frac': {
  idea: 'Decimals and fractions are two spellings of the same number. Read the decimal aloud and you have the fraction.',
  steps: ['Say it aloud: "thirty-six hundredths".', 'Write that as a fraction.', 'Simplify.'],
  ex: { q: 'Write 0.36 as a fraction.', steps: ['Two decimal places means hundredths, so 36/100.', 'Both divide by 4.'], a: '9/25' },
  watch: 'The number of decimal places tells you the bottom: one place is tenths, two is hundredths.',
},
'dp.compare': {
  idea: 'Comparing decimals is comparing place by place from the left, exactly like whole numbers.',
  steps: ['Compare the whole parts.', 'Then the tenths.', 'Then the hundredths.'],
  ex: { q: 'Which is greater, 0.4 or 0.35?', steps: ['Tenths: 4 against 3.', '4 tenths is more, whatever comes after.'], a: '0.4' },
  watch: 'More digits does not mean bigger. 0.35 is longer than 0.4 but smaller.',
},
'dp.addsub': {
  idea: 'Adding decimals is ordinary column addition, as long as the points line up.',
  steps: ['Line up the decimal points, not the last digits.', 'Fill any gaps with zeros.', 'Add as usual and bring the point straight down.'],
  ex: { q: 'What is 3.60 + 12.45?', steps: ['Line up the points.', 'Hundredths: 0 + 5 = 5. Tenths: 6 + 4 = 10, write 0 carry 1.', 'Ones: 3 + 2 + 1 = 6. Tens: 1.'], a: '16.05' },
  watch: 'Lining up the right-hand ends instead of the points is the mistake that ruins this.',
},
'dp.mult': {
  idea: 'Multiply decimals as if the points were not there, then put the point back in at the end.',
  steps: ['Ignore the points and multiply the digits.', 'Count the decimal places in BOTH numbers.', 'Give the answer that many places.'],
  ex: { q: 'What is 0.3 x 0.4?', steps: ['3 x 4 = 12.', 'One place in each number, so two places altogether.'], a: '0.12' },
  watch: 'Multiplying two numbers below one gives an even smaller answer. 0.3 x 0.4 is 0.12, not 1.2.',
},
'dp.div': {
  idea: 'Dividing a decimal by a whole number works exactly like ordinary division, with the point staying where it is.',
  steps: ['Put the point in the answer directly above where it is in the number.', 'Divide as usual.'],
  ex: { q: 'What is 8.4 divided by 4?', steps: ['Point goes above the point.', '8 divided by 4 is 2; 4 tenths divided by 4 is 1 tenth.'], a: '2.1' },
  watch: 'Put the point in the answer FIRST, before you start dividing. It is much harder to place afterwards.',
},
'dp.round': {
  idea: 'Rounding a decimal is the same rule as rounding a whole number, just further right.',
  steps: ['Find the place you are rounding to.', 'Look at the digit just after it.', '5 or more rounds up.'],
  ex: { q: 'Round 3.472 to one decimal place.', steps: ['One decimal place is the 4.', 'The digit after it is 7, which is 5 or more.'], a: '3.5' },
  watch: 'Only the very next digit decides. The 2 on the end has no say at all.',
},
'dp.percent': {
  idea: 'Percent means "out of a hundred". It is a fraction with the bottom already decided.',
  steps: ['Write the percent over 100.', 'Simplify.'],
  ex: { q: 'Write 40% as a fraction.', steps: ['40 out of 100.', 'Both divide by 20.'], a: '2/5' },
  watch: 'Percent, decimal and fraction are three ways to write the same thing: 40%, 0.4 and 2/5.',
},
'dp.percent.of': {
  idea: 'Finding a percent of something means taking that many hundredths of it.',
  steps: ['Find one percent by dividing by 100.', 'Multiply by how many percent you need.'],
  ex: { q: 'What is 25% of 80?', steps: ['One percent of 80 is 0.8.', '25 lots of 0.8 — or just take a quarter, since 25% is a quarter.'], a: '20' },
  watch: 'Some percents are worth knowing as fractions: 50% is a half, 25% a quarter, 10% a tenth.',
},
'dp.ratio': {
  idea: 'A ratio compares two amounts. Equivalent ratios are the same comparison scaled up or down.',
  steps: ['Work out what the first part was multiplied by.', 'Multiply the second part by the same.'],
  ex: { q: '2 : 3 = 8 : what?', steps: ['2 became 8, which is times 4.', 'So 3 becomes 3 x 4.'], a: '12' },
  watch: 'Both sides scale by the SAME amount. Adding the same to both changes the ratio.',
},
'dp.rate': {
  idea: 'A unit rate is the cost or amount for exactly one. It is what makes two different-sized deals comparable.',
  steps: ['Divide the total by how many there were.'],
  ex: { q: '5 apples cost $2.00. What does one cost?', steps: ['Share the $2.00 between 5.', '200 cents divided by 5.'], a: '$0.40' },
  watch: 'Divide by the number of items, not the other way round. One apple costs less than the lot.',
},

/* ══ MEASUREMENT, TIME & MONEY ══════════════════════════════════════════ */

'mt.time.hour': {
  idea: 'A clock has two hands doing different jobs. The short one tells you the hour, the long one the minutes.',
  steps: ['Look at the SHORT hand first. The hour is the number it has passed.', 'Long hand at the top is o\'clock; straight down is half past.'],
  ex: { q: 'Short hand between 3 and 4, long hand on the 6', steps: ['The short hand has passed the 3, so the hour is 3.', 'The long hand pointing down means half past.'], a: '3:30' },
  watch: 'At half past, the short hand sits BETWEEN two numbers. The hour is the one it has already gone past, not the one ahead.',
},
'mt.time.5': {
  idea: 'The long hand counts in fives round the face. Pointing at the 3 means fifteen minutes, not three.',
  steps: ['Read the hour from the short hand.', 'Count round in fives to the long hand.'],
  ex: { q: 'Short hand just past 8, long hand on the 4', steps: ['The hour is 8.', 'Count in fives to the 4: five, ten, fifteen, twenty.'], a: '8:20' },
  watch: 'The numbers on the face mean hours for one hand and fives for the other. Same number, two jobs.',
},
'mt.time.min': {
  idea: 'Between the numbers are small marks, one for each minute. Now every minute has a place.',
  steps: ['Read the hour from the short hand.', 'Count in fives to the nearest number, then single minutes.'],
  ex: { q: 'Short hand just past 2, long hand two marks past the 7', steps: ['The hour is 2.', 'Fives to the 7 is thirty-five, then two more marks.'], a: '2:37' },
  watch: 'The closer the long hand gets to the top, the closer the short hand gets to the NEXT hour. It has not arrived until the long hand reaches 12.',
},
'mt.elapsed': {
  idea: 'Elapsed time is the gap between two times. Time counts in sixties, not hundreds, which is what makes it awkward.',
  steps: ['Count on in whole hours first.', 'Then count the extra minutes.'],
  ex: { q: 'How long from 2:40 to 4:10?', steps: ['2:40 to 4:40 would be two hours — too far.', '2:40 to 4:00 is 1 hour 20 minutes.', 'Then 4:00 to 4:10 is 10 more.'], a: '1 hour 30 minutes' },
  watch: 'Minutes roll over at 60, not 100. From 3:50, twenty minutes later is 4:10.',
},
'mt.coins': {
  idea: 'Each coin is worth a fixed number of cents, and the size of the coin does not tell you which.',
  steps: ['Learn the four: penny 1, nickel 5, dime 10, quarter 25.'],
  ex: { q: 'How much is a dime worth?', steps: ['A dime is the small silver one.'], a: '10 cents' },
  watch: 'The dime is smaller than the nickel but worth twice as much. Size is no guide.',
},
'mt.money.cnt': {
  idea: 'Counting money means adding up different values, so start with the biggest and count on.',
  steps: ['Sort the coins biggest first.', 'Count on from the largest.'],
  ex: { q: 'A quarter, a dime and two pennies', steps: ['Start at 25.', 'Add the dime: 35.', 'Add two pennies: 37.'], a: '37 cents' },
  watch: 'Counting the COINS instead of their value is the classic slip. Four coins can be worth 4 cents or 100.',
},
'mt.money.chg': {
  idea: 'Change is the gap between what something cost and what you handed over.',
  steps: ['Count on from the price up to the amount you paid.'],
  ex: { q: 'A $1.00 note for something costing 65 cents', steps: ['65 up to 70 is 5 cents.', '70 up to 100 is 30 more.'], a: '35 cents' },
  watch: 'Counting on is easier than subtracting, and it is how a shopkeeper does it.',
},
'mt.money.dec': {
  idea: 'Money written with a point is just decimals: dollars before, cents after.',
  steps: ['Line up the decimal points.', 'Add as usual.', 'Every 100 cents becomes a dollar.'],
  ex: { q: 'What is $3.75 + $2.60?', steps: ['Cents: 75 + 60 = 135, which is one dollar and 35 cents.', 'Dollars: 3 + 2 + 1 carried.'], a: '$6.35' },
  watch: 'Cents carry at 100, not at 10. 75 + 60 cents is $1.35.',
},
'mt.len.cmp': {
  idea: 'To compare lengths fairly, everything has to start from the same line.',
  steps: ['Line the ends up.', 'See which reaches furthest.'],
  ex: { q: 'Three bars starting from the same line', steps: ['They all start together.', 'The one whose end is furthest along is longest.'], a: 'The longest is the one reaching furthest' },
  watch: 'If they do not start level, the comparison means nothing.',
},
'mt.len.inch': {
  idea: 'A ruler measures from ZERO, not from the end of the ruler.',
  steps: ['Put the left end of the object on the 0.', 'Read the number at the other end.'],
  ex: { q: 'A bar from 0 to 7 on the ruler', steps: ['It starts at zero.', 'The far end lands on 7.'], a: '7 inches' },
  watch: 'Starting at the 1 instead of the 0 makes everything an inch too short.',
},
'mt.capacity': {
  idea: 'Cups, pints, quarts and gallons each hold twice or four times the one before.',
  steps: ['2 cups make a pint.', '2 pints make a quart.', '4 quarts make a gallon.'],
  ex: { q: 'How many cups in 3 pints?', steps: ['Each pint is 2 cups.', 'Three pints is 3 lots of 2.'], a: '6 cups' },
  watch: 'Going to a smaller unit always gives you MORE of them.',
},
'mt.convert': {
  idea: 'Changing units means asking how many of the small one make the big one, then multiplying or dividing.',
  steps: ['Find how many small units make one big unit.', 'Going to smaller units, MULTIPLY.', 'Going to bigger units, DIVIDE.'],
  ex: { q: 'How many inches in 4 feet?', steps: ['One foot is 12 inches.', 'Inches are smaller, so multiply: 4 x 12.'], a: '48 inches' },
  watch: 'A bigger unit always gives a smaller number. If your answer went the wrong way, you have divided instead of multiplied.',
},
'mt.perimeter': {
  idea: 'Perimeter is the distance all the way round the outside — a walk round the edge.',
  steps: ['Find the length of every side.', 'Add them all up.'],
  ex: { q: 'A rectangle 5 by 3', steps: ['The four sides are 5, 3, 5 and 3.', '5 + 3 + 5 + 3.'], a: '16' },
  watch: 'A rectangle has FOUR sides. Adding only the two labelled ones gives half the answer.',
},
'mt.area.cnt': {
  idea: 'Area is how much surface something covers, counted in squares.',
  steps: ['Count the squares in one row.', 'Count the rows.', 'Multiply.'],
  ex: { q: 'A rectangle 4 squares across and 3 down', steps: ['Four in each row.', 'Three rows.'], a: '12 squares' },
  watch: 'Perimeter is a walk round the edge; area is covering the inside. They answer different questions.',
},
'mt.area.form': {
  idea: 'Once you can see the rows, you can stop counting: area is length times width.',
  steps: ['Multiply the two sides.', 'To find a missing side, divide the area by the side you know.'],
  ex: { q: 'Area 24, one side 6. What is the other?', steps: ['Something times 6 makes 24.', '24 divided by 6.'], a: '4' },
  watch: 'Area is measured in SQUARE units, because you are counting squares.',
},
'mt.volume': {
  idea: 'Volume is how much space something fills — how many unit cubes fit inside.',
  steps: ['Multiply length by width to get one layer.', 'Multiply by the height for all the layers.'],
  ex: { q: 'A box 4 by 3 by 2', steps: ['One layer is 4 x 3 = 12 cubes.', 'Two layers.'], a: '24' },
  watch: 'Volume is in CUBIC units. Three measurements multiplied, not two.',
},
'mt.surface': {
  idea: 'Surface area is the wrapping paper: the total of all the faces on the outside.',
  steps: ['A box has six faces, in three matching pairs.', 'Find the area of one of each pair.', 'Add them and double.'],
  ex: { q: 'A box 3 by 2 by 4', steps: ['Faces: 3x2=6, 2x4=8, 3x4=12.', '6 + 8 + 12 = 26.', 'Double for the matching pair of each.'], a: '52' },
  watch: 'Surface area covers the outside; volume fills the inside. One is squares, the other cubes.',
},
'mt.area.tri': {
  idea: 'A triangle is exactly half of the rectangle it fits inside. A parallelogram is the whole of it.',
  steps: ['For a parallelogram: base times height.', 'For a triangle: base times height, then halve.'],
  ex: { q: 'A triangle with base 6 and height 4', steps: ['The rectangle round it would be 6 x 4 = 24.', 'The triangle is half.'], a: '12' },
  watch: 'The height is the straight-up distance, not the slanted side.',
},

/* ══ GEOMETRY ═══════════════════════════════════════════════════════════ */

'geo.shapes2d': {
  idea: 'Flat shapes are named by how many straight sides they have.',
  steps: ['Count the sides.', 'Check whether the sides are all the same length.'],
  ex: { q: 'A shape with 6 straight sides', steps: ['Six sides and six corners.'], a: 'Hexagon' },
  watch: 'A square is a rectangle with all sides equal. Both names are true of it.',
},
'geo.shapes3d': {
  idea: 'Solid shapes take up space. They are named by their faces and whether any part is curved.',
  steps: ['Look for flat faces.', 'Look for curved surfaces.', 'Count the faces.'],
  ex: { q: 'A solid with 6 square faces', steps: ['All faces flat, all square, six of them.'], a: 'Cube' },
  watch: 'A cube is a special box where every face is a square.',
},
'geo.sides': {
  idea: 'A shape always has the same number of corners as sides.',
  steps: ['Count the sides, going round once.', 'The corners will match.'],
  ex: { q: 'A pentagon', steps: ['Five straight sides.', 'So five corners.'], a: '5' },
  watch: 'Going round twice, or losing your place, is the only way to get this wrong. Start at a corner and mark it.',
},
'geo.partition': {
  idea: 'Cutting a shape into equal parts is where fractions come from.',
  steps: ['Count the pieces.', 'Check they are all the same size.'],
  ex: { q: 'A rectangle cut into 3 strips', steps: ['Three pieces, all the same width.'], a: '3 equal parts' },
  watch: 'Equal parts do not have to be the same SHAPE — only the same size.',
},
'geo.quads': {
  idea: 'All four-sided shapes are quadrilaterals. Which one it is depends on the sides and angles.',
  steps: ['Are all four sides equal?', 'Are the corners square?', 'Are opposite sides parallel?'],
  ex: { q: 'Opposite sides equal and parallel, corners square', steps: ['Square corners and opposite sides equal.'], a: 'Rectangle' },
  watch: 'A square is a rectangle AND a rhombus. The names overlap on purpose.',
},
'geo.symmetry': {
  idea: 'A line of symmetry folds a shape exactly onto itself, with nothing sticking out.',
  steps: ['Imagine folding along the line.', 'Check every corner lands on another corner.'],
  ex: { q: 'A rectangle', steps: ['Fold top to bottom: it matches.', 'Fold left to right: it matches.', 'The diagonals do NOT match.'], a: '2' },
  watch: 'A rectangle has two, not four. The diagonal fold does not line up unless it is a square.',
},
'geo.angles': {
  idea: 'An angle measures a turn. A right angle is a square corner — a quarter turn.',
  steps: ['Compare it to a square corner.', 'Smaller is acute, bigger is obtuse.'],
  ex: { q: 'An angle noticeably smaller than a square corner', steps: ['It opens less than 90 degrees.'], a: 'Acute' },
  watch: 'The length of the arms makes no difference. Only the opening between them counts.',
},
'geo.lines': {
  idea: 'Parallel lines never meet. Perpendicular lines cross at a square corner.',
  steps: ['Do they ever meet? If not, parallel.', 'Do they cross squarely? If so, perpendicular.'],
  ex: { q: 'Two lines crossing at a square corner', steps: ['They meet, and the corner is square.'], a: 'Perpendicular' },
  watch: 'Perpendicular lines ARE intersecting lines — they are just a special kind.',
},
'geo.triangles': {
  idea: 'Triangles are sorted two ways: by their sides, and by their angles.',
  steps: ['All three sides equal is equilateral.', 'Exactly two equal is isosceles.', 'None equal is scalene.'],
  ex: { q: 'A triangle with one square corner', steps: ['One corner is 90 degrees.'], a: 'Right' },
  watch: 'A triangle can have two names at once, like right AND isosceles.',
},
'geo.anglerule': {
  idea: 'Angles that sit together add up to a fixed total, so knowing one gives you the other.',
  steps: ['On a straight line, the angles add to 180.', 'In a square corner, they add to 90.', 'Subtract to find the missing one.'],
  ex: { q: 'Two angles on a straight line, one is 130', steps: ['They add to 180.', '180 - 130.'], a: '50' },
  watch: 'Check which total applies — a straight line is 180, a square corner only 90.',
},
'geo.coord': {
  idea: 'A coordinate is an address on a grid: how far across, then how far up.',
  steps: ['Count ACROSS from zero first.', 'Then count UP.', 'Write them in that order, in brackets.'],
  ex: { q: 'A dot 3 across and 5 up', steps: ['Across is 3.', 'Up is 5.'], a: '(3, 5)' },
  watch: 'Along the corridor, then up the stairs. Across always comes first.',
},
'geo.coord4': {
  idea: 'Extending the grid below and left of zero gives negative coordinates, and four quadrants.',
  steps: ['Left of the middle line is negative across.', 'Below it is negative up.'],
  ex: { q: 'A dot 2 left and 4 down', steps: ['Left means negative: -2.', 'Down means negative: -4.'], a: '(-2, -4)' },
  watch: 'Signs are as important as the numbers. (2, -4) and (-2, 4) are different places.',
},

/* ══ DATA & GRAPHS ══════════════════════════════════════════════════════ */

'da.picture': {
  idea: 'A picture graph shows amounts with pictures, one for each thing counted.',
  steps: ['Find the row the question names.', 'Count the pictures in it.'],
  ex: { q: 'The Cats row has 6 pictures', steps: ['Find the Cats row.', 'Count along it.'], a: '6' },
  watch: 'Read the LABEL first. Counting the wrong row gives a real number to the wrong question.',
},
'da.tally': {
  idea: 'Tally marks are counted in fives. The fifth is drawn across the other four so bundles are easy to see.',
  steps: ['Count the bundles in fives.', 'Add on the loose marks.'],
  ex: { q: 'Three bundles and two singles', steps: ['Three fives is 15.', 'Two more.'], a: '17' },
  watch: 'The stroke across is the FIFTH mark, not an extra one. A bundle is five, not six.',
},
'da.bar': {
  idea: 'A bar graph shows amounts by height. Taller means more.',
  steps: ['Find the bar the question names.', 'Follow its top across to the scale.'],
  ex: { q: 'How many more Stars than Cats?', steps: ['Read both bars off the scale.', 'Subtract the smaller from the bigger.'], a: 'The difference between them' },
  watch: '"How many more" means subtract. Reading one bar answers a different question.',
},
'da.scaled': {
  idea: 'When the numbers get big, one picture stands for several. The key tells you how many.',
  steps: ['Read the key: how much is one picture worth?', 'Count the pictures.', 'Multiply.'],
  ex: { q: 'Each picture is 5. A row has 4 pictures.', steps: ['Four pictures.', 'Each worth 5.'], a: '20' },
  watch: 'Forgetting to multiply by the key gives an answer that is far too small.',
},
'da.lineplot': {
  idea: 'A line plot stacks a mark above each value, so you can see at a glance where most of the data sits.',
  steps: ['Find the value on the line.', 'Count the marks stacked above it.'],
  ex: { q: 'Three crosses above the 2', steps: ['Find 2 on the line.', 'Count up the stack.'], a: '3' },
  watch: 'Count the marks, not the height of the stack in units.',
},
'da.linegraph': {
  idea: 'A line graph shows how something changes. The line between points shows the trend.',
  steps: ['Find the point on the bottom axis.', 'Go straight up to the line.', 'Read across to the scale.'],
  ex: { q: 'The value at 4', steps: ['Find 4 along the bottom.', 'Go up to the line, then across.'], a: 'The number on the left scale' },
  watch: 'Read UP from the bottom axis, then ACROSS. Doing it the other way swaps the two numbers.',
},
'da.mean': {
  idea: 'The mean shares the total out equally. It is what everyone would have if it were all levelled off.',
  steps: ['Add every value.', 'Divide by how many values there are.'],
  ex: { q: 'The mean of 4, 8 and 6', steps: ['Add: 4 + 8 + 6 = 18.', 'Three values, so divide by 3.'], a: '6' },
  watch: 'Divide by HOW MANY there are, not by the biggest one.',
},
'da.mmr': {
  idea: 'The median is the middle value in order. The range is how spread out the data is.',
  steps: ['Put the values in order first.', 'The median is the middle one.', 'The range is biggest minus smallest.'],
  ex: { q: 'The median of 7, 2, 9, 4, 5', steps: ['In order: 2, 4, 5, 7, 9.', 'The middle one is the third.'], a: '5' },
  watch: 'You MUST sort first. The middle of the unsorted list is not the median.',
},
'da.prob': {
  idea: 'Probability counts the ways something can happen out of all the ways anything can happen.',
  steps: ['Count the ones you want.', 'Count everything altogether.', 'Write it as a fraction.'],
  ex: { q: '3 red out of 8 counters', steps: ['Three are red.', 'Eight altogether.'], a: '3/8' },
  watch: 'The bottom is the TOTAL, including the ones you want — not just the others.',
},

/* ══ PATTERNS & ALGEBRA ═════════════════════════════════════════════════ */

'alg.pattern': {
  idea: 'A repeating pattern has a unit that keeps coming round. Find the unit and you can carry on forever.',
  steps: ['Find the part that repeats.', 'Work out where in the unit the pattern has got to.'],
  ex: { q: 'Circle, square, circle, square, then what?', steps: ['The unit is circle-square.', 'It ended on a square, so the unit starts again.'], a: 'Circle' },
  watch: 'Look for the shortest repeating unit, not just the last thing you saw.',
},
'alg.equal': {
  idea: 'The equals sign means "the same as" — both sides balance. It does not mean "the answer is".',
  steps: ['Work out the left side.', 'Work out the right side.', 'Are they the same?'],
  ex: { q: 'Is 5 + 3 = 9 true?', steps: ['Left side: 5 + 3 = 8.', 'Right side: 9.', '8 and 9 are not the same.'], a: 'False' },
  watch: 'The equals sign is a balance, not an arrow. 8 = 5 + 3 is just as correct as 5 + 3 = 8.',
},
'alg.pat.num': {
  idea: 'A number pattern grows by the same amount each time. Finding that amount is the whole job.',
  steps: ['Subtract one term from the next to find the step.', 'Check the step is the same everywhere.', 'Add it on.'],
  ex: { q: '4, 9, 14, 19, then what?', steps: ['9 - 4 = 5, and 14 - 9 = 5. The step is 5.', 'Add 5 to 19.'], a: '24' },
  watch: 'Check the step between at least two pairs before you trust it.',
},
'alg.unknown': {
  idea: 'A missing number in a times or divide fact can be found by doing the opposite operation.',
  steps: ['Ask what times the number you have makes the total.', 'Or divide the total by the number you have.'],
  ex: { q: '6 x what = 42?', steps: ['Divide to undo the multiply.', '42 divided by 6.'], a: '7' },
  watch: 'Multiplying and dividing undo each other, the way adding and subtracting do.',
},
'alg.rule': {
  idea: 'An input-output table hides a rule. Every row obeys the same one.',
  steps: ['Compare an input with its output.', 'Test your rule on a second row before trusting it.'],
  ex: { q: '2 goes to 7, 3 goes to 8, 5 goes to what?', steps: ['2 to 7 is add 5. Check: 3 to 8 is also add 5.', 'So 5 goes to 10.'], a: '10' },
  watch: 'A rule that fits one row may fail the next. Always check a second row.',
},
'alg.express': {
  idea: 'A letter stands for a number you do not know yet. Working out an expression means putting the number back in.',
  steps: ['Replace the letter with its value.', 'Follow the order of operations.'],
  ex: { q: 'If n = 4, what is 3n + 2?', steps: ['3n means 3 times n, so 3 x 4 = 12.', 'Then add 2.'], a: '14' },
  watch: 'A number written against a letter means multiply, and it happens BEFORE adding.',
},
'alg.solve1': {
  idea: 'Solving an equation means getting the letter alone, by doing the same thing to both sides.',
  steps: ['Decide what is being done to the letter.', 'Do the opposite, to BOTH sides.'],
  ex: { q: 'Solve x + 7 = 12', steps: ['7 is being added to x.', 'Take 7 off both sides: x = 12 - 7.'], a: '5' },
  watch: 'Whatever you do to one side you must do to the other, or the balance breaks.',
},
'alg.inequal': {
  idea: 'An inequality shows a whole range of answers, not just one. The circle says whether the end point is included.',
  steps: ['An OPEN circle means that number is not included.', 'A FILLED circle means it is.', 'The line shows which way the answers go.'],
  ex: { q: 'Open circle at 3, line going right', steps: ['Open means 3 itself is not included.', 'The line goes right, so the answers are bigger.'], a: 'x > 3' },
  watch: 'Open circle is > or <. Filled circle is the "or equal to" version.',
},
'alg.varrel': {
  idea: 'When two quantities change together, one depends on the other by a fixed rule.',
  steps: ['Find the rule connecting the pairs.', 'Apply it to the value you were given.'],
  ex: { q: '(1, 3), (2, 6), (3, 9). What is y when x is 5?', steps: ['Each y is 3 times its x.', '5 x 3.'], a: '15' },
  watch: 'Check the rule against every pair given, not just the first.',
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
