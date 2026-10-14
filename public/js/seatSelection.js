export async function showAvailableSeats(journey, card, getText) {
    const previousSelector = card.querySelector('.seat-selector');

    if (previousSelector) {
        previousSelector.remove();
    }

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
}