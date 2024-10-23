import editJsonFile from 'edit-json-file';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This is needed, cause editJsonFile has trouble managing the same file in multiple files.

const filePath = resolve(__dirname, '../../words.json');

let file = editJsonFile(filePath);

export function getWords() {
    let words = file.get('words') || [];
    const shuffledWords = words.sort(() => Math.random() - 0.5).slice(0, 25);
    return shuffledWords;
}

export function storeWords(words) {
    file.set('words', "");
    file.set('words', words);
    file.save();

    return words;
}

export function getAdminWords() {
    const words = file.get('words') || [];
    return words;
}