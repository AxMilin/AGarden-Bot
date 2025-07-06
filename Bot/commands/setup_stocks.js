const { SlashCommandBuilder, PermissionsBitField } = require('discord.js'); // Import PermissionsBitField
const Channel = require('../models/Channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_stocks')
        .setDescription('Setup stock notifier in this channel'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in servers.' });
            return;
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) { // Use PermissionsBitField.Flags
            await interaction.editReply({ content: '❌ You need the **Manage Channels** permission to use this command.' });
            return;
        }

        // Check if the bot has permission to send messages in the channel
        const botMember = interaction.guild.members.me;
        const channelPermissions = interaction.channel.permissionsFor(botMember);

        if (!channelPermissions.has(PermissionsBitField.Flags.SendMessages)) { // Use PermissionsBitField.Flags
            await interaction.editReply({ content: '❌ I do not have permission to send messages in this channel. Please grant me the **Send Messages** permission.' });
            return;
        }

        const type = 'stock';
        const serverId = interaction.guild.id;
        const channelId = interaction.channelId;

        const existing = await Channel.findOne({ serverId, type });

        if (existing?.channelId === channelId) {
            await Channel.deleteOne({ serverId, type, channelId });
            await interaction.editReply({ content: `❌ ${type} notifications removed from this channel.` });
            return;
        }

        if (existing && existing.channelId !== channelId) {
            await interaction.editReply({ content: `⚠️ ${type} notifications are already set up in <#${existing.channelId}>. Remove them there first.` });
            return;
        }

        await Channel.findOneAndUpdate(
            { serverId, type },
            { serverId, channelId, type },
            { upsert: true, new: true }
        );

        await interaction.editReply({ content: `✅ Setup complete! You’ll now receive ${type} notifications here.` });
    },
};