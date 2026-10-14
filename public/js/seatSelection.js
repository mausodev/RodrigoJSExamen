
export async function showAvailableSeats(journey, card, getText) {
    card.querySelector('.seat-selector')?.remove();

    const container = document.createElement('div');
    container.className = 'seat-selector';

    const label = document.createElement('label');
    label.textContent = getText('selectSeat');

    const seatSelect = document.createElement('select');
    seatSelect.id = `seat-${journey.JourneyID}`;
    seatSelect.disabled = true;
    label.htmlFor = seatSelect.id;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = getText('loadingSeats');
    seatSelect.appendChild(placeholder);

    container.append(label, seatSelect);
    card.appendChild(container);

    const form = document.createElement('form');
    form.className = 'booking-form';
    form.hidden = true;

    form.innerHTML = `
    <h3>${getText('passengerDetails')}</h3>

    <label>
        ${getText('passengerName')}
        <input name="passengerName" type="text"
            maxlength="150" required>
    </label>

    <label>
        ${getText('passengerEmail')}
        <input name="passengerEmail" type="email"
            maxlength="254" required>
    </label>

    <button type="submit">${getText('bookTicket')}</button>
`;

    const message = document.createElement('p');
    message.className = 'booking-message';
    message.setAttribute('role', 'status');

    container.append(form, message);


    seatSelect.addEventListener('change', () => {
        form.hidden = !seatSelect.value;
    });

    try {
        const response = await fetch(
            `/api/tickets/available-seats?journeyId=${journey.JourneyID}`
        );

        if (!response.ok) {
            throw new Error('Could not load available seats.');
        }

        const seats = await response.json();
        seatSelect.replaceChildren();

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = seats.length
            ? getText('selectSeat')
            : getText('noSeatsAvailable');

        seatSelect.appendChild(defaultOption);

        seats.forEach(seat => {
            const option = document.createElement('option');
            option.value = seat.SeatID;
            option.textContent = seat.SeatNumber;
            seatSelect.appendChild(option);
        });

        seatSelect.disabled = seats.length === 0;
    } catch (error) {
        console.error('Error loading available seats:', error);
        seatSelect.replaceChildren();

        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = getText('seatLoadError');
        seatSelect.appendChild(errorOption);
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');

        button.disabled = true;
        message.textContent = getText('bookingInProgress');

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    journeyId: journey.JourneyID,
                    seatId: Number(seatSelect.value),
                    passengerName: form.elements.passengerName.value.trim(),
                    passengerEmail: form.elements.passengerEmail.value.trim()
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || getText('bookingError'));
            }

            const bookingReference = result.ticket.BookingReference;

            form.reset();
            form.hidden = true;
            seatSelect.value = '';

            const fareMXN = Number(result.ticket.FarePaidMXN);


            message.textContent =
                `${getText('bookingSuccess')} ` +
                `${getText('bookingReference')}: ${bookingReference} | ` +
                `${getText('total')}: ${fareMXN.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                })}`;

            try {
                const currencyResponse = await fetch('/api/currency/mxn-usd');

                if (!currencyResponse.ok) {
                    throw new Error('Exchange rate unavailable');
                }

                const currencyData = await currencyResponse.json();
                const fareUSD = fareMXN * Number(currencyData.rate);

                message.textContent +=
                    ` | ${getText('approxUSD')}: ` +
                    fareUSD.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    });
            } catch (error) {
                console.error('Currency conversion failed:', error);
                message.textContent += ` (${getText('conversionUnavailable')})`;
            }


            // Refresh available seats without removing the confirmation.
            try {
                const seatsResponse = await fetch(
                    `/api/tickets/available-seats?journeyId=${journey.JourneyID}`
                );

                if (seatsResponse.ok) {
                    const seats = await seatsResponse.json();
                    seatSelect.replaceChildren();

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = seats.length
                        ? getText('selectSeat')
                        : getText('noSeatsAvailable');

                    seatSelect.appendChild(defaultOption);

                    seats.forEach(seat => {
                        const option = document.createElement('option');
                        option.value = seat.SeatID;
                        option.textContent = seat.SeatNumber;
                        seatSelect.appendChild(option);
                    });

                    seatSelect.disabled = seats.length === 0;
                }
            } catch (error) {
                console.error('Could not refresh available seats:', error);
            }
        } catch (error) {
            message.textContent = error.message || getText('bookingError');
        } finally {
            button.disabled = false;
        }
    });
}
