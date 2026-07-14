import { store, subscribe } from "./store.js";
import { renderBoard } from "./board.js";
import { initKeyboard } from "./keyboard.js";
import { initHints } from "./hints.js";
import {
  initInstructionsModal,
  initFeedbackModal,
  initResultsModal,
} from "./modals.js";
import { initRematch } from "./rematch.js";
import { initStats } from "./stats.js";
import { startCountdown } from "./countdown.js";
import { startDailyGame } from "./game.js";

async function init() {
  const boardContainer = document.querySelector("#scoreboard");
  const statusEl = document.querySelector(".status-message");
  const loadingEl = document.querySelector(".info-bar");
  const countdownEl = document.querySelector(".countdown-message");

  renderBoard(boardContainer);

  subscribe((property) => {
    if (property === "isLoading") {
      loadingEl.classList.toggle("hidden", !store.isLoading);
    }
  });

  const { alreadyPlayed, result, word } = await startDailyGame();

  if (alreadyPlayed) {
    statusEl.textContent =
      result === "win"
        ? "You already completed today's puzzle and won."
        : `You already completed today's puzzle. The word was ${word}.`;
    startCountdown(countdownEl);
  } else {
    statusEl.textContent = "Guess the hidden five-letter word.";
  }

  initKeyboard({
    keyboardEl: document.querySelector(".keyboard"),
    keyButtons: document.querySelectorAll(".key"),
    isInputBlocked,
  });

  initHints(
    document.querySelector(".hint-button"),
    document.querySelector(".hint-message"),
  );

  initInstructionsModal({
    button: document.querySelector(".instructions-button"),
    container: document.querySelector(".modal-container"),
    closeButton: document.querySelector(".modal-close-button"),
    closeAction: document.querySelector(".modal-close-action"),
    backdrop: document.querySelector(".modal-container .modal-backdrop"),
  });

  initFeedbackModal({
    button: document.querySelector(".feedback-button"),
    container: document.querySelector(".feedback-modal-container"),
    closeButton: document.querySelector(".feedback-close-button"),
    backdrop: document.querySelector(
      ".feedback-modal-container .modal-backdrop",
    ),
    form: document.querySelector(".feedback-form"),
    statusEl: document.querySelector(".feedback-status-message"),
  });

  initResultsModal({
    container: document.querySelector(".results-modal-container"),
    backdrop: document.querySelector(
      ".results-modal-container .modal-backdrop",
    ),
    closeButton: document.querySelector(".results-close-button"),
    closeAction: document.querySelector(".results-close-action"),
    shareButton: document.querySelector(".results-share-button"),
    titleEl: document.querySelector("#results-title"),
    bodyEl: document.querySelector(".results-body"),
  });

  initRematch(document.querySelector(".rematch-button"));

  initStats({
    button: document.querySelector(".stats-button"),
    container: document.querySelector(".stats-modal-container"),
    backdrop: document.querySelector(".stats-modal-container .modal-backdrop"),
    closeButton: document.querySelector(".stats-close-button"),
    closeAction: document.querySelector(".stats-close-action"),
    body: document.querySelector(".stats-body"),
  });

  subscribe((property) => {
    if (property === "done" && store.done) {
      startCountdown(countdownEl);
    }
  });
}

function isInputBlocked() {
  const activeElement = document.activeElement;
  const isTyping =
    activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
  const anyModalOpen =
    document.querySelector(
      ".modal-container.open, .feedback-modal-container.open, .results-modal-container.open, .stats-modal-container.open",
    ) !== null;
  return isTyping || anyModalOpen;
}

init();
