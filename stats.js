import { store, subscribe } from "./store.js";

const STATS_STORAGE_KEY = "letter-rumble-stats";
let alreadyRecorded = false;

export function initStats({
  button,
  container,
  backdrop,
  closeButton,
  closeAction,
  body,
}) {
  const open = () => {
    renderStats(body);
    container.classList.add("open");
    container.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    container.classList.remove("open");
    container.setAttribute("aria-hidden", "true");
  };

  button.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  closeAction.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  subscribe((property) => {
    if (property === "done" && !store.done) {
      alreadyRecorded = false; // a new round just started
      return;
    }

    if (
      (property === "done" || property === "result") &&
      store.done &&
      store.mode === "daily" &&
      !alreadyRecorded
    ) {
      recordResult();
      alreadyRecorded = true;
    }
  });
}

function emptyStats() {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0], // index 0 = won in 1 guess ... index 5 = won in 6
  };
}

function recordResult() {
  const stats = loadStats();
  stats.played += 1;

  if (store.result === "win") {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[store.currentRow - 1] += 1;
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
}

function loadStats() {
  const saved = localStorage.getItem(STATS_STORAGE_KEY);
  if (!saved) return emptyStats();

  try {
    return { ...emptyStats(), ...JSON.parse(saved) };
  } catch {
    return emptyStats();
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

function renderStats(body) {
  const stats = loadStats();
  const winPercent =
    stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100);
  const maxCount = Math.max(1, ...stats.guessDistribution);

  const bars = stats.guessDistribution
    .map((count, index) => {
      const width = Math.max(8, Math.round((count / maxCount) * 100));
      return `
        <div class="stats-bar-row">
          <span class="stats-bar-label">${index + 1}</span>
          <div class="stats-bar-track">
            <div class="stats-bar-fill" style="inline-size: ${width}%">${count > 0 ? count : ""}</div>
          </div>
        </div>
      `;
    })
    .join("");

  body.innerHTML = `
    <div class="stats-summary">
      <div class="stats-figure">
        <span class="stats-number">${stats.played}</span>
        <span class="stats-label">Played</span>
      </div>
      <div class="stats-figure">
        <span class="stats-number">${winPercent}</span>
        <span class="stats-label">Win %</span>
      </div>
      <div class="stats-figure">
        <span class="stats-number">${stats.currentStreak}</span>
        <span class="stats-label">Streak</span>
      </div>
      <div class="stats-figure">
        <span class="stats-number">${stats.maxStreak}</span>
        <span class="stats-label">Best</span>
      </div>
    </div>
    <p class="stats-subheading">Guess distribution</p>
    <div class="stats-distribution">${bars}</div>
  `;
}
