// Game State
const gameState = {
    currentScreen: 'main-menu',
    difficulty: 'medium',
    timeLimit: 300,
    timeRemaining: 300,
    strikes: 0,
    maxStrikes: 3,
    modules: [],
    solvedModules: 0,
    timerInterval: null,
    serialNumber: '',
    soundEnabled: true,
    musicEnabled: true,
    isPaused: false
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    generateSerialNumber();
});

// Event Listeners
function initializeEventListeners() {
    // Main menu
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('view-manual').addEventListener('click', () => showScreen('manual-screen'));
    document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings-screen'));
    document.getElementById('difficulty').addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
    });
    
    // Settings
    document.getElementById('back-from-settings').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        gameState.soundEnabled = e.target.checked;
    });
    document.getElementById('music-toggle').addEventListener('change', (e) => {
        gameState.musicEnabled = e.target.checked;
    });
    
    // Game controls
    document.getElementById('pause-game').addEventListener('click', togglePause);
    document.getElementById('quit-game').addEventListener('click', quitGame);
    
    // Manual
    document.getElementById('back-from-manual').addEventListener('click', () => showScreen('main-menu'));
    
    // Manual navigation
    document.querySelectorAll('.manual-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const module = btn.dataset.module;
            showManualPage(module);
        });
    });
    
    // Win/Lose screens
    document.getElementById('play-again-win').addEventListener('click', startGame);
    document.getElementById('play-again-lose').addEventListener('click', startGame);
    document.getElementById('menu-from-win').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('menu-from-lose').addEventListener('click', () => showScreen('main-menu'));
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showManualPage(pageId) {
    document.querySelectorAll('.manual-page').forEach(page => page.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    document.querySelectorAll('.manual-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-module="${pageId}"]`).classList.add('active');
}

// Serial Number Generation
function generateSerialNumber() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let serial = '';
    serial += letters[Math.floor(Math.random() * letters.length)];
    serial += letters[Math.floor(Math.random() * letters.length)];
    serial += numbers[Math.floor(Math.random() * numbers.length)];
    serial += letters[Math.floor(Math.random() * letters.length)];
    serial += letters[Math.floor(Math.random() * letters.length)];
    serial += numbers[Math.floor(Math.random() * numbers.length)];
    
    gameState.serialNumber = serial;
    document.getElementById('serial-number').textContent = `SN: ${serial}`;
}

// Game Start
function startGame() {
    // Reset game state
    gameState.strikes = 0;
    gameState.solvedModules = 0;
    gameState.isPaused = false;
    
    // Set difficulty parameters
    switch(gameState.difficulty) {
        case 'easy':
            gameState.timeLimit = 180;
            gameState.moduleCount = Math.floor(Math.random() * 2) + 3; // 3-4
            break;
        case 'medium':
            gameState.timeLimit = 240;
            gameState.moduleCount = Math.floor(Math.random() * 2) + 5; // 5-6
            break;
        case 'hard':
            gameState.timeLimit = 300;
            gameState.moduleCount = Math.floor(Math.random() * 2) + 7; // 7-8
            break;
    }
    
    gameState.timeRemaining = gameState.timeLimit;
    
    // Generate new serial number
    generateSerialNumber();
    
    // Create modules
    createModules();
    
    // Update UI
    updateTimer();
    updateStrikes();
    
    // Show game screen
    showScreen('game-screen');
    
    // Start timer
    startTimer();
}

// Timer
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeRemaining--;
            updateTimer();
            
            if (gameState.timeRemaining <= 0) {
                loseGame('Time ran out!');
            }
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer-display');
    timerElement.textContent = display;
    
    // Change color based on time
    timerElement.classList.remove('warning', 'critical');
    if (gameState.timeRemaining <= 30) {
        timerElement.classList.add('critical');
    } else if (gameState.timeRemaining <= 60) {
        timerElement.classList.add('warning');
    }
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pause-game').textContent = gameState.isPaused ? 'Resume' : 'Pause';
}

// Strikes
function addStrike() {
    gameState.strikes++;
    updateStrikes();
    playSound('strike');
    
    if (gameState.strikes >= gameState.maxStrikes) {
        loseGame('Too many strikes!');
    }
}

function updateStrikes() {
    const strikeElements = document.querySelectorAll('.strike');
    strikeElements.forEach((elem, index) => {
        if (index < gameState.strikes) {
            elem.classList.add('lost');
        } else {
            elem.classList.remove('lost');
        }
    });
}

