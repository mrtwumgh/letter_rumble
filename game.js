import { store } from "./store.js";
import { fetchWordOfTheDay, fetchRandomWord, validateWord } from "./api.js";
import { ANSWER_LENGTH, ROUNDS } from "./constants.js";
import { recordWin, recordLoss } from "./stats.js";

const GAME_STATE_STORAGE_KEY = "letter-rumble-daily-state";

export async function startDailyGame() {
  store.mode = "daily";
  resetRoundState();

  const savedState = loadDailyGameState();
  if (savedState) {
    store.word = savedState.word;
    store.done = true;
    store.result = savedState.result;
    return {
      alreadyPlayed: true,
      result: savedState.result,
      word: savedState.word,
    };
  }

  store.isLoading = true;
  const { word, puzzleNumber } = await fetchWordOfTheDay();
  store.isLoading = false;
  store.word = word;
  store.puzzleNumber = puzzleNumber;
  return { alreadyPlayed: false };
}

export async function startRematch() {
  store.mode = "rematch";
  resetRoundState();
  store.isLoading = true;
  const { word } = await fetchRandomWord();
  store.isLoading = false;
  store.word = word;
  store.puzzleNumber = null;
}

function resetRoundState() {
  store.currentGuess = "";
  store.currentRow = 0;
  store.guesses = [];
  store.done = false;
  store.result = null;
  store.keyStatuses = {};
  store.hintUsed = false;
  store.hintText = "";
}

export function typeLetter(letter) {
  if (store.done) return;

  if (store.currentGuess.length < ANSWER_LENGTH) {
    store.currentGuess += letter;
  } else {
    store.currentGuess = store.currentGuess.slice(0, -1) + letter;
  }
}

export function backspace() {
  if (store.done) return;
  store.currentGuess = store.currentGuess.slice(0, -1);
}

export async function submitGuess() {
  if (store.done || store.currentGuess.length < ANSWER_LENGTH) {
    return { status: "ignored" };
  }

  const guess = store.currentGuess;
  store.isLoading = true;
  const validWord = await validateWord(guess);
  store.isLoading = false;

  if (!validWord) {
    return { status: "invalid" };
  }

  const statuses = scoreGuess(guess, store.word);
  store.keyStatuses = mergeKeyStatuses(store.keyStatuses, guess, statuses);
  store.guesses = [...store.guesses, { letters: guess.split(""), statuses }];
  store.currentGuess = "";
  store.currentRow += 1;

  if (guess === store.word) {
    store.result = "win";
    store.done = true;
    if (store.mode === "daily") {
      saveDailyGameState("win", store.word);
      recordWin(store.currentRow);
    }
    return { status: "win" };
  }

  if (store.currentRow === ROUNDS) {
    store.result = "loss";
    store.done = true;
    if (store.mode === "daily") {
      saveDailyGameState("loss", store.word);
      recordLoss();
    }
    return { status: "loss" };
  }

  return { status: "continue" };
}

function scoreGuess(guess, word) {
  const wordParts = word.split("");
  const guessParts = guess.split("");
  const statuses = new Array(ANSWER_LENGTH).fill("wrong");
  const map = makeMap(wordParts);

  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (wordParts[i] === guessParts[i]) {
      statuses[i] = "correct";
      map[guessParts[i]]--;
    }
  }

  for (let i = 0; i < ANSWER_LENGTH; i++) {
    if (statuses[i] === "correct") continue;
    if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
      statuses[i] = "close";
      map[guessParts[i]]--;
    }
  }

  return statuses;
}

function mergeKeyStatuses(current, guess, statuses) {
  const next = { ...current };

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = statuses[i];
    const existing = next[letter];

    if (existing === "correct") continue;
    if (existing === "close" && status === "wrong") continue;

    next[letter] = status;
  }

  return next;
}

function makeMap(array) {
  const map = {};
  for (const letter of array) {
    map[letter] = (map[letter] || 0) + 1;
  }
  return map;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function saveDailyGameState(result, word) {
  localStorage.setItem(
    GAME_STATE_STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), result, word }),
  );
}

function loadDailyGameState() {
  const saved = localStorage.getItem(GAME_STATE_STORAGE_KEY);
  if (!saved) return null;

  const parsed = JSON.parse(saved);
  if (parsed.date !== getTodayKey()) {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    return null;
  }

  return parsed;
}
