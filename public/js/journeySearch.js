
export function initializeJourneys(
    {
        originInput,
        destinationInput,
        oneWayCheckbox,
        returnDaySelect,
        returnMonthSelect,
        returnYearSelect,
        daySelect,
        monthSelect,
        yearSelect,
        languageSelect,
        searchStatus,
        journeyResults,
        getText,
        formatDateTime,
        formatDuration,
        formatFare,
    }
) {
    let currentJourneys = [];

    function renderJourneys(journeys) {
        journeyResults.replaceChildren();

        // Support both one-way and return-trip API responses
        const isReturnTrip = !Array.isArray(journeys);

        const journeyGroups = isReturnTrip
            ? [
                { title: getText('outbound'), journeys: journeys.outbound },
                { title: getText('return'), journeys: journeys.returnJourneys }
            ]
            : [
                { title: '', journeys }
            ];

        const hasResults = journeyGroups.some(
            group => group.journeys.length > 0
        );

        if (!hasResults) {
            searchStatus.dataset.state = 'empty';
            searchStatus.textContent = getText('noResults');
            return;
        }

        searchStatus.dataset.state = 'results';
        searchStatus.textContent = '';

        journeyGroups.forEach(group => {
            if (group.journeys.length === 0) {
                const message = document.createElement('p');
                message.textContent = getText('noResults');
                journeyResults.appendChild(message);
                return;
            }

            if (group.title) {
                const heading = document.createElement('h3');
                heading.textContent = group.title;
                journeyResults.appendChild(heading);
            }

            group.journeys.forEach(journey => {
                const card = document.createElement('article');
                card.className = 'journey-card';

                const title = document.createElement('h4');
                title.textContent =
                    `${journey.OriginCity} → ${journey.DestinationCity}`;

                const train = document.createElement('p');
                train.textContent =
                    `${getText('train')}: ${journey.TrainName}`;

                const departure = document.createElement('p');
                departure.textContent =
                    `${getText('departure')}: ${formatDateTime(journey.DepartureTime)}`;

                const arrival = document.createElement('p');
                arrival.textContent =
                    `${getText('arrival')}: ${formatDateTime(journey.ArrivalTime)}`;

                const duration = document.createElement('p');
                duration.textContent =
                    `${getText('duration')}: ${formatDuration(
                        journey.DepartureTime,
                        journey.ArrivalTime
                    )}`;

                const fare = document.createElement('p');
                fare.textContent =
                    `${getText('fare')}: ${formatFare(journey.FareMXN)}`;

                card.append(title, train, departure, arrival, duration, fare);
                journeyResults.appendChild(card);
            });
        });
    }

    function getSelectedDate(monthSelect, daySelect, yearSelect) {
        const values = [
            monthSelect.value,
            daySelect.value,
            yearSelect.value
        ];

        if (values.every(value => !value)) {
            return '';
        }

        if (values.some(value => !value)) {
            return null;
        }

        const month = Number(monthSelect.value);
        const day = Number(daySelect.value);
        const year = Number(yearSelect.value);

        const date = new Date(Date.UTC(year, month - 1, day));

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            return null;
        }

        return `${yearSelect.value}-${monthSelect.value}-${daySelect.value}`;
    }

    async function searchJourneys() {
        console.log('searchJourneys() called');
        const params = new URLSearchParams();

        if (originInput.value.trim()) {
            params.set('origin', originInput.value.trim());
        }

        if (destinationInput.value.trim()) {
            params.set('destination', destinationInput.value.trim());
        }

        const departureDate = getSelectedDate(monthSelect, daySelect, yearSelect);
        const returnDate = getSelectedDate(returnMonthSelect, returnDaySelect, returnYearSelect);

        if (departureDate === null || returnDate === null) {
            searchStatus.dataset.state = 'error';
            searchStatus.textContent = languageSelect.value === 'es-MX'
                ? 'Selecciona el mes, día y año de la fecha correspondiente.'
                : 'Please select the month, day, and year for each date.';
            return;
        }

        if (departureDate) {
            params.set('date', departureDate);
        }
        else if (monthSelect.value || daySelect.value || yearSelect.value) {
            searchStatus.dataset.state = 'error';
            searchStatus.textContent = languageSelect.value === 'es-MX'
                ? 'Selecciona el mes, día y año.'
                : 'Please select the month, day, and year.';
            return;
        }

        if (!oneWayCheckbox.checked) {
            if (!returnDate) {
                searchStatus.dataset.state = 'error';
                searchStatus.textContent = languageSelect.value === 'es-MX'
                    ? 'Selecciona la fecha de regreso.'
                    : 'Please select a return date.';
                return;
            }

            if (returnDate < departureDate) {
                searchStatus.dataset.state = 'error';
                searchStatus.textContent = languageSelect.value === 'es-MX'
                    ? 'La fecha de regreso debe ser posterior a la salida.'
                    : 'The return date must be after the departure date.';
                return;
            }

            params.set('returnDate', returnDate);
        }

        searchStatus.dataset.state = 'loading';
        searchStatus.textContent = getText('loading');
        journeyResults.replaceChildren();
        currentJourneys = [];

        try {
            const response = await fetch(
                `/api/journeys?${params.toString()}`
            );

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Journey search failed:', response.status, errorDetails);
                throw new Error('Journey search failed.');
            }

            currentJourneys = await response.json();
            renderJourneys(currentJourneys);
        } catch (error) {
            console.error('Error searching journeys:', error);
            searchStatus.dataset.state = 'error';
            searchStatus.textContent = getText('error');
        }
    }

    return {
        renderJourneys,
        searchJourneys,
        getCurrentJourneys: () => currentJourneys
    };
}
