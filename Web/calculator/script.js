     document.addEventListener('DOMContentLoaded', () => {
function populateCropDropdown() {
  const cropSelect = document.getElementById('reverseCropSelect');
  if (!cropSelect) return;

  // Build <optgroup> sections for each category
  let optionsHTML = '<option value="" disabled selected>-- Select a crop --</option>';
  Object.entries(categories).forEach(([categoryName, cropList]) => {
    optionsHTML += `<optgroup label="${categoryName}">` +
                     cropList.map(cropName => 
                       `<option value="${cropName}">${cropName}</option>`
                     ).join('') +
                   `</optgroup>`;
  });

  cropSelect.innerHTML = optionsHTML;
}
const categories = {
  "Public Crops": [
    "Carrot","Strawberry","Blueberry","Orange Tulip","Tomato",
    "Corn","Daffodil","Watermelon","Pumpkin","Apple",
    "Bamboo","Coconut","Cactus","Dragon Fruit","Mango",
    "Grape","Mushroom","Pepper","Cacao","Beanstalk"
  ],
  "Seed Pack": [
    "Lemon","Pineapple","Peach","Raspberry","Pear",
    "Cranberry","Durian","Eggplant","Venus Flytrap","Lotus"
  ],
  "Exotic Seed Pack": [
    "Papaya","Banana","Passionfruit","Soul Fruit","Cursed Fruit"
  ],
  "Easter Event": [
    "Chocolate Carrot","Candy Sunflower","Easter Egg",
    "Red Lollipop","Candy Blossom"
  ],
   "Lunar Glow Event": [
    "Nightshade", "Glowshroom", "Mint", "Moonflower", 
    "Starfruit", "Moonglow", "Moon Blossom", "Blood Banana", 
    "Moon Melon", "Celestiberry", "Moon Mango"
  ],
  "Bizzy Bees Event": [
    "Sunflower", "Nectarine", "Hive Fruit", 
    "Purple Dahlia", "Pink Lily", "Foxglove", "Lilac", "Rose"
  ]
};
        const cropImageMap = {
          "Carrot": "https://static.wikia.nocookie.net/growagarden/images/3/3c/Carrottransparent.png/revision/latest?cb=20250421123349",
          "Strawberry": "https://static.wikia.nocookie.net/growagarden/images/6/6d/Strawberry.png/revision/latest?cb=20250501001831",
          "Blueberry": "https://static.wikia.nocookie.net/growagarden/images/9/9e/Blueberry.png/revision/latest?cb=20250504064726",
          "Orange Tulip": "https://static.wikia.nocookie.net/growagarden/images/4/4d/Orangetulip.png/revision/latest?cb=20250422131408",
          "Tomato": "https://static.wikia.nocookie.net/growagarden/images/9/9d/Tomato.png/revision/latest?cb=20250501001240",
          "Corn": "https://static.wikia.nocookie.net/growagarden/images/e/ee/CornCropsPic.png/revision/latest?cb=20250429082913",
          "Daffodil": "https://static.wikia.nocookie.net/growagarden/images/3/31/Daffodilfruiticon.png/revision/latest?cb=20250422223149",
          "Watermelon": "https://static.wikia.nocookie.net/growagarden/images/3/31/Watermelonfruiticon.png/revision/latest?cb=20250422203923",
          "Pumpkin": "https://static.wikia.nocookie.net/growagarden/images/3/36/Pumpkincropp.png/revision/latest?cb=20250423182726",
          "Apple": "https://static.wikia.nocookie.net/growagarden/images/c/c3/Applefruiticon.png/revision/latest?cb=20250423014534",
          "Bamboo": "https://static.wikia.nocookie.net/growagarden/images/8/88/Bamboofruiticon.png/revision/latest?cb=20250422225330",
          "Coconut": "https://static.wikia.nocookie.net/growagarden/images/4/46/Coconutfruiticon.png/revision/latest?cb=20250421045107",
          "Cactus": "https://static.wikia.nocookie.net/growagarden/images/8/86/Cactus_fruit_icon.png/revision/latest?cb=20250422183017",
          "Dragon Fruit": "https://static.wikia.nocookie.net/growagarden/images/4/4a/Dragonfruitthumb.png/revision/latest?cb=20250421182136",
          "Mango": "https://static.wikia.nocookie.net/growagarden/images/0/0e/MangoFruitIcon.png/revision/latest?cb=20250421020339",
          "Grape": "https://static.wikia.nocookie.net/growagarden/images/7/7b/Grapwes.png/revision/latest?cb=20250420202852",
          "Mushroom": "https://static.wikia.nocookie.net/growagarden/images/3/3a/MushroomCropsPic.png/revision/latest/scale-to-width-down/1000?cb=20250430134436",
          "Pepper": "https://static.wikia.nocookie.net/growagarden/images/2/29/PepperCropsPic.png/revision/latest/scale-to-width-down/1000?cb=20250503163931",
          "Cacao": "https://static.wikia.nocookie.net/growagarden/images/f/f2/CacaoIcon.png/revision/latest?cb=20250511025646",
          "Lemon": "https://static.wikia.nocookie.net/growagarden/images/9/92/LemonCropsPic.png/revision/latest?cb=20250429120733",
          "Pineapple": "https://static.wikia.nocookie.net/growagarden/images/7/7a/PineappleTreePic.png/revision/latest?cb=20250428191705",
          "Peach": "https://static.wikia.nocookie.net/growagarden/images/1/13/Transparent_Peach.png/revision/latest?cb=20250421060048",
          "Raspberry": "https://static.wikia.nocookie.net/growagarden/images/1/1f/Raspberry.png/revision/latest?cb=20250423134817",
          "Pear": "https://static.wikia.nocookie.net/growagarden/images/a/a1/Regpear.png/revision/latest?cb=20250417155929",
          "Cranberry": "https://static.wikia.nocookie.net/growagarden/images/d/dd/Cranberry.png/revision/latest?cb=20250427102834",
          "Durian": "https://static.wikia.nocookie.net/growagarden/images/c/c0/Duriannobg.png/revision/latest?cb=20250427170102",
          "Eggplant": "https://static.wikia.nocookie.net/growagarden/images/f/fb/EggplantCropPic.png/revision/latest?cb=20250429150832",
          "Venus Flytrap": "https://static.wikia.nocookie.net/growagarden/images/a/a5/VenusFlyTrapCropsPic.png/revision/latest/scale-to-width-down/1000?cb=20250430165230",
          "Lotus": "https://static.wikia.nocookie.net/growagarden/images/6/68/LotusPic.png/revision/latest?cb=20250428145838",
          "Papaya": "https://static.wikia.nocookie.net/growagarden/images/3/31/Papayafruiticon.png/revision/latest?cb=20250422220237",
          "Banana": "https://static.wikia.nocookie.net/growagarden/images/c/cf/BananaPic.png/revision/latest/scale-to-width-down/1000?cb=20250428203430",
          "Passionfruit": "https://static.wikia.nocookie.net/growagarden/images/0/01/NormalPassionfruitPic.png/revision/latest/scale-to-width-down/1000?cb=20250428142506",
          "Soul Fruit": "https://static.wikia.nocookie.net/growagarden/images/9/96/SoulFruitCropsPic.png/revision/latest/scale-to-width-down/1000?cb=20250503182228",
          "Cursed Fruit": "https://static.wikia.nocookie.net/growagarden/images/f/f3/Cursed_Fruit.png/revision/latest?cb=20250517073936",
          "Chocolate Carrot": "https://static.wikia.nocookie.net/growagarden/images/d/d8/Chococarrotthumb.png/revision/latest?cb=20250424063607",
          "Candy Sunflower": "https://static.wikia.nocookie.net/growagarden/images/e/ed/CandySunflowerPic.png/revision/latest?cb=20250429072940",
          "Easter Egg": "https://static.wikia.nocookie.net/growagarden/images/8/8e/Easter_egg_plant2.png/revision/latest?cb=20250422190119",
          "Red Lollipop": "https://static.wikia.nocookie.net/growagarden/images/0/0d/Redlollithumb.png/revision/latest?cb=20250429063543",
          "Candy Blossom": "https://static.wikia.nocookie.net/growagarden/images/5/52/CandyBlossomPic.png/revision/latest?cb=20250504064114",
          "Nightshade": "https://static.wikia.nocookie.net/growagarden/images/d/dd/Flower.png/revision/latest?cb=20250510162934",
          "Glowshroom": "https://static.wikia.nocookie.net/growagarden/images/f/f7/GlowshroomTreePic.png/revision/latest?cb=20250510180232",
          "Mint": "https://static.wikia.nocookie.net/growagarden/images/0/09/MintFruit.png/revision/latest?cb=20250511171855",
          "Moonflower": "https://static.wikia.nocookie.net/growagarden/images/a/a0/MoonFlowerCropsIcon.png/revision/latest?cb=20250511112259",
          "Starfruit": "https://static.wikia.nocookie.net/growagarden/images/6/62/StarFruitFruit.png/revision/latest?cb=20250511082657",
          "Moonglow": "https://static.wikia.nocookie.net/growagarden/images/5/54/Nobackgroundmoonglow.png.png/revision/latest?cb=20250510175014",
          "Moon Blossom": "https://static.wikia.nocookie.net/growagarden/images/a/af/MoonBlossomFruit.png/revision/latest?cb=20250511173731",
          "Beanstalk": "https://static.wikia.nocookie.net/growagarden/images/f/f9/BeanstalkIcon.png/revision/latest/scale-to-width-down/1000?cb=20250517153727",
          "Blood Banana": "https://static.wikia.nocookie.net/growagarden/images/8/83/Blood_Banana_Icon.png/revision/latest?cb=20250517140315",
          "Moon Melon": "https://static.wikia.nocookie.net/growagarden/images/4/4f/Moon_Melon_Icon.png/revision/latest?cb=20250517140316",
          "Sunflower": "https://static.wikia.nocookie.net/growagarden/images/c/c0/Sunflower_Produce_.png/revision/latest?cb=20250531190322",
          "Nectarine": "https://static.wikia.nocookie.net/growagarden/images/3/3a/Nectarine.png/revision/latest?cb=20250531152812",
          "Hive Fruit": "https://static.wikia.nocookie.net/growagarden/images/0/0f/HiveFruitCropIcon.png/revision/latest/scale-to-width-down/1000?cb=20250531150508",
          "Pink Lily": "https://static.wikia.nocookie.net/growagarden/images/0/03/Pink_Lily.png/revision/latest?cb=20250531165949",
          "Purple Dahlia": "https://static.wikia.nocookie.net/growagarden/images/c/cc/ProduceDahila.png/revision/latest?cb=20250601012738",
          "Foxglove": "https://static.wikia.nocookie.net/growagarden/images/e/e7/Foxgloveproduce.png/revision/latest?cb=20250531162211",
          "Lilac": "https://static.wikia.nocookie.net/growagarden/images/d/d2/LilacCropIcon.png/revision/latest/scale-to-width-down/1000?cb=20250531164609",
          "Rose": "https://static.wikia.nocookie.net/growagarden/images/d/d3/Roseflower.png/revision/latest?cb=20250531145536",
          "Celestiberry": "https://static.wikia.nocookie.net/growagarden/images/3/33/CelestiberryIcon.png/revision/latest/scale-to-width-down/1000?cb=20250525112629",
          "Moon Mango": "https://static.wikia.nocookie.net/growagarden/images/f/fd/MoonMangoIcon.png/revision/latest/scale-to-width-down/1000?cb=20250525113246"
        };


      const basePrices = {
        "Carrot": 270,
        "Strawberry": 167,
        "Blueberry": 500,
        "Tomato": 120,
        "Orange Tulip": 350000,
        "Corn": 10,
        "Daffodil": 25000,
        "Watermelon": 61.25,
        "Pumpkin": 53.1,
        "Apple": 30.625,
        "Bamboo": 250,
        "Coconut": 2.04,
        "Cactus": 69.4,
        "Dragon Fruit": 33,
        "Mango": 28.875,
        "Grape": 872.25,
        "Mushroom": 241.5,
        "Pepper": 320,
        "Cacao": 171.875,
        "Pineapple": 222,
        "Raspberry": 178,
        "Starfruit": 1666.25,
        "Easter Egg": 280,
        "Candy Blossom": 11100,
        "Eggplant": 300,
        "Moonflower": 2375,
        "Moonglow": 408,
        "Glowshroom": 533,
        "Mint": 5250,
        "Beanstalk": 200,
        "Blood Banana": 4198,
        "Moon Melon": 711,
        "Rose": 100,
        "Sunflower": 100,
        "Nectarine": 100,
        "Hive Fruit": 100,
        "Purple Dahlia": 100,
        "Pink Lily": 100,
        "Foxglove": 100,
        "Lilac": 100,
        "Celestiberry": 15000,
        "Moon Mango": 100000
      };
      // Number formatting function
function formatNumber(value) {
  if (!Number.isFinite(value)) return '∞';
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000_000_000) return (value/1_000_000_000_000_000).toFixed(2) + 'q';
  if (absValue >= 1_000_000_000_000) return (value/1_000_000_000_000).toFixed(2) + 't';
  if (absValue >= 1_000_000_000) return (value/1_000_000_000).toFixed(2) + 'b';
  if (absValue >= 1_000_000) return (value/1_000_000).toFixed(2) + 'm';
  if (absValue >= 1_000) return (value/1_000).toFixed(2) + 'k';
  return value.toFixed(2);
}
    // ── START: “how obtained” placeholders ──
      const cropInfo = {};
      Object.values(categories).flat().forEach(crop => {
cropInfo["Carrot"]           = "Buyable from Seed Shop for 10₵ (always in stock)";
cropInfo["Strawberry"]       = "Buyable from Seed Shop for 50₵ (always in stock)";
cropInfo["Blueberry"]        = "Buyable from Seed Shop for 400₵ (always in stock)";
cropInfo["Orange Tulip"]     = "Buyable from Seed Shop for 600₵ (~35% chance to appear)";
cropInfo["Tomato"]           = "Buyable from Seed Shop for 800₵ (always in stock)";
cropInfo["Corn"]             = "Buyable from Seed Shop for 1,300₵ (~30% chance)";
cropInfo["Daffodil"]         = "Buyable from Seed Shop for 1,000₵ (~15% chance)";
cropInfo["Watermelon"]       = "Buyable from Seed Shop for 2,500₵ (~13% chance)";
cropInfo["Pumpkin"]          = "Buyable from Seed Shop for 3,000₵ (~10% chance)";
cropInfo["Apple"]            = "Buyable from Seed Shop for 3,250₵ (~7% chance)";
cropInfo["Bamboo"]           = "Buyable from Seed Shop for 4,000₵ (~20% chance)";
cropInfo["Coconut"]          = "Buyable from Seed Shop for 6,000₵ (~5% chance)";
cropInfo["Cactus"]           = "Buyable from Seed Shop for 15,000₵ (~3% chance)";
cropInfo["Dragon Fruit"]     = "Buyable from Seed Shop for 30,000₵ (~2% chance)";
cropInfo["Mango"]            = "Buyable from Seed Shop for 100,000₵ (~1.5% chance)";
cropInfo["Grape"]            = "Buyable from Seed Shop for 850,000₵ (~1% chance)";
cropInfo["Mushroom"]         = "Buyable from Seed Shop for 150,000₵ (~0.75% chance)";
cropInfo["Pepper"]           = "Buyable from Seed Shop for 1,000,000₵ (~0.5% chance)";
cropInfo["Cacao"]            = "Buyable from Seed Shop for 2,500,000₵ (~0.5% chance)";
cropInfo["Beanstalk"]        = "Buyable from Seed Shop for 10,000,000₵ (~0.5% chance to appear)";
cropInfo["Lemon"]            = "Exclusive event reward (no longer obtainable)";
cropInfo["Pineapple"]        = "Dropped from Normal Seed Pack (~7.7% chance)";
cropInfo["Peach"]            = "Dropped from Normal Seed Pack (~7.7% chance)";
cropInfo["Raspberry"]        = "Dropped from Normal Seed Pack (~7.7% chance)";
cropInfo["Pear"]             = "Dropped from Normal Seed Pack (~7.7% chance)";
cropInfo["Cranberry"]        = "Dropped from Basic Seed Pack (~30% chance); Premium Seed Pack (45% chance)";
cropInfo["Durian"]           = "Dropped from Basic Seed Pack (~21% chance); Premium Seed Pack (35% chance)";
cropInfo["Eggplant"]         = "Dropped from Basic Seed Pack (~8.7% chance); Premium Seed Pack (16% chance)";
cropInfo["Venus Flytrap"]    = "Dropped from Basic Seed Pack (~0.01% chance); Premium Seed Pack (1% chance)";
cropInfo["Lotus"]            = "Dropped from Basic Seed Pack (~0.25% chance); Premium Seed Pack (2.5% chance)";
cropInfo["Papaya"]           = "Dropped from Exotic Seed Pack (~40% chance)";
cropInfo["Banana"]           = "Dropped from Exotic Seed Pack (~38% chance)";
cropInfo["Passionfruit"]     = "Dropped from Exotic Seed Pack (~20% chance)";
cropInfo["Soul Fruit"]       = "Dropped from Exotic Seed Pack (~1.5% chance, event-limited)";
cropInfo["Cursed Fruit"]     = "Dropped from Exotic Seed Pack (~0.5% chance, rarest crop)";
cropInfo["Chocolate Carrot"] = "Buyable from Easter Event Shop for 10,000₵";
cropInfo["Candy Sunflower"]  = "Buyable from Easter Event Shop for 75,000₵";
cropInfo["Easter Egg"]       = "Buyable from Easter Event Shop for 500,000₵";
cropInfo["Red Lollipop"]     = "Buyable from Easter Event Shop for 45,000₵";
cropInfo["Candy Blossom"]    = "Buyable from Easter Event Shop for 10,000,000₵";
cropInfo["Nightshade"]       = "Dropped from Night Seed Pack (35% chance)";
cropInfo["Glowshroom"]       = "Dropped from Night Seed Pack (19.5% chance); Premium Night Seed Pack (30% chance)";
cropInfo["Mint"]             = "Dropped from Night Seed Pack (14.3% chance); Premium Night Seed Pack (22% chance)";
cropInfo["Moonflower"]       = "Dropped from Night Seed Pack (11.7% chance); Premium Night Seed Pack (18% chance)";
cropInfo["Starfruit"]        = "Dropped from Night Seed Pack (10.08% chance); Premium Night Seed Pack (15.5% chance)";
cropInfo["Moonglow"]         = "Dropped from Night Seed Pack (7.8% chance); Premium Night Seed Pack (12% chance)";
cropInfo["Moon Blossom"]     = "Dropped from Night Seed Pack (1.63% chance); Premium Night Seed Pack (2.5% chance)";
cropInfo["Blood Banana"]     = "Buyable from Blood Moon Shop for 200,000₵ when in stock";
cropInfo["Moon Melon"]       = "Buyable from Blood Moon Shop for 500,000₵ when in stock";
cropInfo["Sunflower"]        = "Dropped from Flower Seed Pack (~0.5% chance)";
cropInfo["Rose"]             = "Dropped from Flower Seed Pack (~40% chance)";
cropInfo["Foxglove"]         = "Dropped from Flower Seed Pack (~25% chance)";
cropInfo["Lilac"]            = "Dropped from Flower Seed Pack (~20% chance)";
cropInfo["Pink Lily"]        = "Dropped from Flower Seed Pack (~10% chance)";
cropInfo["Purple Dahlia"]    = "Dropped from Flower Seed Pack (~4.5% chance)";
cropInfo["Nectarine"]        = "Buyable from Honey Shop for 40 Honey";
cropInfo["Hive Fruit"]       = "Buyable from Honey Shop for 40 Honey";
cropInfo["Moon Mango"]       = "Buyable from Twilight Shop for 1,000,000,000₵";
cropInfo["Celestiberry"]     = "Buyable from Twilight Shop for 15,000,000₵";



      });
  // 1) “Reverse Lookup” button: opens the panel and populates the Crop dropdown
  const revBtn = document.getElementById('reverseLookupBtn');
  if (revBtn) {
    revBtn.addEventListener('click', () => {
      // Hide any other panel (calculator, crop reference, etc.)
      if (typeof hidePanel === 'function')       hidePanel();
      if (typeof hideCropReference === 'function') hideCropReference();

      // Show the reverse‐lookup panel
      const reversePanel = document.getElementById('reversePanel');
      reversePanel.classList.add('active');

      // Populate the “Crop” dropdown if it still only has the placeholder
      const cropSelect = document.getElementById('reverseCropSelect');
      if (cropSelect && cropSelect.options.length === 1) {
        populateCropDropdown();
      }
    });
  }

  // 2) “Back” button inside Reverse Lookup panel: hides the panel
  const revBackBtn = document.getElementById('reverseBackBtn');
  if (revBackBtn) {
    revBackBtn.addEventListener('click', () => {
      const reversePanel = document.getElementById('reversePanel');
      reversePanel.classList.remove('active');
    });
  }
     // ── END: placeholders ──
     
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    function createCategorySection(name, crops) {
  const section = document.createElement('details');
  section.className = 'category-section';
  section.innerHTML = `
    <summary>${name}</summary>
    ${crops.map(crop => {
      // check if this crop is in favorites
      const isFav = favorites.includes(crop);
      return `
        <button data-crop="${crop}" onclick="selectPlant('${name}', '${crop}')">
          ${crop}
          <span 
            class="star-icon ${isFav ? 'active' : ''}" 
            onclick="toggleFavorite('${crop}', event); event.stopPropagation()"
          >
            ${isFav ? '★' : '☆'}
          </span>
        </button>
      `;
    }).join('')}`;
  return section;
}


      const sidebar = document.getElementById('sidebar');
      Object.entries(categories).forEach(([name, crops]) => {
        sidebar.appendChild(createCategorySection(name, crops));
      });
          
      function updateFavoritesDisplay() {
        const favoritesList = document.getElementById('favoritesList');
        favoritesList.innerHTML = favorites.map(crop => `
          <button class="starred" data-crop="${crop}" onclick="selectCategoryFromFavorite('${crop}')">
            ${crop} 
            <span class="star-icon active" onclick="toggleFavorite('${crop}', event)">★</span>
          </button>
        `).join('');
        
        document.querySelector('.empty-state').style.display = 
          favorites.length ? 'none' : 'block';
      }

      window.toggleFavorite = function(crop, event) {
    event.stopPropagation();
    favorites = favorites.includes(crop)
      ? favorites.filter(f => f !== crop)
      : [...favorites, crop];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesDisplay();
    updateCategoryStars();    // ← SYNC ALL STARS IMMEDIATELY
  }
function updateCategoryStars() {
  document.querySelectorAll('.star-icon').forEach(icon => {
    const button = icon.closest('button[data-crop]');
    if (!button) return;
    const cropName = button.getAttribute('data-crop');
    if (favorites.includes(cropName)) {
      icon.classList.add('active');
      icon.textContent = '★';
    } else {
      icon.classList.remove('active');
      icon.textContent = '☆';
    }
  });
}

      document.getElementById('sidebarSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.category-section').forEach(section => {
          let hasVisibleItems = false;
          const buttons = section.querySelectorAll('button');
          buttons.forEach(button => {
            const matches = button.textContent.toLowerCase().includes(query);
            button.style.display = matches ? 'block' : 'none';
            if (matches) hasVisibleItems = true;
          });
          
          if (query.length > 0) {
            section.open = hasVisibleItems;
          }
        });
      });

      window.selectPlant = function(category, plant) {
        selectCategory(category);
        const select = document.getElementById('plant-select');
        select.value = plant;
      };

      window.selectCategory = function(catName) {
        hideCropReference();
        document.querySelectorAll('#sidebar button')
                .forEach(b => b.classList.toggle('active', b.textContent === catName));
        
        const plantSelect = document.getElementById('plant-select');
        plantSelect.innerHTML = '';
        categories[catName].forEach(p => {
          const option = document.createElement('option');
          option.value = p;
          option.textContent = p;
          plantSelect.appendChild(option);
        });

        document.getElementById('panel-title').textContent = catName;
        document.getElementById('panel').classList.add('active');
        updateHistoryDisplay();
      };

      function findCategoryForCrop(crop) {
        for (const [category, crops] of Object.entries(categories)) {
          if (crops.includes(crop)) return category;
        }
        return null;
      }

      window.selectCategoryFromFavorite = function(crop) {
        const category = findCategoryForCrop(crop);
        if (category) {
          selectPlant(category, crop);
        }
      };

     let calculationHistory = JSON.parse(localStorage.getItem('gardenCalculations')) || [];


      const statsBody = document.getElementById('stats-body');
      Object.values(categories).flat().forEach(crop => {
        const tr = document.createElement('tr');
        const imageUrl = cropImageMap[crop] || '';
        const tooltipText = cropInfo[crop] || crop;
        tr.innerHTML = `
     <td style="display:flex; align-items:center; gap:10px;">
      <span class="seed-item tooltip" data-tooltip="${tooltipText}">
        <img
          src="${imageUrl}"
          alt="${crop}"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null;this.src='https://via.placeholder.com/28x28?text=❌';"
          style="width:80px; height:80px; border-radius:4px;"
        >
      </span>
      <span style="color:#fff; font-weight:bold; margin-left:8px;">${crop}</span>
    </td>
    <td>₵${basePrices[crop] || 'N/A'}</td>
  `;
  statsBody.appendChild(tr);
});

      const mutations = [
        { name: "Shocked", value: 99 },
        { name: "Chilled", value: 1 },
        { name: "Wet", value: 1 },
        { name: "Moonlit", value: 1 },
        { name: "Frozen", value: 9 },
        { name: "Chocolate", value: 1 },
        { name: "Bloodlit", value: 3 },
        { name: "Zombified", value: 24 },
        { name: "Celestial", value: 119 },
        { name: "Disco", value: 124 },
        { name: "Twisted", value: 29 },        
        { name: "Pollinated", value: 2 },    
        { name: "HoneyGlazed", value: 4 },  
        { name: "Void Touched", value: 134 },
        { name: "Plasma", value: 4 }        
      ];