// Module Creation
function createModules() {
    const modulesContainer = document.getElementById('bomb-modules');
    modulesContainer.innerHTML = '';
    gameState.modules = [];
    
    // Available module types
    const moduleTypes = [
        'wires',
        'button',
        'keypads',
        'simon',
        'whosonfirst',
        'memory',
        'morse',
        'complex-wires'
    ];
    
    // Randomly select modules
    const selectedModules = [];
    for (let i = 0; i < gameState.moduleCount; i++) {
        const type = moduleTypes[Math.floor(Math.random() * moduleTypes.length)];
        selectedModules.push(type);
    }
    
    // Create module elements
    selectedModules.forEach((type, index) => {
        const moduleData = createModuleByType(type, index);
        gameState.modules.push(moduleData);
        modulesContainer.appendChild(moduleData.element);
    });
}

function createModuleByType(type, id) {
    switch(type) {
        case 'wires':
            return createWiresModule(id);
        case 'button':
            return createButtonModule(id);
        case 'keypads':
            return createKeypadsModule(id);
        case 'simon':
            return createSimonModule(id);
        case 'whosonfirst':
            return createWhosOnFirstModule(id);
        case 'memory':
            return createMemoryModule(id);
        case 'morse':
            return createMorseModule(id);
        case 'complex-wires':
            return createComplexWiresModule(id);
        default:
            return createWiresModule(id);
    }
}

// Wire Module
function createWiresModule(id) {
    const wireCount = Math.floor(Math.random() * 4) + 3; // 3-6 wires
    const colors = ['red', 'blue', 'yellow', 'black', 'white'];
    const wires = [];
    
    for (let i = 0; i < wireCount; i++) {
        wires.push({
            color: colors[Math.floor(Math.random() * colors.length)],
            cut: false
        });
    }
    
    const correctWire = calculateCorrectWire(wires);
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Simple Wires</div>
        <div class="wires-container" data-module-id="${id}"></div>
    `;
    
    const wiresContainer = moduleDiv.querySelector('.wires-container');
    wires.forEach((wire, index) => {
        const wireDiv = document.createElement('div');
        wireDiv.className = `wire ${wire.color}`;
        wireDiv.dataset.index = index;
        wireDiv.addEventListener('click', () => cutWire(id, index));
        wiresContainer.appendChild(wireDiv);
    });
    
    return {
        id,
        type: 'wires',
        element: moduleDiv,
        data: { wires, correctWire },
        solved: false
    };
}

function calculateCorrectWire(wires) {
    const count = wires.length;
    const serialLastDigit = parseInt(gameState.serialNumber[gameState.serialNumber.length - 1]);
    const isOdd = serialLastDigit % 2 === 1;
    
    const countColor = (color) => wires.filter(w => w.color === color).length;
    const lastColor = wires[wires.length - 1].color;
    
    if (count === 3) {
        if (countColor('red') === 0) return 1;
        if (lastColor === 'white') return wires.length - 1;
        if (countColor('blue') > 1) {
            // Find last blue wire
            for (let i = wires.length - 1; i >= 0; i--) {
                if (wires[i].color === 'blue') return i;
            }
        }
        return wires.length - 1;
    }
    
    if (count === 4) {
        if (countColor('red') > 1 && isOdd) {
            for (let i = wires.length - 1; i >= 0; i--) {
                if (wires[i].color === 'red') return i;
            }
        }
        if (lastColor === 'yellow' && countColor('red') === 0) return 0;
        if (countColor('blue') === 1) return 0;
        if (countColor('yellow') > 1) return wires.length - 1;
        return 1;
    }
    
    if (count === 5) {
        if (lastColor === 'black' && isOdd) return 3;
        if (countColor('red') === 1 && countColor('yellow') > 1) return 0;
        if (countColor('black') === 0) return 1;
        return 0;
    }
    
    if (count === 6) {
        if (countColor('yellow') === 0 && isOdd) return 2;
        if (countColor('yellow') === 1 && countColor('white') > 1) return 3;
        if (countColor('red') === 0) return wires.length - 1;
        return 3;
    }
    
    return 0;
}

function cutWire(moduleId, wireIndex) {
    const module = gameState.modules.find(m => m.id === moduleId);
    if (module.solved) return;
    
    const wire = module.data.wires[wireIndex];
    if (wire.cut) return;
    
    wire.cut = true;
    
    const wireElement = module.element.querySelector(`[data-index="${wireIndex}"]`);
    wireElement.classList.add('cut');
    
    if (wireIndex === module.data.correctWire) {
        solveModule(moduleId);
    } else {
        addStrike();
        module.element.classList.add('error');
        setTimeout(() => module.element.classList.remove('error'), 300);
    }
}

// Button Module
function createButtonModule(id) {
    const colors = ['red', 'blue', 'yellow', 'white'];
    const labels = ['Abort', 'Detonate', 'Hold', 'Press'];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const label = labels[Math.floor(Math.random() * labels.length)];
    
    const shouldHold = calculateButtonAction(color, label);
    const stripColor = ['blue', 'white', 'yellow', 'red'][Math.floor(Math.random() * 4)];
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">The Button</div>
        <div class="button-container">
            <button class="big-button ${color}" data-module-id="${id}">${label}</button>
            <div class="strip-indicator" style="display: none;">
                Strip Color: <span class="strip-color" style="background: ${stripColor};"></span>
            </div>
        </div>
    `;
    
    const button = moduleDiv.querySelector('.big-button');
    const stripIndicator = moduleDiv.querySelector('.strip-indicator');
    
    let pressTime = 0;
    let holding = false;
    
    button.addEventListener('mousedown', () => {
        pressTime = Date.now();
        holding = true;
        button.classList.add('pressed');
        
        if (shouldHold) {
            setTimeout(() => {
                if (holding) {
                    stripIndicator.style.display = 'block';
                }
            }, 500);
        }
    });
    
    button.addEventListener('mouseup', () => {
        const holdTime = Date.now() - pressTime;
        holding = false;
        button.classList.remove('pressed');
        
        if (shouldHold && holdTime >= 500) {
            // Check if released at correct time
            const correctDigit = getCorrectReleaseDigit(stripColor);
            const timerText = document.getElementById('timer-display').textContent;
            
            if (timerText.includes(correctDigit)) {
                solveModule(id);
            } else {
                addStrike();
                moduleDiv.classList.add('error');
                setTimeout(() => moduleDiv.classList.remove('error'), 300);
            }
        } else if (!shouldHold && holdTime < 500) {
            solveModule(id);
        } else {
            addStrike();
            moduleDiv.classList.add('error');
            setTimeout(() => moduleDiv.classList.remove('error'), 300);
        }
        
        stripIndicator.style.display = 'none';
    });
    
    return {
        id,
        type: 'button',
        element: moduleDiv,
        data: { color, label, shouldHold, stripColor },
        solved: false
    };
}

