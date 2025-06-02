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
  const isActive = data.active;

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
  ];

  allWeather
    .sort((a, b) => b.time - a.time)
    .forEach(entry => {
      weatherRow.insertAdjacentHTML('beforeend', entry.html);
    });

  weatherCard.appendChild(weatherRow);
  stockDiv.appendChild(weatherCard);
}

// Initial load + refresh every 5 mins
loadStock();
setInterval(loadStock, 5 * 60 * 1000);