const categoryFilter = document.getElementById('categoryFilter');

categoryFilter.innerHTML =
  '<option value="All">All</option>' +
  Object.keys(categories).map(cat => `<option value="${cat}">${cat}</option>`).join('');
          
categoryFilter.addEventListener('change', applyFilters);

function applyFilters() {
  const selectedCategory = categoryFilter.value;

  document.querySelectorAll('.category-section').forEach(section => {
    const catName = section.querySelector('summary').textContent.trim();

    if (selectedCategory !== 'All' && catName !== selectedCategory) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
      section.open = (selectedCategory === 'All') ? false : true;
    }
  });
}

// 4) Run once on load so everything is visible (closed) initially
applyFilters();
// ──────────────────────────────────────────────────────────────────────────────

      let variantMultiplier = 1;
      let baseMultiplier = 1;

      const mutationChips = document.getElementById('mutation-chips');
      mutations.forEach(mutation => {
        const chip = document.createElement('div');
        chip.className = 'mutation-chip';
        chip.textContent = mutation.name;
        chip.dataset.value = mutation.value;
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
          updateMultiplier();
        });
        mutationChips.appendChild(chip);
      });

      const variantButtons = document.querySelectorAll('.variant-buttons button');
      variantButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          variantButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          variantMultiplier = parseInt(this.dataset.mult);
          updateMultiplier();
        });
      });

      function updateMultiplier() {
        const activeChips = document.querySelectorAll('.mutation-chip.active');
        let mutationSum = 0;
        
        activeChips.forEach(chip => {
          mutationSum += parseInt(chip.dataset.value);
        });
        
        const totalMultiplier = baseMultiplier + mutationSum;
        const effectiveMultiplier = totalMultiplier * variantMultiplier;
        
        document.getElementById('active-multiplier').textContent = effectiveMultiplier;
        document.getElementById('multiplier').value = effectiveMultiplier;
      }

      function updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = calculationHistory.map(entry => `
          <li>
            <span class="history-timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
            ${entry.html}
          </li>
        `).join('');
        
        if (calculationHistory.length === 0) {
          historyList.innerHTML = '<li>No calculations yet.</li>';
        }
      }

     window.hidePanel = function() {
  document.getElementById('panel').classList.remove('active');
  document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
  document.getElementById('result').textContent = '';
  document.getElementById('result').style.display = 'none';
  
  // Close mobile sidebar
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
};

     window.showCropReference = function() {
  const panel = document.getElementById('crop-reference');
  panel.classList.add('active');
  document.querySelector('.main').style.display = 'none';
  
  // Close mobile menu if open
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
  
  // Close plant panel if open
  document.getElementById('panel').classList.remove('active');
}

      window.hideCropReference = function() {
        document.getElementById('crop-reference').classList.remove('active');
        document.querySelector('.main').style.display = 'flex';
        document.body.style.overflow = 'auto';
      };

 window.calculate = function() {
    if (!validateMass()) return;
    console.log('--- CALCULATION STARTED ---');
    console.log('Plant:', document.getElementById('plant-select').value);
    console.log('Mass:', document.getElementById('mass').value);
    console.log('Multiplier:', document.getElementById('multiplier').value);
  // 1. Inputs
  var plant = document.getElementById('plant-select').value;
  var mass  = parseFloat(document.getElementById('mass').value);
  var mult  = parseFloat(document.getElementById('multiplier').value);

  // 2. Base price per kg
  var basePrice = basePrices[plant] || 100;

  // 3. Compute ±0.005-kg bounds
  var minMass = Math.max(0, mass - 0.005);
  var maxMass = mass + 0.005;

  // 4. Totals
var minTotal = Math.pow(minMass, 2) * basePrice * mult;
var maxTotal = Math.pow(maxMass, 2) * basePrice * mult;
  let formattedParts = [];

  // 5. Build the pieces of the result
  var parts = [];

  // Variant badge
const variantButton = document.querySelector('.variant-buttons button.active');
if (variantButton && variantButton.textContent !== 'Normal') {
  const variant = variantButton.textContent.trim();
  const variantClass = variant === 'Golden' ? 'golden-text' : 'rainbow-text';
  formattedParts.push(`<span class="${variantClass}">${variant.toLowerCase()}</span>`);
}

// Fixed mutations list
var muts = Array.from(document.querySelectorAll('.mutation-chip.active')) // ✅ Proper parenthesis
  .map(function(chip) {
    return chip.textContent.toLowerCase();
  });

if (muts.length) {
  parts.push('<span class="mutation-text">' + muts.join(', ') + '</span>');
}
  // Price range
 // Replace the price parts section with:
parts.push(
  `<span class="price-range">₵${minTotal.toFixed(2)}</span> - ` +
  `<span class="price-range">₵${maxTotal.toFixed(2)}</span>`
);

      const activeMutationChips = Array.from(document.querySelectorAll('.mutation-chip.active'));
  if (activeMutationChips.length > 0) {
    const coloredMutationSpans = activeMutationChips.map(chip => {
      const mutationName = chip.textContent; 
      let mutClass = '';
      if (mutationName === 'Shocked') mutClass = 'shocked-text';
      else if (mutationName === 'Frozen') mutClass = 'frozen-text';
      else if (mutationName === 'Wet') mutClass = 'wet-text';
      else if (mutationName === 'Chilled') mutClass = 'chilled-text';
      else if (mutationName === 'Chocolate') mutClass = 'chocolate-text';
      else if (mutationName === 'Moonlit') mutClass = 'moonlit-text';
      else if (mutationName === 'Bloodlit') mutClass = 'bloodlit-text';
      else if (mutationName === 'Zombified') mutClass = 'zombified-text';
      else if (mutationName === 'Celestial') mutClass = 'celestial-text';
      else if (mutationName === 'Disco') mutClass = 'disco-text';
      else if (mutationName === 'Twisted')    mutClass = 'twisted-text';
      else if (mutationName === 'Pollinated') mutClass = 'pollinated-text';
      else if (mutationName === 'HoneyGlazed') mutClass = 'honeyglazed-text';
      else if (mutationName === 'Void Touched') mutClass = 'voidtouched-text';
      else if (mutationName === 'Plasma')     mutClass = 'plasma-text';
      // FIX #2: Corrected return statement
      return `<span class="${mutClass}">${mutationName.toLowerCase()}</span>`;
    });
   formattedParts = formattedParts.concat(coloredMutationSpans);
}
        
        let color = '';
        switch (plant) {
          case 'Carrot': color = '#FFA500'; break;
          case 'Strawberry': color = '#FF4C4C'; break;
          case 'Blueberry': color = '#4C4CFF'; break;
          case 'Tomato': color = '#FF6347'; break;
          case 'Orange Tulip': color = '#FFB347'; break;
          case 'Corn': color = '#FFF200'; break;
          case 'Daffodil': color = '#FFFF66'; break;
          case 'Watermelon': color = '#FF6B6B'; break;
          case 'Pumpkin': color = '#FF7518'; break;
          case 'Apple': color = '#FF1A1A'; break;
          case 'Bamboo': color = '#7CFC00'; break;
          case 'Coconut': color = '#A0522D'; break;
          case 'Cactus': color = '#228B22'; break;
          case 'Dragon Fruit': color = '#FF69B4'; break;
          case 'Mango': color = '#FFD166'; break;
          case 'Grape': color = '#800080'; break;
          case 'Mushroom': color = '#D2B48C'; break;
          case 'Pepper': color = '#FF0000'; break;
          case 'Cacao': color = '#5C3317'; break;
          case 'Pineapple': color = '#FFE135'; break;
          case 'Raspberry': color = '#E30B5D'; break;
          case 'Starfruit': color = '#FFF700'; break;
          case 'Easter Egg': color = '#FFB6C1'; break;
          case 'Candy Blossom': color = '#FF69B4'; break;
          case 'Eggplant': color = '#800080'; break;
          case 'Moonflower': color = '#9370DB'; break;
          case 'Moonglow': color = '#ADD8E6'; break;
          case 'Glowshroom': color = '#00CED1'; break;
          case 'Mint': color = '#98FF98'; break;
          case 'Beanstalk': color = '#2E8B57'; break;
          case 'Blood Banana': color = '#8B0000'; break;
          case 'Moon Melon': color = '#7FFFD4'; break;
          case 'Lemon': color = '#FFF44F'; break;
          case 'Peach': color = '#FFE5B4'; break;
          case 'Pear': color = '#D1E231'; break;
          case 'Papaya': color = '#FFDAB9'; break;
          case 'Banana': color = '#FFE135'; break;
          case 'Passionfruit': color = '#800080'; break;
          case 'Soul Fruit': color = '#FF00FF'; break;
          case 'Cursed Fruit': color = '#4B0082'; break;
          case 'Chocolate Carrot': color = '#8B4513'; break;
          case 'Candy Sunflower': color = '#FFD700'; break;
          case 'Red Lollipop': color = '#FF0033'; break;
          case 'Nightshade': color = '#483D8B'; break;
          case 'Moon Blossom': color = '#E6E6FA'; break;
          case 'Cranberry': color = '#A52A2A'; break;
          case 'Durian': color = '#A9A900'; break;
          case 'Venus Flytrap': color = '#90EE90'; break;
          case 'Lotus': color = '#FFE4E1'; break;
          case 'Sunflower': color = '#FFD700'; break;
          case 'Nectarine': color = '#FFB347'; break; 
          case 'Hive Fruit': color = '#DAA520'; break;
          case 'Purple Dahlia': color = '#800080'; break; 
          case 'Pink Lily': color = '#FF69B4'; break; 
          case 'Foxglove': color = '#DA70D6'; break;
          case 'Lilac': color = '#C8A2C8'; break; 
          case 'Rose': color = '#FF007F'; break; 
          case 'Celestiberry': color = '#FAFAD2'; break;
          case 'Moon Mango': color = '#FFEFD5'; break; 
        }
    formattedParts.push(`<span class="plant-name" style="color:${color}">${plant}</span>`);

const formattedName = formattedParts.join(' ');

     // Remove duplicate price declaration
const priceRange = `${minTotal.toFixed(2)}-${maxTotal.toFixed(2)}`;
     
  
const entry = {
  timestamp: new Date().toISOString(),
  plant: plant,
  mass: mass,
  multiplier: mult,
  minTotal: minTotal,
  maxTotal: maxTotal,
  html: `${formattedName} (${mass.toFixed(3)}kg × ${mult.toFixed(2)}) → ` +
        `₵${minTotal.toFixed(2)}-₵${maxTotal.toFixed(2)}`
};
    

    // … your existing calls to updateFavoritesDisplay(), updateMultiplier(), etc. …
    updateFavoritesDisplay();
    updateCategoryStars();    // ← ensure this runs on page load
    sidebar.classList.toggle('collapsed', sidebarCollapsed);

// Format the numbers first
const formattedMin = formatNumber(minTotal);
const formattedMax = formatNumber(maxTotal);

// Updatedisplays:
document.getElementById('calc-output').innerHTML = `
  <div class="calculation-result">
    <img src="${cropImageMap[plant]}" 
         class="plant-image" 
         style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;"
         alt="${plant}"
         onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=❌';">
    <div class="text-content">
      <div class="calculation-header">
        ${formattedName}
      </div>
      <div class="calculation-numbers">
        <span>${formattedMin}</span>
        <span class="value-separator">-</span>
        <span>${formattedMax}</span>
      </div>
    </div>
  </div>
`;

document.getElementById('result').innerHTML = `
  <div class="calculation-result">
    <img src="${cropImageMap[plant]}" 
         class="plant-image growing" 
         alt="${plant}"
         style="width: 40px; height: 40px; border-radius: 4px;">
    <div class="calculation-header">
      ${formattedName}
    </div>
    <div class="calculation-numbers">
      <span>${formattedMin}</span>
      <span class="value-separator">-</span>
      <span>${formattedMax}</span>
    </div>
  </div>
`;

// Keep visibility control
document.getElementById('result').style.display = 'block';
        
        calculationHistory.unshift(entry);
        if (calculationHistory.length > 5) calculationHistory.pop();
        localStorage.setItem('gardenCalculations', JSON.stringify(calculationHistory));
        
        updateHistoryDisplay();
      };

