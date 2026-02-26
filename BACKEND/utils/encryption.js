const CryptoJS = require('crypto-js');

const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, process.env.AES_SECRET).toString();
};

const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
