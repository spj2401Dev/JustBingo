const editJsonFile = require("edit-json-file");

let file = editJsonFile(`${__dirname}/../../words.json`);

// This is needed, cause editJsonFile has trouble managing the same file in multiple files.

function getWords() {
    let words = file.get('words') || [];
    const shuffledWords = words.sort(() => Math.random() - 0.5).slice(0, 25);
    return(shuffledWords);
}

function storeWords(words) {
    file.set('words', "");
    file.set('words', words);
    file.save();

    return(words);
}

function getAdminWords() {
    const words = file.get('words') || [];
    return(words);
}

module.exports = {
    getWords,
    storeWords,
    getAdminWords
}