// CTA Bus API Configuration
const CTA_API_KEY = 'xYg3wA8J465gEEV38eXZa2eua';
const BUS_STOP_IDS = ['1848', '1901', '1413', '1448']; // Add multiple stop IDs: ['1848', '1901', '1413']

// Palette of distinct colors for bus routes
// const BUS_COLORS = [
//     "#FFC5D3", // Pastel Pink (22)
//     '#4caf50',  // Green
//     '#2196f3',  // Blue
//     '#ff9800',  // Orange
//     '#9c27b0',  // Purple
//     '#f44336',  // Red
//     '#00bcd4',  // Cyan
//     '#ffeb3b',  // Yellow
//     '#e91e63',  // Pink
//     '#3f51b5',  // Indigo
//     '#ff5722',  // Deep Orange
//     '#009688',  // Teal
//     '#795548',  // Brown
//     '#607d8b',  // Blue Grey
//     '#cddc39',  // Lime
//     '#ffc107',  // Amber
//     '#00e676',  // Green Accent
//     '#ff6f00',  // Orange Accent
//     '#7c4dff',  // Deep Purple
//     '#00acc1',  // Cyan Accent
//     '#ab47bc'   // Purple Accent
// ];

const BUS_COLORS = {
    "22": "#9AB7D3",
    "36": "#97C1A9",
    "156": "#DFCFF3",
}

// Generate a consistent color for a bus route
function getBusColor(route) {
    if (route in BUS_COLORS) {
        return BUS_COLORS[route];
    } else {
        return "#F5E29E"; // DEFAULT (GOLD)
    }
}

// Fetch CTA bus predictions for multiple stops
async function fetchBusTimes() {
    const allPredictions = [];
    
    // Fetch predictions for each stop ID
    for (const stopId of BUS_STOP_IDS) {
        try {
            // Use HTTP endpoint with CORS proxy
            const baseUrl = `http://www.ctabustracker.com/bustime/api/v2/getpredictions?key=${CTA_API_KEY}&stpid=${stopId}&format=json`;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`;
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                console.warn(`Bus API error for stop ${stopId}: ${response.status}`);
                continue; // Skip this stop and continue with others
            }
            
            const data = await response.json();
            
            if (data['bustime-response'].error) {
                console.warn(`Bus API error for stop ${stopId}:`, data['bustime-response'].error[0].msg);
                continue; // Skip this stop and continue with others
            }
            
            const predictions = data['bustime-response'].prd || [];
            
            // Add predictions from this stop to the combined list
            allPredictions.push(...predictions);
        } catch (error) {
            console.error(`Error fetching bus times for stop ${stopId}:`, error);
            // Continue with other stops even if one fails
            continue;
        }
    }
    
    // If no predictions from any stop, show message
    if (allPredictions.length === 0) {
        document.getElementById('bus-times').innerHTML = 
            '<div class="no-data">No bus predictions available at this time</div>';
        return;
    }
    
    // Parse and group predictions by direction (Northbound/Southbound)
    const northbound = [];
    const southbound = [];
    
    allPredictions.forEach(pred => {
        const route = pred.rt;
        const direction = pred.rtdir || 'Unknown';
        let minutes = pred.prdctdn;
        
        // Handle "DUE" or numeric values
        if (minutes === 'DUE') {
            minutes = 0;
        } else if (typeof minutes === 'string' && /^\d+$/.test(minutes)) {
            minutes = parseInt(minutes, 10);
        } else {
            return; // Skip invalid predictions
        }
        
        const busData = { route, direction, minutes };
        
        // Determine direction from rtdir field
        const directionUpper = direction.toUpperCase();
        if (directionUpper.includes('NORTH') || directionUpper.includes('NB')) {
            northbound.push(busData);
        } else if (directionUpper.includes('SOUTH') || directionUpper.includes('SB')) {
            southbound.push(busData);
        } else {
            // If direction unclear, try to infer from common patterns
            // Default to northbound for now
            northbound.push(busData);
        }
    });
    
    // Sort each direction by minutes (earliest first)
    const sortBuses = (a, b) => a.minutes - b.minutes;
    northbound.sort(sortBuses);
    southbound.sort(sortBuses);
    
    // Display buses grouped by direction in columns
    let html = '<div class="direction-container">';
    
    // Northbound section
    if (northbound.length > 0) {
        html += '<div class="direction-column"><h3 class="direction-heading bus-direction">Northbound</h3>';
        northbound.slice(0, 5).forEach(bus => {
            const timeText = bus.minutes === 0 ? 'Due' : `${bus.minutes} min`;
            const routeColor = getBusColor(bus.route);
            html += `
                <div class="transit-item" style="border-left-color: ${routeColor};">
                    <div>
                        <div class="route-name" style="color: ${routeColor};">Route ${bus.route}</div>
                    </div>
                    <div class="arrival-time">${timeText}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Southbound section
    if (southbound.length > 0) {
        html += '<div class="direction-column"><h3 class="direction-heading bus-direction">Southbound</h3>';
        southbound.slice(0, 5).forEach(bus => {
            const timeText = bus.minutes === 0 ? 'Due' : `${bus.minutes} min`;
            const routeColor = getBusColor(bus.route);
            html += `
                <div class="transit-item" style="border-left-color: ${routeColor};">
                    <div>
                        <div class="route-name" style="color: ${routeColor};">Route ${bus.route}</div>
                    </div>
                    <div class="arrival-time">${timeText}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    
    document.getElementById('bus-times').innerHTML = html || 
        '<div class="no-data">No bus predictions available</div>';
}

