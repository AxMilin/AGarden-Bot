const { SlashCommandBuilder, PermissionsBitField, InteractionType } = require('discord.js');
const Channel = require('../models/Channel');
const { seeds, gear, eggs, SeedsEmoji, GearEmoji, EggEmoji } = require('../utils/helpers'); // Assuming helpers.js is in utils folder

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert_role')
        .setDescription('Assign a role to receive alerts for specific seeds, gear, or eggs.')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The category of items (seeds, gear, or eggs).')
                .setRequired(true)
                .addChoices(
                    { name: 'Seeds', value: 'seeds' },
                    { name: 'Gear', value: 'gear' },
                    { name: 'Eggs', value: 'eggs' }
                ))
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The specific item to set the alert role for (e.g., Carrot, Watering Can, Common Egg).')
                .setRequired(true)
                .setAutocomplete(true)) // Enable autocomplete for item selection
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to ping for this item. Leave empty to remove the role.')
                .setRequired(false)), // Role is optional to allow removal

    // This method handles the execution of the slash command
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

        const category = interaction.options.getString('category');
        const itemName = interaction.options.getString('item');
        const role = interaction.options.getRole('role'); // This will be null if no role is selected
        const roleId = role ? role.id : null;

        const serverId = interaction.guild.id;
        const channelId = interaction.channelId;

        // Determine the 'type' for the Channel model based on the chosen category
        let channelType;
        if (category === 'seeds' || category === 'gear') {
            channelType = 'stock';
        } else if (category === 'eggs') {
            channelType = 'egg';
        } else {
            await interaction.editReply({ content: '❌ Invalid category selected.' });
            return;
        }

        // Find the existing channel setup for the determined type
        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        // If no setup exists for this type, inform the user to use /alert_set first
        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **${channelType}** notifications in this server before setting item-specific roles.` });
            return;
        }

        // Ensure alertRoles map exists, initialize if not
        if (!channelDoc.alertRoles) {
            channelDoc.alertRoles = new Map();
        }

        // Check if the provided item name is valid for the selected category
        let validItems = [];
        let itemEmojiMap = {};
        if (category === 'seeds') {
            validItems = seeds;
            itemEmojiMap = SeedsEmoji;
        } else if (category === 'gear') {
            validItems = gear;
            itemEmojiMap = GearEmoji;
        } else if (category === 'eggs') {
            validItems = eggs;
            itemEmojiMap = EggEmoji;
        }

        if (!validItems.includes(itemName)) {
            await interaction.editReply({ content: `❌ "${itemName}" is not a valid item in the **${category}** category.` });
            return;
        }

        const itemEmoji = itemEmojiMap[itemName] || '';

        // Update or remove the role for the specific item
        if (roleId) {
            channelDoc.alertRoles.set(itemName, roleId);
            await channelDoc.save();
            await interaction.editReply({ content: `✅ Successfully set ${itemEmoji} **${itemName}** alerts to ping ${role}.` });
        } else {
            // If no role is provided, remove the existing role for that item
            if (channelDoc.alertRoles.has(itemName)) {
                channelDoc.alertRoles.delete(itemName);
                await channelDoc.save();
                await interaction.editReply({ content: `🗑️ Successfully removed role for ${itemEmoji} **${itemName}** alerts.` });
            } else {
                await interaction.editReply({ content: `ℹ️ No role was set for ${itemEmoji} **${itemName}** alerts to begin with.` });
            }
        }
    },

    // This method handles autocomplete interactions for the 'item' option
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const category = interaction.options.getString('category'); // Get the value of the 'category' option

        let choices = [];
        if (category === 'seeds') {
            choices = seeds;
        } else if (category === 'gear') {
            choices = gear;
        } else if (category === 'eggs') {
            choices = eggs;
        }

        // Filter choices based on the user's current input
        const filtered = choices.filter(choice =>
            choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );

        // Respond with the filtered choices (max 25 for Discord)
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
        );
    },
};