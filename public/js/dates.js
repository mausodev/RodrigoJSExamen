export function initializeDates({
    languageSelect,
    oneWayCheckbox,
    returnDateField,
    daySelect,
    monthSelect,
    yearSelect,
    returnDaySelect,
    returnMonthSelect,
    returnYearSelect
}) {
    const dateGroups = [
        {
            container: document.getElementById('departure-date'),
            day: daySelect,
            month: monthSelect,
            year: yearSelect
        },
        {
            container: document.getElementById('return-date'),
            day: returnDaySelect,
            month: returnMonthSelect,
            year: returnYearSelect
        }
    ];

    function updateDayOptions(monthSelect, daySelect, yearSelect) {
        const previousDay = daySelect.value;
        const month = Number(monthSelect.value);
        const year = Number(yearSelect.value);

        const daysInMonth = month && year
            ? new Date(year, month, 0).getDate()
            : month
                ? new Date(2000, month, 0).getDate()
                : 31;

        daySelect.replaceChildren();

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'DD';
        daySelect.appendChild(placeholder);

        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = String(day).padStart(2, '0');
            option.textContent = String(day).padStart(2, '0');
            daySelect.appendChild(option);
        }

        if (previousDay && Number(previousDay) <= daysInMonth) {
            daySelect.value = previousDay;
        }
    }

    function populateDateDropdowns() {
        const currentYear = new Date().getFullYear();

        for (const group of dateGroups) {
            for (let month = 1; month <= 12; month++) {
                const option = document.createElement('option');
                option.value = String(month).padStart(2, '0');
                option.textContent = String(month).padStart(2, '0');
                group.month.appendChild(option);
            }

            for (let year = currentYear; year <= currentYear + 5; year++) {
                const option = document.createElement('option');
                option.value = String(year);
                option.textContent = String(year);
                group.year.appendChild(option);
            }

            updateDayOptions(group.month, group.day, group.year);

            group.month.addEventListener('change', () => {
                updateDayOptions(group.month, group.day, group.year);
            });

            group.year.addEventListener('change', () => {
                updateDayOptions(group.month, group.day, group.year);
            });
        }
    }

    function updateDateOrder() {
        for (const group of dateGroups) {
            const separators = group.container.querySelectorAll('span');

            if (separators.length < 2) {
                continue;
            }

            if (languageSelect.value === 'es-MX') {
                group.container.append(
                    group.day,
                    separators[0],
                    group.month,
                    separators[1],
                    group.year
                );
            } else {
                group.container.append(
                    group.month,
                    separators[0],
                    group.day,
                    separators[1],
                    group.year
                );
            }
        }
    }

    function updateTripType() {
        const isOneWay = oneWayCheckbox.checked;

        returnDateField.hidden = isOneWay;
        returnMonthSelect.required = !isOneWay;
        returnDaySelect.required = !isOneWay;
        returnYearSelect.required = !isOneWay;
    }

    oneWayCheckbox.addEventListener('change', updateTripType);

    populateDateDropdowns();
    updateDateOrder();
    updateTripType();

    return { updateDateOrder };
}

export function formatDateTime(value, language) {
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC'
    }).format(new Date(value));
}

export function formatFare(amount, language) {
    return new Intl.NumberFormat(language, {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

export function formatDuration(departure, arrival, getText) {
    const minutes = Math.round(
        (new Date(arrival) - new Date(departure)) / 60000
    );

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}${getText('hours')} ${remainingMinutes}${getText('minutes')}`;
}
