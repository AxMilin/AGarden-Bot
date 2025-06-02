const STOCK_URL = 'https://growagardenapi.vercel.app/api/stock/GetStock';
const WEATHER_URL = 'https://growagardenapi.vercel.app/api/GetWeather';
const ITEM_INFO_URL = 'https://growagardenapi.vercel.app/api/Item-Info';

let itemImages = {};

async function fetchItemImages() {
  const res = await fetch(ITEM_INFO_URL);
  const items = await res.json();
  items.forEach(item => {
    itemImages[item.name] = item.image;
  });
}

function formatWeather(name, emoji, data) {
  const time = new Date(data.LastSeen);
  const now = new Date();
  const hoursAgo = Math.floor((now - time) / (1000 * 60 * 60));
  const status = data.active ? "✅ Active" : "❌ Inactive";
  return `<div class="card">${emoji} <strong>${name}</strong><br>${status}<br>Last Seen: ${hoursAgo}h ago</div>`;
}

async function loadStock() {
  await fetchItemImages();
  const stockRes = await fetch(STOCK_URL);
  const weatherRes = await fetch(WEATHER_URL);

  const stockData = await stockRes.json();
  const weatherData = await weatherRes.json();

  const stockDiv = document.getElementById('stock');
  const weatherDiv = document.getElementById('weather');
  stockDiv.innerHTML = '';
  weatherDiv.innerHTML = '';

  // Add emojis for each category here
  const categoryEmojis = {
    gearStock: '⚙️',
    seedsStock: '🌱',
    eggStock: '🥚',
    BeeStock: '🐝',
    cosmeticsStock: '✨'
  };

  const categories = ['gearStock', 'seedsStock', 'eggStock', 'BeeStock', 'cosmeticsStock'];

  categories.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'card';
    const emoji = categoryEmojis[cat] || '';
    const title = cat.replace('Stock', '');
    section.innerHTML = `<h2>${emoji} ${title.charAt(0).toUpperCase() + title.slice(1)}</h2>`;

    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';

    stockData[cat].forEach(item => {
      const img = itemImages[item.name] ? `<img src="${itemImages[item.name]}" alt="${item.name}" />` : '';
      const itemBox = document.createElement('div');
      itemBox.className = 'item-box';
      itemBox.innerHTML = `${img}${item.name} x${item.value}`;
      itemRow.appendChild(itemBox);
    });

    section.appendChild(itemRow);
    stockDiv.appendChild(section);
  });

  weatherDiv.innerHTML += formatWeather("Rain", "🌧️", weatherData.rain);
  weatherDiv.innerHTML += formatWeather("Snow", "❄️", weatherData.snow);
  weatherDiv.innerHTML += formatWeather("Thunderstorm", "⛈️", weatherData.thunderstorm);
  weatherDiv.innerHTML += formatWeather("Meteorshower", "☄️", weatherData.meteorshower);
  weatherDiv.innerHTML += formatWeather("Frost", "🧊", weatherData.frost);
  weatherDiv.innerHTML += formatWeather("Bloodnight", "🌙", weatherData.bloodnight);
}

// Refresh every 5 minutes
loadStock();
setInterval(loadStock, 5 * 60 * 1000);
