// routes/telegram.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const TELEGRAM_BOT_TOKEN ="6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU"
const TELEGRAM_CHAT_ID="5230934145"

router.post('/sendmessage', async (req, res) => {
    const { message } = req.body;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending message', error);
        res.json({ success: false });
    }
});

module.exports = router;