function calculateButtonAction(color, label) {
    // Simplified button rules (assuming 2+ batteries and no special indicators for simplicity)
    if (color === 'blue' && label === 'Abort') return true;
    if (label === 'Detonate') return false; // Assuming 2+ batteries
    if (color === 'white') return true; // Assuming CAR indicator
    if (color === 'yellow') return true;
    if (color === 'red' && label === 'Hold') return false;
    return true;
}

function getCorrectReleaseDigit(stripColor) {
    switch(stripColor) {
        case 'blue': return '4';
        case 'white': return '1';
        case 'yellow': return '5';
        default: return '1';
    }
}

// Keypads Module
function createKeypadsModule(id) {
    const allSymbols = ['☺', '★', '©', '¶', '§', 'Ω', 'λ', 'ψ', 'Ϙ', 'Җ', 'Ѧ', 'Ͱ'];
    
    // Select 4 random symbols
    const symbols = [];
    const shuffled = [...allSymbols].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 4; i++) {
        symbols.push(shuffled[i]);
    }
    
    // Shuffle for display
    const displaySymbols = [...symbols].sort(() => Math.random() - 0.5);
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Keypads</div>
        <div class="keypads-container" data-module-id="${id}"></div>
    `;
    
    const container = moduleDiv.querySelector('.keypads-container');
    const pressedOrder = [];
    
    displaySymbols.forEach((symbol, index) => {
        const btn = document.createElement('button');
        btn.className = 'keypad-button';
        btn.textContent = symbol;
        btn.dataset.symbol = symbol;
        btn.addEventListener('click', () => {
            if (btn.classList.contains('pressed')) return;
            
            btn.classList.add('pressed');
            pressedOrder.push(symbol);
            
            if (pressedOrder.length === 4) {
                // Check if order is correct
                const correct = symbols.every((sym, i) => sym === pressedOrder[i]);
                
                if (correct) {
                    solveModule(id);
                } else {
                    addStrike();
                    moduleDiv.classList.add('error');
                    setTimeout(() => {
                        moduleDiv.classList.remove('error');
                        // Reset
                        container.querySelectorAll('.keypad-button').forEach(b => {
                            b.classList.remove('pressed');
                        });
                        pressedOrder.length = 0;
                    }, 1000);
                }
            }
        });
        container.appendChild(btn);
    });
    
    return {
        id,
        type: 'keypads',
        element: moduleDiv,
        data: { correctOrder: symbols },
        solved: false
    };
}

// Simon Says Module
function createSimonModule(id) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Simon Says</div>
        <div class="simon-container" data-module-id="${id}">
            <div class="simon-button red top-left" data-color="red"></div>
            <div class="simon-button blue top-right" data-color="blue"></div>
            <div class="simon-button green bottom-left" data-color="green"></div>
            <div class="simon-button yellow bottom-right" data-color="yellow"></div>
        </div>
        <div class="simon-info">Stage: <span class="simon-stage">1</span></div>
    `;
    
    const colors = ['red', 'blue', 'green', 'yellow'];
    const sequence = [];
    let stage = 1;
    let playerSequence = [];
    let showingSequence = false;
    
    const addToSequence = () => {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    };
    
    const showSequence = async () => {
        showingSequence = true;
        for (const color of sequence) {
            const btn = moduleDiv.querySelector(`[data-color="${color}"]`);
            btn.classList.add('active');
            playSound('beep');
            await sleep(400);
            btn.classList.remove('active');
            await sleep(200);
        }
        showingSequence = false;
    };
    
    const buttons = moduleDiv.querySelectorAll('.simon-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (showingSequence) return;
            
            const color = btn.dataset.color;
            const translatedColor = translateSimonColor(color);
            
            btn.classList.add('active');
            playSound('beep');
            setTimeout(() => btn.classList.remove('active'), 200);
            
            playerSequence.push(translatedColor);
            
            // Check if correct so far
            const correctSoFar = playerSequence.every((c, i) => c === sequence[i]);
            
            if (!correctSoFar) {
                addStrike();
                moduleDiv.classList.add('error');
                setTimeout(() => moduleDiv.classList.remove('error'), 300);
                playerSequence = [];
                showSequence();
                return;
            }
            
            // Check if completed stage
            if (playerSequence.length === sequence.length) {
                if (stage >= 5) {
                    solveModule(id);
                } else {
                    stage++;
                    playerSequence = [];
                    addToSequence();
                    moduleDiv.querySelector('.simon-stage').textContent = stage;
                    setTimeout(() => showSequence(), 1000);
                }
            }
        });
    });
    
    // Initialize
    addToSequence();
    setTimeout(() => showSequence(), 500);
    
    return {
        id,
        type: 'simon',
        element: moduleDiv,
        data: { sequence, stage },
        solved: false
    };
}

