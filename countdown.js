let intervalId = null;

export function startCountdown(messageEl) {
  updateDisplay(messageEl);

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => updateDisplay(messageEl), 1000);
}

function updateDisplay(messageEl) {
  const now = new Date();
  const nextMidnight = getNextMidnight();
  const timeRemaining = nextMidnight - now;
  messageEl.textContent = `Next word in ${formatCountdown(timeRemaining)}`;
}

function getNextMidnight() {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
