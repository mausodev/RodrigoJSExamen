const express = require('express');
const router = express.Router();

router.get('/mxn-usd', async (req, res) => {
    try {
        const response = await fetch(
            'https://api.frankfurter.dev/v2/rate/MXN/USD'
        );

        if (!response.ok) {
            throw new Error('Exchange rate API request failed.');
        }

        const data = await response.json();

        res.json({
            base: data.base,
            quote: data.quote,
            rate: data.rate,
            date: data.date
        });
    } catch (error) {
        console.error('Currency API error:', error);

        res.status(502).json({
            message: 'Exchange rate is temporarily unavailable.'
        });
    }
});

module.exports = router;
