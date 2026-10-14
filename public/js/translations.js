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
        selectJourney: 'Select this trip',
        viewSeats: 'View available seats',
        searchPrompt: 'Search for journeys to see available trains.',
        selectOutboundFirst: 'Please select an outbound trip first.',
        originPlaceholder: 'Select an origin city',
        destinationPlaceholder: 'Select a destination city',
        passengerDetails: 'Passenger details',
        passengerName: 'Full name',
        passengerEmail: 'Email address',
        bookTicket: 'Book ticket',
        bookingInProgress: 'Processing booking...',
        bookingSuccess: 'Booking confirmed!',
        bookingReference: 'Booking reference',
        bookingError: 'Could not complete booking.',
        total: 'Total',
        approxUSD: 'Approx. in USD',
        conversionUnavailable: 'Currency conversion service unavailable',
        reviewTicket: 'Review ticket',
        reviewTicketDescription: 'Enter your ticket ID and booking reference to review your reservation.',
        ticketId: 'Ticket ID',
        passenger: 'Passenger',
        from: 'From',
        to: 'To',
        seat: 'Seat',
        farePaid: 'Fare paid',
        status: 'Status',
        cancelTicket: 'Cancel ticket',
        reviewingTicket: 'Reviewing ticket...',
        reviewTicketPrompt: 'Please review the details before cancelling.',
        ticketAlreadyCancelled: 'This ticket has already been cancelled.',
        ticketCancelled: 'Ticket cancelled successfully.',
        confirmCancellation: 'Are you sure you want to cancel this ticket?',
        ticketNotFound: 'Ticket not found. Check your details.',
        ticketReviewError: 'Could not retrieve ticket details.',
        ticketCancellationError: 'Could not cancel ticket.',
        cancellingTicket: 'Cancelling ticket...'
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
        selectJourney: 'Seleccionar este viaje',
        viewSeats: 'Ver asientos disponibles',
        searchPrompt: 'Ingrese una fecha para ver los trenes disponibles.',
        selectOutboundFirst: 'Seleccione un viaje de ida para ver los viajes de regreso.',
        originPlaceholder: 'Seleccione una ciudad de origen',
        destinationPlaceholder: 'Seleccione una ciudad de destino',
        passengerDetails: 'Datos del pasajero',
        passengerName: 'Nombre completo',
        passengerEmail: 'Correo electrónico',
        bookTicket: 'Reservar boleto',
        bookingInProgress: 'Procesando reservación...',
        bookingSuccess: '¡Reservación confirmada!',
        bookingReference: 'Referencia de reservación',
        bookingError: 'No se pudo completar la reservación.',
        total: 'Total',
        approxUSD: 'Aprox. en USD',
        conversionUnavailable: 'Servicio de conversión a USD no disponible',
        reviewTicket: 'Consultar boleto',
        reviewTicketDescription: 'Ingrese su ID de boleto y referencia de reservación para consultar su boleto.',
        ticketId: 'ID de boleto',
        passenger: 'Pasajero',
        from: 'Origen',
        to: 'Destino',
        seat: 'Asiento',
        farePaid: 'Tarifa pagada',
        status: 'Estado',
        cancelTicket: 'Cancelar boleto',
        reviewingTicket: 'Consultando boleto...',
        reviewTicketPrompt: 'Revise los datos antes de cancelar.',
        ticketAlreadyCancelled: 'Este boleto ya ha sido cancelado.',
        ticketCancelled: 'Boleto cancelado correctamente.',
        confirmCancellation: '¿Está seguro de que desea cancelar este boleto?',
        ticketNotFound: 'No se encontró el boleto. Verifique los datos.',
        ticketReviewError: 'No se pudieron consultar los datos del boleto.',
        ticketCancellationError: 'No se pudo cancelar el boleto.',
        cancellingTicket: 'Cancelando boleto...'
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

    // Ticket review and cancellation
    const ticketSection = document.querySelector('.cancel-ticket-section');

    ticketSection.querySelector('h2').textContent = text.reviewTicket;
    ticketSection.querySelector('p').textContent = text.reviewTicketDescription;

    ticketSection.querySelector('label[for="cancel-ticket-id"]').textContent = text.ticketId;
    ticketSection.querySelector('label[for="cancel-booking-reference"]').textContent = text.bookingReference;
    ticketSection.querySelector('#cancel-ticket-form button').textContent = text.reviewTicket;
    ticketSection.querySelector('#cancel-ticket-button').textContent = text.cancelTicket;

    updateDateOrder();
}
