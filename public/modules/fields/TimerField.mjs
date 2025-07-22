/**
 * TimerField - Handles timer-based bingo cells
 * Creates interactive timer cells that can be started, paused, and reset
 */
export class TimerField {
    constructor(cell, wordObj, confettiColors, checkForBingo) {
        this.cell = cell;
        this.wordObj = wordObj;
        this.confettiColors = confettiColors;
        this.checkForBingo = checkForBingo;
        
        this.timerDuration = parseInt(wordObj.time) || 30;
        this.remainingTime = this.timerDuration;
        this.timerInterval = null;
        this.timerState = 'ready'; // States: 'ready', 'running', 'paused', 'completed', 'disabled'
        
        this.init();
    }

    init() {
        this.cell.classList.add('timer-cell');
        
        const wordText = this.cell.textContent;
        this.cell.textContent = '';
        
        const wordElement = document.createElement('div');
        wordElement.textContent = wordText;
        wordElement.className = 'timer-word';
        
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'timer-display';
        this.timerDisplay.textContent = `${this.remainingTime}s`;
        
        this.cell.appendChild(wordElement);
        this.cell.appendChild(this.timerDisplay);
        
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        this.cell.addEventListener('click', (event) => {
            event.preventDefault();
            
            switch (this.timerState) {
                case 'ready':
                    this.startTimer();
                    break;
                case 'running':
                    this.pauseTimer();
                    break;
                case 'paused':
                    this.startTimer();
                    break;
                case 'completed':
                    this.resetTimer();
                    break;
                case 'disabled':
                    break;
            }
        });
        
        this.cell.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            
            if (this.timerState === 'disabled') {
                this.enableTimer();
            } else if (this.timerState === 'completed') {
                this.disableTimer(true);
            } else {
                this.resetTimer();
                this.disableTimer(false);
            }
        });
    }

    updateDisplay() {
        this.timerDisplay.textContent = `${this.remainingTime}s`;
        
        this.cell.classList.remove('timer-running', 'timer-paused', 'timer-completed');
        switch (this.timerState) {
            case 'running':
                this.cell.classList.add('timer-running');
                break;
            case 'paused':
                this.cell.classList.add('timer-paused');
                break;
            case 'completed':
                this.cell.classList.add('timer-completed', 'marked');
                break;
        }
    }

    startTimer() {
        if (this.timerState === 'disabled') return;
        
        this.timerState = 'running';
        this.updateDisplay();
        
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.timerDisplay.textContent = `${this.remainingTime}s`;
            
            if (this.remainingTime <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.timerState = 'completed';
                this.updateDisplay();
                
                this.showCompletionConfetti();
                this.checkForBingo();
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.timerState = 'paused';
            this.updateDisplay();
        }
    }

    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.remainingTime = this.timerDuration;
        this.timerState = 'ready';
        this.cell.classList.remove('timer-running', 'timer-paused', 'timer-completed', 'marked');
        this.updateDisplay();
    }

    disableTimer(keepCompletedState = false) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerState = 'disabled';
        this.cell.classList.add('disabled');
        
        if (keepCompletedState) {
            this.cell.classList.remove('timer-running', 'timer-paused', 'timer-completed');
        } else {
            this.cell.classList.remove('timer-running', 'timer-paused', 'timer-completed', 'marked');
        }
    }

    enableTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.remainingTime = this.timerDuration;
        this.timerState = 'ready';
        this.cell.classList.remove('disabled', 'timer-running', 'timer-paused', 'timer-completed', 'marked');
        this.updateDisplay();
    }

    showCompletionConfetti() {
        const rect = this.cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        confetti({
            particleCount: 15,
            spread: 70,
            colors: this.confettiColors,
            startVelocity: 25,
            origin: {
                x: x / window.innerWidth,
                y: y / window.innerHeight 
            }
        });
    }

    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

export default TimerField;
