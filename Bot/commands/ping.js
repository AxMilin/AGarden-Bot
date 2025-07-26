const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pingBridge } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency, WebSocket ping, and bridge ping'),
    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = client.ws.ping;
        const bridgePing = await pingBridge();

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x00AE86)
            .addFields(
                { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true },
                { name: '🌐 WebSocket Ping', value: `${wsLatency}ms`, inline: true },
                { name: '🌉 Bridge Ping', value: typeof bridgePing === 'number' ? `${bridgePing}ms` : 'Unavailable', inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};
