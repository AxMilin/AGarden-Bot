const STOCK_URL = 'https://growagardenapi.vercel.app/api/stock/GetStock';
const WEATHER_URL = 'https://growagardenapi.vercel.app/api/GetWeather';
const ITEM_INFO_URL = 'https://growagardenapi.vercel.app/api/Item-Info';

let itemImages = {};

function getNext5MinTimestamp() {
  const now = new Date();
  // round up to next multiple of 5 minutes
  const ms = now.getTime();
  const interval = 5 * 60 * 1000;
  return Math.ceil(ms / interval) * interval;
}

async function fetchItemImages() {
  const res = await fetch(ITEM_INFO_URL);
  const items = await res.json();
  items.forEach(item => {
    itemImages[item.name] = item.image;
  });
}

function formatWeather(name, emoji, data) {
  if (!data) return null;

  const time = new Date(data.LastSeen);
  const now = new Date();
  const hoursAgo = Math.floor((now - time) / (1000 * 60 * 60));
  const isActive = data.active;

  // Skip inactive weather older than 24 hours
  if (!isActive && hoursAgo > 24) return null;

  return {
    html: `
      <div class="item-box${isActive ? ' active-weather' : ''}">
        ${emoji} <strong>${name}</strong><br>
        <small>${hoursAgo}h ago</small>
      </div>`,
    time
  };
}

async function loadStock() {
  await fetchItemImages();
  const stockRes = await fetch(STOCK_URL);
  const weatherRes = await fetch(WEATHER_URL);

  const stockData = await stockRes.json();
  const weatherData = await weatherRes.json();
  console.log("Weather Data:", weatherData);

  const stockDiv = document.getElementById('stock');
  stockDiv.innerHTML = '';

  const categoryEmojis = {
    gearStock: '⚙️',
    seedsStock: '🌱',
    eggStock: '🥚',
    BeeStock: '🎟️',
    cosmeticsStock: '✨'
  };

  const categoryTitles = {
    gearStock: 'Gear Stock',
    seedsStock: 'Seeds Stock',
    eggStock: 'Egg Stock',
    BeeStock: 'Event Shop Stock',
    cosmeticsStock: 'Cosmetics Stock'
  };

  const categories = ['gearStock', 'seedsStock', 'eggStock', 'BeeStock', 'cosmeticsStock'];

  categories.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'card';

    const emoji = categoryEmojis[cat] || '';
    const title = categoryTitles[cat] || cat;

    section.innerHTML = `<h2>${emoji} ${title}</h2>`;

    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';

    stockData[cat].forEach(item => {
      const fallbackImage = Object.values(itemImages)[0]; // first available image
      const imageSrc = itemImages[item.name] || fallbackImage;
      const img = imageSrc ? `<img src="${imageSrc}" alt="${item.name}" />` : '';
      const itemBox = document.createElement('div');
      itemBox.className = 'item-box';
      itemBox.innerHTML = `${img}${item.name} x${item.value}`;
      itemRow.appendChild(itemBox);
    });

    section.appendChild(itemRow);
    stockDiv.appendChild(section);
  });

  // Add weather card separately
  const weatherCard = document.createElement('div');
  weatherCard.className = 'card';
  weatherCard.innerHTML = `<h2>⛅ Weather</h2>`;

  const weatherRow = document.createElement('div');
  weatherRow.className = 'item-row';

  const allWeather = [
    formatWeather("Rain", "🌧️", weatherData.rain),
    formatWeather("Snow", "❄️", weatherData.snow),
    formatWeather("Thunderstorm", "⛈️", weatherData.thunderstorm),
    formatWeather("Meteorshower", "☄️", weatherData.meteorshower),
    formatWeather("Frost", "🧊", weatherData.frost),
    formatWeather("Bloodnight", "🌙", weatherData.bloodnight)
  ].filter(entry => entry !== null);

  allWeather
    .sort((a, b) => b.time - a.time)
    .forEach(entry => {
      weatherRow.insertAdjacentHTML('beforeend', entry.html);
    });

  weatherCard.appendChild(weatherRow);
  stockDiv.appendChild(weatherCard);
}

// Countdown update function
function updateCountdown() {
  const countdownDiv = document.getElementById('next-refresh');
  const now = Date.now();
  let diff = nextFetchTime - now;

  if (diff < 0) diff = 0;

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownDiv.textContent = `Next refresh in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

let nextFetchTime = getNext5MinTimestamp();

function scheduleNextFetch() {
  const now = Date.now();
  const delayUntilNext5Min = nextFetchTime - now;
  
  setTimeout(() => {
    // random delay 2-5 seconds after exact 5-min mark
    const randomDelay = 2000 + Math.floor(Math.random() * 3000);
    setTimeout(() => {
      loadStock();
      nextFetchTime += 5 * 60 * 1000; // schedule next 5-min mark after this one
      scheduleNextFetch(); // schedule the next one
    }, randomDelay);
  }, delayUntilNext5Min);
}

// Initial call and setup
loadStock();
updateCountdown();
scheduleNextFetch();
setInterval(updateCountdown, 1000);
