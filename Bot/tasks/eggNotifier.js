const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Channel = require('../models/Channel'); // Assuming this is your Mongoose model
const { fetchStockData } = require('../utils/api'); // Assuming this fetches global stock data
const { categoryEmojis, EggEmoji } = require('../utils/helpers'); // Make sure EggEmoji is imported
const { acquireLock } = require('../utils/mongo'); // Your config file with bridge info

const LOCK_NAME = 'egg_stock_notification';
const LOCK_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes lock to cover the job duration

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client) => {
    // Add a small initial delay to help with potential startup race conditions across shards
    const initialDelayMs = 1 * 60 * 1000; // 1 minute delay
    await sleep(initialDelayMs);

    // Log which shard is running this notifier
    const shardId = client.shard ? client.shard.ids[0] : 0;
    
    // Try to acquire the lock to run the job
    const gotLock = await acquireLock(LOCK_NAME, LOCK_TIMEOUT_MS);

    if (!gotLock) {
      console.log(`[✉️] Shard ${shardId}: Did not acquire lock. Another shard is running the egg notifier.`);
      return; // Exit so no duplicate sending
    }

    console.log(`[✉️] Shard ${shardId}: Acquired lock, running egg notifier...`);
    
    console.log(`[🥚] Egg stock notifier running on Shard ${shardId}...`);

    try {
        const fetchedData = await fetchStockData();
        // Access data through the "Data" key
        if (!fetchedData || !fetchedData.Data) {
            console.log(`[🥚] No valid data fetched or 'Data' key missing on Shard ${shardId}.`);
            return;
        }

        const data = fetchedData.Data; // Get the actual data object
        const eggItems = data.egg; // Access the 'egg' array directly
        const now = new Date();

        if (!eggItems || eggItems.length === 0) {
            console.log(`[🥚] No 'egg' items found in fetched data on Shard ${shardId}.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setDescription(`## ${categoryEmojis['eggStock'] || ''} Eggs Stock`) // Keep the emoji key as it was
            .setColor(0xFFD700)
            .setTimestamp();

        for (const item of eggItems) { // Iterate directly over eggItems
            const emoji = item.emoji || EggEmoji[item.name] || '';
            embed.addFields({ name: `${emoji} x${item.stock} ${item.name}`, value: '', inline: false });
        }

        // --- Button Logic for a Single Random Button ---
        let componentsToSend = []; // Renamed for consistency with stock notifier
        // Corrected chance: Math.floor(Math.random() * X) === 0 for 1 in X chance.
        // If you want 100% chance, keep Math.floor(Math.random() * 1) === 0.
        // If you want 1 in 10 chance, use Math.floor(Math.random() * 10) === 0;
        const shouldAddButton = Math.floor(Math.random() * 10) === 0; // Changed to 1 in 10 chance for consistency

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

            // Randomly select one button from the array
            const randomIndex = Math.floor(Math.random() * buttons.length);
            const randomButton = buttons[randomIndex];

            const row = new ActionRowBuilder().addComponents(randomButton);
            componentsToSend.push(row);
        }
        // --- End Button Logic ---

        // Step 1: Get all guild IDs managed by the current shard.
        const guildIdsOnThisShard = client.guilds.cache.map(guild => guild.id);

        if (guildIdsOnThisShard.length === 0) {
            console.log(`[🥚] Shard ${shardId} has no guilds to notify for egg stock updates.`);
            return; // No guilds on this shard, so nothing to do
        }

        // Step 2: Query the database for 'egg' type channels belonging only to these guilds.
        // Ensure alertRoles are fetched
        const eggChannels = await Channel.find({
            type: 'egg',
            serverId: { $in: guildIdsOnThisShard } // Filter channels by serverId belonging to this shard
        });

        console.log(`[🥚] Shard ${shardId} found ${eggChannels.length} egg stock channels for its guilds...`);

        const totalChannels = eggChannels.length;
        const maxGroups = 24; // You might adjust this based on your bot's scale
        const pauseBetweenGroupsMs = 5 * 1000; // 5 seconds

        const groupSize = Math.ceil(totalChannels / maxGroups);

        let channelsSent = 0;
        let successfulSends = 0;
        let failedSends = 0;

        for (let i = 0; i < totalChannels; i += groupSize) {
            const group = eggChannels.slice(i, i + groupSize);
            console.log(`[🥚] Shard ${shardId} processing egg stock group ${Math.floor(i / groupSize) + 1} with ${group.length} channels.`);

            const groupPromises = [];
            for (const channelDoc of group) { // Iterate over the full channel document
                const { serverId, channelId, lastSentAt, alertRoles } = channelDoc; // Destructure alertRoles
                
                // Skip if recently sent (within 5 seconds)
                if (lastSentAt && now - new Date(lastSentAt) < 5 * 1000) {
                    console.log(`[❌] Shard ${shardId} skipping egg stock channel ${channelId} due to recent send.`);
                    failedSends++;
                    continue;
                }

                groupPromises.push(
                    (async () => {
                        try {
                            // Ensure the channel is still cached by this shard
                            const ch = client.channels.cache.get(channelId);
                            if (ch) {
                                let pingContent = '';
                                const rolesToPingSet = new Set(); // Use a Set to store unique role IDs

                                // Collect all relevant roles to ping for this channel
                                if (alertRoles) {
                                    for (const item of eggItems) { // Iterate over the fetched egg items
                                        const roleId = alertRoles.get(item.name); // Get role for this specific egg
                                        if (roleId) {
                                            rolesToPingSet.add(`<@&${roleId}>`);
                                        }
                                    }
                                }

                                if (rolesToPingSet.size > 0) {
                                    pingContent = Array.from(rolesToPingSet).join(' '); // Join roles with a space
                                }

                                // Send the ping content with the embed and components
                                await ch.send({ content: pingContent, embeds: [embed], components: componentsToSend });
                                
                                // Update lastSentAt in the database
                                await Channel.updateOne({ serverId, channelId, type: 'egg' }, { lastSentAt: now });
                                console.log(`[✅] Shard ${shardId} sent egg stock notification to channel ${channelId}.`);
                                return true;
                            } else {
                                console.log(`[❌] Shard ${shardId} could not find channel ${channelId} (might have left guild or not in cache).`);
                                return false; // Channel not found or not on this shard's cache
                            }
                        } catch (err) {
                            console.error(`[❌] Shard ${shardId} failed to notify egg stock ${channelId}:`, err.message);
                            return false;
                        }
                    })()
                );
            }

            const groupResults = await Promise.allSettled(groupPromises);
            groupResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value === true) {
                    successfulSends++;
                } else {
                    failedSends++;
                }
            });

            channelsSent += group.length;

            // Pause after each group, unless it's the last group
            if (i + groupSize < totalChannels) {
                console.log(`[⏳] Shard ${shardId} pausing for ${pauseBetweenGroupsMs / 1000} seconds before next egg stock group...`);
                await sleep(pauseBetweenGroupsMs);
            }
        }

        console.log(`[🥚] Egg stock notifier done on Shard ${shardId}. ${successfulSends} success, ${failedSends} skipped/failed.`);

    } catch (err) {
        console.error(`[❌] Egg stock fetch error on Shard ${shardId}:`, err.message);
    }
};