import CryptoJS from 'crypto-js';

const AES_SECRET = import.meta.env.VITE_AES_SECRET; // Matches backend .env

export const encrypt = (data) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(text, AES_SECRET).toString();
};

export const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};
