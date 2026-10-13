const express = require('express');
const router = express.Router();

const { poolPromise } = require('../src/database');

// GET /api/journeys
// Search journeys by origin, destination, and travel date
router.get('/', async (req, res) => {
    try {
        const { origin, destination, date } = req.query;

        // Validate search parameters
        if (
            (origin !== undefined &&
                (typeof origin !== 'string' || !origin.trim())) ||
            (destination !== undefined &&
                (typeof destination !== 'string' || !destination.trim()))
        ) {
            return res.status(400).json({
                message: 'Origin and destination must be non-empty strings.'
            });
        }

        if (date !== undefined) {
            const validFormat = /^\d{4}-\d{2}-\d{2}$/.test(date);

            if (!validFormat) {
                return res.status(400).json({
                    message: 'Date must use YYYY-MM-DD format.'
                });
            }

            const parsedDate = new Date(`${date}T00:00:00Z`);

            if (
                Number.isNaN(parsedDate.getTime()) ||
                parsedDate.toISOString().slice(0, 10) !== date
            ) {
                return res.status(400).json({
                    message: 'Please provide a valid calendar date.'
                });
            }
        }


        const pool = await poolPromise;

        const request = pool.request();

        let query = `
            SELECT
                j.JourneyID,
                origin.StationName AS Origin,
                origin.City AS OriginCity,
                destination.StationName AS Destination,
                destination.City AS DestinationCity,
                j.DepartureTime,
                j.ArrivalTime,
                j.FareMXN,
                t.TrainName
            FROM Journeys AS j
            INNER JOIN Stations AS origin
                ON j.OriginStationID = origin.StationID
            INNER JOIN Stations AS destination
                ON j.DestinationStationID = destination.StationID
            INNER JOIN Trains AS t
                ON j.TrainID = t.TrainID
            WHERE j.DepartureTime > SYSDATETIME()
        `;

        if (origin) {
            query += ' AND origin.City = @origin';
            request.input('origin', origin);
        }

        if (destination) {
            query += ' AND destination.City = @destination';
            request.input('destination', destination);
        }

        // if (date && (from || to)) {
        //     return res.status(400).json({
        //         message: 'Use either date or a date range, not both.'
        //     });
        // }

        if (date) {
            query += `
        AND j.DepartureTime >= @date
        AND j.DepartureTime < DATEADD(DAY, 1, @date)
    `;
            request.input('date', date);
        }

        // if (from) {
        //     query += ' AND j.DepartureTime >= @from';
        //     request.input('from', from);
        // }

        // if (to) {
        //     query += ' AND j.DepartureTime < DATEADD(DAY, 1, @to)';
        //     request.input('to', to);
        // }

        query += ' ORDER BY j.DepartureTime';

        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error retrieving journeys:', error);

        res.status(500).json({
            message: 'Could not retrieve train journeys.'
        });
    }
});

module.exports = router;