const STOCK_URL = 'https://growagardenapi.vercel.app/api/stock/GetStock';
const WEATHER_URL = 'https://growagardenapi.vercel.app/api/GetWeather'; // New URL for weather

// Define mappings for category keys in the API response to display properties
const apiCategoryMap = {
    'gear': { emoji: '⚙️', title: 'Gear Stock', displayOrder: 1 },
    'seeds': { emoji: '🌱', title: 'Seeds Stock', displayOrder: 2 },
    'egg': { emoji: '🥚', title: 'Egg Stock', displayOrder: 3 },
    'cosmetics': { emoji: '✨', title: 'Cosmetics Stock', displayOrder: 4 },
    // 'honey' and 'night' will be grouped under 'event'
    'honey': { emoji: '🍯', title: 'Honey Stock', isEvent: true }, // Not directly displayed, but used for grouping
    'night': { emoji: '🌙', title: 'Night Stock', isEvent: true }, // Not directly displayed, but used for grouping
    'weather': { emoji: '🌦️', title: 'Weather Status', displayOrder: 6 },
    'event': { emoji: '🎉', title: 'Event Stock', displayOrder: 5 } // This is a virtual category for display
};

// Emojis for specific weather types (you can expand this as needed)
const weatherEmojis = {
    "beeswarm": "🐝",
    "frost": "❄️",
    "rain": "🌧️",
    "thunderstorm": "⛈️",
    "disco": "🕺",
    "jandelstorm": "🌪️",
    "blackhole": "⚫",
    "djjhai": "🎧",
    "nightevent": "🌃",
    "meteorshower": "☄️",
    "sungod": "☀️",
    "jandelfloat": "🎈",
    "chocolaterain": "🍫",
    "bloodmoonevent": "🩸",
    "workingbeeswarm": " industrious 🐝", // Consider if you want distinct emojis for similar events
    "volcano": "🌋"
};

