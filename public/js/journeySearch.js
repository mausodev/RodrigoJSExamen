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

        if (Array.isArray(journeys) && journeys.length === 0) {
            return;
        }

        const isReturnTrip = !Array.isArray(journeys);

        if (!isReturnTrip) {
            renderJourneyGroup('', journeys, false);
            return;
        }

        renderJourneyGroup(
            getText('outbound'),
            journeys.outbound,
            true
        );

        if (journeys.returnJourneys !== undefined) {
            if (
                journeys.outbound.length > 0 &&
                journeys.returnJourneys.length === 0
            ) {
                const message = document.createElement('p');
                message.textContent = getText('selectOutboundFirst');
                journeyResults.appendChild(message);
            } else {
                renderJourneyGroup(
                    getText('return'),
                    journeys.returnJourneys,
                    false
                );
            }
        }
    }

    function renderJourneyGroup(titleText, journeys, selectable) {
        if (titleText) {
            const heading = document.createElement('h3');
            heading.textContent = titleText;
            journeyResults.appendChild(heading);
        }

        if (journeys.length === 0) {
            const message = document.createElement('p');
            message.textContent = getText('noResults');
            journeyResults.appendChild(message);
            return;
        }

        journeys.forEach(journey => {
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

            if (selectable) {
                const selectButton = document.createElement('button');
                selectButton.type = 'button';
                selectButton.textContent = getText('selectJourney');

                selectButton.addEventListener('click', () => {
                    searchReturnJourneys(journey);
                });

                card.appendChild(selectButton);
            }

            journeyResults.appendChild(card);
        });
    }

    async function searchReturnJourneys(outboundJourney) {
        const params = new URLSearchParams();

        params.set('origin', originInput.value.trim());
        params.set('destination', destinationInput.value.trim());
        params.set(
            'date',
            getSelectedDate(monthSelect, daySelect, yearSelect)
        );
        params.set(
            'returnDate',
            getSelectedDate(returnMonthSelect, returnDaySelect, returnYearSelect)
        );
        params.set('outboundJourneyId', outboundJourney.JourneyID);

        searchStatus.dataset.state = 'loading';
        searchStatus.textContent = getText('loading');

        try {
            const response = await fetch(`/api/journeys?${params.toString()}`);

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error(
                    'Return search failed:',
                    response.status,
                    errorDetails
                );
                throw new Error('Return search failed.');
            }

            const result = await response.json();

            // Keep the selected outbound journey visible alongside its return options.
            renderJourneys({
                outbound: [outboundJourney],
                returnJourneys: result.returnJourneys
            });
        } catch (error) {
            console.error('Error searching return journeys:', error);
            searchStatus.dataset.state = 'error';
            searchStatus.textContent = getText('error');
        }
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
