const { SlashCommandBuilder, PermissionsBitField, InteractionType } = require('discord.js');
const Channel = require('../models/Channel');
const { seeds, SeedsEmoji } = require('../utils/helpers'); // Only import seeds and SeedsEmoji

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_seed') // Command name changed to role_seed
        .setDescription('Assign a role to receive alerts for a specific seed.')
        .addStringOption(option =>
            option.setName('seed_name')
                .setDescription('The specific seed to set the alert role for (e.g., Carrot, Apple).')
                .setRequired(true)
                .setAutocomplete(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to ping for this seed. Leave empty to remove the role.')
                .setRequired(false)),

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

        const itemName = interaction.options.getString('seed_name');
        const role = interaction.options.getRole('role');
        const roleId = role ? role.id : null;

        const serverId = interaction.guild.id;
        const channelType = 'stock'; // Seeds fall under 'stock' type

        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **stock** notifications in this server before setting seed-specific roles.` });
            return;
        }

        if (!channelDoc.alertRoles) {
            channelDoc.alertRoles = new Map();
        }

        if (!seeds.includes(itemName)) {
            await interaction.editReply({ content: `❌ "${itemName}" is not a valid seed name.` });
            return;
        }

        const itemEmoji = SeedsEmoji[itemName] || '';

        if (roleId) {
            channelDoc.alertRoles.set(itemName, roleId);
            await channelDoc.save();
            await interaction.editReply({ content: `✅ Successfully set ${itemEmoji} **${itemName}** alerts to ping ${role}.` });
        } else {
            if (channelDoc.alertRoles.has(itemName)) {
                channelDoc.alertRoles.delete(itemName);
                await channelDoc.save();
                await interaction.editReply({ content: `🗑️ Successfully removed role for ${itemEmoji} **${itemName}** alerts.` });
            } else {
                await interaction.editReply({ content: `ℹ️ No role was set for ${itemEmoji} **${itemName}** alerts to begin with.` });
            }
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const filtered = seeds.filter(seed =>
            seed.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
        );
    },
};