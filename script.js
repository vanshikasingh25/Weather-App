// const apiKey = "35332cd8afaccfbbdbe59a28692df8cb";


// const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${apiKey}`);


// const futureDataUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Tokyo`;

// const locationNameUrl=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;





const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time'); // This might not be used in the new data format
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.getElementById('locationInput');
const search = document.querySelector('.search');
const btn = document.querySelector('.submit');
const cities = document.querySelectorAll('.city');
const apiKey = "35332cd8afaccfbbdbe59a28692df8cb";

let cityInput = "";

cities.forEach((city) => {
    city.addEventListener('click', async (e) => {
        cityInput = e.target.innerHTML;
        await fetchWeatherData();
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (search.value.length === 0) {
        alert("Please type in a city name");
    } else {
        cityInput = search.value;
        await fetchWeatherData();
        search.value = '';
    }
});

const dayOfTheWeek = (day, month, year) => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[new Date(`${year}-${month}-${day}`).getDay()];
}


const getLocationName = async (lat, long) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const stateName = data.address.state;
    nameOutput.innerHTML = stateName;
    cityInput = stateName;
    fetchWeatherData();
}

const success = (position) => {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    getLocationName(latitude, longitude);
}

const error = (error) => {
    console.log("Error messgae:", error);
}

const defaultValues = () => {
    if (navigator) {
        navigator.geolocation.getCurrentPosition(success, error);
    }

}

defaultValues();



const fetchWeatherData = async () => {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${apiKey}`);
        const data = await res.json();

        console.log(data);

        temp.innerHTML = data.main.temp.toFixed(1) + "&#176;C";

        conditionOutput.innerHTML = data.weather[0].description;

        const date = new Date(data.dt * 1000); // Convert Unix timestamp to date
        const y = date.getFullYear();
        const m = date.getMonth() + 1; // Months are zero-based
        const d = date.getDate();

        // The time is not provided in the new data structure, so we won't display it
        // If needed, you can add local time information from the timezone offset

        dateOutput.innerHTML = `${dayOfTheWeek(d, m, y)} ${d}, ${m} ${y}`;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        // Format time as HH:MM:SS AM/PM
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;

        timeOutput.innerHTML = timeString;

        nameOutput.innerHTML = data.name;
        const iconId = data.weather[0].icon;
        icon.src = `http://openweathermap.org/img/wn/${iconId}.png`; // Use URL from OpenWeatherMap


        cloudOutput.innerHTML = data.clouds.all + "%";
        humidityOutput.innerHTML = data.main.humidity + "%";
        windOutput.innerHTML = data.wind.speed + " m/s";

        const code = data.weather[0].id; // Use weather condition ID to determine background
        let timeOfDay = "day"; // Assuming daytime for simplicity

        // Set the appropriate background image based on weather condition
        if (code === 800) {
            // app.style.backgroundImage = `url(./images/${timeOfDay}/clear.jpg)`;
            btn.style.background = timeOfDay === "night" ? "#181e27" : "#e5ba92";
        } else if ([801, 802, 803, 804].includes(code)) {
            // app.style.backgroundImage = `url(./images/${timeOfDay}/cloudy.jpg)`;
            btn.style.background = timeOfDay === "night" ? "#181e27" : "#fa6d1b";
        } else if ([200, 201, 202, 230, 231, 232, 300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(code)) {
            // app.style.backgroundImage = `url(./images/${timeOfDay}/rainy.jpg)`;
            btn.style.background = timeOfDay === "night" ? "#325c80" : "#647d75";
        } else if ([600, 601, 602, 611, 612, 613, 614, 615, 616, 620, 621, 622].includes(code)) {
            // app.style.backgroundImage = `url(./images/${timeOfDay}/snowy.jpg)`;
            btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
        } else {
            // app.style.backgroundImage = `url(./images/${timeOfDay}/default.jpg)`; // Fallback image
            btn.style.background = timeOfDay === "night" ? "#1b1b1b" : "#4d72aa";
        }

    } catch (error) {
        console.error("Error fetching weather data:", error);
        app.style.opacity = "1"; // Ensure opacity is reset on error
    }
}



fetchWeatherData();




// Call the function to update the forecast when the page loads
document.addEventListener('DOMContentLoaded', updateForecast);


const getFutureData = async (long, lat) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;

    const res = await fetch(url);
    const data = await res.json();
    const dailyForecasts = data.daily;

    updateForecast(dailyForecasts);
};

// Update the forecast section with data from the future weather API
const updateForecast = (dailyForecasts) => {
    const forecastContainer = document.querySelector('.forecast-container');

    forecastContainer.innerHTML = ''; // Clear previous content

    dailyForecasts.time.forEach((time, i) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        const dayName = document.createElement('span');
        dayName.className = 'day-name';
        dayName.textContent = new Date(time).toLocaleDateString('en-US', { weekday: 'short' });

        const forecastTemp = document.createElement('span');
        forecastTemp.className = 'forecast-temp';
        forecastTemp.textContent = `${dailyForecasts.temperature_2m_max[i]}°C / ${dailyForecasts.temperature_2m_min[i]}°C`;

        // Append elements to the day div
        dayDiv.appendChild(dayName);
        dayDiv.appendChild(forecastTemp);

        // Append the day div to the forecast container
        forecastContainer.appendChild(dayDiv);
    });
};


