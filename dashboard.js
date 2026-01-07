// Main Dashboard Controller
// API modules are loaded separately: weather.js, bus.js, train.js

// Update clock every second
function updateClock() {
    const now = new Date();
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    
    if (timeElement) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// Initial data fetch
fetchWeather();
fetchBusTimes();
fetchTrainTimes();

// Auto-refresh every 60 seconds
setInterval(() => {
    fetchWeather();
    fetchBusTimes();
    fetchTrainTimes();
}, 60000);
