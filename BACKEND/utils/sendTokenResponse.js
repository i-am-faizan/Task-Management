const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });

    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
};

module.exports = sendTokenResponse;
