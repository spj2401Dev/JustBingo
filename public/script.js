
document.addEventListener("DOMContentLoaded", () => {
    
    const fetchWords = async () => {
        try {
            const response = await fetch('/api/words');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching the words:', error);
            return [];
        }
    };

    const createBingoCell = (wordObj) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        cell.textContent = wordObj.word;

        switch (wordObj.type) {
            case 'Field':
                createFieldCell(cell, wordObj);
                break;
            case 'Timer':
                createFieldCell(cell, wordObj); // Not implemented yet
                break;
            case 'Free':
                createFreeCell(cell, wordObj);
                break;
            default:
                console.error(`Unknown word type: ${wordObj.type}`);
        }

        return cell;
    };

    var confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8']

    const createFieldCell = (cell, wordObj) => {
        cell.addEventListener('click', (event) => {
            cell.classList.toggle('marked');
            if (cell.classList.contains('marked')) {
                showConfetti(event);
            }
        });

        cell.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            cell.classList.toggle('disabled');
        });
    };

    const showConfetti = (event) => {
        const x = event.clientX;
        const y = event.clientY;

        
        confetti({
            particleCount: 10,
            spread: 60,
            colors: confettiColors,
            startVelocity: 20,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight 
            }
        });
    };

    const createFreeCell = (cell, wordObj) => {
        cell.classList.add('free-cell');
        cell.addEventListener('click', () => {
            cell.classList.toggle('marked');
        });
    };

    const populateBingoGrid = (words) => {
        const grid = document.getElementById('bingoGrid');
        let freeWord = null;

        const freeWords = words.filter(word => word.type === 'Free');
        if (freeWords.length > 0) {
            freeWord = freeWords[Math.floor(Math.random() * freeWords.length)];
        }

        const nonFreeWords = words.filter(word => word.type !== 'Free' || word.word !== freeWord?.word);

        nonFreeWords.slice(0, 24).forEach((wordObj) => {
            const cell = createBingoCell(wordObj);
            grid.appendChild(cell);
        });

        if (freeWord) {
            const middleCellIndex = 12; 
            const middleCell = createBingoCell(freeWord);
            grid.insertBefore(middleCell, grid.children[middleCellIndex]);
        }
    };

    const initializeBingoGrid = async () => {
        const words = await fetchWords();
        populateBingoGrid(words);
    };

    initializeBingoGrid();
});

// unessesary code

var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
};
  
var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
var konamiCodePosition = 0;
  
document.addEventListener('keydown', function(e) {
    var key = allowedKeys[e.keyCode];
    var requiredKey = konamiCode[konamiCodePosition];
  
    if (key == requiredKey) {
        konamiCodePosition++;
        if (konamiCodePosition == konamiCode.length) {
            fireworkConfetti()
            konamiCodePosition = 0;
        }   
    } else {
      konamiCodePosition = 0;
    }
});

function fireworkConfetti() {
    var confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8']
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors: confettiColors };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);

    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}