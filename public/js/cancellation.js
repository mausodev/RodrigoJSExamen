import { translations } from './translations.js';

export function initializeTicketCancellation() {
    const form = document.querySelector('#cancel-ticket-form');
    const message = document.querySelector('#cancel-ticket-message');
    const details = document.querySelector('#ticket-review-details');
    const cancelButton = document.querySelector('#cancel-ticket-button');

    if (!form || !message || !details || !cancelButton) {
        console.error('Ticket review section is missing required HTML elements.');
        return;
    }

    const getText = key =>
        translations[document.querySelector('#language-select').value][key];

    let reviewedTicket = null;

    cancelButton.hidden = true;
    details.hidden = true;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        reviewedTicket = null;
        cancelButton.hidden = true;
        details.hidden = true;
        message.textContent = getText('reviewingTicket');

        const ticketId = form.elements.ticketId.value.trim();
        const bookingReference = form.elements.bookingReference.value.trim();

        try {
            const response = await fetch(
                `/api/tickets/${encodeURIComponent(ticketId)}/review`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingReference })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || getText('ticketNotFound'));
            }

            reviewedTicket = result.ticket;
            details.replaceChildren();

            const fields = [
                [getText('ticketId'), reviewedTicket.TicketID],
                [getText('bookingReference'), reviewedTicket.BookingReference],
                [getText('passenger'), reviewedTicket.PassengerName],
                [getText('train'), reviewedTicket.TrainName],
                [getText('from'), `${reviewedTicket.Origin}, ${reviewedTicket.OriginCity}`],
                [getText('to'), `${reviewedTicket.Destination}, ${reviewedTicket.DestinationCity}`],
                [getText('departure'), new Date(reviewedTicket.DepartureTime).toLocaleString()],
                [getText('arrival'), new Date(reviewedTicket.ArrivalTime).toLocaleString()],
                [getText('seat'), reviewedTicket.SeatNumber],
                [getText('farePaid'), Number(reviewedTicket.FarePaidMXN).toLocaleString(
                    document.querySelector('#language-select').value === 'es-MX'
                        ? 'es-MX'
                        : 'en-US',
                    { style: 'currency', currency: 'MXN' }
                )],
                [getText('status'), reviewedTicket.Status === 'Cancelled'
                    ? getText('ticketAlreadyCancelled')
                    : 'Confirmed']
            ];

            fields.forEach(([label, value]) => {
                const row = document.createElement('p');
                const strong = document.createElement('strong');

                strong.textContent = `${label}: `;
                row.append(strong, document.createTextNode(String(value)));
                details.appendChild(row);
            });

            details.hidden = false;

            if (reviewedTicket.Status !== 'Cancelled') {
                cancelButton.hidden = false;
                message.textContent = getText('reviewTicketPrompt');
            } else {
                message.textContent = getText('ticketAlreadyCancelled');
            }
        } catch (error) {
            message.textContent = error.message || getText('ticketReviewError');
        }
    });

    cancelButton.addEventListener('click', async () => {
        if (!reviewedTicket || reviewedTicket.Status === 'Cancelled') return;

        if (!window.confirm(getText('confirmCancellation'))) return;

        cancelButton.disabled = true;
        message.textContent = getText('cancellingTicket');

        try {
            const response = await fetch(
                `/api/tickets/${encodeURIComponent(reviewedTicket.TicketID)}/cancel`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookingReference: reviewedTicket.BookingReference
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || getText('ticketCancellationError'));
            }

            reviewedTicket.Status = 'Cancelled';

            const statusRow = details.querySelector('p:last-child');
            if (statusRow) {
                statusRow.lastChild.textContent = getText('ticketAlreadyCancelled');
            }

            cancelButton.hidden = true;
            message.textContent = getText('ticketCancelled');
        } catch (error) {
            message.textContent = error.message || getText('ticketCancellationError');
        } finally {
            cancelButton.disabled = false;
        }
    });
}