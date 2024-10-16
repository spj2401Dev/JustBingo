const express = require('express');
const router = express.Router();

const { getWords } = require('../services/apiDataService');

router.get('/words', (req, res) => {
    res.json(getWords());
});


module.exports = router;
