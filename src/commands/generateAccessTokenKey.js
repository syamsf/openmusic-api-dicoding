const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const generateRandomKey = () => crypto.randomBytes(64).toString('hex');
const accessTokenKey = generateRandomKey();
const refreshTokenKey = generateRandomKey();

const envFilePath = path.resolve(__dirname, '../../.env');

fs.appendFileSync(envFilePath, `\nACCESS_TOKEN_KEY=${accessTokenKey}`, 'utf8');
fs.appendFileSync(envFilePath, `\nREFRESH_TOKEN_KEY=${refreshTokenKey}`, 'utf8');

console.log('Access key and token key generated and appended to .env');
