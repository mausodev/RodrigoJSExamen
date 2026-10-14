import { translations, updateLanguage } from './translations.js';

import { initializeDates, formatDateTime, formatFare, formatDuration } from './dates.js';

import { initializeJourneys } from './journeySearch.js';

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

/* Update city dropdown placeholders */
function updateCityPlaceholders() {
    const originPlaceholder =
        originInput.querySelector('option[value=""]');

    const destinationPlaceholder =
        destinationInput.querySelector('option[value=""]');

    if (originPlaceholder) {
        originPlaceholder.textContent = getText('originPlaceholder');
    }

    if (destinationPlaceholder) {
        destinationPlaceholder.textContent = getText('destinationPlaceholder');
    }
}

/* Load available cities into the origin and destination dropdowns */
async function loadCities() {
    try {
        const response = await fetch('/api/journeys/cities');

        if (!response.ok) {
            throw new Error('Could not load cities.');
        }

        const cities = await response.json();

        for (const select of [originInput, destinationInput]) {
            select.replaceChildren();

            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = select === originInput
                ? getText('originPlaceholder')
                : getText('destinationPlaceholder');

            select.appendChild(placeholder);

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        searchStatus.dataset.state = 'error';
        searchStatus.textContent = 'Could not load available cities.';
    }

    updateCityOptions();
}

/* Prevent selecting the same origin and destination */
function updateCityOptions() {
    const origin = originInput.value;
    const destination = destinationInput.value;

    for (const option of originInput.options) {
        option.disabled =
            option.value !== '' && option.value === destination;
    }

    for (const option of destinationInput.options) {
        option.disabled =
            option.value !== '' && option.value === origin;
    }
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

    updateCityPlaceholders();

    if (journeys.getCurrentJourneys().length === 0) {
        searchStatus.textContent = getText('searchPrompt');
    }
}

/* Events */
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    console.log('Search form submitted');
    journeys.searchJourneys();
});

languageSelect.addEventListener('change', applyLanguage);

originInput.addEventListener('change', updateCityOptions);
destinationInput.addEventListener('change', updateCityOptions);

/* Initial setup */
applyLanguage();
loadCities();