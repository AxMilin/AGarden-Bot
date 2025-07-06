const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_eggs')
        .setDescription('Setup eggs notifier in this channel'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Ensure the command is used in a guild (server)
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in servers.' });
            return;
        }

        // Check if the user has permission to manage channels
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.editReply({ content: '❌ You need the **Manage Channels** permission to use this command.' });
            return;
        }

        // Check if the bot has permission to send messages in the current channel
        const botMember = interaction.guild.members.me;
        const channelPermissions = interaction.channel.permissionsFor(botMember);

        if (!channelPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            await interaction.editReply({ content: '❌ I do not have permission to send messages in this channel. Please grant me the **Send Messages** permission.' });
            return;
        }

        const type = 'egg';
        const serverId = interaction.guild.id;
        const channelId = interaction.channelId;

        const existing = await Channel.findOne({ serverId, type });

        // If notifications are already set up in this channel, remove them
        if (existing?.channelId === channelId) {
            await Channel.deleteOne({ serverId, type, channelId });
            await interaction.editReply({ content: `❌ ${type} notifications removed from this channel.` });
            return;
        }

        // If notifications are set up in another channel, inform the user
        if (existing && existing.channelId !== channelId) {
            await interaction.editReply({ content: `⚠️ ${type} notifications are already set up in <#${existing.channelId}>. Remove them there first.` });
            return;
        }

        // Set up notifications in the current channel
        await Channel.findOneAndUpdate(
            { serverId, type },
            { serverId, channelId, type },
            { upsert: true, new: true }
        );

        await interaction.editReply({ content: `✅ Setup complete! You’ll now receive ${type} notifications here.` });
    },
};