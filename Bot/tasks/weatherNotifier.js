const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Channel = require('../models/Channel');
const Lock = require('../models/Lock');
const { fetchWeatherData } = require('../utils/api');

async function acquireLock(lockName, lockTimeoutMs) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + lockTimeoutMs);

    const updateResult = await Lock.findOneAndUpdate(
        {
            name: lockName,
            $or: [
                { expiresAt: { $lt: now } },
                { expiresAt: null }
            ]
        },
        {
            $set: {
                lockedAt: now,
                expiresAt
            }
        },
        {
            new: true
        }
    );

    if (updateResult) return true;

    try {
        await Lock.create({ name: lockName, lockedAt: now, expiresAt });
        return true;
    } catch (err) {
        if (err.code === 11000) return false;
        throw err;
    }
}

const LOCK_NAME = 'weather_stock_notification';
const LOCK_TIMEOUT_MS = 2 * 60 * 1000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client) => {
    const shardId = client.shard ? client.shard.ids[0] : 0;
    const shardCount = client.shard ? client.shard.count : 1;

    const gotLock = await acquireLock(LOCK_NAME, LOCK_TIMEOUT_MS);
    if (!gotLock) {
        console.log(`[✉️] Shard ${shardId}: Lock not acquired.`);
        return;
    }

    console.log(`[🔄] Shard ${shardId}/${shardCount}: Running weather notifier...`);

    try {
        const apiResponse = await fetchWeatherData();
        if (!apiResponse || !Array.isArray(apiResponse.events)) {
            console.log(`[🌦️] Shard ${shardId}: No valid weather data.`);
            return;
        }

        const weatherData = apiResponse.events;
        const now = new Date();
        const activeWeatherList = weatherData.filter(w => w.isActive);

        if (activeWeatherList.length === 0) {
            console.log(`[🌤️] Shard ${shardId}: No active weather.`);
            return;
        }

        const weatherEmbed = new EmbedBuilder()
            .setDescription('# 🌦️ Current Weather Status')
            .setColor(0x1E90FF)
            .setTimestamp();

        for (const weather of activeWeatherList) {
            const emoji = weather.emoji || '❓';
            const name = weather.displayName || 'Unknown';
            weatherEmbed.addFields({
                name: `${emoji} ${name}`,
                value: 'Status: Active',
                inline: true
            });
        }

        let componentsToSend = [];
        
        const shouldAddButton = Math.floor(Math.random() * 1) === 0;

        if (shouldAddButton) {
            const buttons = [
                new ButtonBuilder()
                    .setLabel('Vote on Top.gg')
                    .setURL('https://top.gg/bot/1378774993147793480')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Join Support Server')
                    .setURL('https://discord.gg/3cFNsH34U9')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Invite the Bot')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1378774993147793480&permissions=0&integration_type=0&scope=bot+applications.commands&redirect_uri=https%3A%2F%2Fagarden-bot.pages.dev%2Fthank&response_type=code')
                    .setStyle(ButtonStyle.Link)
            ];
           }

        const guildIdsOnThisShard = client.guilds.cache.map(g => g.id);
        if (guildIdsOnThisShard.length === 0) {
            console.log(`[🌦️] Shard ${shardId}: No guilds found.`);
            return;
        }

        const weatherChannels = await Channel.find({
            type: 'weather',
            serverId: { $in: guildIdsOnThisShard }
        });

        const totalChannels = weatherChannels.length;
        const maxGroups = 24;
        const pauseBetweenGroupsMs = 5000;
        const groupSize = Math.ceil(totalChannels / maxGroups);

        let successful = 0, failed = 0;

        for (let i = 0; i < totalChannels; i += groupSize) {
            const group = weatherChannels.slice(i, i + groupSize);

            const promises = group.map(async ({ serverId, channelId, lastSentAt }) => {
                if (lastSentAt && now - new Date(lastSentAt) < 5000) return false;
                try {
                    const ch = client.channels.cache.get(channelId);
                    if (!ch) return false;
                    await ch.send({ embeds: [weatherEmbed], components: componentsToSend });
                    await Channel.updateOne({ serverId, channelId, type: 'weather' }, { lastSentAt: now });
                    return true;
                } catch {
                    return false;
                }
            });

            const results = await Promise.allSettled(promises);
            results.forEach(r => (r.status === 'fulfilled' && r.value ? successful++ : failed++));

            if (i + groupSize < totalChannels) await sleep(pauseBetweenGroupsMs);
        }

        console.log(`[🌦️] Shard ${shardId}: Done. ${successful} success, ${failed} failed.`);

    } catch (err) {
        console.error(`[❌] Shard ${shardId} error:`, err);
    }
};