window.hideReverseLookup = function() {
  document.getElementById('reversePanel').classList.remove('active');
};

// Build an object of baseValues from your cropInfo (if available)
const baseValues = {};
Object.keys(cropInfo).forEach(crop => {
  const match = (cropInfo[crop] || "").match(/for\s([\d,]+)₵/);
  if (match) {
    baseValues[crop] = parseInt(match[1].replace(/,/g, ''), 10);
  }
});

window.findCombos = function() {
  // 1) Grab user inputs
  const targetValue = parseFloat(document.getElementById('targetPrice').value);
  if (isNaN(targetValue) || targetValue <= 0) {
    return alert('Please enter a positive target price.');
  }

  const cropSelectVal = document.getElementById('reverseCropSelect').value;
  if (!cropSelectVal) {
    return alert('You must select a crop.');
  }

  const variantFilter = document.getElementById('reverseVariantSelect').value;
  const maxMutsVal    = document.getElementById('maxMutsSelect').value;

  // 2) Decide max allowed mutations
  let maxAllowed;
  if (maxMutsVal === 'any') {
    maxAllowed = Infinity;
  } else {
    maxAllowed = parseInt(maxMutsVal, 10);
  }

  // 3) Configuration: prefer weights around 1 kg, cap each crop’s appearances
  const IDEAL_WEIGHT = 1.00;
  const MAX_PER_CROP = 5;
  const validResults = [];

  // 4) Build array of all mutation objects { name, value }
  const allMuts = mutations.map(m => ({ name: m.name, value: m.value }));

  // 5) Precompute the power set (all subsets) of allMuts
  function getAllSubsets(arr) {
    const subsets = [[]];
    for (let i = 0; i < arr.length; i++) {
      const len = subsets.length;
      for (let j = 0; j < len; j++) {
        subsets.push(subsets[j].concat(arr[i]));
      }
    }
    return subsets;
  }
  const allSubsets = getAllSubsets(allMuts);

  // 6) Define variants array
  const variants = [
    { name: "Normal",  mult: 1  },
    { name: "Golden",  mult: 20 },
    { name: "Rainbow", mult: 50 }
  ];

  // 7) Forbid more than one of {Frozen, Chilled, Wet}
  function tooManyFWC(subset) {
    let count = 0;
    for (const m of subset) {
      if (m.name === 'Frozen' || m.name === 'Chilled' || m.name === 'Wet') {
        count++;
        if (count > 1) return true;
      }
    }
    return false;
  }

  // 8) We only need to loop over the single selected crop
  const crop = cropSelectVal;
  const base = basePrices[crop] || 0;
  if (base <= 0) {
    return alert('Selected crop has no base price.');
  }

  for (const variant of variants) {
    if (variantFilter !== 'any' && variant.name !== variantFilter) continue;

    for (const subset of allSubsets) {
      // 8a) Enforce “maxAllowed mutations”
      if (subset.length > maxAllowed) continue;

      // 8b) Enforce “at most one of FWC”
      if (tooManyFWC(subset)) continue;

      // 8c) Compute envSum & total multiplier
      const envSum    = subset.reduce((sum, m) => sum + m.value, 0);
      const totalMult = variant.mult * (1 + envSum);

      // 8d) Compute real‐valued weight needed
      //     targetValue = base × totalMult × weightReal²
      const weightReal = Math.sqrt(targetValue / (base * totalMult));
      if (isNaN(weightReal) || weightReal < 0.01 || weightReal > 9999) continue;

      // 8e) Round to two decimals
      const weightRound = Math.round(weightReal * 100) / 100;

      // 8f) Recompute ±0.005 kg bounds from weightRound
      const minMass  = Math.max(0, weightRound - 0.005);
      const maxMass  = weightRound + 0.005;
      const minTotal = Math.pow(minMass, 2) * base * totalMult;
      const maxTotal = Math.pow(maxMass, 2) * base * totalMult;

      // 8g) Check if targetValue is attainable when rounding
      if (targetValue + 1e-9 < minTotal || targetValue - 1e-9 > maxTotal) {
        continue;
      }

      // 8h) Build description string
      const variantDesc = variant.name;
      const mutDesc     = subset.length === 0
        ? "No mutations"
        : subset.map(m => m.name).join(" + ");
      const desc = `${crop} (${variantDesc}${mutDesc==="No mutations" ? "" : ", " + mutDesc})`;

      // 8i) Compute how close to 1 kg
      const weightDiff = Math.abs(weightRound - IDEAL_WEIGHT);

      validResults.push({ crop, desc, weightRound, weightDiff });
    }
  }

  // 9) Sort by ascending distance from IDEAL_WEIGHT
  validResults.sort((a, b) => a.weightDiff - b.weightDiff);

  // 10) Pick up to 10 results, never more than MAX_PER_CROP for this single crop
  const finalList = [];
  let countThisCrop = 0; // only one crop, so we track a single counter

  for (const item of validResults) {
    if (finalList.length >= 10) break;
    if (countThisCrop < MAX_PER_CROP) {
      finalList.push(item);
      countThisCrop++;
    }
  }

  // 11) Render the results
  const listHTML = finalList.length
    ? finalList.map(item => `<li>${item.desc} – ${item.weightRound.toFixed(2)} kg</li>`).join('')
    : "<li>No combination found</li>";

  document.getElementById('reverseResults').innerHTML = `<ul>${listHTML}</ul>`;
};

