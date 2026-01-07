// CTA Train API Configuration
const TRAIN_API_KEY = '450f1d12e0b34e0f8333cc58f6851a47';
const TRAIN_STATION_ID = '40630';

// Calculate minutes until arrival
function calculateMinutes(arrivalTimeString) {
    if (!arrivalTimeString) return 'N/A';
    const arrivalTime = new Date(arrivalTimeString);
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) return 'Due';
    if (diffMins === 0) return 'Due';
    return diffMins.toString();
}

// Fetch CTA train arrivals
async function fetchTrainTimes() {
    try {
        const url = `https://www.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${TRAIN_STATION_ID}&outputType=JSON`;
        
        // Try direct fetch first (HTTPS endpoint usually works)
        let response;
        try {
            response = await fetch(url);
        } catch (fetchError) {
            // If direct fetch fails due to CORS, use proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            response = await fetch(proxyUrl);
        }
        
        if (!response.ok) {
            throw new Error(`Train API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check for API errors
        if (data.ctatt && data.ctatt.errCd && data.ctatt.errCd !== '0') {
            throw new Error(data.ctatt.errNm || 'Train API error');
        }
        
        const arrivals = data.ctatt?.eta || [];
        
        if (arrivals.length === 0) {
            document.getElementById('train-times').innerHTML = 
                '<div class="no-data">No train arrivals available at this time</div>';
            return;
        }
        
        // Parse and group arrivals by direction
        const northbound = [];
        const southbound = [];
        
        arrivals.forEach(arrival => {
            const route = arrival.rt || 'Unknown';
            const destination = arrival.destNm || 'Unknown';
            const arrivalTime = arrival.arrT;
            const direction = arrival.trDr || ''; // Direction field from API
            
            if (!arrivalTime) {
                return; // Skip arrivals without time
            }
            
            const minutes = calculateMinutes(arrivalTime);
            const minutesNum = minutes === 'Due' || minutes === 'N/A' ? 0 : parseInt(minutes, 10);
            
            const trainData = { route, destination, minutes, minutesNum, arrivalTime };
            
            // Determine direction: '1' = Northbound, '5' = Southbound, or infer from destination
            if (direction === '1' || direction === 'North' || isNorthbound(destination, route)) {
                northbound.push(trainData);
            } else if (direction === '5' || direction === 'South' || isSouthbound(destination, route)) {
                southbound.push(trainData);
            } else {
                // Default to northbound if unclear
                northbound.push(trainData);
            }
        });
        
        // Sort each direction by arrival time (earliest first)
        const sortTrains = (a, b) => {
            if (a.minutes === 'Due') return -1;
            if (b.minutes === 'Due') return 1;
            if (a.minutes === 'N/A') return 1;
            if (b.minutes === 'N/A') return -1;
            return a.minutesNum - b.minutesNum;
        };
        
        northbound.sort(sortTrains);
        southbound.sort(sortTrains);
        
        // Display trains grouped by direction in columns
        let html = '<div class="direction-container">';
        
        // Helper function to get train line color
        const getTrainColor = (route) => {
            const routeUpper = route.toUpperCase();
            if (routeUpper.includes('RED') || routeUpper === 'RED') {
                return '#FF746C'; // CTA Red Line color
            } else if (routeUpper.includes('BLUE') || routeUpper === 'BLUE') {
                return '#00a1de'; // CTA Blue Line color
            } else if (routeUpper.includes('BROWN') || routeUpper === 'BRN') {
                return '#62361b'; // CTA Brown Line color
            } else if (routeUpper.includes('GREEN') || routeUpper === 'G') {
                return '#009b3a'; // CTA Green Line color
            } else if (routeUpper.includes('ORANGE') || routeUpper === 'O') {
                return '#f9461c'; // CTA Orange Line color
            } else if (routeUpper.includes('PURPLE') || routeUpper === 'P') {
                return '#522398'; // CTA Purple Line color
            } else if (routeUpper.includes('PINK') || routeUpper === 'PNK') {
                return '#e27ea6'; // CTA Pink Line color
            } else if (routeUpper.includes('YELLOW') || routeUpper === 'Y') {
                return '#f9e300'; // CTA Yellow Line color
            }
            return '#ff9800'; // Default orange
        };

        // Northbound section
        if (northbound.length > 0) {
            html += '<div class="direction-column"><h3 class="direction-heading train-direction">Northbound</h3>';
            northbound.slice(0, 5).forEach(train => {
                const lineColor = getTrainColor(train.route);
                html += `
                    <div class="transit-item" style="border-left-color: ${lineColor};">
                        <div>
                            <div class="route-name" style="color: ${lineColor};">${train.route} Line</div>
                            <div class="destination">To: ${train.destination}</div>
                        </div>
                        <div class="arrival-time">${train.minutes} min</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Southbound section
        if (southbound.length > 0) {
            html += '<div class="direction-column"><h3 class="direction-heading train-direction">Southbound</h3>';
            southbound.slice(0, 5).forEach(train => {
                const lineColor = getTrainColor(train.route);
                html += `
                    <div class="transit-item" style="border-left-color: ${lineColor};">
                        <div>
                            <div class="route-name" style="color: ${lineColor};">${train.route} Line</div>
                            <div class="destination">To: ${train.destination}</div>
                        </div>
                        <div class="arrival-time">${train.minutes} min</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        
        document.getElementById('train-times').innerHTML = html || 
            '<div class="no-data">No train arrivals available</div>';
    } catch (error) {
        console.error('Train fetch error:', error);
        document.getElementById('train-times').innerHTML = 
            `<div class="error">Failed to load train times: ${error.message}</div>`;
    }
}

// Helper function to determine if destination is northbound
function isNorthbound(destination, route) {
    const destinationUpper = destination.toUpperCase();
    const northboundKeywords = ['HOWARD', 'KENMORE', 'KIMBALL', 'LINDEN', 'DEMPSTER', 'FOSTER', 'BELMONT'];
    return northboundKeywords.some(keyword => destinationUpper.includes(keyword));
}

// Helper function to determine if destination is southbound
function isSouthbound(destination, route) {
    const destinationUpper = destination.toUpperCase();
    const southboundKeywords = ['95TH', 'DAN RYAN', 'O\'HARE', 'MIDWAY', 'CICERO', 'ASHLAND', 'ROOSEVELT', 'JACKSON'];
    return southboundKeywords.some(keyword => destinationUpper.includes(keyword));
}

