const { decrypt } = require('../utils/encryption');

/**
 * Middleware to decrypt incoming request body if it contains an 'encryptedData' field.
 * This is useful for sensitive payloads as per the technical assessment requirements.
 */
const decryptPayload = (req, res, next) => {
    if (req.body && req.body.encryptedData) {
        try {
            const decryptedString = decrypt(req.body.encryptedData);
            if (!decryptedString) {
                throw new Error('Decryption failed to produce string');
            }

            const decryptedBody = JSON.parse(decryptedString);

            // Merge decrypted data into req.body
            req.body = { ...req.body, ...decryptedBody };
            delete req.body.encryptedData;

            next();
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Security check failed: Invalid encrypted payload'
            });
        }
    } else {
        next();
    }
};

module.exports = decryptPayload;
