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

export async function fetchDictionaryHint(word) {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
  );
  if (!res.ok) {
    throw new Error("Dictionary request failed");
  }

  const data = await res.json();
  const meaning = data[0]?.meanings?.[0];
  const definition = meaning?.definitions?.[0]?.definition;

  if (definition) {
    return `Hint: ${definition}`;
  }

  const synonym = meaning?.synonym?.[0];
  if (synonym) {
    return `Hint: A related word is "${synonym}".`;
  }

  throw new Error("No usable dictionary hint found");
}
