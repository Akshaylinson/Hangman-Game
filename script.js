// Game Data Module
const gameData = (() => {
    const words = {
        cities: [
            { word: "WASHINGTON", hint: "Capital of the United States" },
            { word: "LISBON", hint: "Capital of Portugal" },
            { word: "BANGKOK", hint: "Capital of Thailand" },
            { word: "LEIPZIG", hint: "German city known for its trade fairs" },
            { word: "LIVERPOOL", hint: "Home of The Beatles" },
            { word: "FLORENCE", hint: "Italian city known for Renaissance art" }
        ],
        fruits: [
            { word: "PINEAPPLE", hint: "Tropical fruit with spiky skin" },
            { word: "STRAWBERRY", hint: "Red, heart-shaped berry" },
            { word: "WATERMELON", hint: "Large, juicy summer fruit" },
            { word: "BLACKBERRY", hint: "Dark purple, aggregate fruit" },
            { word: "DRAGON FRUIT", hint: "Tropical fruit with bright pink skin" }
        ],
        food: [
            { word: "CROISSANT", hint: "Buttery, flaky French pastry" },
            { word: "FROMAGE", hint: "French word for cheese" },
            { word: "BAGUETTE", hint: "Long, thin French bread" },
            { word: "PAIN AU CHOCOLAT", hint: "Chocolate-filled pastry" },
            { word: "CASSOULET", hint: "French bean and meat stew" }
        ]
    };

    const getRandomWord = (theme) => {
        const themeWords = words[theme];
        return themeWords[Math.floor(Math.random() * themeWords.length)];
    };

    return { getRandomWord };
})();

// Game State Module
const gameState = (() => {
    let state = {
        wins: 0,
        losses: 0,
        currentTheme: null,
        currentWord: null,
        currentHint: null,
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
        gameOver: false,
        hintLetters: []
    };

    const resetGame = () => {
        state.guessedLetters = [];
        state.wrongGuesses = 0;
        state.gameOver = false;
        state.hintLetters = [];
    };

    const startNewGame = (theme) => {
        resetGame();
        const { word, hint } = gameData.getRandomWord(theme);
        state.currentTheme = theme;
        state.currentWord = word;
        state.currentHint = hint;
        
        // Generate 3 hint letters
        generateHintLetters();
    };

    const generateHintLetters = () => {
        const uniqueLetters = Array.from(new Set(state.currentWord.replace(/ /g, '')));
        const shuffled = [...uniqueLetters].sort(() => 0.5 - Math.random());
        state.hintLetters = shuffled.slice(0, Math.min(3, uniqueLetters.length));
    };

    const makeGuess = (letter) => {
        if (state.gameOver || state.guessedLetters.includes(letter)) return false;

        state.guessedLetters.push(letter);

        if (!state.currentWord.includes(letter)) {
            state.wrongGuesses++;
            if (state.wrongGuesses >= state.maxWrongGuesses) {
                state.gameOver = true;
                state.losses++;
            }
            return false;
        }

        // Check for win
        if (Array.from(new Set(state.currentWord.replace(/ /g, ''))).every(l => 
            state.guessedLetters.includes(l))) {
            state.gameOver = true;
            state.wins++;
        }

        return true;
    };

    const getState = () => ({ ...state });

    return { startNewGame, makeGuess, getState, resetGame };
})();

