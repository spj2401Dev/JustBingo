const express = require('express');
const dotenv = require('dotenv');
const app = express();

const wordsController = require('./routes/wordsController');
const adminController = require("./routes/adminController");

dotenv.config();

app.use(express.static('public'));

app.use('/api', wordsController);
app.use('/admin', adminController);

var port = process.env.PORT || 3000;
var ip = process.env.IP || 'localhost';

app.listen(port, ip, () => {
    console.log(`Server is listening on ${ip}:${port}`);
});