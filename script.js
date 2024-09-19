// const apiKey = "35332cd8afaccfbbdbe59a28692df8cb";


// const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${apiKey}`);


// const futureDataUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Tokyo`;

// const locationNameUrl=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;





const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
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

const dayOfTheWeek = (date) => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[date.getDay()];
}

const getLocationName = async (lat, long) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    cityInput = data.address.city || data.address.state; // Fallback to state if city not found
    nameOutput.innerHTML = cityInput;
    await fetchWeatherData();
}

const success = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    getLocationName(latitude, longitude);
}

const error = (error) => {
    console.error("Error message:", error);
}

const defaultValues = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

document.addEventListener('DOMContentLoaded', defaultValues);

const fetchWeatherData = async () => {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${apiKey}`);
        const data = await res.json();

        if (!data.main) {
            throw new Error("City not found");
        }

        // Update weather details
        temp.innerHTML = `${data.main.temp.toFixed(1)}&#176;C`;
        conditionOutput.innerHTML = data.weather[0].description;
        const date = new Date(data.dt * 1000);
        dateOutput.innerHTML = `${dayOfTheWeek(date)} ${date.getDate()}, ${date.getMonth() + 1} ${date.getFullYear()}`;
        nameOutput.innerHTML = data.name;
        icon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        cloudOutput.innerHTML = `${data.clouds.all}%`;
        humidityOutput.innerHTML = `${data.main.humidity}%`;
        windOutput.innerHTML = `${data.wind.speed} m/s`;

        // Get future weather data
        await getFutureData(data.coord.lon, data.coord.lat);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        app.style.opacity = "1"; // Ensure opacity is reset on error
    }
}

const getFutureData = async (long, lat) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;
        const res = await fetch(url);
        const data = await res.json();
        updateForecast(data.daily);
    } catch (error) {
        console.error("Error fetching future weather data:", error);
    }
};

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

        dayDiv.appendChild(dayName);
        dayDiv.appendChild(forecastTemp);
        forecastContainer.appendChild(dayDiv);
    });
};