async function loadStockAndWeather() {
    const stockDiv = document.getElementById('stock');
    stockDiv.innerHTML = 'Loading...';

    try {
        // Fetch Stock Data
        const stockRes = await fetch(STOCK_URL);
        const stockJson = await stockRes.json();
        const stockData = stockJson.Data; // Access the 'Data' object

        if (!stockData) {
            throw new Error('Stock data not found in API response.');
        }

        // Fetch Weather Data
        const weatherRes = await fetch(WEATHER_URL);
        const weatherJson = await weatherRes.json();
        const weatherData = weatherJson.weather; // Access the 'weather' array directly

        if (!weatherJson.success || !Array.isArray(weatherData)) {
            throw new Error('Weather data not found or invalid in API response.');
        }

        stockDiv.innerHTML = ''; // Clear loading message

        // Consolidate all data into a single object for easier processing
        const allFetchedData = {
            ...stockData, // gear, seeds, egg, honey, cosmetics, night
            weather: weatherData // active weather events
        };

        // Determine the order of categories to display based on displayOrder
        const sortedDisplayCategories = Object.keys(apiCategoryMap)
            .filter(key => apiCategoryMap[key].displayOrder !== undefined) // Only categories with a defined displayOrder
            .sort((a, b) => apiCategoryMap[a].displayOrder - apiCategoryMap[b].displayOrder);


        sortedDisplayCategories.forEach(catKey => {
            let itemsToDisplay = [];
            let currentCategoryTitle = apiCategoryMap[catKey].title;
            let currentCategoryEmoji = apiCategoryMap[catKey].emoji;

            if (catKey === 'event') {
                // Combine 'honey' and 'night' into 'event'
                const honeyItems = allFetchedData['honey'] || [];
                const nightItems = allFetchedData['night'] || [];
                itemsToDisplay = [...honeyItems, ...nightItems];
                currentCategoryTitle = apiCategoryMap.event.title;
                currentCategoryEmoji = apiCategoryMap.event.emoji;
            } else if (catKey === 'weather') {
                // Filter for active weather events
                const activeWeather = allFetchedData.weather.filter(w => w.active);
                if (activeWeather.length === 0) return; // Skip if no active weather

                itemsToDisplay = activeWeather.map(item => {
                    const startTimestamp = item.start_duration_unix > 0 ? `<t:${item.start_duration_unix}:R>` : 'N/A';
                    const endTimestamp = item.end_duration_unix > 0 ? `<t:${item.end_duration_unix}:R>` : 'N/A';
                    return {
                        name: item.weather_name,
                        stock: `Starts: ${startTimestamp}<br>Ends: ${endTimestamp}`, // Use 'stock' field for consistency, but customize value
                        emoji: weatherEmojis[item.weather_id] // Get specific weather emoji
                    };
                });
            } else {
                // For direct stock categories (gear, seeds, egg, cosmetics)
                itemsToDisplay = allFetchedData[catKey] || [];
            }

            if (itemsToDisplay.length === 0) return; // Skip if no items for this category

            const section = document.createElement('div');
            section.className = 'card';

            const header = document.createElement('h2');
            header.innerHTML = `${currentCategoryEmoji} ${currentCategoryTitle}`; // Use innerHTML to render emoji
            section.appendChild(header);

            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';

            itemsToDisplay.forEach(item => {
                const itemBox = document.createElement('div');
                itemBox.className = 'item-box';

                const parts = [];

                // No 'image' in your current API responses, but keeping this structure for future if you add it.
                if (item.image) {
                    parts.push(`<img src="${item.image}" alt="${item.name}" />`);
                }

                // Use the specific item emoji if available, or a default
                const itemEmoji = item.emoji || '';
                if (itemEmoji) {
                    parts.push(`<span class="item-emoji">${itemEmoji}</span>`);
                }

                // Handle stock vs. weather display
                if (catKey === 'weather') {
                    parts.push(`${item.name}<br><small>${item.stock}</small>`); // Display weather details
                } else {
                    const stockValue = parseInt(item.stock, 10);
                    if (!isNaN(stockValue) && stockValue > 0) {
                         parts.push(`${item.name} x${stockValue}`);
                    } else if (item.name) { // Display items with 0 stock but still have a name
                        parts.push(`${item.name} x0`);
                    }
                }
               
                itemBox.innerHTML = parts.join(' '); // Join with a space for readability
                itemRow.appendChild(itemBox);
            });

            section.appendChild(itemRow);
            stockDiv.appendChild(section);
        });

    } catch (err) {
        stockDiv.innerHTML = 'Failed to load data.';
        console.error('Error loading stock or weather:', err);
    }
}

// Countdown & refresh scheduling unchanged (from your script)
function getNext5MinTimestamp() {
    const now = new Date();
    const ms = now.getTime();
    const interval = 5 * 60 * 1000;
    return Math.ceil(ms / interval) * interval;
}

function updateCountdown() {
    const countdownDiv = document.getElementById('next-refresh');
    const now = Date.now();
    let diff = nextFetchTime - now;
    if (diff < 0) diff = 0; // Ensure diff is not negative

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownDiv.textContent = `Next refresh in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

let nextFetchTime = getNext5MinTimestamp();

function scheduleNextFetch() {
    const now = Date.now();
    const delayUntilNext5Min = nextFetchTime - now;

    setTimeout(() => {
        const randomDelay = 2000 + Math.floor(Math.random() * 3000); // 2-5 second random delay
        setTimeout(() => {
            loadStockAndWeather(); // Call the combined loading function
            nextFetchTime = getNext5MinTimestamp(); // Recalculate next fetch time
            scheduleNextFetch();
        }, randomDelay);
    }, delayUntilNext5Min);
}

// Init
loadStockAndWeather(); // Initial load
updateCountdown();
scheduleNextFetch(); // Schedule the first refresh
setInterval(updateCountdown, 1000); // Update countdown every second