function translateSimonColor(color) {
    // Simplified: assuming no vowel in serial and no strikes
    const hasVowel = /[AEIOU]/.test(gameState.serialNumber);
    const strikes = gameState.strikes;
    
    const tables = [
        // 0 strikes
        {
            vowel: { red: 'blue', blue: 'red', green: 'yellow', yellow: 'green' },
            noVowel: { red: 'blue', blue: 'yellow', green: 'green', yellow: 'red' }
        },
        // 1 strike
        {
            vowel: { red: 'yellow', blue: 'green', green: 'blue', yellow: 'red' },
            noVowel: { red: 'red', blue: 'blue', green: 'yellow', yellow: 'green' }
        },
        // 2 strikes
        {
            vowel: { red: 'green', blue: 'red', green: 'yellow', yellow: 'blue' },
            noVowel: { red: 'yellow', blue: 'green', green: 'blue', yellow: 'red' }
        }
    ];
    
    const table = tables[Math.min(strikes, 2)];
    return hasVowel ? table.vowel[color] : table.noVowel[color];
}

// Who's On First Module
function createWhosOnFirstModule(id) {
    const displayWords = ['YES', 'NO', 'NOTHING', 'BLANK', 'READY', 'FIRST', 'PRESS', 'WHAT'];
    const buttonWords = ['READY', 'FIRST', 'NO', 'BLANK', 'NOTHING', 'YES'];
    
    const displayWord = displayWords[Math.floor(Math.random() * displayWords.length)];
    const shuffledButtons = [...buttonWords].sort(() => Math.random() - 0.5);
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Who's On First</div>
        <div class="whosonfirst-container">
            <div class="display-word">${displayWord}</div>
            <div class="word-buttons" data-module-id="${id}"></div>
        </div>
    `;
    
    const container = moduleDiv.querySelector('.word-buttons');
    const correctWord = getWhosOnFirstAnswer(displayWord, shuffledButtons);
    
    shuffledButtons.forEach(word => {
        const btn = document.createElement('button');
        btn.className = 'word-button';
        btn.textContent = word;
        btn.addEventListener('click', () => {
            if (word === correctWord) {
                solveModule(id);
            } else {
                addStrike();
                moduleDiv.classList.add('error');
                setTimeout(() => moduleDiv.classList.remove('error'), 300);
            }
        });
        container.appendChild(btn);
    });
    
    return {
        id,
        type: 'whosonfirst',
        element: moduleDiv,
        data: { displayWord, correctWord },
        solved: false
    };
}

function getWhosOnFirstAnswer(displayWord, availableButtons) {
    // Simplified logic - just pick first available button from a priority list
    const priorities = {
        'YES': ['READY', 'YES', 'NOTHING', 'BLANK'],
        'NO': ['BLANK', 'READY', 'YES', 'NOTHING'],
        'NOTHING': ['YES', 'READY', 'BLANK'],
        'BLANK': ['READY', 'YES', 'NOTHING'],
        'READY': ['YES', 'READY', 'NOTHING', 'BLANK'],
        'FIRST': ['READY', 'YES', 'NOTHING'],
        'PRESS': ['YES', 'READY', 'NOTHING', 'BLANK'],
        'WHAT': ['YES', 'NOTHING', 'READY', 'BLANK']
    };
    
    const priority = priorities[displayWord] || ['YES', 'READY', 'NOTHING', 'BLANK'];
    
    for (const word of priority) {
        if (availableButtons.includes(word)) {
            return word;
        }
    }
    
    return availableButtons[0];
}

// Memory Module
function createMemoryModule(id) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Memory</div>
        <div class="memory-container">
            <div class="memory-stage">Stage: <span>1</span></div>
            <div class="memory-display">1</div>
            <div class="memory-buttons" data-module-id="${id}"></div>
        </div>
    `;
    
    let stage = 1;
    const history = [];
    
    const setupStage = () => {
        const display = Math.floor(Math.random() * 4) + 1;
        const labels = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
        
        moduleDiv.querySelector('.memory-display').textContent = display;
        moduleDiv.querySelector('.memory-stage span').textContent = stage;
        
        const container = moduleDiv.querySelector('.memory-buttons');
        container.innerHTML = '';
        
        labels.forEach((label, position) => {
            const btn = document.createElement('button');
            btn.className = 'memory-button';
            btn.textContent = label;
            btn.dataset.position = position + 1;
            btn.dataset.label = label;
            
            btn.addEventListener('click', () => {
                const correctAction = getMemoryAction(stage, display, history);
                let correct = false;
                
                if (correctAction.type === 'position') {
                    correct = (position + 1) === correctAction.value;
                } else if (correctAction.type === 'label') {
                    correct = label === correctAction.value;
                }
                
                if (correct) {
                    history.push({ position: position + 1, label: label });
                    
                    if (stage >= 5) {
                        solveModule(id);
                    } else {
                        stage++;
                        setTimeout(() => setupStage(), 500);
                    }
                } else {
                    addStrike();
                    moduleDiv.classList.add('error');
                    setTimeout(() => moduleDiv.classList.remove('error'), 300);
                }
            });
            
            container.appendChild(btn);
        });
    };
    
    setupStage();
    
    return {
        id,
        type: 'memory',
        element: moduleDiv,
        data: { stage, history },
        solved: false
    };
}

