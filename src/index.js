const express = require('express');
const app = express();
const wordsController = require('./routes/wordsController');

app.use(express.static('public'));

app.use('/api', wordsController);

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});