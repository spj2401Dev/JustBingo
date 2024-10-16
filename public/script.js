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

    const createFieldCell = (cell, wordObj) => {
        cell.addEventListener('click', () => {
            cell.classList.toggle('marked');
        });

        cell.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            cell.classList.toggle('disabled');
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