function getMemoryAction(stage, display, history) {
    // Simplified memory rules
    if (stage === 1) {
        if (display <= 2) return { type: 'position', value: 2 };
        if (display === 3) return { type: 'position', value: 3 };
        return { type: 'position', value: 4 };
    }
    
    if (stage === 2) {
        if (display === 1) return { type: 'label', value: 4 };
        if (display === 2 || display === 4) return { type: 'position', value: history[0].position };
        return { type: 'position', value: 1 };
    }
    
    if (stage === 3) {
        if (display === 1) return { type: 'label', value: history[1].label };
        if (display === 2) return { type: 'label', value: history[0].label };
        if (display === 3) return { type: 'position', value: 3 };
        return { type: 'label', value: 4 };
    }
    
    if (stage === 4) {
        if (display === 1) return { type: 'position', value: history[0].position };
        if (display === 2) return { type: 'position', value: 1 };
        return { type: 'position', value: history[1].position };
    }
    
    if (stage === 5) {
        if (display === 1) return { type: 'label', value: history[0].label };
        if (display === 2) return { type: 'label', value: history[1].label };
        if (display === 3) return { type: 'label', value: history[3].label };
        return { type: 'label', value: history[2].label };
    }
    
    return { type: 'position', value: 1 };
}

// Morse Code Module
function createMorseModule(id) {
    const words = ['SHELL', 'HALLS', 'SLICK', 'TRICK', 'BOXES', 'LEAKS'];
    const frequencies = {
        'SHELL': 3.505,
        'HALLS': 3.515,
        'SLICK': 3.522,
        'TRICK': 3.532,
        'BOXES': 3.535,
        'LEAKS': 3.542
    };
    
    const word = words[Math.floor(Math.random() * words.length)];
    const correctFreq = frequencies[word];
    
    const morseCode = {
        'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
        'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
        'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
        'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
        'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−', 'Z': '−−··'
    };
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Morse Code</div>
        <div class="morse-container">
            <div class="morse-light"></div>
            <div class="morse-word"></div>
            <div class="frequency-controls">
                <button class="freq-button" data-dir="down">◄</button>
                <div class="frequency-display">3.505</div>
                <button class="freq-button" data-dir="up">►</button>
            </div>
            <button class="morse-submit" data-module-id="${id}">Submit</button>
        </div>
    `;
    
    const light = moduleDiv.querySelector('.morse-light');
    const wordDisplay = moduleDiv.querySelector('.morse-word');
    const freqDisplay = moduleDiv.querySelector('.frequency-display');
    let currentFreq = 3.505;
    
    // Show morse code
    const playMorse = async () => {
        for (const letter of word) {
            const code = morseCode[letter];
            for (const symbol of code) {
                light.classList.add('on');
                await sleep(symbol === '·' ? 200 : 600);
                light.classList.remove('on');
                await sleep(200);
            }
            await sleep(400);
        }
        await sleep(2000);
        playMorse();
    };
    
    // Show word after some time (hint)
    setTimeout(() => {
        wordDisplay.textContent = word;
    }, 10000);
    
    // Frequency controls
    moduleDiv.querySelectorAll('.freq-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            if (dir === 'up') {
                currentFreq = Math.min(3.600, currentFreq + 0.005);
            } else {
                currentFreq = Math.max(3.500, currentFreq - 0.005);
            }
            currentFreq = Math.round(currentFreq * 1000) / 1000;
            freqDisplay.textContent = currentFreq.toFixed(3);
        });
    });
    
    // Submit
    moduleDiv.querySelector('.morse-submit').addEventListener('click', () => {
        if (Math.abs(currentFreq - correctFreq) < 0.001) {
            solveModule(id);
        } else {
            addStrike();
            moduleDiv.classList.add('error');
            setTimeout(() => moduleDiv.classList.remove('error'), 300);
        }
    });
    
    playMorse();
    
    return {
        id,
        type: 'morse',
        element: moduleDiv,
        data: { word, correctFreq },
        solved: false
    };
}

// Complicated Wires Module
function createComplexWiresModule(id) {
    const wireCount = Math.floor(Math.random() * 3) + 4; // 4-6 wires
    const wires = [];
    
    for (let i = 0; i < wireCount; i++) {
        wires.push({
            red: Math.random() > 0.5,
            blue: Math.random() > 0.5,
            led: Math.random() > 0.5,
            star: Math.random() > 0.5,
            cut: false
        });
    }
    
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module';
    moduleDiv.innerHTML = `
        <div class="module-title">Complicated Wires</div>
        <div class="complex-wires-container" data-module-id="${id}"></div>
    `;
    
    const container = moduleDiv.querySelector('.complex-wires-container');
    
    wires.forEach((wire, index) => {
        const wireDiv = document.createElement('div');
        wireDiv.className = 'complex-wire';
        
        let color = '#fff';
        if (wire.red && wire.blue) color = '#f0f';
        else if (wire.red) color = '#f00';
        else if (wire.blue) color = '#00f';
        
        wireDiv.innerHTML = `
            <div class="wire-visual" style="background: ${color};"></div>
            <div class="wire-led ${wire.led ? 'on' : ''}"></div>
            <div class="wire-star">${wire.star ? '★' : ''}</div>
            <button class="cut-wire-btn" data-index="${index}">Cut</button>
        `;
        
        wireDiv.querySelector('.cut-wire-btn').addEventListener('click', function() {
            if (wire.cut) return;
            
            const shouldCut = shouldCutComplexWire(wire);
            wire.cut = true;
            this.disabled = true;
            wireDiv.style.opacity = '0.5';
            
            if (shouldCut) {
                // Correct - check if all necessary wires are cut
                checkComplexWiresCompletion(id);
            } else {
                addStrike();
                moduleDiv.classList.add('error');
                setTimeout(() => moduleDiv.classList.remove('error'), 300);
            }
        });
        
        container.appendChild(wireDiv);
    });
    
    return {
        id,
        type: 'complex-wires',
        element: moduleDiv,
        data: { wires },
        solved: false
    };
}

function shouldCutComplexWire(wire) {
    // Simplified rules
    const serialLastDigit = parseInt(gameState.serialNumber[gameState.serialNumber.length - 1]);
    const isEven = serialLastDigit % 2 === 0;
    
    if (!wire.red && !wire.blue && !wire.led && !wire.star) return true;
    if (!wire.red && !wire.blue && !wire.led && wire.star) return false;
    if (!wire.red && !wire.blue && wire.led) return isEven;
    if (wire.red && !wire.blue && !wire.led && !wire.star) return isEven;
    if (wire.red && !wire.blue && !wire.led && wire.star) return true;
    if (wire.red && !wire.blue && wire.led) return true; // Simplified: assuming parallel port
    if (!wire.red && wire.blue && !wire.led && !wire.star) return isEven;
    if (!wire.red && wire.blue && !wire.led && wire.star) return false;
    if (!wire.red && wire.blue && wire.led) return true; // Simplified
    if (wire.red && wire.blue && !wire.led) return isEven;
    if (wire.red && wire.blue && wire.led && !wire.star) return true; // Simplified: assuming 2+ batteries
    if (wire.red && wire.blue && wire.led && wire.star) return false;
    
    return false;
}

function checkComplexWiresCompletion(moduleId) {
    const module = gameState.modules.find(m => m.id === moduleId);
    
    // Check if all wires that should be cut are cut
    const allCorrect = module.data.wires.every(wire => {
        const shouldCut = shouldCutComplexWire(wire);
        return shouldCut === wire.cut || !shouldCut;
    });
    
    const allNecessaryCut = module.data.wires.every(wire => {
        const shouldCut = shouldCutComplexWire(wire);
        return !shouldCut || wire.cut;
    });
    
    if (allNecessaryCut) {
        solveModule(moduleId);
    }
}

// Module Completion
function solveModule(moduleId) {
    const module = gameState.modules.find(m => m.id === moduleId);
    if (module.solved) return;
    
    module.solved = true;
    module.element.classList.add('solved');
    gameState.solvedModules++;
    
    playSound('success');
    
    if (gameState.solvedModules >= gameState.modules.length) {
        winGame();
    }
}

// Game End
function winGame() {
    clearInterval(gameState.timerInterval);
    
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    document.getElementById('win-time').textContent = 
        `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    playSound('win');
    showScreen('win-screen');
}

function loseGame(reason) {
    clearInterval(gameState.timerInterval);
    
    document.getElementById('lose-reason').textContent = reason;
    
    playSound('lose');
    showScreen('lose-screen');
}

function quitGame() {
    if (confirm('Are you sure you want to quit?')) {
        clearInterval(gameState.timerInterval);
        showScreen('main-menu');
    }
}

// Utility Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'beep':
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;
            break;
        case 'success':
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.2;
            break;
        case 'strike':
            oscillator.frequency.value = 220;
            gainNode.gain.value = 0.3;
            break;
        case 'win':
            oscillator.frequency.value = 660;
            gainNode.gain.value = 0.2;
            break;
        case 'lose':
            oscillator.frequency.value = 110;
            gainNode.gain.value = 0.3;
            break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}
