import { store, subscribe } from "./store.js";
import { fetchDictionaryHint } from "./api.js";

const UNLOCK_AT_ROW = 3; //

export function initHints(button, messageEl) {
  updateButton(button);

  subscribe((property) => {
    if (
      property === "currentRow" ||
      property === "done" ||
      property === "hintUsed"
    ) {
      updateButton(button);
    }
    if (property === "hintText") {
      messageEl.textContent = store.hintText;
    }
  });

  button.addEventListener("click", () => giveHint(button));
}

function isUnlocked() {
  return store.currentRow >= UNLOCK_AT_ROW && !store.done && !store.hintUsed;
}

function updateButton(button) {
  if (store.hintUsed) {
    button.disabled = true;
    button.textContent = "Hint used";
  } else if (store.done) {
    button.disabled = true;
    button.textContent = "Hint unavailable";
  } else if (isUnlocked()) {
    button.disabled = false;
    button.textContent = "Hint";
  } else {
    button.disabled = true;
    button.textContent = "Hint (guess 5+)";
  }
}

async function giveHint(button) {
  if (!isUnlocked()) return;

  store.hintUsed = true;

  try {
    const hint = await fetchDictionaryHint(store.word);
    store.hintText = revealsWord(hint, store.word)
      ? getFallbackHint(store.word)
      : hint;
  } catch (error) {
    store.hintText = getFallbackHint(store.word);
  }
}

function revealsWord(hintText, word) {
  if (!hintText || !word) return false;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wholeWordPattern = new RegExp(`\\b${escaped}\\b`, "i");
  return wholeWordPattern.test(hintText);
}

function getFallbackHint(word) {
  const revealIndex = Math.floor(Math.random() * word.length);
  const revealLetter = word[revealIndex];
  const position = revealIndex + 1;
  return `Hint: The ${position}${getOrdinalSuffix(position)} letter is ${revealLetter}.`;
}

function getOrdinalSuffix(number) {
  if (number === 1) return "st";
  if (number === 2) return "nd";
  if (number === 3) return "rd";
  return "th";
}
