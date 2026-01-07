// Weather API Configuration
const WEATHER_API_KEY = 'ef8e78ee474a4e188b352157260701';
const WEATHER_LOCATION = 'Chicago';

// Capitalize first letter of string
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fetch weather data from weatherapi.com
async function fetchWeather() {
    try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${WEATHER_LOCATION}&aqi=no`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        const temp = Math.round(data.current.temp_f);
        const description = data.current.condition.text;
        
        const weatherHTML = `
            <div class="weather-info">
                <span class="weather-temp">${temp}°F</span>
                <span class="weather-desc">· ${capitalizeFirst(description)}</span>
            </div>
        `;
        
        document.getElementById('weather').innerHTML = weatherHTML;
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById('weather').innerHTML = 
            `<div class="error">Failed to load weather: ${error.message}</div>`;
    }
}

