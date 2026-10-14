
const express = require('express');
const router = express.Router();

const { poolPromise } = require('../src/database');

// GET /api/journeys/cities
// Retrieve available cities for the origin and destination dropdowns
router.get('/cities', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT DISTINCT City
            FROM Stations
            ORDER BY City
        `);

        res.json(result.recordset.map(row => row.City));
    } catch (error) {
        console.error('Error retrieving cities:', error);

        res.status(500).json({
            message: 'Could not retrieve available cities.'
        });
    }
});

// GET /api/journeys
// Search journeys by origin, destination, and travel date
router.get('/', async (req, res) => {
    try {
        const { origin, destination, date, returnDate, outboundJourneyId } = req.query;

        // Validate origin and destination
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

        // Validate date parameters
        function isValidDate(value) {
            if (typeof value !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            const parsedDate = new Date(`${value}T00:00:00Z`);

            return !Number.isNaN(parsedDate.getTime()) &&
                parsedDate.toISOString().slice(0, 10) === value;
        }

        for (const [name, value] of [
            ['date', date],
            ['returnDate', returnDate]
        ]) {
            if (value !== undefined && !isValidDate(value)) {
                return res.status(400).json({
                    message: `${name} must be a valid date in YYYY-MM-DD format.`
                });
            }
        }

        // A return trip requires both dates and both cities
        if (returnDate !== undefined) {
            if (!date) {
                return res.status(400).json({
                    message: 'A departure date is required for a return trip.'
                });
            }

            if (returnDate < date) {
                return res.status(400).json({
                    message: 'The return date must be after the departure date.'
                });
            }

            if (!origin || !destination) {
                return res.status(400).json({
                    message: 'Origin and destination are required for a return trip.'
                });
            }
        }

        const pool = await poolPromise;

        // Retrieve journeys for one leg of the trip
        async function findJourneys(journeyOrigin, journeyDestination, journeyDate, earliestDeparture = null) {
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

            if (journeyOrigin) {
                query += ' AND origin.City = @origin';
                request.input('origin', journeyOrigin);
            }

            if (journeyDestination) {
                query += ' AND destination.City = @destination';
                request.input('destination', journeyDestination);
            }

            if (journeyDate) {
                query += `
                    AND j.DepartureTime >= @date
                    AND j.DepartureTime < DATEADD(DAY, 1, @date)
                `;
                request.input('date', journeyDate);
            }

            if (earliestDeparture) {
                query += ' AND j.DepartureTime > @earliestDeparture';
                request.input('earliestDeparture', earliestDeparture);
            }

            query += ' ORDER BY j.DepartureTime';

            const result = await request.query(query);
            return result.recordset;
        }

        // One-way search: preserve the existing array response

        // One-way search: preserve the existing array response
        const outbound = await findJourneys(origin, destination, date);

        if (returnDate === undefined) {
            return res.json(outbound);
        }

        // Initial return-trip search: show outbound options first
        if (outboundJourneyId === undefined) {
            return res.json({
                outbound,
                returnJourneys: []
            });
        }

        // Find the selected outbound journey and its arrival time
        const request = pool.request();
        request.input('journeyId', outboundJourneyId);
        request.input('origin', origin);
        request.input('destination', destination);
        request.input('date', date);

        const selectedResult = await request.query(`
            SELECT j.ArrivalTime
            FROM Journeys AS j
            INNER JOIN Stations AS origin
                ON j.OriginStationID = origin.StationID
            INNER JOIN Stations AS destination
                ON j.DestinationStationID = destination.StationID
            WHERE j.JourneyID = @journeyId
              AND origin.City = @origin
              AND destination.City = @destination
              AND j.DepartureTime >= @date
              AND j.DepartureTime < DATEADD(DAY, 1, @date)
              AND j.DepartureTime > SYSDATETIME()
        `);

        if (selectedResult.recordset.length === 0) {
            return res.status(400).json({
                message: 'The selected outbound journey is invalid.'
            });
        }

        const arrivalTime = selectedResult.recordset[0].ArrivalTime;

        // Find return journeys that depart after the selected journey arrives
        const returnJourneys = await findJourneys(
            destination,
            origin,
            returnDate,
            arrivalTime
        );

        return res.json({ returnJourneys });

    } catch (error) {
        console.error('Error retrieving journeys:', error);

        res.status(500).json({
            message: 'Could not retrieve train journeys.'
        });
    }
});

module.exports = router;
