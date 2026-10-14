const express = require('express');
const router = express.Router();

const { poolPromise } = require('../src/database');

// GET /api/tickets/available-seats?journeyId=1
// Retrieve seats available for a specific journey
router.get('/available-seats', async (req, res) => {
    try {
        const journeyId = Number(req.query.journeyId);

        if (!Number.isInteger(journeyId) || journeyId <= 0) {
            return res.status(400).json({
                message: 'A valid journey ID is required.'
            });
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input('journeyId', journeyId)
            .query(`
                SELECT
                    s.SeatID,
                    s.SeatNumber
                FROM Journeys AS j
                INNER JOIN Seats AS s
                    ON s.TrainID = j.TrainID
                WHERE j.JourneyID = @journeyId
                  AND NOT EXISTS (
                      SELECT 1
                      FROM Tickets AS tk
                      WHERE tk.JourneyID = j.JourneyID
                        AND tk.TrainSeatID = s.SeatID
                        AND tk.Status <> 'Cancelled'
                  )
                ORDER BY TRY_CONVERT(INT, s.SeatNumber), s.SeatNumber;
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error retrieving available seats:', error);

        res.status(500).json({
            message: 'Could not retrieve available seats.'
        });
    }
});

module.exports = router;