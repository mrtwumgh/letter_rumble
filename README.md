# Letter Rumble

Letter Rumble is a browser-based, Wordle-style word game built with vanilla JavaScript (ES modules), HTML and CSS. Players get six tries to guess a hidden five-letter word, with colour feedback after every guess. There is a new daily puzzle, a random-word rematch mode, streak tracking and a shareable result grid.

## Features

- **Daily puzzle:** the word of the day is fetched from an external API. Once you finish, the game remembers it and shows a countdown to the next word.
- **Word validation:** every guess is checked against a dictionary API. Invalid words flash the row instead of using up a guess.
- **Colour feedback:**
  - Green: correct letter, correct position.
  - Amber: letter is in the word, wrong position.
  - Gray: letter is not in the word.
- **Two input methods:** type on your keyboard or use the on-screen keyboard. Keys are coloured to match what you've learned, and eliminated letters fade into the background.
- **Hint:** unlocks on your fifth guess, one per round. It shows a dictionary definition of the word, and falls back to revealing one letter and its position if the definition is unavailable or would give the word away.
- **Rematch:** once a round is over, play a random word as many times as you like. Rematches don't affect your daily state or stats.
- **Stats:** games played, win percentage, current streak, best streak and a guess-distribution chart. Only daily games count.
- **Share your result:** copies an emoji grid of your guesses to the clipboard, with a copy-by-hand fallback if the clipboard isn't available.
- **Feedback form:** send bugs or ideas from inside the game.
- **Instructions and result modals:** a how-to-play dialog, and a result dialog when a round ends.

## How it works

1. **Start-up:** `main.js` renders the board and starts the daily game. If you've already played today, your saved result is restored and the countdown starts. Otherwise the word of the day is fetched.
2. **Guessing:** type five letters and press `Enter`. The guess is validated through the API.
3. **Scoring:** valid guesses are scored, tiles and keyboard keys update, and the guess is added to the board.
4. **Win or loss:** matching the word wins. Using all six guesses without a match is a loss and reveals the word.
5. **Aftermath:** a daily result is saved for the day and recorded in your stats. The results modal opens, the rematch button appears, and the countdown to the next word starts.

## Running locally

There is no build step and no dependencies, but the project uses ES modules (`<script type="module">`), so **opening `index.html` directly from disk will not work**. Browsers block module loading over `file://`. Serve the folder instead:

```bash
git clone https://github.com/mrtwumgh/letter_rumble.git
cd letter_rumble

# any static server works, for example:
python3 -m http.server 8000
# or: npx serve
```

Then open `http://localhost:8000`. The Live Server extension in VS Code also works.

## Architecture

The game is split into small modules with one job each, connected through a single shared store.

### The store (`store.js`)

A `Proxy`-wrapped state object plus a `subscribe()` function. Any assignment to the store (for example `store.done = true`) notifies every subscriber with the property name, so UI modules can react to just the changes they care about. Modules read and write the store directly, and never call each other's UI code.

### Scoring (`game.js`)

Guesses are scored in two passes using a letter-frequency map of the secret word, so duplicate letters are handled correctly:

1. **Pass 1:** mark every exact-position match as `correct` and decrement that letter's count in the map.
2. **Pass 2:** for the remaining letters, mark `close` only if the letter is in the word and its remaining count is above zero. Everything else is `wrong`.

```js
// Secret word "ABBEY" -> { A: 1, B: 2, E: 1, Y: 1 }
```

### Persistence

Everything is stored in `localStorage`:

- `letter-rumble-daily-state`: today's date, result and word, so a finished daily puzzle can't be replayed. It is cleared automatically when the date changes.
- `letter-rumble-stats`: played, wins, streaks and guess distribution. Reading and writing this key is owned entirely by `stats.js`. `game.js` calls its `recordWin` and `recordLoss` when a daily game ends.

### Hints (`hints.js`, `api.js`)

The hint button unlocks when `currentRow` reaches the fifth guess. The definition comes from Datamuse with a 3-second timeout. If the request fails, times out, returns no definition, or the definition contains the answer, the game shows a fallback hint that reveals one letter and its position.

## APIs used

| API | Used for |
| --- | --- |
| `words.dev-apis.com` | `GET /word-of-the-day` (daily word), `GET /word-of-the-day?random=1` (rematch word), `POST /validate-word` (guess validation) |
| `api.datamuse.com` | `GET /words?sp=<word>&md=d&max=1` for the definition used in hints |
| Formspree | Receives submissions from the feedback form |

## Technologies

- **HTML5:** semantic structure and accessible modal dialogs.
- **CSS3:** custom properties for theming, Grid for the board, Flexbox for layout, keyframe animations for the loading spinner and the invalid-word flash.
- **JavaScript (ES2020+):** ES modules, `async`/`await`, a Proxy-based reactive store, `localStorage`, the Clipboard API and `AbortSignal.timeout`.

## Project structure

```
/
├── index.html      # Page structure, keyboard and modals
├── style.css       # Theme, layout, tile/key states, animations, responsive rules
├── main.js         # Entry point: wires up all modules and starts the daily game
├── store.js        # Shared reactive state (Proxy) and subscribe()
├── constants.js    # ANSWER_LENGTH and ROUNDS
├── game.js         # Round lifecycle, guess submission, scoring, daily-state saving
├── api.js          # words.dev-apis.com and Datamuse requests
├── board.js        # Renders the tile grid and the invalid-row flash
├── keyboard.js     # Physical and on-screen keyboard input, key colouring
├── hints.js        # Hint button state and hint fetching
├── modals.js       # Instructions, feedback and results modals
├── stats.js        # Stats storage (recordWin/recordLoss) and stats modal
├── share.js        # Builds and copies the shareable emoji grid
├── rematch.js      # Rematch button visibility and behaviour
└── countdown.js    # "Next word in ..." countdown to local midnight
```