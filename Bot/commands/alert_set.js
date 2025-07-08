const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert_set')
        .setDescription('Set up alerts for stocks, eggs, or weather in this channel.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of alert to set up.')
                .setRequired(true)
                .addChoices(
                    { name: 'Stocks', value: 'stock' },
                    { name: 'Eggs', value: 'egg' },
                    { name: 'Weather', value: 'weather' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in servers.' });
            return;
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.editReply({ content: '❌ You need the **Manage Channels** permission to use this command.' });
            return;
        }

        const botMember = interaction.guild.members.me;
        const channelPermissions = interaction.channel.permissionsFor(botMember);

        if (!channelPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            await interaction.editReply({ content: '❌ I do not have permission to send messages in this channel. Please grant me the **Send Messages** permission.' });
            return;
        }

        const type = interaction.options.getString('type');
        const serverId = interaction.guild.id;
        const channelId = interaction.channelId;

        const existing = await Channel.findOne({ serverId, type });

        if (existing?.channelId === channelId) {
            await Channel.deleteOne({ serverId, type, channelId });
            await interaction.editReply({ content: `❌ ${type} alerts removed from this channel.` });
            return;
        }

        if (existing && existing.channelId !== channelId) {
            await interaction.editReply({ content: `⚠️ ${type} alerts are already set up in <#${existing.channelId}>. Remove them there first.` });
            return;
        }

        await Channel.findOneAndUpdate(
            { serverId, type },
            { serverId, channelId, type },
            { upsert: true, new: true }
        );

        await interaction.editReply({ content: `✅ Setup complete! You’ll now receive ${type} alerts here.` });
    },
};