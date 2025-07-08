const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchRestockTime } = require('../utils/api');
const { capitalize } = require('../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_restock')
        .setDescription('Get current restock times once'),
    async execute(interaction) {
        await interaction.deferReply();

        const data = await fetchRestockTime();
        if (!data) {
            interaction.editReply('Failed to fetch restock times.');
            return;
        }

        const embed = new EmbedBuilder()
            .setDescription('## ⏰ Restock Times')
            .setColor(0xFFA500)
            .setTimestamp();

        for (const [key, info] of Object.entries(data)) {
            embed.addFields({
                name: capitalize(key),
                value: `Countdown: ${info.countdown}\nLast Restock: ${info.LastRestock}\nTime Since Last Restock: ${info.timeSinceLastRestock}`,
                inline: true,
            });
        }
        interaction.editReply({ embeds: [embed] });
    },
};