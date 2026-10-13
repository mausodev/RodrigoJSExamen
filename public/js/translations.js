export const translations = {
    'en-US': {
        tagline: 'Book your next train journey.',
        searchTitle: 'Find a Journey',
        origin: 'Origin city',
        destination: 'Destination city',
        date: 'Travel date',
        searchButton: 'Search journeys',
        resultsTitle: 'Available Journeys',
        initialStatus: 'Enter your search criteria to find journeys.',
        loading: 'Searching for journeys...',
        noResults: 'No journeys found for your search.',
        error: 'Could not retrieve journeys. Please try again.',
        train: 'Train',
        departure: 'Departure',
        arrival: 'Arrival',
        duration: 'Duration',
        outbound: 'Outbound journeys',
        return: 'Return journeys',
        fare: 'Fare',
        hours: 'h',
        minutes: 'min',
        oneWay: 'One-way ticket',
        selectJourney: 'Select journey',
        searchPrompt: 'Search for journeys to see available trains.',
        selectOutboundFirst: 'Please select an outbound trip first.'
    },
    'es-MX': {
        tagline: 'Reserva tu próximo viaje en tren.',
        searchTitle: 'Buscar un viaje',
        origin: 'Ciudad de origen',
        destination: 'Ciudad de destino',
        date: 'Fecha de viaje',
        searchButton: 'Buscar viajes',
        resultsTitle: 'Viajes disponibles',
        initialStatus: 'Ingrese sus criterios de búsqueda para encontrar viajes.',
        loading: 'Buscando viajes...',
        noResults: 'No se encontraron viajes para su búsqueda.',
        error: 'No se pudieron consultar los viajes. Inténtelo de nuevo.',
        train: 'Tren',
        departure: 'Salida',
        arrival: 'Llegada',
        duration: 'Duración',
        outbound: 'Viajes de ida',
        return: 'Viajes de regreso',
        fare: 'Tarifa',
        hours: 'h',
        minutes: 'min',
        oneWay: 'Viaje sencillo',
        selectJourney: 'Seleccionar viaje',
        searchPrompt: 'Ingrese una fecha para ver los trenes disponibles.',
        selectOutboundFirst: 'Seleccione un viaje de ida para ver los viajes de regreso.'
    }
};


export function updateLanguage({
    languageSelect,
    originInput,
    destinationInput,
    searchButton,
    searchStatus,
    departureDateField,
    returnDateField,
    getCurrentJourneys,
    renderJourneys,
    updateDateOrder
}) {
    const text = translations[languageSelect.value];

    document.documentElement.lang = languageSelect.value;

    document.querySelector('header p').textContent = text.tagline;

    const headings = document.querySelectorAll('main section h2');
    headings[0].textContent = text.searchTitle;
    headings[1].textContent = text.resultsTitle;

    document.querySelector('label[for="origin"]').textContent =
        text.origin;

    document.querySelector('label[for="destination"]').textContent =
        text.destination;

    departureDateField.querySelector('legend').textContent =
        text.date;

    returnDateField.querySelector('legend').textContent =
        languageSelect.value === 'es-MX'
            ? 'Fecha de regreso'
            : 'Return date';

    originInput.placeholder = languageSelect.value === 'es-MX'
        ? 'Ej. Chihuahua'
        : 'e.g. Chihuahua';

    destinationInput.placeholder = languageSelect.value === 'es-MX'
        ? 'Ej. Ciudad Juárez'
        : 'e.g. Ciudad Juarez';

    document.querySelector('label[for="one-way"]').textContent = text.oneWay;

    searchButton.textContent = text.searchButton;

    const journeys = getCurrentJourneys();

    if (searchStatus.dataset.state === 'loading') {
        searchStatus.textContent = text.loading;
    } else if (searchStatus.dataset.state === 'error') {
        searchStatus.textContent = text.error;
    } else if (searchStatus.dataset.state === 'empty') {
        searchStatus.textContent = text.noResults;
    } else if (journeys.length > 0) {
        renderJourneys(journeys);
    } else {
        searchStatus.textContent = text.initialStatus;
    }

    renderJourneys(getCurrentJourneys());

    updateDateOrder();
}
