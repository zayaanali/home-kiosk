// Main Dashboard Controller
// API modules are loaded separately: weather.js, bus.js, train.js

// Update clock every second
function updateClock() {
    const now = new Date();
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
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
