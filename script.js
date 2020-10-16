const API_KEY = '8c762cd769300edced7e7d801ecca3416bf68527';
const BASE_URL = 'https://calendarific.com/api/v2';

let monthBeingDisplayed = 9;
let yearBeingDisplayed = 2020;
let holidaysForYearByMonth = {};
let filters = {
    "National holiday": true,
    "Orthodox": true,
    "Local holiday": true,
    "Observance": true,
    "Sporting event": true,
    "Worldwide observance": true,
    "United Nations observance": true,
    "Other": true
}
let eventMap = {};

function moveMonthRight() {
    monthBeingDisplayed += 1;
    if (monthBeingDisplayed > 11) {
        monthBeingDisplayed = 0;
        yearBeingDisplayed++;
        loadHolidays();
    } else {
        loadCalendar();
    }
}

function moveMonthLeft() {
    monthBeingDisplayed -= 1;
    if (monthBeingDisplayed < 0) {
        monthBeingDisplayed = 11;
        yearBeingDisplayed--;
        loadHolidays();
    } else {
        loadCalendar();
    }
}

async function loadHolidays() {
    let response = await fetch(`${BASE_URL}/holidays?api_key=${API_KEY}&country=us&year=${yearBeingDisplayed}`);
    if (response.status === 200) {
        let json = await response.json();
        for (let holiday of json.response.holidays) {
            if (!(holiday.date.datetime.month in holidaysForYearByMonth)) {
                holidaysForYearByMonth[holiday.date.datetime.month] = [];
            }
            let isDuplicate = false;
            for (otherHoliday of holidaysForYearByMonth[holiday.date.datetime.month]) {
                if (holiday.name == otherHoliday.name) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                holidaysForYearByMonth[holiday.date.datetime.month].push(holiday);
            }
        }
        loadCalendar();
    } else {
        console.log(`Failed to retrieve data, status code: ${response.status}`);
    }
}

async function loadCalendar() {
    let monthDisplay = document.getElementById('month-display');
    monthDisplay.innerText = ` ${monthToString(monthBeingDisplayed)} ${yearBeingDisplayed}`;
    createCalendar();
}

function createCalendar() {
    let firstOfDisplayedMonth = new Date(yearBeingDisplayed, monthBeingDisplayed);
    let day = 1;

    createHeader();
    eventMap = {};
    let calendar = document.getElementById('calendar-body');
    calendar.innerHTML = "";
    let firstDate = new Date(yearBeingDisplayed, monthBeingDisplayed, day);
    for (let i = 0; i < firstDate.getDay(); i++) {
        let date = new Date(yearBeingDisplayed, monthBeingDisplayed - 1, i);
        createPlaceHolder(date);
    }
    while (true) {
        let date = new Date(yearBeingDisplayed, monthBeingDisplayed, day);
        if (date.getMonth() != monthBeingDisplayed) {
            break;
        }
        createDay(date);
        day++;
    }
}

function createHeader() {
    let header = document.getElementById('calendar-header');
    header.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        let dayHeader = `<div class="day-header">${dayToString(i)}</div>`;
        header.innerHTML += dayHeader;
    }
}

function createPlaceHolder(date) {
    let calendar = document.getElementById('calendar-body');
    let entry = `<div class="placeholder-entry"></div>`;
    calendar.innerHTML += entry;
}

function createDay(date) {
    let calendar = document.getElementById('calendar-body');
    let holidaysInDay = [];
    for (let holiday of holidaysForYearByMonth[date.getMonth() + 1]) {
        if (holiday.date.datetime.day === date.getDate()) {
            holidaysInDay.push(holiday);
        }
    }

    let entry = `<div class="day-entry">${date.getDate()}`;
    for (let holiday of holidaysInDay) {
        let classes = "holiday ";
        switch (holiday.type[0]) {
            case "National holiday":
                classes += 'national-holiday';
                break;
            case "Orthodox":
                classes += 'orthodox';
                break;
            case "Local holiday":
                classes += 'local-holiday';
                break;
            case "Observance":
                classes += 'observance';
                break;
            case "Sporting event":
                classes += 'sporting-event';
                break;
            case "Worldwide observance":
                classes += 'worldwide-observance';
                break;
            case "United Nations observance":
                classes += 'united-nations-observance';
                break;
            default:
                holiday.type[0] = 'Other';
        }
        if (filters[holiday.type[0]]) {
            let id = holiday.name;
            id = id.replace("'", "");
            eventMap[id] = holiday;
            entry += `<div class="${classes}" onclick='displayEventInfo("${id}")'>${holiday.name}</div>`;
        }
    }
    entry += `</div>`;
    calendar.innerHTML += entry;
}

function dayToString(day) {
    switch (day) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
    }
}

function monthToString(month) {
    switch (month) {
        case 0:
            return 'January';
        case 1:
            return 'February';
        case 2:
            return 'March';
        case 3:
            return 'April';
        case 4:
            return 'May';
        case 5:
            return 'June';
        case 6:
            return 'July';
        case 7:
            return 'August';
        case 8:
            return 'September';
        case 9:
            return 'October';
        case 10:
            return 'November';
        case 11:
            return 'December';
    }
}

function onFilterClicked(filter) {
    let filterElement = document.getElementById(filter);
    filters[filter] = !filters[filter];
    if (filters[filter]) {
        filterElement.className = "filter selected-filter";
    } else {
        filterElement.className = "filter";
    }
    loadCalendar();
}

function displayEventInfo(id) {
    let event = eventMap[id];
    let popup = document.getElementById('popup');
    popup.style.display = 'block';
    let title = document.getElementById('popup-title');
    title.innerText = event.name;
    let description = document.getElementById('popup-description');
    description.innerText = event.description;
}

function closePopup() {
    let popup = document.getElementById('popup');
    popup.style.display = 'none';
}