const quizQuestions = [
  {
    q: "Which mutation triples base value?",
    options: ["Pollinated", "Frozen", "Golden"],
    answer: 0
  },
  {
    q: "Golden variant multiplies a crop's value by:",
    options: ["20×", "50×", "100×"],
    answer: 0
  },
  {
    q: "What is the rarity (spawn chance) of a Rainbow crop?",
    options: ["1%", "0.1%", "5%"],
    answer: 1
  },
  {
    q: "Which mutation is obtained during a Thunderstorm event?",
    options: ["Frozen", "Shocked", "Zombified"],
    answer: 1
  },
  {
    q: "How much bonus does the Shocked mutation give?",
    options: ["+50", "+99", "+134"],
    answer: 1
  }
];

let quizIndex = 0;
let quizQuestionsSelected = [];
let score = 0;

window.showTrivia = function() {
  hidePanel();
  hideCropReference();
  document.getElementById('triviaPanel').classList.add('active');

  // Pick 3 random questions
  quizQuestionsSelected = quizQuestions
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  quizIndex = 0;
  score = 0;
  showQuizQuestion();
};

window.hideTrivia = function() {
  document.getElementById('triviaPanel').classList.remove('active');
};

function showQuizQuestion() {
  const currentQ = quizQuestionsSelected[quizIndex];
  document.getElementById('quizQuestion').textContent = currentQ.q;
  document.getElementById('quizFeedback').textContent = "";
  document.getElementById('nextQuestionBtn').style.display = 'none';

  const optionsDiv = document.getElementById('quizOptions');
  optionsDiv.innerHTML = "";
  currentQ.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'quiz-option-btn';
    btn.onclick = () => submitAnswer(i);
    optionsDiv.appendChild(btn);
  });
}

