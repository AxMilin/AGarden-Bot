const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

// ====== MongoDB setup ======
const { Schema, model } = require('mongoose');
const channelSchema = new Schema({
  serverId: String,
  channelId: String,
  type: String, // 'stock' or 'weather'
  lastSentAt: Date, // <--- NEW
});
const Channel = model('Channel', channelSchema);

// ====== Discord Client ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

// ====== Slash Commands ======
const commands = [
  new SlashCommandBuilder().setName('setup_stocks').setDescription('Setup stock notifier in this channel or DM'),
  new SlashCommandBuilder().setName('setup_weather').setDescription('Setup weather notifier in this channel or DM'),
  new SlashCommandBuilder().setName('get_stock').setDescription('Get current stock once'),
  new SlashCommandBuilder().setName('get_weather').setDescription('Get current weather once'),
  new SlashCommandBuilder().setName('get_restock').setDescription('Get restock times once'),
].map(cmd => cmd.toJSON());

// ====== Discord API setup ======
const rest = new REST({ version: '10' }).setToken('TOKENS');
const clientId = 'CLIENT ID';

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// ====== MongoDB connect ======
mongoose.connect('MONGO DB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('🟢 MongoDB connected'))
  .catch(err => console.error('🔴 MongoDB error', err));

// ====== Helpers ======
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const categoryEmojis = {
  seedsStock: '🌱',
  gearStock: '⚙️',
  eggStock: '🥚',
  BeeStock: '🐝',
};
const weatherEmojis = {
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
  meteorshower: '☄️',
  frost: '🧊',
  bloodnight: '🌙',
};

// ====== Stock Cache ======
let previous = {
  seedsStock: [],
  gearStock: [],
  eggStock: [],
  BeeStock: [],
};

const compareStock = (oldStock, newStock) => {
  return newStock.filter(item => {
    const oldItem = oldStock.find(i => i.name === item.name);
    return !oldItem || oldItem.value !== item.value;
  });
};

// ====== Command handler ======
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  let serverId, channelId;

  if (interaction.guild) {
    serverId = interaction.guild.id;
    channelId = interaction.channelId;
  } else {
    serverId = `dm-${interaction.user.id}`;
    channelId = interaction.user.id;
  }

  if (commandName === 'setup_stocks' || commandName === 'setup_weather') {
    const type = commandName === 'setup_stocks' ? 'stock' : 'weather';
    await Channel.findOneAndUpdate(
      { serverId, type },
      { channelId, type },
      { upsert: true, new: true }
    );
    await interaction.reply({ content: `✅ Setup complete! You’ll now receive ${type} notifications here.`, ephemeral: true });
    return;
  }

  if (commandName === 'get_stock') {
    const res = await fetch('https://growagardenapi.vercel.app/api/stock/GetStock');
    const data = await res.json();
    if (!data.success) return interaction.reply('Failed to fetch stock data.');

    const embeds = [];
    for (const category of ['seedsStock', 'gearStock', 'eggStock', 'BeeStock']) {
      const items = data[category];
      if (!items?.length) continue;

      const embed = new EmbedBuilder()
        .setTitle(`${categoryEmojis[category] || ''} ${capitalize(category.replace('Stock', ''))} Restock`)
        .setColor(0x00AE86)
        .setTimestamp();

      for (const item of items) {
        embed.addFields({ name: item.name, value: `Stock: ${item.value}`, inline: true });
      }

      embeds.push(embed);
    }

    if (embeds.length) interaction.reply({ embeds });
    else interaction.reply('No stock updates currently.');
    return;
  }

  if (commandName === 'get_weather') {
    const res = await fetch('https://growagardenapi.vercel.app/api/GetWeather');
    const weather = await res.json();
    if (!weather.success) return interaction.reply('Failed to fetch weather data.');

    const embed = new EmbedBuilder()
      .setTitle('🌦️ Weather Status')
      .setColor(0x1E90FF)
      .setTimestamp();

    for (const [event, info] of Object.entries(weather)) {
      if (event === 'success') continue;
      embed.addFields({
        name: `${weatherEmojis[event] || ''} ${capitalize(event)}`,
        value: `Active: ${info.active}\nLast Seen: <t:${Math.floor(new Date(info.LastSeen).getTime() / 1000)}:R>`,
        inline: true,
      });
    }

    interaction.reply({ embeds: [embed] });
    return;
  }

  if (commandName === 'get_restock') {
    const res = await fetch('https://growagardenapi.vercel.app/api/stock/Restock-Time');
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setTitle('⏰ Restock Times')
      .setColor(0xFFA500)
      .setTimestamp();

    for (const [key, info] of Object.entries(data)) {
      embed.addFields({
        name: capitalize(key),
        value: `Countdown: ${info.countdown}\nLast Restock: ${info.LastRestock}\nTime Since Last Restock: ${info.timeSinceLastRestock}`,
        inline: true,
      });
    }

    interaction.reply({ embeds: [embed] });
    return;
  }
});

