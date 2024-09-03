const express = require('express');
const router = express.Router();
const words = require('../utilities/wordsUtility');

router.get('/words', (req, res) => {
    res.json(words.sort(() => Math.random() - 0.5).slice(0, 25));
});

module.exports = router;
