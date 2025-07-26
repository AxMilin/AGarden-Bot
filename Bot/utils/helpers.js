const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Sam
const seeds = [
    'Carrot', 'Strawberry', 'Blueberry', 'Orange Tulip', 'Tomato',
    'Corn', 'Daffodil', 'Watermelon', 'Pumpkin', 'Apple', 'Bamboo',
    'Coconut', 'Cactus', 'Dragon Fruit', 'Mango', 'Grape', 'Mushroom',
    'Pepper', 'Cacao', 'Beanstalk', 'Ember Lily', 'Sugar Apple', 'Burning Bud',
    'Giant Pinecone', 'Elder Strawberry'
];

// Summer
/*
const seeds = [
    'Carrot', 'Strawberry', 'Blueberry', 'Cauliflower', 'Watermelon',
    'Rafflesia', 'Green Apple', 'Avocado', 'Banana', 'Pineapple', 'Kiwi',
    'Bell Pepper', 'Prickly Pear', 'Loquat', 'Feijoa', 'Pitcher Plant', 'Sugar Apple'
];
*/

const gear = [
    'Watering Can', 'Trowel', 'Recall Wrench', 'Basic Sprinkler', 'Advanced Sprinkler',
    'Medium Toy', 'Medium Treat',
    'Godly Sprinkler', 'Magnifying Glass', 'Tanning Mirror', 'Master Sprinkler',
    'Cleaning Spray', 'Favorite Tool', 'Harvest Tool', 'Friendship Pot', 
    'Levelup Lollipop'
];

const eggs = [
  'Common Egg',
  'Uncommon Egg',
  'Rare Egg',
  'Legendary Egg',
  'Mythical Egg',
  'Bug Egg',
  'Common Summer Egg',
  'Rare Summer Egg',
  'Paradise Egg',
  'Bee Egg',
];

const SeedsEmoji = {
  'Carrot': '🥕',
  'Strawberry': '🍓',
  'Blueberry': '🫐',
  'Orange Tulip': '🌷',
  'Tomato': '🍅',
  'Corn': '🌽',
  'Daffodil': '🌼',
  'Watermelon': '🍉',
  'Pumpkin': '🎃',
  'Apple': '🍎',
  'Bamboo': '🎍',
  'Coconut': '🥥',
  'Cactus': '🌵',
  'Dragon Fruit': '🐉',
  'Mango': '🥭',
  'Grape': '🍇',
  'Mushroom': '🍄',
  'Pepper': '🌶️',
  'Cacao': '🍫',
  'Beanstalk': '🌱',
  'Ember Lily': '🔥',
  'Sugar Apple': '🍏',
  'Cauliflower': '🥦',
  'Green Apple': '🍏',
  'Avocado': '🥑',
  'Banana': '🍌',
  'Pineapple': '🍍',
  'Kiwi': '🥝',
  'Bell Pepper': '🫑',
  'Prickly Pear': '🌵',
  'Loquat': '🍊',
  'Feijoa': '🥭',
  'Pitcher Plant': '🪴',
  'Rafflesia': '🌺',  
  'Burning Bud': '🔥',
  'Giant Pinecone': '🌲',
  'Elder Strawberry': '🍓',
};

const GearEmoji = {
  'Watering Can': '🚿',
  'Trowel': '🛠️',
  'Basic Sprinkler': '💦',
  'Advanced Sprinkler': '🌊',
  'Medium Toy': '🪀',
  'Medium Treat': '🦴',
  'Godly Sprinkler': '✨',
  'Lightning Rod': '⚡',
  'Master Sprinkler': '👑',
  'Cleaning Spray': '🧴',
  'Favorite Tool': '💝',
  'Harvest Tool': '🚜',
  'Friendship Pot': '🪴',
  'Recall Wrench': '🔧',
  'Tanning Mirror': '🪞',
  'Magnifying Glass': '🔍',
  'Levelup Lollipop': '🍭',
};

const EggEmoji = {
  'Common Egg': '🥚',          // basic egg
  'Uncommon Egg': '🍳',        // cooked egg
  'Rare Egg': '🐣',            // hatching chick
  'Legendary Egg': '🦄',       // dragon (legendary feel)
  'Mythical Egg': '🔮',        // magic wand (mythical theme)
  'Bug Egg': '🐛',             // bug
  'Common Summer Egg': '🟡',   // sunny summer vibe
  'Rare Summer Egg': '🔵',     // beach/rare summer
  'Paradise Egg': '🌞', // tropical paradise
  'Bee Egg': '🐝',
};

const categoryEmojis = {
    seedsStock: '🌱',
    gearStock: '⚙️',
    eggStock: '🥚',
    cosmeticsStock: '🌟', // Added as per your get_stock command
};

const weatherEmojis = {
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
  meteorshower: '☄️',
  frost: '🧊',
  bloodnight: '🌙',
  beeswarm: '🐝',
  disco: '🪩',
  jandelstorm: '🌪️',
  blackhole: '🕳️',
  djjhai: '🎧',
  nightevent: '🌌',
  sungod: '☀️',
  jandelfloat: '🎈',
  chocolaterain: '🍫',
  bloodmoonevent: '🩸',
  workingbeeswarm: '🐝',
  volcano: '🌋'
};

const waitRandom = () => {
    const ms = (Math.floor(Math.random() * 5) + 1) * 1000; // 1 to 5 seconds in ms
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    capitalize,
    seeds,
    gear,
    eggs,
    categoryEmojis,
    weatherEmojis,
    waitRandom,
    SeedsEmoji,
    GearEmoji,
    EggEmoji
};
