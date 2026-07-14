const listeners = new Set();

function notify(property, value, previous) {
  for (const listener of listeners) {
    listener(property, value, previous);
  }
}

function createStore(initialState) {
  return new Proxy(initialState, {
    set(target, property, value) {
      const previous = target[property];
      target[property] = value;
      notify(property, value, previous);
      return true;
    },
  });
}

export const store = createStore({
  word: "",
  puzzleNumber: null,
  mode: "daily", // "daily" | "rematch"
  isLoading: false,
  currentGuess: "",
  currentRow: 0,
  guesses: [],
  done: false,
  result: null, // "win" | "loss" | null
  keyStatuses: {},
  hintUsed: false,
  hintText: "",
});

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
