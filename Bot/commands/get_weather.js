const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchWeatherData } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_weather')
        .setDescription('Get current active weather events.'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const apiResponse = await fetchWeatherData();

            // Check for expected structure
            if (!apiResponse || !Array.isArray(apiResponse.events)) {
                return interaction.editReply('Failed to fetch weather data or invalid response format.');
            }

            const activeWeatherEvents = apiResponse.events.filter(event => event.isActive);

            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTimestamp();

            if (activeWeatherEvents.length === 0) {
                embed.setDescription('🌤️ There are no active weather events at the moment.');
            } else {
                embed.setDescription('🌦️ **Current Active Weather Events:**');
                for (const event of activeWeatherEvents) {
                    const emoji = event.emoji || '❓';
                    const name = event.displayName || 'Unknown';
                    embed.addFields({
                        name: `${emoji} ${name}`,
                        value: `Status: Active`,
                        inline: true,
                    });
                }
            }

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching or processing weather data:', error);
            interaction.editReply('An error occurred while fetching weather data. Please try again later.');
        }
    },
};
