/**
 * WordField - Admin interface component for managing word fields
 * Creates form elements for editing word field properties (text, type, timer duration)
 */
export class WordField {
    constructor(value = '', type = 'Field', time = '') {
        this.value = value;
        this.type = type;
        this.time = time;
        this.container = null;
        this.timeInput = null;
        this.inputField = null;
        this.typeDropdown = null;
        this.removeButton = null;
        
        this.init();
    }

    init() {
        this.createContainer();
        this.createTimeInput();
        this.createInputField();
        this.createTypeDropdown();
        this.createRemoveButton();
        this.assembleComponents();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'word-field-container';
    }

    createTimeInput() {
        this.timeInput = document.createElement('input');
        this.timeInput.type = 'number';
        this.timeInput.placeholder = 'Sec';
        this.timeInput.className = 'time-field';
        this.timeInput.value = this.time;
        this.timeInput.style.display = this.type === 'Timer' ? 'block' : 'none';
    }

    createInputField() {
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.value = this.value;
        this.inputField.className = 'word-field';
    }

    createTypeDropdown() {
        this.typeDropdown = document.createElement('select');
        this.typeDropdown.className = 'word-type';
        
        const options = ['Field', 'Free', 'Timer'];
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (option === this.type) opt.selected = true;
            this.typeDropdown.appendChild(opt);
        });
    }

    createRemoveButton() {
        this.removeButton = document.createElement('button');
        this.removeButton.textContent = 'X';
        this.removeButton.className = 'remove-button';
    }

    assembleComponents() {
        this.container.appendChild(this.timeInput);
        this.container.appendChild(this.inputField);
        this.container.appendChild(this.typeDropdown);
        this.container.appendChild(this.removeButton);
    }

    setupEventListeners() {
        this.typeDropdown.addEventListener('change', () => {
            this.type = this.typeDropdown.value;
            if (this.typeDropdown.value === 'Timer') {
                this.timeInput.style.display = 'block';
            } else {
                this.timeInput.style.display = 'none';
            }
        });

        this.removeButton.addEventListener('click', () => {
            this.remove();
        });
    }

    getValue() {
        return {
            word: this.inputField.value.trim(),
            type: this.typeDropdown.value,
            time: this.timeInput.value
        };
    }

    setValue(value, type, time) {
        this.inputField.value = value;
        this.typeDropdown.value = type;
        this.timeInput.value = time;
        this.timeInput.style.display = type === 'Timer' ? 'block' : 'none';
    }

    getContainer() {
        return this.container;
    }

    remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    destroy() {
        this.remove();
    }
}

export default WordField;
