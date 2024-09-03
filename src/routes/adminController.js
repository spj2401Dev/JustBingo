const editJsonFile = require("edit-json-file");
const express = require('express');
const auth = require('../utilities/authUtility');
const bodyParser = require('body-parser');
const router = express.Router();

let file = editJsonFile(`${__dirname}/../../words.json`);

router.use(auth);
router.use(bodyParser.json());
router.use(express.static(`${__dirname}/../../admin`));

router.post('/words', (req, res) => {
    console.log("words", req.body);
    let words = req.body.words;

    file.set('words', ""); // Clear the file
    file.set('words', words);
    file.save();

    res.json(words);
});

router.get("/words", (req, res) => {
    const words = file.get('words') || [];
    res.json(words);
});


module.exports = router;
