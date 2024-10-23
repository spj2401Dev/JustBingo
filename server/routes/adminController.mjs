import express from 'express';
import auth from '../utilities/authUtility.js';
import bodyParser from 'body-parser';
import { storeWords, getAdminWords } from '../services/apiDataService.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.use(auth);
router.use(bodyParser.json());
router.use(express.static(`${__dirname}/../../admin`));

router.post('/words', (req, res) => {
    res.json(storeWords(req.body.words));
});

router.get('/words', (req, res) => {
    res.json(getAdminWords());
});

export default router;
