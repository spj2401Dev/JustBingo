const express = require('express');
const router = express.Router();
const editJsonFile = require("edit-json-file");

let file = editJsonFile(`${__dirname}/../../words.json`);

router.get('/words', (req, res) => {
    var words = file.get('words') || [];
    res.json(words.sort(() => Math.random() - 0.5).slice(0, 25));
});

module.exports = router;
