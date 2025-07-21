const editJsonFile = require("edit-json-file");
const express = require('express');
const auth = require('../utilities/authUtility');
const bodyParser = require('body-parser');
const router = express.Router();
const { storeWords, getAdminWords } = require('../services/apiDataService');

router.use(auth);
router.use(bodyParser.json());
router.use(express.static(`${__dirname}/../../admin`));


router.post('/words', (req, res) => {
    res.json(storeWords(req.body.words));
});

router.get("/words", (req, res) => {
    res.json(getAdminWords());
});


module.exports = router;
