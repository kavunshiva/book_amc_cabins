import { debounce } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { cabinNames } = JSON.parse(document.querySelector('body').getAttribute('data'));
  const startDateSelector = document.getElementById('start-date');
  const daysSelector = document.getElementById('days');
  const numberOfGuestsSelector = document.getElementById('guest-number');
  const tableHeaderRow = document.getElementById('cabin-names');
  const tableBody = document.getElementById('cabin-availabilities');

  const initializeOptions = () => {
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
  };

  const initializeDefaultValues = async () => {
    const { minStartDate } = await fetch(`/api/min_start_date`).then((res) => res.json());
    startDateSelector.setAttribute('min', minStartDate);
    startDateSelector.setAttribute('value', minStartDate);

    daysSelector.value = 10;
    numberOfGuestsSelector.value = 4;
  };

  const addOptionChangeListeners = () => {
    [startDateSelector, daysSelector, numberOfGuestsSelector]
      .forEach((element) => {
        element.addEventListener('change', debounce(() => renderAvailabilities(), 300));
      });
  };

  const setTableHeaders = () => {
    cabinNames.forEach((cabinName) => {
      const cabinNameHeaderElement = document.createElement('td');
      cabinNameHeaderElement.innerText = cabinName;
      tableHeaderRow.appendChild(cabinNameHeaderElement);
    });
  };

  const getParams = () => {
    const params = new URLSearchParams();
    cabinNames.forEach((cabinName) => params.append('cabinName', cabinName));
    params.set('days', daysSelector.value);
    params.set('numberOfGuests', numberOfGuestsSelector.value);
    params.set('startDate', startDateSelector.value);
    return params;
  };

  const renderAvailability = (availability) => {
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
  };

  const renderAvailabilities = async () => {
    tableBody.innerHTML = '';
    const loadingSpinner = document.getElementById('loading-spinner');
    const availabilitiesTable = document.getElementById('availabilities-table');
    loadingSpinner.style.display = 'flex';
    availabilitiesTable.style.display = 'none';
    const availabilities = await fetch(`/api/cabins?${getParams()}`).then((res) => res.json());
    loadingSpinner.style.display = 'none';
    availabilitiesTable.style.display = 'block';
    availabilities.forEach((availability) => renderAvailability(availability));
  };

  initializeOptions();
  await initializeDefaultValues();
  addOptionChangeListeners();
  setTableHeaders();
  renderAvailabilities();
});
