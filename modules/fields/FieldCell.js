/**
 * FieldCell - Handles regular bingo field cells
 * Creates interactive cells that can be marked/unmarked and disabled
 */
export class FieldCell {
    constructor(cell, wordObj, confettiColors, checkForBingo) {
        this.cell = cell;
        this.wordObj = wordObj;
        this.confettiColors = confettiColors;
        this.checkForBingo = checkForBingo;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.cell.addEventListener('click', (event) => {
            this.cell.classList.toggle('marked');
            if (this.cell.classList.contains('marked')) {
                this.showConfetti(event);
            }
            setTimeout(() => this.checkForBingo(), 100);
        });

        this.cell.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.cell.classList.toggle('disabled');
        });
    }

    showConfetti(event) {
        const x = event.clientX;
        const y = event.clientY;

        confetti({
            particleCount: 10,
            spread: 60,
            colors: this.confettiColors,
            startVelocity: 20,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight 
            }
        });
    }

    destroy() {
    }
}

export default FieldCell;
