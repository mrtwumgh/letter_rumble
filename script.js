const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const themeToggleButton = document.querySelector(".theme-toggle");
const THEME_STORAGE_KEY = "letter-rumble-theme";

const instructionsButton = document.querySelector(".instructions-button");
const modalContainer = document.querySelector(".modal-container");
const modalCloseButton = document.querySelector(".modal-close-button");
const modalCloseAction = document.querySelector(".modal-close-action");
const modalBackdrop = document.querySelector(".modal-backdrop");

const keyButtons = document.querySelectorAll(".key");
const statusMessage = document.querySelector(".status-message");
const GAME_STATE_STORAGE_KEY = "letter-rumble-daily-state";

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let done = false;
  let isLoading = false;
  const keyStatuses = {};

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj["word"].toUpperCase();
  const wordParts = word.split("");
  setLoading(false);

  clearOldDailyGameState();

  const savedState = loadDailyGameState();

  if (savedState && savedState.date === getTodayKey()) {
    done = true;
    showCompletedGameMessage(savedState);
    return;
  }

  statusMessage.textContent = "Guess the hidden five-letter word.";

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].textContent =
      letter;
  }

  async function commit() {
    if (currentGuess.length < ANSWER_LENGTH) {
      // do nothing
      return;
    }

    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const validWord = resObj["validWord"];
    setLoading(false);

    if (!validWord) {
      markAsInvalid();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (wordParts[i] === guessParts[i]) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("correct");
        map[guessParts[i]]--;
        updateKeyStatus(guessParts[i], "correct");
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (wordParts[i] === guessParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("close");
        map[guessParts[i]]--;
        updateKeyStatus(guessParts[i], "close");
      } else {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
        updateKeyStatus(guessParts[i], "wrong");
      }
    }

    currentRow++;
    if (word === currentGuess) {
      alert("You Win");
      saveDailyGameState("win", word);
      statusMessage.textContent = "You solved today's puzzle.";
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      alert(`You lose! The word was ${word}`);
      saveDailyGameState("loss", word);
      statusMessage.textContent = `You finished today's puzzle. The word was ${word}.`;
      done = true;
      return;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].textContent = "";
  }

  function markAsInvalid() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");

      setTimeout(function () {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("invalid");
      }, 10);
    }
  }

  function updateKeyStatus(letter, nextStatus) {
    const currentStatus = keyStatuses[letter];

    if (currentStatus === "correct") {
      return;
    }

    if (currentStatus === "close" && nextStatus === "wrong") {
      return;
    }

    keyStatuses[letter] = nextStatus;
    paintKeyboardKey(letter, keyStatuses[letter]);
  }

  function paintKeyboardKey(letter, status) {
    for (let i = 0; i < keyButtons.length; i++) {
      const keyButton = keyButtons[i];
      const keyValue = keyButton.dataset.key || keyButton.textContent.trim();

      if (keyValue.toUpperCase() === letter) {
        keyButton.classList.remove("correct", "close", "wrong");
        keyButton.classList.add(status);
        return;
      }
    }
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      return;
    }
    const action = event.key;
    handleInput(action);
  });

  document
    .querySelector(".keyboard")
    .addEventListener("click", function (event) {
      if (done || isLoading) {
        return;
      }

      const target = event.target;

      const keyButton = target.closest(".key");

      if (!keyButton) {
        return;
      }

      let action = keyButton.textContent;

      if (keyButton.dataset.key) {
        action = keyButton.dataset.key;
      }

      handleInput(action);

      keyButton.blur();
    });

  function handleInput(action) {
    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  }
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};

  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggleButton.textContent = "Light mode";
    themeToggleButton.setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.remove("dark-theme");
    themeToggleButton.textContent = "Dark mode";
    themeToggleButton.setAttribute("aria-pressed", "false");
  }
}

function setupThemeToggle() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark") {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }

  themeToggleButton.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark-theme");
    const nextTheme = isDark ? "light" : "dark";

    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

function openInstructionsModal() {
  modalContainer.classList.add("open");
  modalContainer.setAttribute("aria-hidden", "false");
}

function closeInstructionsModal() {
  modalContainer.classList.remove("open");
  modalContainer.setAttribute("aria-hidden", "true");
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function saveDailyGameState(result, answer) {
  const gameState = {
    date: getTodayKey(),
    result: result,
    answer: answer,
  };

  localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(gameState));
}

function loadDailyGameState() {
  const savedState = localStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!savedState) {
    return null;
  }

  return JSON.parse(savedState);
}

function clearOldDailyGameState() {
  const savedState = loadDailyGameState();

  if (!savedState) {
    return;
  }

  if (savedState.date !== getTodayKey()) {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  }
}

function showCompletedGameMessage(savedState) {
  if (savedState.result === "win") {
    statusMessage.textContent = "You already completed today's puzzle and won.";
  } else {
    statusMessage.textContent = `You already completed today's puzzle. The word was ${savedState.answer}.`;
  }
}

function setupInstructionsModal() {
  instructionsButton.addEventListener("click", openInstructionsModal);
  modalCloseButton.addEventListener("click", closeInstructionsModal);
  modalCloseAction.addEventListener("click", closeInstructionsModal);
  modalBackdrop.addEventListener("click", closeInstructionsModal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeInstructionsModal();
    }
  });
}

if (themeToggleButton) {
  setupThemeToggle();
}

if (
  instructionsButton &&
  modalContainer &&
  modalCloseButton &&
  modalCloseAction &&
  modalBackdrop
) {
  setupInstructionsModal();
}

init();
