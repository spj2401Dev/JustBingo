const basicAuth = require('basic-auth');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'password';

function auth(req, res, next) {
    const user = basicAuth(req);
    
    if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
        res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Authentication required.');
    }

    next();
}

module.exports = auth;