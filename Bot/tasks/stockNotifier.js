const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Channel = require('../models/Channel'); // Assuming this is your Mongoose model
const { fetchStockData } = require('../utils/api'); // Assuming this fetches global stock data
const { capitalize, categoryEmojis, SeedsEmoji, GearEmoji } = require('../utils/helpers');
const { acquireLock } = require('../utils/mongo'); // Your config file with bridge info

const LOCK_NAME = 'seeds_stock_notification';
const LOCK_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes lock to cover the job duration

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client) => {
    // Log which shard is running this notifier
    const shardId = client.shard ? client.shard.ids[0] : 0;
    
    // Try to acquire the lock to run the job
    const gotLock = await acquireLock(LOCK_NAME, LOCK_TIMEOUT_MS);

    if (!gotLock) {
      console.log(`[✉️] Shard ${shardId}: Did not acquire lock. Another shard is running the notifier.`);
      return; // Exit so no duplicate sending
    }

    console.log(`[✉️] Shard ${shardId}: Acquired lock, running notifier...`);
    
    console.log(`[🔄] Stock notifier running on Shard ${shardId}...`);

    try {
        const fetchedData = await fetchStockData();
        if (!fetchedData || !fetchedData.Data) {
            console.log(`[📈] No valid data fetched or 'Data' key missing on Shard ${shardId}.`);
            return;
        }

        const data = fetchedData.Data; // Get the actual data object
        const categories = [
            { key: 'seeds', emojiKey: 'seedsStock' }, 
            { key: 'gear', emojiKey: 'gearStock' }
        ]; // Changed to map directly to new API structure
        const stockEmbeds = [];
        const now = new Date();

        // Prepare all the embeds first
        for (const category of categories) {
            const items = data[category.key]; // Access directly by 'seeds' or 'gear'
            if (!items || items.length === 0) continue;

            const embed = new EmbedBuilder()
                .setDescription(`# ${categoryEmojis[category.emojiKey] || ''} ${capitalize(category.key)} Stock`) // Use category.key for title
                .setColor(0x00AE86)
                .setTimestamp();

            for (const item of items) { // Iterate over the actual items array
                let emoji = '';
                if (category.key === 'seeds') {
                  emoji =  item.emoji || SeedsEmoji[item.name] || '';
                } else if (category.key === 'gear') {
                  emoji =  item.emoji || GearEmoji[item.name] || '';
                }
                embed.addFields({ name: `${emoji} x${item.stock} ${item.name}`, value: '', inline: false });
 // Use item.stock
            }
            stockEmbeds.push(embed);
        }

        // --- Button Logic for a Single Random Button ---
        let componentsToSend = []; // This will hold the action row if a button is generated
        const shouldAddButton = Math.floor(Math.random() * 1) === 0; // 1 in 10 chance

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

        // Step 2: Get all guild IDs managed by the current shard.
        // client.guilds.cache contains only the guilds this specific shard is responsible for.
        const guildIdsOnThisShard = client.guilds.cache.map(guild => guild.id);

        if (guildIdsOnThisShard.length === 0) {
            console.log(`[📈] Shard ${shardId} has no guilds to notify for stock updates.`);
            return; // No guilds on this shard, so nothing to do
        }

        // Step 3: Query the database for stock channels belonging only to these guilds.
        const stockChannels = await Channel.find({
            type: 'stock',
            serverId: { $in: guildIdsOnThisShard } // Filter channels by serverId belonging to this shard
        });

        console.log(`[📈] Shard ${shardId} found ${stockChannels.length} stock channels for its guilds...`);

        const totalChannels = stockChannels.length;
        const maxGroups = 24; // You might adjust this based on your bot's scale
        const pauseBetweenGroupsMs = 5 * 1000; // 5 seconds

        const groupSize = Math.ceil(totalChannels / maxGroups);

        let channelsSent = 0;
        let successfulSends = 0;
        let failedSends = 0;

        for (let i = 0; i < totalChannels; i += groupSize) {
            const group = stockChannels.slice(i, i + groupSize);
            console.log(`[📈] Shard ${shardId} processing stock group ${Math.floor(i / groupSize) + 1} with ${group.length} channels.`);

            const groupPromises = [];
            for (const { serverId, channelId, lastSentAt } of group) {
                // Skip if recently sent (within 5 seconds) - helps with rate limits even on sharded bots
                if (lastSentAt && now - new Date(lastSentAt) < 5 * 1000) {
                    console.log(`[❌] Shard ${shardId} skipping stock channel ${channelId} due to recent send.`);
                    failedSends++;
                    continue;
                }

                groupPromises.push(
                    (async () => {
                        try {
                            // Ensure the channel is still cached by this shard
                            const ch = client.channels.cache.get(channelId);
                            if (ch) {
                                // Send all embeds. Only the LAST embed will have the button.
                                for (let j = 0; j < stockEmbeds.length; j++) {
                                    const embed = stockEmbeds[j];
                                    if (j === stockEmbeds.length - 1) {
                                        // If it's the last embed, attach the components (if any)
                                        await ch.send({ embeds: [embed], components: componentsToSend });
                                    } else {
                                        // Otherwise, just send the embed
                                        await ch.send({ embeds: [embed] });
                                    }
                                }
                                // Update lastSentAt in the database
                                await Channel.updateOne({ serverId, channelId, type: 'stock' }, { lastSentAt: now });
                                console.log(`[✅] Shard ${shardId} sent stock notification to channel ${channelId}.`);
                                return true;
                            } else {
                                console.log(`[❌] Shard ${shardId} could not find channel ${channelId} (might have left guild or not in cache).`);
                                return false; // Channel not found or not on this shard's cache
                            }
                        } catch (err) {
                            console.error(`[❌] Shard ${shardId} failed to notify stock ${channelId}:`, err.message);
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
                console.log(`[⏳] Shard ${shardId} pausing for ${pauseBetweenGroupsMs / 1000} seconds before next stock group...`);
                await sleep(pauseBetweenGroupsMs);
            }
        }

        console.log(`[📈] Stock notifier done on Shard ${shardId}. ${successfulSends} success, ${failedSends} skipped/failed.`);

    } catch (err) {
        console.error(`[❌] Stock fetch error on Shard ${shardId}:`, err.message);
    }
};