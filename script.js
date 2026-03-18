const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {

    let currentGuess = "";
    let currentRow = 0;
    let done = false;
    let isLoading = false;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj["word"].toUpperCase();
    const wordParts = word.split("");
    setLoading(false);


    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length < ANSWER_LENGTH) {
            // do nothing
            return;
        }

        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
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
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (wordParts[i] === guessParts[i]) {
                // do nothing
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[ANSWER_LENGTH * currentRow + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
            }
        }

        currentRow++;
        if (word === currentGuess) {
            alert("You Win");
            document.querySelector(".brand").classList.add("winner");
            done = true;
            return
        } else if (currentRow === ROUNDS) {
            alert(`You lose! The word was ${word}`);
            done = true;
            return;
        }
        currentGuess = "";
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markAsInvalid() {
        for (let i = 0; i < ANSWER_LENGTH; i++){
            letters[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");

            setTimeout(function () {
                letters[ANSWER_LENGTH * currentRow + i].classList.add("invalid");
            }, 10);
        }
    }

    document.addEventListener("keydown", function handleKeyPress(event) {
        if (done || isLoading) {
            return;
        }
        const action = event.key;
        handleInput(action);
    })

    document.querySelector(".keyboard").addEventListener("click", function (event) {
        if (done || isLoading) {
            return;
        }

        const target = event.target;

        const keyButton = target.closest(".key");

        if (!keyButton) {
            return;
        }

        let action = keyButton.innerText;

        if (keyButton.dataset.key) {
            action = keyButton.dataset.key;
        }

        handleInput(action);

        keyButton.blur();
    })

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
    
    for (let i = 0; i < array.length; i++){
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

init();