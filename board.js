import { store, subscribe } from "./store.js";
import { ANSWER_LENGTH, ROUNDS } from "./constants.js";

let boardContainer = null;

export function renderBoard(container) {
  boardContainer = container;
  container.innerHTML = "";

  for (let row = 0; row < ROUNDS; row++) {
    for (let col = 0; col < ANSWER_LENGTH; col++) {
      const tile = document.createElement("div");
      tile.className = "scoreboard-letter";
      container.appendChild(tile);
    }
  }

  subscribe((property) => {
    if (
      property === "guesses" ||
      property === "currentGuess" ||
      property === "currentRow"
    ) {
      updateBoard(container);
    }
  });

  updateBoard(container);
}

export function flashInvalidRow(row) {
  if (!boardContainer) return;
  const tiles = boardContainer.children;

  for (let col = 0; col < ANSWER_LENGTH; col++) {
    const tile = tiles[row * ANSWER_LENGTH + col];
    tile.classList.remove("invalid");
    setTimeout(() => tile.classList.add("invalid"), 10);
  }
}

function updateBoard(container) {
  const tiles = container.children;

  for (let row = 0; row < ROUNDS; row++) {
    const completedGuess = store.guesses[row];

    for (let col = 0; col < ANSWER_LENGTH; col++) {
      const tile = tiles[row * ANSWER_LENGTH + col];
      tile.classList.remove("correct", "close", "wrong");

      if (completedGuess) {
        tile.textContent = completedGuess.letters[col];
        tile.classList.add(completedGuess.statuses[col]);
      } else if (row === store.currentRow) {
        tile.textContent = store.currentGuess[col] || "";
      } else {
        tile.textContent = "";
      }
    }
  }
}
