const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchStockData } = require('../utils/api'); // Ensure fetchStockData now returns the API response as shown
const { capitalize, categoryEmojis, SeedsEmoji, GearEmoji, EggEmoji } = require('../utils/helpers'); // Make sure these helpers are available

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_stock')
        .setDescription('Get current item stock from various categories.'), // Updated description
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const apiResponse = await fetchStockData(); // Fetch the data from your API

            // Check if the API response is successful and contains the 'Data' object
            if (!apiResponse || !apiResponse.Data) {
                return interaction.editReply('Failed to fetch stock data or invalid response format.');
            }

            const stockData = apiResponse.Data; // Access the 'Data' object

            // Define the categories exactly as they appear in the API response's 'Data' object
            // and map them to their corresponding display names and emojis.
            const categoriesToProcess = [
                { key: 'gear', emojiKey: 'gearStock' },
                { key: 'seeds', emojiKey: 'seedsStock' },
                { key: 'egg', emojiKey: 'eggStock' },
                { key: 'cosmetics',  emojiKey: 'cosmeticsStock' },
                // If 'night' is a category in your API response, add it here.
                // For now, based on your provided JSON, 'night' is not directly a top-level key under 'Data'.
                // { key: 'night', displayName: 'Night', emoji: '🌙' }, 
            ];

            const embeds = [];

            for (const categoryInfo of categoriesToProcess) {
                const { key, displayName, emoji } = categoryInfo;
                const items = stockData[key]; // Access the array directly using the key

                // Only proceed if the category exists and has items
                if (!items || !Array.isArray(items) || items.length === 0) {
                    continue; // Skip if no items in this category
                }

                const embed = new EmbedBuilder()
                    .setDescription(`## ${categoryEmojis[categoriesToProcess.emojiKey] || ''} ${capitalize(key)} Stock`) // Use the defined emoji and display name
                    .setColor(0x00AE86)
                    .setTimestamp();

                let hasValidStock = false;
                for (const item of items) {
                    // Ensure 'name' and 'stock' properties exist and 'stock' is a valid number > 0
                    const stockValue = parseInt(item.stock, 10); // Parse stock to integer

                    if (item.name && !isNaN(stockValue) && stockValue > 0) {
                        // Assuming your item object might not have an 'emoji' property directly from the API.
                        // You might need a helper that maps item names to specific emojis if you want them.
                        // For now, I'll use a generic placeholder or rely on categoryEmojis for the title.
                        // If you have an `itemEmojis` helper, you can use:
                        // const itemEmoji = itemEmojis[item.name.toLowerCase().replace(/ /g, '_')] || '';
                        let emoji = '';
                        if (key === 'seeds') {
                            emoji = item.emoji || SeedsEmoji[item.name] || '';
                        } else if (key === 'gear') {
                            emoji = item.emoji || GearEmoji[item.name] || '';
                        } else if (key === 'egg') {
                            emoji = item.emoji || EggEmoji[item.name] || '';
                        } else {
                            emoji = item.emoji || ''
                        }
                        embed.addFields({ name: `${emoji} x${item.stock} ${item.name}`, value: '', inline: false });
                        hasValidStock = true;
                    }
                }

                // Only push the embed if it contains actual stock data
                if (hasValidStock) {
                    embeds.push(embed);
                }
            }

            if (embeds.length > 0) {
                await interaction.editReply({ embeds: embeds });
            } else {
                await interaction.editReply('No active stock data available at this time.');
            }

        } catch (error) {
            console.error('Error fetching or processing stock data:', error);
            await interaction.editReply('An error occurred while fetching stock data. Please try again later.');
        }
    },
};