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

    const createBingoCell = (word) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell');
        cell.textContent = word;
        cell.addEventListener('click', () => {
            cell.classList.toggle('marked');
        });
        return cell;
    };

    const populateBingoGrid = (words) => {
        const grid = document.getElementById('bingoGrid');
        words.slice(0, 25).forEach((word) => {
            const cell = createBingoCell(word);
            grid.appendChild(cell);
        });
    };

    const initializeBingoGrid = async () => {
        const words = await fetchWords();
        populateBingoGrid(words);
    };

    initializeBingoGrid();
});