// UI Controller Module
const UIController = (() => {
    // DOM Elements
    const elements = {
        themeDisplay: document.getElementById('theme-display'),
        resultDisplay: document.getElementById('result-display'),
        wordDisplay: document.getElementById('word-display'),
        hintDisplay: document.getElementById('hint-display'),
        keyboard: document.getElementById('keyboard'),
        newGameBtn: document.getElementById('new-game-btn'),
        hintBtn: document.getElementById('hint-btn'),
        winCount: document.getElementById('win-count'),
        lossCount: document.getElementById('loss-count'),
        year: document.getElementById('year'),
        themeButtons: document.querySelectorAll('.theme-btn')
    };

    // Initialize UI
    const init = () => {
        // Set current year in footer
        elements.year.textContent = new Date().getFullYear();

        // Create keyboard
        createKeyboard();

        // Hide game elements initially
        toggleGameElements(false);

        // Add event listeners
        setupEventListeners();
    };

    // Create keyboard buttons
    const createKeyboard = () => {
        const keyboardLayout = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
        
        keyboardLayout.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.classList.add('key');
            button.dataset.letter = letter;
            elements.keyboard.appendChild(button);
        });
    };

    // Toggle game elements visibility
    const toggleGameElements = (show) => {
        const display = show ? 'block' : 'none';
        elements.wordDisplay.style.display = display;
        elements.keyboard.style.display = display;
        elements.hintBtn.style.display = display;
        elements.hintDisplay.style.display = display;
    };

    // Update game display
    const updateGameDisplay = () => {
        const state = gameState.getState();
        const { currentWord, guessedLetters, wrongGuesses, gameOver, currentTheme, currentHint, hintLetters } = state;

        // Update theme display
        let themeName = '';
        switch (currentTheme) {
            case 'cities': themeName = 'Cities'; break;
            case 'fruits': themeName = 'Fruits'; break;
            case 'food': themeName = 'French Food'; break;
        }
        elements.themeDisplay.textContent = `Theme: ${themeName}`;

        // Update word display with hint letters
        let displayWord = '';
        for (const letter of currentWord) {
            if (letter === ' ') {
                displayWord += ' ';
            } else {
                // Show letter if guessed or if it's one of our hint letters (before any guesses)
                const shouldShow = guessedLetters.includes(letter) || 
                                 (hintLetters.includes(letter) && guessedLetters.length === 0);
                if (shouldShow && hintLetters.includes(letter) && guessedLetters.length === 0) {
                    displayWord += `<span class="hint-letter">${letter}</span>`;
                } else if (shouldShow) {
                    displayWord += letter;
                } else {
                    displayWord += '_';
                }
            }
            displayWord += ' ';
        }
        elements.wordDisplay.innerHTML = displayWord.trim();

        // Update keyboard
        updateKeyboard(guessedLetters, currentWord);

        // Update hangman drawing
        updateHangman(wrongGuesses);

        // Update game result
        if (gameOver) {
            if (wrongGuesses >= state.maxWrongGuesses) {
                elements.resultDisplay.textContent = 'Game Over!';
                elements.resultDisplay.style.color = 'var(--wrong-color)';
                elements.wordDisplay.textContent = currentWord;
            } else {
                elements.resultDisplay.textContent = 'You Win!';
                elements.resultDisplay.style.color = 'var(--correct-color)';
            }
            elements.newGameBtn.style.display = 'inline-flex';
        } else {
            elements.resultDisplay.textContent = '';
        }

        // Update stats
        elements.winCount.textContent = `Wins: ${state.wins}`;
        elements.lossCount.textContent = `Losses: ${state.losses}`;
    };

    // Update keyboard buttons
    const updateKeyboard = (guessedLetters, currentWord) => {
        document.querySelectorAll('.key').forEach(button => {
            const letter = button.dataset.letter;
            if (guessedLetters.includes(letter)) {
                button.disabled = true;
                button.classList.add(currentWord.includes(letter) ? 'correct' : 'wrong');
            } else {
                button.disabled = false;
                button.classList.remove('correct', 'wrong');
            }
        });
    };

    // Update hangman drawing
    const updateHangman = (wrongGuesses) => {
        const parts = ['head', 'body', 'right-arm', 'left-arm', 'left-leg', 'right-leg'];
        
        parts.forEach((part, index) => {
            const element = document.querySelector(`[data-part="${part}"]`);
            element.style.visibility = index < wrongGuesses ? 'visible' : 'hidden';
        });
    };

    // Show hint
    const showHint = () => {
        const { currentHint } = gameState.getState();
        elements.hintDisplay.textContent = `Hint: ${currentHint}`;
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Theme selection
        elements.themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                gameState.startNewGame(theme);
                toggleGameElements(true);
                elements.newGameBtn.style.display = 'none';
                elements.hintDisplay.textContent = '';
                updateGameDisplay();
            });
        });

        // Keyboard letter selection
        elements.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                const letter = e.target.dataset.letter;
                gameState.makeGuess(letter);
                updateGameDisplay();
            }
        });

        // New game button
        elements.newGameBtn.addEventListener('click', () => {
            const { currentTheme } = gameState.getState();
            gameState.resetGame();
            gameState.startNewGame(currentTheme);
            elements.newGameBtn.style.display = 'none';
            elements.hintDisplay.textContent = '';
            updateGameDisplay();
        });

        // Hint button
        elements.hintBtn.addEventListener('click', showHint);

        // Keyboard event listener for physical keyboard
        document.addEventListener('keydown', (e) => {
            if (/^[a-z]$/i.test(e.key)) {
                const letter = e.key.toUpperCase();
                const keyElement = document.querySelector(`.key[data-letter="${letter}"]`);
                if (keyElement && !keyElement.disabled) {
                    gameState.makeGuess(letter);
                    updateGameDisplay();
                }
            }
        });
    };

    return { init };
})();

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', UIController.init);
