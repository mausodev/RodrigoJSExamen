
import { translations, updateLanguage } from './translations.js';

import { initializeDates, formatDateTime, formatFare, formatDuration } from './dates.js';

import { initializeJourneys } from './journeys.js';

/* Language */
const languageSelect = document.getElementById('language-select');

/* Search form */
const searchForm = document.getElementById('search-form');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const oneWayCheckbox = document.getElementById('one-way');

/* Departure date */
const departureDateField = document.getElementById('departure-date-selector');
const monthSelect = document.getElementById('departure-month');
const daySelect = document.getElementById('departure-day');
const yearSelect = document.getElementById('departure-year');

/* Return date */
const returnDateField = document.getElementById('return-date-selector');
const returnMonthSelect = document.getElementById('return-month');
const returnDaySelect = document.getElementById('return-day');
const returnYearSelect = document.getElementById('return-year');

/* Search results */
const searchStatus = document.getElementById('search-status');
const journeyResults = document.getElementById('journey-results');

const searchButton =
    document.querySelector('button[form="search-form"]') ||
    searchForm.querySelector('button[type="submit"]');

/* Shared helpers */
function getText(key) {
    return translations[languageSelect.value][key];
}

/* Initialize date controls */
const dates = initializeDates({
    languageSelect,
    oneWayCheckbox,
    returnDateField,
    daySelect,
    monthSelect,
    yearSelect,
    returnDaySelect,
    returnMonthSelect,
    returnYearSelect
});

/* Initialize journey search and rendering */
const journeys = initializeJourneys({
    originInput,
    destinationInput,
    oneWayCheckbox,
    daySelect,
    monthSelect,
    yearSelect,
    returnDaySelect,
    returnMonthSelect,
    returnYearSelect,
    languageSelect,
    searchStatus,
    journeyResults,
    getText,
    formatDateTime: value =>
        formatDateTime(value, languageSelect.value),
    formatFare: amount =>
        formatFare(amount, languageSelect.value),
    formatDuration: (departure, arrival) =>
        formatDuration(departure, arrival, getText)
});

/* Update all translated page content */
function applyLanguage() {
    updateLanguage({
        languageSelect,
        originInput,
        destinationInput,
        searchButton,
        searchStatus,
        departureDateField,
        returnDateField,
        getCurrentJourneys: journeys.getCurrentJourneys,
        renderJourneys: journeys.renderJourneys,
        updateDateOrder: dates.updateDateOrder
    });
}

/* Events */
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    console.log('Search form submitted');
    journeys.searchJourneys();
});

languageSelect.addEventListener('change', applyLanguage);

/* Initial setup */
applyLanguage();
