/**
 * WordFieldManager - Manages multiple word fields in the admin interface
 * Provides methods to add, remove, and collect data from word fields
 */
import WordField from './WordField.mjs';

export class WordFieldManager {
    constructor(container) {
        this.container = container;
        this.fields = [];
    }

    addField(value = '', type = 'Field', time = '') {
        const wordField = new WordField(value, type, time);
        this.fields.push(wordField);
        this.container.appendChild(wordField.getContainer());
        return wordField;
    }

    removeField(wordField) {
        const index = this.fields.indexOf(wordField);
        if (index > -1) {
            this.fields.splice(index, 1);
            wordField.destroy();
        }
    }

    getAllValues() {
        return this.fields.map(field => field.getValue()).filter(data => data.word.length > 0);
    }

    clearAllFields() {
        this.fields.forEach(field => field.destroy());
        this.fields = [];
    }

    getFieldCount() {
        return this.fields.length;
    }

    displayNoWordsMessage() {
        this.container.innerHTML = '<p>No words found.</p>';
    }

    displayErrorMessage() {
        this.container.innerHTML = '<p>Error loading words. Please try again later.</p>';
    }
}

export default WordFieldManager;
