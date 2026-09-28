const BASE_URL = "https://words.dev-apis.com";

async function fetchWord(query = "") {
  const res = await fetch(`${BASE_URL}/word-of-the-day${query}`);
  const data = await res.json();
  return {
    word: data.word.toUpperCase(),
    puzzleNumber: data.puzzleNumber,
  };
}

export function fetchWordOfTheDay() {
  return fetchWord();
}

export function fetchRandomWord() {
  return fetchWord("?random=1");
}

// Not needed yet
export function fetchPuzzle(puzzleNumber) {
  return fetchWord(`?puzzle=${puzzleNumber}`);
}

export async function validateWord(word) {
  const res = await fetch(`${BASE_URL}/validate-word`, {
    method: "POST",
    body: JSON.stringify({ word }),
  });
  const data = await res.json();
  return data.validWord;
}

const PART_OF_SPEECH = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
};

export async function fetchDictionaryHint(word) {
  const target = word.toLowerCase();
  const res = await fetch(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(target)}&md=d&max=1`,
    { signal: AbortSignal.timeout(3000) },
  );
  if (!res.ok) {
    throw new Error("Dictionary request failed");
  }

  const data = await res.json();
  const entry = data[0];

  if (!entry || entry.word.toLowerCase() !== target) {
    throw new Error("No matching dictionary entry");
  }

  const [tag, definition] = (entry.defs?.[0] ?? "").split("\t");
  if (!definition) {
    throw new Error("No usable dictionary hint found");
  }

  const label = PART_OF_SPEECH[tag];
  return label ? `Hint (${label}): ${definition}` : `Hint: ${definition}`;
}
