import { store, subscribe } from "./store.js";
import { startRematch } from "./game.js";

export function initRematch(button) {
  updateVisibility(button);

  subscribe((property) => {
    if (property === "done") {
      updateVisibility(button);
    }
  });

  button.addEventListener("click", () => {
    startRematch();
  });
}

function updateVisibility(button) {
  button.hidden = !store.done;
}