// ====== Stock Notifier ======
const fetchAndNotifyStocks = async () => {
  console.log('[📈] Stocks notifier running...');
  try {
    const res = await fetch('https://growagardenapi.vercel.app/api/stock/GetStock');
    const data = await res.json();
    if (!data.success) return;

    const updates = [];
    for (const category of ['seedsStock', 'gearStock', 'eggStock', 'BeeStock']) {
      const embed = new EmbedBuilder()
        .setTitle(`${categoryEmojis[category] || ''} ${capitalize(category.replace('Stock', ''))} Stock`)
        .setColor(0x00AE86)
        .setTimestamp();

      for (const item of data[category]) {
        embed.addFields({ name: item.name, value: `Stock: ${item.value}`, inline: true });
      }

      updates.push(embed);
      previous[category] = data[category]; // still update cache
    }

    const stockChannels = await Channel.find({ type: 'stock' });

    console.log(`[📈] Notifying ${stockChannels.length} stock channels...`);

    const now = new Date();
    let success = 0;

    for (const { serverId, channelId, lastSentAt } of stockChannels) {
      // Skip if last sent less than 5 minutes ago
      if (lastSentAt && now - new Date(lastSentAt) < 5 * 60 * 1000) continue;

      try {
        let ch;
        if (serverId.startsWith('dm-')) {
          const user = await client.users.fetch(channelId);
          ch = user.dmChannel || await user.createDM();
        } else {
          ch = await client.channels.fetch(channelId);
        }
        if (ch) {
          for (const embed of updates) await ch.send({ embeds: [embed] });
          success++;

          // Update lastSentAt after successful send
          await Channel.updateOne({ serverId, channelId, type: 'stock' }, { lastSentAt: now });
        }
      } catch (err) {
        console.error(`❌ Failed to notify ${channelId}:`, err.message);
      }
    }

    console.log(`[📈] Stocks notifier done. ${success} success, ${stockChannels.length - success} skipped/failed.`);

  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};

// ====== Weather Notifier ======
const fetchAndNotifyWeather = async () => {
  console.log('[🌦️] Weather notifier running...');
  try {
    const res = await fetch('https://growagardenapi.vercel.app/api/GetWeather');
    const weather = await res.json();
    if (!weather.success) return;

    const embed = new EmbedBuilder()
      .setTitle('🌦️ Weather Status')
      .setColor(0x1E90FF)
      .setTimestamp();

    for (const [event, info] of Object.entries(weather)) {
      if (event === 'success') continue;
      embed.addFields({
        name: `${weatherEmojis[event] || ''} ${capitalize(event)}`,
        value: `Active: ${info.active}\nLast Seen: <t:${Math.floor(new Date(info.LastSeen).getTime() / 1000)}:R>`,
        inline: true,
      });
    }

    const weatherChannels = await Channel.find({ type: 'weather' });

    console.log(`[🌦️] Notifying ${weatherChannels.length} weather channels...`);

    const now = new Date();
    let success = 0;

    for (const { serverId, channelId, lastSentAt } of weatherChannels) {
      if (lastSentAt && now - new Date(lastSentAt) < 10 * 60 * 1000) continue; // 10 min cooldown

      try {
        let ch;
        if (serverId.startsWith('dm-')) {
          const user = await client.users.fetch(channelId);
          ch = user.dmChannel || await user.createDM();
        } else {
          ch = await client.channels.fetch(channelId);
        }

        if (ch) {
          await ch.send({ embeds: [embed] });
          success++;

          // Update lastSentAt after successful send
          await Channel.updateOne({ serverId, channelId, type: 'weather' }, { lastSentAt: now });
        }
      } catch (err) {
        console.error(`❌ Failed to notify weather to ${channelId}:`, err.message);
      }
    }

    console.log(`[🌦️] Weather notifier done. ${success} success, ${weatherChannels.length - success} skipped/failed.`);

  } catch (err) {
    console.error('Weather fetch error:', err.message);
  }
};

// ====== Channel Clean ======
const cleanInvalidChannels = async () => {
  const allChannels = await Channel.find();

  for (const { serverId, channelId } of allChannels) {
    try {
      if (serverId.startsWith('dm-')) {
        const user = await client.users.fetch(channelId);
        if (!user) throw new Error('User not found');
        await user.createDM(); // attempt to DM to confirm
      } else {
        const ch = await client.channels.fetch(channelId);
        if (!ch) throw new Error('Channel not found');
      }
    } catch (err) {
      console.log(`🧹 Removing invalid channel: ${channelId} (${err.message})`);
      await Channel.deleteOne({ serverId });
    }
  }
};

// ====== Timer Loop ======
const startSyncedInterval = (fn, intervalMs) => {
  const delay = intervalMs - (Date.now() % intervalMs);
  setTimeout(() => {
    setTimeout(fn, 10 * 1000);
    setInterval(() => setTimeout(fn, 10 * 1000), intervalMs);
  }, delay);
};

// ====== Start Intervals ======
startSyncedInterval(cleanInvalidChannels, 60 * 60 * 1000);
startSyncedInterval(fetchAndNotifyStocks, 5 * 60 * 1000);
startSyncedInterval(fetchAndNotifyWeather, 5 * 60 * 1000);

// ====== Bot Login ======
client.once('ready', () => {
  console.clear();
  console.log('==============================');
  console.log('✅ AGarden Bot is now online!');
  console.log(`👤 Logged in as: ${client.user.tag} (ID: ${client.user.id})`);
  console.log('==============================');

  cleanInvalidChannels();
});

client.login('TOKENS');