import { store, subscribe } from "./store.js";
import { buildShareText, copyShareText } from "./share.js";

export function initInstructionsModal({
  button,
  container,
  closeButton,
  closeAction,
  backdrop,
}) {
  const open = () => setOpen(container, true);
  const close = () => setOpen(container, false);

  button.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  closeAction.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

export function initFeedbackModal({
  button,
  container,
  closeButton,
  backdrop,
  form,
  statusEl,
}) {
  const open = () => setOpen(container, true);
  const close = () => setOpen(container, false);

  button.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    statusEl.textContent = "Sending...";

    try {
      const response = await fetch("https://formspree.io/f/mojkzdbd/", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Feedback request failed");
      }

      statusEl.textContent = "Thanks! Your feedback was sent.";
      form.reset();
    } catch (error) {
      statusEl.textContent = "Sorry, something went wrong. Please try again.";
    }
  });
}

// Call initResultsModal() *after* the initial daily-state load has already
// set store.done — see main.js. The subscribe() below only fires on future
// changes, so a "done" that was already true before this function ran
// (a returning visitor who already played today) won't pop this modal
// open unprompted. Only a game that finishes during this session will.
export function initResultsModal({
  container,
  backdrop,
  closeButton,
  closeAction,
  shareButton,
  titleEl,
  bodyEl,
}) {
  const close = () => setOpen(container, false);

  closeButton.addEventListener("click", close);
  closeAction.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  shareButton.addEventListener("click", async () => {
    const original = shareButton.textContent;

    try {
      await copyShareText();
      shareButton.textContent = "Copied!";
      setTimeout(() => {
        shareButton.textContent = original;
      }, 1500);
    } catch (error) {
      // navigator.clipboard needs a secure context (HTTPS, or localhost —
      // not a plain http:// LAN address) and can reject for other reasons
      // too. Rather than just fail, fall back to a prompt with the text
      // pre-filled so it's still copyable by hand (Ctrl+C / Cmd+C).
      window.prompt("Copy your result:", buildShareText());
      shareButton.textContent = original;
    }
  });

  subscribe((property) => {
    if ((property === "done" || property === "result") && store.done) {
      showResult(titleEl, bodyEl);
      setOpen(container, true);
    }
  });
}

function showResult(titleEl, bodyEl) {
  if (store.result === "win") {
    titleEl.textContent = "You got it";
    bodyEl.textContent =
      store.mode === "daily"
        ? "Nice work — that's today's word solved."
        : "Nice work on that one.";
  } else {
    titleEl.textContent = "So close";
    bodyEl.textContent = `The word was ${store.word}.`;
  }
}

function setOpen(container, isOpen) {
  container.classList.toggle("open", isOpen);
  container.setAttribute("aria-hidden", String(!isOpen));
}
