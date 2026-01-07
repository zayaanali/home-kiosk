# CTA + Weather Dashboard

A web-based dashboard for displaying Chicago Transit Authority (CTA) bus and train times, weather information, and a real-time clock. Optimized for Fire tablets running Fully Kiosk Browser.

## Features

- **Real-time Clock**: Displays current time and date
- **Weather Display**: Shows current temperature and conditions for Chicago
- **Bus Times**: Displays next arrivals for configured bus stop
- **Train Times**: Displays next arrivals for configured train station
- **Auto-refresh**: Updates transit and weather data every 60 seconds

## Setup Instructions

### 1. Get Your Weather API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key
5. Open `weather.js` and replace `YOUR_WEATHER_API_KEY_HERE` with your actual API key:

```javascript
const WEATHER_API_KEY = 'your-actual-api-key-here';
```

### 2. Configure Transit Stop IDs (Optional)

If you want to monitor different bus stops or train stations:

**Bus Stop IDs:**
- Find your bus stop IDs at [CTA Bus Tracker](https://www.ctabustracker.com/bustime/home.jsp)
- Update `BUS_STOP_IDS` array in `bus.js` (currently set to `['1848']`)
- Add multiple stop IDs: `const BUS_STOP_IDS = ['1848', '1901', '1413'];`

**Train Station ID:**
- Find your station map ID at [CTA Train Tracker](https://www.transitchicago.com/developers/traintracker/)
- Update `TRAIN_STATION_ID` in `train.js` (currently set to `30162`)

### 3. Test Locally

1. Open `index.html` in a web browser
2. The dashboard should load and display:
   - Current time and date
   - Weather information (once API key is configured)
   - Bus arrival times
   - Train arrival times

### 4. Deploy to Hosting

#### Option A: GitHub Pages (Recommended)

1. Create a new GitHub repository
2. Upload all files (`index.html`, `style.css`, `dashboard.js`, `weather.js`, `bus.js`, `train.js`)
3. Go to repository Settings → Pages
4. Select your main branch as the source
5. Your dashboard will be available at: `https://yourusername.github.io/repository-name/`

#### Option B: Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up/login
3. Drag and drop your project folder
4. Your dashboard will be live immediately

#### Option C: Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up/login
3. Import your GitHub repository or upload files
4. Deploy

### 5. Configure Fully Kiosk Browser

1. Install Fully Kiosk Browser on your Fire tablet
2. Open Fully Kiosk settings
3. Set your dashboard URL as the home page
4. Enable kiosk mode
5. Configure auto-refresh settings if needed
6. Set screen timeout to "Never" for always-on display

## File Structure

```
HomeKiosk/
├── index.html          # Main HTML structure
├── style.css           # Styling (black background, white text)
├── dashboard.js        # Main controller (clock, initialization, auto-refresh)
├── weather.js          # Weather API integration
├── bus.js              # CTA Bus API integration
├── train.js            # CTA Train API integration
└── README.md           # This file
```

## API Keys Used

- **CTA API Key**: Already configured (hardcoded in `bus.js` and `train.js`)
- **Weather API Key**: You need to add your own OpenWeatherMap API key in `weather.js`

## Customization

### Change Weather Location

Edit `WEATHER_LOCATION` in `weather.js`:

```javascript
const WEATHER_LOCATION = 'YourCity';
```

### Change Refresh Interval

Edit the interval in `dashboard.js` (currently 60000ms = 60 seconds):

```javascript
setInterval(() => {
    fetchWeather();
    fetchBusTimes();
    fetchTrainTimes();
}, 60000); // Change 60000 to your desired interval in milliseconds
```

### Modular Design

The dashboard is split into separate modules for easy customization:
- **weather.js** - Weather API configuration and fetching
- **bus.js** - Bus API configuration and fetching
- **train.js** - Train API configuration and fetching
- **dashboard.js** - Main controller (clock, initialization, auto-refresh)

### Customize Colors

Edit `style.css` to change colors:
- Background: `background: #000000;`
- Text: `color: #ffffff;`
- Header: `background: #00bcd4;`
- Section backgrounds: `background: #111111;`

## Troubleshooting

### Weather Not Loading
- Verify your OpenWeatherMap API key is correct
- Check browser console for API errors
- Ensure the API key has proper permissions

### Transit Times Not Showing
- Verify the stop/station IDs are correct
- Check CTA API status
- Some stops may not have active predictions at certain times

### CORS Errors
- If testing locally, you may encounter CORS issues
- Deploy to a web server (GitHub Pages, Netlify, etc.) to avoid CORS problems
- The APIs should work fine when hosted on a proper domain

## License

This project is provided as-is for personal use.

