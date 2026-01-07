// CTA Train API Configuration
const TRAIN_API_KEY = '450f1d12e0b34e0f8333cc58f6851a47';
const TRAIN_STATION_ID = '40630';

// Fetch with timeout
function fetchWithTimeout(url, timeout = 10000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
}

// Try multiple proxy options
async function fetchWithProxies(baseUrl, maxRetries = 3) {
    const proxies = [
        null, // Direct fetch first
        `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(baseUrl)}`
    ];
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        for (let i = 0; i < proxies.length; i++) {
            const proxyUrl = proxies[i];
            const fetchUrl = proxyUrl || baseUrl;
            
            try {
                console.log(`Train API attempt ${attempt + 1}, method ${i === 0 ? 'direct' : 'proxy'}`);
                const response = await fetchWithTimeout(fetchUrl, 10000);
                
                if (!response.ok) {
                    if (response.status === 404 || response.status >= 500) {
                        continue; // Try next proxy
                    }
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const text = await response.text();
                if (!text || text.trim() === '') {
                    continue; // Empty response, try next
                }
                
                const data = JSON.parse(text);
                
                // Check for API errors
                if (data.ctatt && data.ctatt.errCd && data.ctatt.errCd !== '0') {
                    throw new Error(data.ctatt.errNm || 'Train API error');
                }
                
                return data;
            } catch (error) {
                // If it's the last attempt on the last proxy, throw
                if (attempt === maxRetries - 1 && i === proxies.length - 1) {
                    throw error;
                }
                // Otherwise, continue to next proxy/retry
                console.warn(`Train API attempt failed: ${error.message}`);
                continue;
            }
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
    
    throw new Error('All fetch attempts failed');
}

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
        
        const data = await fetchWithProxies(url);
        
        const arrivals = data.ctatt?.eta || [];
        
        if (arrivals.length === 0) {
            document.getElementById('train-times').innerHTML = 
                '<div class="no-data">No train arrivals available at this time</div>';
            return;
        }
        
        // Display the data
        displayTrainData(arrivals);
    } catch (error) {
        console.error('Train fetch error:', error);
        document.getElementById('train-times').innerHTML = 
            `<div class="error">Failed to load train times: ${error.message}. Retrying...</div>`;
    }
}

// Display train data (extracted for reuse)
function displayTrainData(arrivals) {
    // Parse and group arrivals by direction
    const northbound = [];
    const southbound = [];
    
    arrivals.forEach(arrival => {
        const route = arrival.rt || 'Unknown';
        const destination = arrival.destNm || 'Unknown';
        const arrivalTime = arrival.arrT;
        const direction = arrival.trDr || '';
        
        if (!arrivalTime) {
            return;
        }
        
        const minutes = calculateMinutes(arrivalTime);
        const minutesNum = minutes === 'Due' || minutes === 'N/A' ? 0 : parseInt(minutes, 10);
        
        const trainData = { route, destination, minutes, minutesNum, arrivalTime };
        
        if (direction === '1' || direction === 'North' || isNorthbound(destination, route)) {
            northbound.push(trainData);
        } else if (direction === '5' || direction === 'South' || isSouthbound(destination, route)) {
            southbound.push(trainData);
        } else {
            northbound.push(trainData);
        }
    });
    
    // Sort each direction by arrival time
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
            return '#FF746C';
        } else if (routeUpper.includes('BLUE') || routeUpper === 'BLUE') {
            return '#00a1de';
        } else if (routeUpper.includes('BROWN') || routeUpper === 'BRN') {
            return '#62361b';
        } else if (routeUpper.includes('GREEN') || routeUpper === 'G') {
            return '#009b3a';
        } else if (routeUpper.includes('ORANGE') || routeUpper === 'O') {
            return '#f9461c';
        } else if (routeUpper.includes('PURPLE') || routeUpper === 'P') {
            return '#522398';
        } else if (routeUpper.includes('PINK') || routeUpper === 'PNK') {
            return '#e27ea6';
        } else if (routeUpper.includes('YELLOW') || routeUpper === 'Y') {
            return '#f9e300';
        }
        return '#ff9800';
    };

    // Northbound section
    if (northbound.length > 0) {
        html += '<div class="direction-column"><h3 class="direction-heading train-direction">Northbound</h3>';
        northbound.slice(0, 5).forEach(train => {
            const lineColor = getTrainColor(train.route);
            html += `
                <div class="transit-item" style="border-left-color: ${lineColor};">
                    <div>
                        <div class="route-name" style="color: ${lineColor};">
                            ${train.route} Line
                            <span class="destination" style="font-size: 0.85em; opacity: 0.8; margin-left: 8px;">${train.destination}</span>
                        </div>
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
                        <div class="route-name" style="color: ${lineColor};">
                            ${train.route} Line
                            <span class="destination" style="font-size: 0.85em; opacity: 0.8; margin-left: 8px;">${train.destination}</span>
                        </div>
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

