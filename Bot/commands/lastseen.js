const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchStockData } = require('../utils/api');
const { capitalize } = require('../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lastseen')
        .setDescription('Shows last seen items from the stocks'),
    async execute(interaction) {
        await interaction.deferReply();
        
        //await interaction.editReply('❌ Temporarily Disabled');return;
        
        try {
            const data = await fetchStockData();
            if (!data || !data.lastSeen) {
                await interaction.editReply('❌ Failed to fetch last seen items.');
                return;
            }

            const lastSeen = data.lastSeen;
            const embeds = [];

            for (const [category, items] of Object.entries(lastSeen)) {
                if (!items.length) continue;

                for (let i = 0; i < items.length; i += 10) {
                    const chunk = items.slice(i, i + 10);

                    const embed = new EmbedBuilder()
                        .setDescription(`## 🕒 Last Seen - ${capitalize(category)}${items.length > 10 ? ` (Page ${Math.floor(i / 10) + 1})` : ''}`)
                        .setColor(0x90ee90)
                        .setTimestamp();

                    for (const item of chunk) {
                        embed.addFields({
                            name: `${item.emoji || ''} ${item.name}`,
                            value: `Seen: <t:${Math.floor(new Date(item.seen).getTime() / 1000)}:R>`,
                            inline: true,
                        });
                    }
                    if (chunk[0]?.image) embed.setThumbnail(chunk[0].image);
                    embeds.push(embed);
                }
            }
            await interaction.editReply({ embeds });
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Failed to fetch last seen items.');
        }
    },
};