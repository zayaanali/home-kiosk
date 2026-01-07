// Weather API Configuration
const WEATHER_API_KEY = 'YOUR_WEATHER_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const WEATHER_LOCATION = 'Chicago';

// Get weather emoji based on icon code
function getWeatherEmoji(icon) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌦️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
}

// Capitalize first letter of string
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fetch weather data
async function fetchWeather() {
    if (WEATHER_API_KEY === 'YOUR_WEATHER_API_KEY_HERE') {
        document.getElementById('weather').innerHTML = 
            '<div class="error">Weather API key not configured. Please add your OpenWeatherMap API key in weather.js</div>';
        return;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_LOCATION}&appid=${WEATHER_API_KEY}&units=imperial`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
        
        const weatherHTML = `
            <div class="weather-info">
                <div class="weather-icon">${getWeatherEmoji(icon)}</div>
                <div>
                    <div class="weather-temp">${temp}°F</div>
                    <div class="weather-desc">${capitalizeFirst(description)}</div>
                </div>
            </div>
        `;
        
        document.getElementById('weather').innerHTML = weatherHTML;
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById('weather').innerHTML = 
            `<div class="error">Failed to load weather: ${error.message}</div>`;
    }
}

