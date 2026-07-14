import { store } from "./store.js";
import { ROUNDS } from "./constants.js";

const EMOJI = { correct: "🟩", close: "🟨", wrong: "⬛" };

export function buildShareText() {
  const header =
    store.mode === "daily"
      ? `Letter Rumble #${store.puzzleNumber} ${formatScore()}`
      : `Letter Rumble (practice) ${formatScore()}`;

  const grid = store.guesses
    .map((guess) => guess.statuses.map((status) => EMOJI[status]).join(""))
    .join("\n");

  return `${header}\n\n${grid}`;
}

function formatScore() {
  return store.result === "win"
    ? `${store.guesses.length}/${ROUNDS}`
    : `X/${ROUNDS}`;
}

export async function copyShareText() {
  const text = buildShareText();
  await navigator.clipboard.writeText(text);
  return text;
}
