import { store, subscribe } from "./store.js";
import { typeLetter, backspace, submitGuess } from "./game.js";
import { flashInvalidRow } from "./board.js";

export function initKeyboard({ keyboardEl, keyButtons, isInputBlocked }) {
  keyboardEl.addEventListener("click", (event) => {
    if (store.done || isInputBlocked()) return;

    const keyButton = event.target.closest(".key");
    if (!keyButton) return;

    const action = keyButton.dataset.key || keyButton.textContent.trim();
    handleAction(action);
    keyButton.blur();
  });

  document.addEventListener("keydown", (event) => {
    if (store.done || isInputBlocked()) return;
    handleAction(event.key);
  });

  subscribe((property) => {
    if (property === "keyStatuses") {
      paintKeys(keyButtons);
    }
  });
}

async function handleAction(action) {
  if (action === "Enter") {
    const result = await submitGuess();
    if (result.status === "invalid") {
      flashInvalidRow(store.currentRow);
    }
  } else if (action === "Backspace") {
    backspace();
  } else if (isLetter(action)) {
    typeLetter(action.toUpperCase());
  }
}

function paintKeys(keyButtons) {
  for (const button of keyButtons) {
    const keyValue = (
      button.dataset.key || button.textContent.trim()
    ).toUpperCase();
    const status = store.keyStatuses[keyValue];
    button.classList.remove("correct", "close", "wrong");
    if (status) {
      button.classList.add(status);
    }
  }
}

function isLetter(value) {
  return /^[a-zA-Z]$/.test(value);
}
