document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams();
    const { cabinNames, startDate } = JSON.parse(document.querySelector('body').getAttribute('data'));
    cabinNames.forEach((cabinName) => params.append('cabinName', cabinName));
    const startDateSelector = document.getElementById('start-date');
    const { minStartDate } = await fetch(`/api/min_start_date`).then((res) => res.json());
    startDateSelector.setAttribute('min', minStartDate);
    startDateSelector.setAttribute('value', minStartDate);
    const daysSelector = document.getElementById('days');
    const numberOfGuestsSelector = document.getElementById('guest-number');
    const tableHeaderRow = document.getElementById('cabin-names');
    const tableBody = document.getElementById('cabin-availabilities');

    for (let i = 1; i <= 40; i++) {
        const daysOption = document.createElement('option');
        daysOption.value = i;
        daysOption.innerText = i;
        daysSelector.appendChild(daysOption);
    }

    for (let i = 1; i <= 10; i++) {
        const numberOfGuestsOption = document.createElement('option');
        numberOfGuestsOption.value = i;
        numberOfGuestsOption.innerText = i;
        numberOfGuestsSelector.appendChild(numberOfGuestsOption);
    }

    daysSelector.value = 10;
    numberOfGuestsSelector.value = 4;

    cabinNames.forEach((cabinName) => {
        const cabinNameHeaderElement = document.createElement('td');
        cabinNameHeaderElement.innerText = cabinName;
        tableHeaderRow.appendChild(cabinNameHeaderElement);
    });

    const renderAvailabilities = async () => {
        params.set('days', daysSelector.value);
        params.set('numberOfGuests', numberOfGuestsSelector.value);
        params.set('startDate', startDateSelector.value);
        tableBody.innerHTML = '';
        const loadingSpinner = document.getElementById('loading-spinner');
        const availabilitiesTable = document.getElementById('availabilities-table');
        loadingSpinner.style.display = 'flex';
        availabilitiesTable.style.display = 'none';
        const availabilities = await fetch(`/api/cabins?${params}`).then((res) => res.json());
        loadingSpinner.style.display = 'none';
        availabilitiesTable.style.display = 'block';
        availabilities.forEach((availability) => {
            const availabilityRowElement = document.createElement('tr');
            const dateElement = document.createElement('td');
            dateElement.innerText = availability.date;
            availabilityRowElement.appendChild(dateElement);
            cabinNames.forEach((cabinName) => {
                const cabinAvailabilityElement = document.createElement('td');
                const cabinAvailable = availability[cabinName];
                if (cabinAvailable) cabinAvailabilityElement.style.backgroundColor = 'green';
                availabilityRowElement.appendChild(cabinAvailabilityElement);
            });
            tableBody.appendChild(availabilityRowElement);
        });
    };

    renderAvailabilities();

    [daysSelector, numberOfGuestsSelector]
        .forEach((element) => element.addEventListener('change', () => renderAvailabilities()));
});
