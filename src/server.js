
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON requests
app.use(express.json());

// Serve the frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Test endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Internal API is running'
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
