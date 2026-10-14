
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { poolPromise, sql } = require('../src/database');

// GET /api/tickets/available-seats?journeyId=1
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
            .input('journeyId', sql.Int, journeyId)
            .query(`
                SELECT s.SeatID, s.SeatNumber
                FROM dbo.Journeys AS j
                INNER JOIN dbo.Seats AS s
                    ON s.TrainID = j.TrainID
                WHERE j.JourneyID = @journeyId
                  AND NOT EXISTS (
                      SELECT 1
                      FROM dbo.Tickets AS tk
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

// POST /api/tickets
router.post('/', async (req, res) => {
    const {
        journeyId,
        seatId,
        passengerName,
        passengerEmail
    } = req.body;

    const parsedJourneyId = Number(journeyId);
    const parsedSeatId = Number(seatId);
    const name = typeof passengerName === 'string'
        ? passengerName.trim()
        : '';
    const email = typeof passengerEmail === 'string'
        ? passengerEmail.trim()
        : '';

    if (
        !Number.isInteger(parsedJourneyId) || parsedJourneyId <= 0 ||
        !Number.isInteger(parsedSeatId) || parsedSeatId <= 0
    ) {
        return res.status(400).json({
            message: 'A valid journey and seat are required.'
        });
    }

    if (!name || name.length > 150) {
        return res.status(400).json({
            message: 'Passenger name is required (maximum 150 characters).'
        });
    }

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({
            message: 'A valid email address is required.'
        });
    }

    const bookingReference =
        `TT${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    let transaction;

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        const request = new sql.Request(transaction);

        request.input('journeyId', sql.Int, parsedJourneyId);
        request.input('seatId', sql.Int, parsedSeatId);

        const check = await request.query(`
            SELECT j.FareMXN
            FROM dbo.Journeys AS j
            INNER JOIN dbo.Seats AS s
                ON s.TrainID = j.TrainID
            WHERE j.JourneyID = @journeyId
              AND s.SeatID = @seatId
              AND NOT EXISTS (
                  SELECT 1
                  FROM dbo.Tickets AS tk WITH (UPDLOCK, HOLDLOCK)
                  WHERE tk.JourneyID = j.JourneyID
                    AND tk.TrainSeatID = s.SeatID
                    AND tk.Status <> 'Cancelled'
              );
        `);

        if (check.recordset.length === 0) {
            await transaction.rollback();
            return res.status(409).json({
                message: 'This seat is unavailable for the selected journey.'
            });
        }

        const fare = check.recordset[0].FareMXN;

        const insert = new sql.Request(transaction);
        insert.input('journeyId', sql.Int, parsedJourneyId);
        insert.input('seatId', sql.Int, parsedSeatId);
        insert.input('name', sql.NVarChar(150), name);
        insert.input('email', sql.NVarChar(254), email);
        insert.input('fare', sql.Decimal(10, 2), fare);
        insert.input('reference', sql.VarChar(11), bookingReference);

        const result = await insert.query(`
            INSERT INTO dbo.Tickets (
                BookingReference,
                JourneyID,
                TrainSeatID,
                PassengerName,
                PassengerEmail,
                FarePaidMXN,
                BookingTime,
                Status
            )
            OUTPUT
                INSERTED.TicketID,
                INSERTED.BookingReference,
                INSERTED.JourneyID,
                INSERTED.TrainSeatID,
                INSERTED.FarePaidMXN,
                INSERTED.BookingTime,
                INSERTED.Status
            VALUES (
                @reference,
                @journeyId,
                @seatId,
                @name,
                @email,
                @fare,
                SYSUTCDATETIME(),
                'Confirmed'
            );
        `);

        await transaction.commit();

        res.status(201).json({
            message: 'Ticket booked successfully.',
            ticket: result.recordset[0]
        });
    } catch (error) {
        if (transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Transaction rollback failed:', rollbackError);
            }
        }

        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                message: 'This seat has already been booked for that journey.'
            });
        }

        console.error('Error creating ticket:', error);
        res.status(500).json({
            message: 'Could not create the booking.'
        });
    }
});

/* POST /api/tickets/:ticketId/review */
router.post('/:ticketId/review', async (req, res) => {
    try {
        const ticketId = Number(req.params.ticketId);
        const bookingReference = req.body.bookingReference?.trim();

        if (!Number.isInteger(ticketId) || ticketId <= 0 ||
            !bookingReference) {
            return res.status(400).json({
                message: 'Valid ticket details are required.'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('ticketId', sql.Int, ticketId)
            .input('bookingReference', sql.VarChar(11), bookingReference)
            .query(`
                SELECT
                    t.TicketID,
                    t.BookingReference,
                    t.PassengerName,
                    t.FarePaidMXN,
                    t.BookingTime,
                    t.Status,
                    s.SeatNumber,
                    j.DepartureTime,
                    j.ArrivalTime,
                    origin.StationName AS Origin,
                    origin.City AS OriginCity,
                    destination.StationName AS Destination,
                    destination.City AS DestinationCity,
                    tr.TrainName
                FROM dbo.Tickets t
                JOIN dbo.Seats s
                    ON t.TrainSeatID = s.SeatID
                JOIN dbo.Journeys j
                    ON t.JourneyID = j.JourneyID
                JOIN dbo.Stations origin
                    ON j.OriginStationID = origin.StationID
                JOIN dbo.Stations destination
                    ON j.DestinationStationID = destination.StationID
                JOIN dbo.Trains tr
                    ON j.TrainID = tr.TrainID
                WHERE t.TicketID = @ticketId
                AND t.BookingReference = @bookingReference
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Ticket not found. Check your details.'
            });
        }

        res.json({ ticket: result.recordset[0] });
    } catch (error) {
        console.error('Ticket review error:', error);
        res.status(500).json({
            message: 'Could not retrieve ticket details.'
        });
    }
});

/* PATCH /api/tickets/:ticketId/cancel */
router.patch('/:ticketId/cancel', async (req, res) => {
    const ticketId = Number(req.params.ticketId);
    const bookingReference =
        typeof req.body.bookingReference === 'string'
            ? req.body.bookingReference.trim().toUpperCase()
            : '';

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
        return res.status(400).json({
            message: 'A valid ticket ID is required.'
        });
    }

    if (!bookingReference || bookingReference.length > 11) {
        return res.status(400).json({
            message: 'A valid booking reference is required.'
        });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ticketId', sql.Int, ticketId)
            .input('reference', sql.VarChar(11), bookingReference)
            .query(`
                UPDATE dbo.Tickets
                SET Status = 'Cancelled'
                OUTPUT
                    INSERTED.TicketID,
                    INSERTED.BookingReference,
                    INSERTED.Status
                WHERE TicketID = @ticketId
                  AND BookingReference = @reference
                  AND Status <> 'Cancelled';
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Ticket not found, reference incorrect, or ticket already cancelled.'
            });
        }

        res.json({
            message: 'Ticket cancelled successfully.',
            ticket: result.recordset[0]
        });
    } catch (error) {
        console.error('Error cancelling ticket:', error);
        res.status(500).json({
            message: 'Could not cancel the ticket.'
        });
    }
});

module.exports = router;