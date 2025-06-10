const STOCK_URL = '/stocks';

const categoryEmojis = {
  gearStock: '⚙️',
  seedsStock: '🌱',
  eggStock: '🥚',
  cosmeticsStock: '✨',
  weatherStock: '🌦️',
  eventStock: '🎉',  // Event icon
};

const categoryTitles = {
  gearStock: 'Gear Stock',
  seedsStock: 'Seeds Stock',
  eggStock: 'Egg Stock',
  cosmeticsStock: 'Cosmetics Stock',
  weatherStock: 'Weather',
  eventStock: 'Event',
};

// The main categories to display, with Event grouping bee and night stocks
const categories = ['seedsStock', 'gearStock', 'cosmeticsStock', 'eggStock', 'eventStock', 'weatherStock'];

async function loadStock() {
  const stockDiv = document.getElementById('stock');
  stockDiv.innerHTML = 'Loading...';

  try {
    const res = await fetch(STOCK_URL);
    //const json = await res.json();
    //const stockData = json.result;
    const stockData = await res.json();

    stockDiv.innerHTML = '';

categories.forEach(cat => {
  let items = [];

  if (cat === 'eventStock') {
    const bee = stockData['honeyStock'] || [];
    const night = stockData['nightStock'] || [];
    items = [...bee, ...night];
    if (items.length === 0) return;

  } else if (cat === 'weatherStock') {
    items = stockData.lastSeen?.Weather || [];
    if (items.length === 0) return;

    items = items.map(item => ({
      ...item,
      name: `${item.name} (${item.seen})`,
      value: 1
    }));

  } else {
    items = stockData[cat] || [];
    if (items.length === 0) return;
  }

  const section = document.createElement('div');
  section.className = 'card';

  const emoji = categoryEmojis[cat] || '';
  const title = categoryTitles[cat] || cat;

  const header = document.createElement('h2');
  header.innerText = `${emoji} ${title}`;
  section.appendChild(header);

  const itemRow = document.createElement('div');
  itemRow.className = 'item-row';

  items.forEach(item => {
    const itemBox = document.createElement('div');
    itemBox.className = 'item-box';

    const parts = [];

    if (item.image) {
      parts.push(`<img src="${item.image}" alt="${item.name}" />`);
    }

    if (item.emoji) {
      parts.push(`<span class="item-emoji">${item.emoji}</span>`);
    }

    parts.push(`${item.name} x${item.value}`);

    itemBox.innerHTML = parts.join(' ');
    itemRow.appendChild(itemBox);
  });

  section.appendChild(itemRow);
  stockDiv.appendChild(section);
});



      } catch (err) {
        stockDiv.innerHTML = 'Failed to load stock.';
        console.error('Error loading stock:', err);
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
    const randomDelay = 2000 + Math.floor(Math.random() * 3000);
    setTimeout(() => {
      loadStock();
      nextFetchTime += 5 * 60 * 1000;
      scheduleNextFetch();
    }, randomDelay);
  }, delayUntilNext5Min);
}

// Init
loadStock();
updateCountdown();
scheduleNextFetch();
setInterval(updateCountdown, 1000);
