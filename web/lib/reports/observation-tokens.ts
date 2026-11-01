/**
 * Words that identify what a report note is about, for matching notes to resume
 * lines. Stop words and the vocabulary every critique uses are dropped, and words
 * are stemmed so "evaluated" and "evaluation" compare equal.
 */

const STOP_WORDS = new Set(`
a an the and or but if of to in on for with by at from as into onto about over under after before since than then
that this these those it its is are was were be been being has have had do does did done can could would should may
might will shall not no nor so such your you yours we our they their them he she his her i me my what which who whom
whose when where why how whether also more most less very just only each every any all some other another both
either one there here while within without across between through via per up out off again further once first second
itself themselves yourself myself himself herself ourselves
`.trim().split(/\s+/));

// Words every critique uses. Matching on them would tie unrelated lines together.
const REPORT_WORDS = new Set(`
bullet bullets line lines entry entries section sections resume resumes reviewer reviewers recruiter recruiters reader
readers readers work worked working experience experiences detail details example examples specific specifically
concrete show shows showing shown add adding added describe describes described explain explains explained name names
named identify identifies include includes included mention mentions clear clearer clearly unclear make makes making
help helps helped current currently wording result results contribution contributions contribute contributed
contributing personally task tasks role roles team teams part parts thing things way ways actual actually already
still yet stated state states given give gives leave leaving difficult easy easier hard harder picture assess
understand understanding broad broader general generic vague abstract approach used use using well like change changes
changed changing kind type types something someone
`.trim().split(/\s+/));

function isConsonant(word: string, index: number): boolean {
  const char = word[index];
  if ("aeiou".includes(char)) return false;
  if (char === "y") return index === 0 ? true : !isConsonant(word, index - 1);
  return true;
}

function measure(stem: string) {
  let count = 0;
  let index = 0;
  while (index < stem.length && isConsonant(stem, index)) index += 1;
  while (index < stem.length) {
    while (index < stem.length && !isConsonant(stem, index)) index += 1;
    if (index >= stem.length) break;
    while (index < stem.length && isConsonant(stem, index)) index += 1;
    count += 1;
  }
  return count;
}

function hasVowel(stem: string) {
  for (let index = 0; index < stem.length; index += 1) if (!isConsonant(stem, index)) return true;
  return false;
}

function endsWithDoubleConsonant(word: string) {
  const last = word.length - 1;
  return last > 0 && word[last] === word[last - 1] && isConsonant(word, last);
}

function endsConsonantVowelConsonant(word: string) {
  const last = word.length - 1;
  return last >= 2 && isConsonant(word, last - 2) && !isConsonant(word, last - 1)
    && isConsonant(word, last) && !"wxy".includes(word[last]);
}

function replaceSuffix(word: string, rules: Array<[string, string]>, minimumMeasure: number) {
  for (const [suffix, replacement] of rules) {
    if (!word.endsWith(suffix)) continue;
    const stem = word.slice(0, -suffix.length);
    return measure(stem) > minimumMeasure ? stem + replacement : word;
  }
  return word;
}

const STEP_2: Array<[string, string]> = [
  ["ational", "ate"], ["tional", "tion"], ["enci", "ence"], ["anci", "ance"], ["izer", "ize"], ["bli", "ble"],
  ["alli", "al"], ["entli", "ent"], ["eli", "e"], ["ousli", "ous"], ["ization", "ize"], ["ation", "ate"],
  ["ator", "ate"], ["alism", "al"], ["iveness", "ive"], ["fulness", "ful"], ["ousness", "ous"], ["aliti", "al"],
  ["iviti", "ive"], ["biliti", "ble"], ["logi", "log"],
];
const STEP_3: Array<[string, string]> = [
  ["icate", "ic"], ["ative", ""], ["alize", "al"], ["iciti", "ic"], ["ical", "ic"], ["ful", ""], ["ness", ""],
];
const STEP_4 = [
  "ement", "ance", "ence", "able", "ible", "ment", "ant", "ent", "ism", "ate", "iti", "ous", "ive", "ize", "ion",
  "al", "er", "ic", "ou",
];

/** Porter's stemmer, so "evaluated" and "evaluation" or "proposals" and "proposal" compare equal. */
export function stemWord(input: string) {
  // "mentorship" and "mentoring", "leadership" and "led by": the person, not the suffix, carries the meaning.
  let word = input.length > 7 && input.endsWith("ship") ? input.slice(0, -4) : input;
  if (word.length <= 2) return word;
  if (word.endsWith("sses") || word.endsWith("ies")) word = word.slice(0, -2);
  else if (word.endsWith("s") && !word.endsWith("ss")) word = word.slice(0, -1);

  let trimmed = false;
  if (word.endsWith("eed")) {
    if (measure(word.slice(0, -3)) > 0) word = word.slice(0, -1);
  } else if (word.endsWith("ed") && hasVowel(word.slice(0, -2))) {
    word = word.slice(0, -2);
    trimmed = true;
  } else if (word.endsWith("ing") && hasVowel(word.slice(0, -3))) {
    word = word.slice(0, -3);
    trimmed = true;
  }
  if (trimmed) {
    if (/(at|bl|iz)$/.test(word)) word += "e";
    else if (endsWithDoubleConsonant(word) && !/[lsz]$/.test(word)) word = word.slice(0, -1);
    else if (measure(word) === 1 && endsConsonantVowelConsonant(word)) word += "e";
  }
  if (word.endsWith("y") && hasVowel(word.slice(0, -1))) word = `${word.slice(0, -1)}i`;

  word = replaceSuffix(word, STEP_2, 0);
  word = replaceSuffix(word, STEP_3, 0);
  const suffix = STEP_4.find((candidate) => word.endsWith(candidate));
  if (suffix) {
    const stem = word.slice(0, -suffix.length);
    if (measure(stem) > 1 && (suffix !== "ion" || /[st]$/.test(stem))) word = stem;
  }
  if (word.endsWith("e")) {
    const stem = word.slice(0, -1);
    const value = measure(stem);
    if (value > 1 || (value === 1 && !endsConsonantVowelConsonant(stem))) word = stem;
  }
  if (word.endsWith("ll") && measure(word) > 1) word = word.slice(0, -1);
  return word;
}

export function observationTokens(text: string | null | undefined): Set<string> {
  const tokens = new Set<string>();
  const words = String(text || "")
    .toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .match(/\$?\d[\d.,]*[%km]?|[a-z][a-z'-]*[a-z]/g) || [];
  for (const raw of words) {
    if (/\d/.test(raw)) {
      tokens.add(raw.replace(/[.,]+$/, ""));
      continue;
    }
    for (const part of raw.replace(/'s$/, "").split("-")) {
      if (part.length < 3 || part.includes("'") || STOP_WORDS.has(part) || REPORT_WORDS.has(part)) continue;
      const token = stemWord(part);
      if (REPORT_WORDS.has(token)) continue;
      tokens.add(token);
    }
  }
  return tokens;
}
