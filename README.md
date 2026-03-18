
---

# Wordify

**Wordify** is a browser-based word guessing game inspired by the popular game Wordle. Built with vanilla JavaScript, HTML, and CSS, it challenges players to guess a secret 5-letter word within 6 attempts, providing visual feedback on the accuracy of each letter.

## Table of Contents

* [Features](https://www.google.com/search?q=%23features)
* [How it Works](https://www.google.com/search?q=%23how-it-works)
* [Installation & Usage](https://www.google.com/search?q=%23installation--usage)
* [Game Logic & Architecture](https://www.google.com/search?q=%23game-logic--architecture)
* [Technologies Used](https://www.google.com/search?q=%23technologies-used)
* [Project Structure](https://www.google.com/search?q=%23project-structure)

## Features

* **Daily Word Fetching:** Automatically fetches a "Word of the Day" from an external API.
* **Input Validation:** Validates if the user's guess is a real English word via API before processing.
* **Visual Feedback:**
* **Green:** Correct letter in the correct spot.
* **Goldenrod:** Correct letter in the wrong spot.
* **Gray:** Letter not in the word.


* **Interactive UI:** Includes loading spinners, **crimson border flashing** for invalid words, and a rainbow victory animation.
* **Responsive Grid:** Adapts the game board layout for different screen sizes.

## How it Works

1. **Initialization:** When the game loads, it fetches a random 5-letter word.
2. **Guessing:** The player types a 5-letter word and presses `Enter`.
3. **Validation:** The game checks an API to ensure the guess is a valid dictionary word.
* *If invalid:* The row borders **flash crimson red** to alert the user.
* *If valid:* The game compares the guess against the secret word.


4. **Scoring:** Tiles flip to reveal colors indicating accuracy.
5. **Win/Loss:**
* **Win:** If the word matches exactly, a "You Win!" alert triggers and the title animates with a rainbow effect.
* **Loss:** After 6 failed attempts, the game reveals the correct word.



## Installation & Usage

Since this is a static web application, no build process or package manager (npm/yarn) is required.

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/word-masters.git

```


2. **Navigate to the folder:**
```bash
cd word-masters

```


3. **Run the game:**
* Simply double-click `index.html` to open it in your default browser.
* *Note:* For best results with API calls (CORS), it is recommended to run this using a local server (e.g., Live Server in VS Code):


```bash
# If you have parcel installed
parcel index.html
# Then visit localhost:1234

```



## Game Logic & Architecture

### Core JavaScript Logic (`word-masters.js`)

The game logic relies heavily on **async/await** for API handling and a **frequency map** algorithm to handle duplicate letters correctly.

#### 1. The Frequency Map (`makeMap`)

To prevent highlighting a letter as "Close" (Yellow) if it has already been accounted for as "Correct" (Green), the game creates a map of the secret word's letter counts.

```javascript
// Example: If the secret word is "ABBEY"
// The map looks like: { A: 1, B: 2, E: 1, Y: 1 }

```

#### 2. The Validation Loop

The grading logic runs in two distinct passes:

1. **Pass 1 (Green Check):** Identifies all letters that are exactly correct. It decrements the count in the frequency map for those letters.
2. **Pass 2 (Yellow/Gray Check):** Checks remaining letters. If the letter exists in the word and the map count is greater than 0, it is marked "Close" (Yellow). Otherwise, it is "Wrong" (Gray).

#### 3. State Management

* `currentGuess`: Tracks the string currently being typed.
* `currentRow`: Tracks which of the 6 attempts the user is on.
* `isLoading`: Prevents input while waiting for API responses.

### APIs Used

The application uses the `words.dev-apis.com` endpoints:

* `GET /word-of-the-day`: Retrieves the target word.
* `POST /validate-word`: Checks if the user's input is a valid English word.

## Technologies Used

* **HTML5:** Semantic structure and grid layout containers.
* **CSS3:**
* **CSS Grid:** Used for the main scoreboard layout.
* **Keyframes:** Used for the `spin`, `flash`, and `rainbow` animations.
* **Flexbox:** Used for centering content and navbar alignment.


* **JavaScript (ES6+):**
* `async`/`await` for fetch requests.
* DOM manipulation (`querySelector`, `classList`).
* Event Listeners (`keydown`).



## Project Structure

```text
/
├── index.html          # Main game interface and structure
├── style.css           # Styling, animations, and responsive design
└── word-masters.js     # Game logic, API calls, and state management

```

---