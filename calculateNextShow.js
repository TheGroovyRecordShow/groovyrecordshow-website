function formatDate(date) {
    var isoString = date.toISOString();
    var formattedString = encodeURIComponent(isoString);
    return formattedString;
}

function getMinMaxDates() {
    const MONTH_SPAN = 4;

    var currentTime = new Date();
    var timeMin = new Date(currentTime);
    timeMin.setHours(currentTime.getHours() - 1);
    var timeMax = new Date(currentTime);
    timeMax.setMonth(currentTime.getMonth() + MONTH_SPAN);

    // Format the dates in the required format
    var formattedTimeMin = formatDate(timeMin);
    var formattedTimeMax = formatDate(timeMax);

    return [formattedTimeMin, formattedTimeMax]
}

async function firstCalenderItem(matchString) {
    console.log("starting CALANDER SEARCH")
    try {
        const minMax = getMinMaxDates();

        console.log(minMax)


        // Replace 'your_api_url' with the actual API endpoint
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/j2i05osj76t7okeeulcn08m06g%40group.calendar.google.com/events?`+
            `key=AIzaSyDwLcNXDnv934vAvhPAblJ0KhclAK7k2Sc&`+
            `timeMin=${minMax[0]}&`+
            `timeMax=${minMax[1]}&`+
            `singleEvents=true&`+
            `maxResults=9999`+
            `#fromHistory`
            );
        
        if (!response.ok) {return false}

        const jsonData = await response.json();

        // Loop through json.items array
        for (let i = 0; i < jsonData.items.length; i++) {
            const item = jsonData.items[i];
            // console.log(item.summary)
            if (item.summary == matchString) {
                const eventData = item.start  
                return eventData
            }
        }
        
        console.log("COULD NOT FIND - RETURNING FALSE")
        return false
    } catch (error) {
        console.log("ERROR")
        return false
    }
}

function formatTimeInZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.hour}:${values.minute} ${values.dayPeriod} ${values.timeZoneName}`;
}

function toHumanDate(eventData) {
    const showDate = new Date(eventData.dateTime);
    const pacificDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'long',
        day: 'numeric'
    }).formatToParts(showDate);
    const dateParts = Object.fromEntries(pacificDate.map(part => [part.type, part.value]));
    const day = Number(dateParts.day);
    const ordinalSuffix = (number) => {
        if (number % 100 >= 11 && number % 100 <= 13) return 'th';
        if (number % 10 === 1) return 'st';
        if (number % 10 === 2) return 'nd';
        if (number % 10 === 3) return 'rd';
        return 'th';
    };

    const pacificTime = formatTimeInZone(showDate, 'America/Los_Angeles');
    const easternTime = formatTimeInZone(showDate, 'America/New_York');
    return `${dateParts.month} ${day}${ordinalSuffix(day)} at ${pacificTime} / ${easternTime}`;
}


async function getNextShowText(){
    SHOW_NAME = "Paul from CA"
    const firstShow = await firstCalenderItem(SHOW_NAME);
    if (firstShow == false) {return "Unknown at this time"}
    const humanDate = toHumanDate(firstShow);
    return humanDate
}

async function mainX(){
    const nextShowText = await getNextShowText();
    document.getElementById("next-show-date").textContent = nextShowText;
}
mainX()