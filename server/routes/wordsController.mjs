import express from 'express';
import { getWords } from '../services/apiDataService.mjs';

const router = express.Router();

router.get('/words', (req, res) => {
    res.json(getWords());
});

export default router;
