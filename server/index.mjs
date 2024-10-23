import express from 'express';
import dotenv from 'dotenv';
import wordsController from './routes/wordsController.mjs';
import adminController from './routes/adminController.mjs';
import { handler } from '../public/build/handler.js';

const app = express();

dotenv.config();

app.use('/api', wordsController);
app.use('/api/admin', adminController);

app.use(handler);

const port = process.env.PORT || 3000;
const ip = process.env.IP || 'localhost';

app.listen(port, ip, () => {
    console.log(`Server is listening on ${ip}:${port}`);
});