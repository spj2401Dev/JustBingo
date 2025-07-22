/**
 * FreeCell - Handles free bingo cells
 * Creates cells that are automatically marked as "free" spaces
 */
export class FreeCell {
    constructor(cell, wordObj, confettiColors, checkForBingo) {
        this.cell = cell;
        this.wordObj = wordObj;
        this.confettiColors = confettiColors;
        this.checkForBingo = checkForBingo;
        
        this.init();
    }

    init() {
        this.cell.classList.add('free-cell');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.cell.addEventListener('click', () => {
            this.cell.classList.toggle('marked');
            setTimeout(() => this.checkForBingo(), 100);
        });
    }

    destroy() {
    }
}

export default FreeCell;
