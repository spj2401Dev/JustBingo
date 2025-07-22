import { apiService } from './modules/ApiService.mjs';
import CellFactory from './modules/fields/index.mjs';

document.addEventListener("DOMContentLoaded", async () => {
    
    await apiService.initialize();
    
    const fetchWords = async () => {
        try {
            return await apiService.getWords();
        } catch (error) {
            console.error('Error fetching the words:', error);
            return [];
        }
    };

    const createBingoCell = (wordObj) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        cell.textContent = wordObj.word;

        CellFactory.createCell(cell, wordObj, checkForBingo);

        return cell;
    };

    const confettiColors = ['#42f569', '#23522d', '#05756a', '#6dd16d', '#0caae8'];

    const checkForBingo = () => {
        const grid = document.getElementById('bingoGrid');
        const cells = Array.from(grid.children);
        
        const isMarked = (index) => {
            const cell = cells[index];
            return cell && cell.classList.contains('marked') && !cell.classList.contains('disabled');
        };

        const bingoPatterns = [
            // Rows
            [0, 1, 2, 3, 4],
            [5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24],
            // Columns
            [0, 5, 10, 15, 20],
            [1, 6, 11, 16, 21],
            [2, 7, 12, 17, 22],
            [3, 8, 13, 18, 23],
            [4, 9, 14, 19, 24],
            // Diagonals
            [0, 6, 12, 18, 24],
            [4, 8, 12, 16, 20]
        ];

        let completedLines = 0;
        for (const pattern of bingoPatterns) {
            if (pattern.every(index => isMarked(index))) {
                completedLines++;
            }
        }

        const totalCells = cells.length;
        const disabledCells = cells.filter(cell => cell.classList.contains('disabled')).length;
        const markedCells = cells.filter(cell => cell.classList.contains('marked') && !cell.classList.contains('disabled')).length;
        const requiredForFullHouse = totalCells - disabledCells;
        const isFullHouse = markedCells === requiredForFullHouse;

        if (isFullHouse && !grid.dataset.fullHouseTriggered) {
            triggerFullHouseCelebration();
            grid.dataset.fullHouseTriggered = 'true';
            return true;
        } else if (completedLines >= 2 && !grid.dataset.twoLinesTriggered) {
            triggerTwoLinesCelebration();
            grid.dataset.twoLinesTriggered = 'true';
            return true;
        } else if (completedLines >= 1 && !grid.dataset.oneLineTriggered) {
            triggerOneLineCelebration();
            grid.dataset.oneLineTriggered = 'true';
            return true;
        }

        return false;
    };

    const triggerOneLineCelebration = () => {
        console.log('ONE LINE CELEBRATION TRIGGERED!');
        confetti({
            particleCount: 50,
            spread: 70,
            colors: confettiColors,
            startVelocity: 25,
            origin: { x: 0.5, y: 0.6 }
        });
        
        showBingoMessage('BINGO! 🎉', '#42f569', '2.5rem');
    };

    const triggerTwoLinesCelebration = () => {
        confetti({
            particleCount: 100,
            spread: 90,
            colors: confettiColors,
            startVelocity: 30,
            origin: { x: 0.5, y: 0.6 }
        });
        
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 60,
                colors: confettiColors,
                startVelocity: 20,
                origin: { x: 0.3, y: 0.7 }
            });
            confetti({
                particleCount: 50,
                spread: 60,
                colors: confettiColors,
                startVelocity: 20,
                origin: { x: 0.7, y: 0.7 }
            });
        }, 200);
        
        showBingoMessage('BINGO! 🎉🎉', '#42f569', '3rem');
    };

    const triggerFullHouseCelebration = () => {
        confetti({
            particleCount: 200,
            spread: 120,
            colors: confettiColors,
            startVelocity: 45,
            origin: { x: 0.5, y: 0.5 }
        });
        
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 80,
                colors: confettiColors,
                startVelocity: 35,
                origin: { x: 0.2, y: 0.6 }
            });
            confetti({
                particleCount: 100,
                spread: 80,
                colors: confettiColors,
                startVelocity: 35,
                origin: { x: 0.8, y: 0.6 }
            });
        }, 300);
        
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                colors: confettiColors,
                startVelocity: 40,
                origin: { x: 0.5, y: 0.3 }
            });
        }, 600);
        
        showBingoMessage('BINGO! Lingo! 🏆🎉', '#42f569', '3.5rem');
    };

    const showBingoMessage = (text, color = '#42f569', fontSize = '3rem') => {
        console.log(`Showing bingo message: ${text}`);
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${fontSize};
            font-weight: bold;
            color: ${color};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            font-family: 'Merriweather', serif;
            animation: bingoAnimation 3s ease-out forwards;
            pointer-events: none;
            text-align: center;
        `;
        
        if (!document.getElementById('bingo-styles')) {
            const style = document.createElement('style');
            style.id = 'bingo-styles';
            style.textContent = `
                @keyframes bingoAnimation {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
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