window.submitAnswer = function(optionIndex) {
  const currentQ = quizQuestionsSelected[quizIndex];
  const feedback = document.getElementById('quizFeedback');
  if (optionIndex === currentQ.answer) {
    score++;
    feedback.textContent = "Correct!";
  } else {
    const correctOpt = currentQ.options[currentQ.answer];
    feedback.textContent = `Incorrect. The correct answer is: ${correctOpt}.`;
  }
  document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.disabled = true);

  const nextBtn = document.getElementById('nextQuestionBtn');
  if (quizIndex < quizQuestionsSelected.length - 1) {
    nextBtn.textContent = "Next";
    nextBtn.style.display = 'inline-block';
  } else {
    nextBtn.textContent = "See Score";
    nextBtn.style.display = 'inline-block';
  }
};

window.nextQuestion = function() {
  const nextBtn = document.getElementById('nextQuestionBtn');
  if (quizIndex < quizQuestionsSelected.length - 1) {
    quizIndex++;
    showQuizQuestion();
  } else {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `<p>You scored ${score} out of ${quizQuestionsSelected.length}!</p>`;
  }
  nextBtn.style.display = 'none';
};
     window.validateMass = function() {
  const massInput = document.getElementById('mass');
  const errorDisplay = document.getElementById('massError');
  const rawValue = massInput.value.trim();
  
  const parsed = parseFloat(rawValue);

  if (rawValue === '' || isNaN(parsed)) {
    errorDisplay.textContent = "Please enter a valid number (0.01–9999).";
    errorDisplay.style.display = 'block';
    return false;
  }

  if (parsed < 0.01) {
    errorDisplay.textContent = "Mass cannot be less than 0.01 kg.";
    errorDisplay.style.display = 'block';
    return false;
  }

  if (parsed > 9999) {
    errorDisplay.textContent = "Mass cannot exceed 9999 kg.";
    errorDisplay.style.display = 'block';
    return false;
  }

  errorDisplay.style.display = 'none';
  return true;
};
// Call this any time `favorites` changes
function updateCategoryStars() {
  document.querySelectorAll('.category-section button').forEach(btn => {
    const crop = btn.getAttribute('data-crop');
    const star = btn.querySelector('.star-icon');
    if (!star) return;
    
    if (favorites.includes(crop)) {
      star.classList.add('active');
      star.textContent = '★';
    } else {
      star.classList.remove('active');
      star.textContent = '☆';
    }
  });
}
      window.clearHistory = function() {
        localStorage.removeItem('gardenCalculations');
        calculationHistory = [];
        updateHistoryDisplay();
      };

      window.toggleHistoryView = function() {
        document.getElementById('history-list').classList.toggle('compact-view');
      };

      updateMultiplier();
      updateHistoryDisplay();
      sidebar.classList.toggle('collapsed', sidebarCollapsed);
      updateFavoritesDisplay();
      
      function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
  
  // Close plant panel if open
  const plantPanel = document.getElementById('panel');
  if (plantPanel.classList.contains('active')) {
    plantPanel.classList.remove('active');
  }
}
  // ─── Pinch‐to‐Zoom & Swipe to Toggle Sidebar ─────────────────────────────
  let touchStartX = null;
  let touchStartY = null;
  document.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    } else {
      touchStartX = null;
      touchStartY = null;
    }
  });

  document.addEventListener('touchend', e => {
    if (touchStartX !== null && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          document.getElementById('sidebar').classList.remove('collapsed');
        } else {
          document.getElementById('sidebar').classList.add('collapsed');
        }
      }
    }
  });

  // Pinch to zoom in #result
  const resultDiv = document.getElementById('result');
  let pinchStartDist = 0;
  let baseScale = 1;
  let currentScale = 1;

  resultDiv.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      pinchStartDist = Math.hypot(dx, dy);
      baseScale = currentScale;
    }
  });

  resultDiv.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchStartDist) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const dist = Math.hypot(dx, dy);
      let newScale = baseScale * (dist / pinchStartDist);
      if (newScale < 1) newScale = 1;
      if (newScale > 3) newScale = 3;
      resultDiv.style.transform = `scale(${newScale})`;
      currentScale = newScale;
    }
  });

  resultDiv.addEventListener('touchend', e => {
    if (e.touches.length < 2) {
      pinchStartDist = 0;
    }
  });
    });
