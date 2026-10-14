
const express = require('express');
const path = require('path');
const { poolPromise } = require('./database');
const journeysRouter = require('../routes/journeys');
const ticketsRouter = require('../routes/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

// Register the train journeys routes under /api/journeys
app.use('/api/journeys', journeysRouter);

// Register the ticket routes under /api/tickets
app.use('/api/tickets', ticketsRouter);

// Parse incoming JSON requests
app.use(express.json());

// Serve the frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Test endpoint
app.get('/api/health', async (req, res) => {
    try {
        await poolPromise;

        res.json({
            status: 'ok',
            message: 'Server and database connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
