const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');
const { seeds, SeedsEmoji } = require('../utils/helpers');

// Function to convert item names to valid Discord option names (lowercase, snake_case)
const toOptionName = (itemName) => itemName.toLowerCase().replace(/ /g, '_');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_seed')
        .setDescription('Assign or remove roles for specific seed alerts.'),
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

        let replyMessages = [];
        let rolesModified = false;

        // Iterate over all possible seed options
        for (const seedName of seeds) {
            const optionName = toOptionName(seedName);
            const role = interaction.options.getRole(optionName); // Get the role for this specific option
            const roleId = role ? role.id : null;
            const itemEmoji = SeedsEmoji[seedName] || '';

            // Check if the user provided a value for this specific seed option
            if (interaction.options.data.some(opt => opt.name === optionName)) {
                rolesModified = true; // At least one role option was explicitly provided

                if (roleId) {
                    channelDoc.alertRoles.set(seedName, roleId);
                    replyMessages.push(`✅ ${itemEmoji} **${seedName}** alerts will now ping ${role}.`);
                } else {
                    // If roleId is null, it means the user cleared the role or didn't select one
                    if (channelDoc.alertRoles.has(seedName)) {
                        channelDoc.alertRoles.delete(seedName);
                        replyMessages.push(`🗑️ Role for ${itemEmoji} **${seedName}** alerts has been removed.`);
                    } else {
                        replyMessages.push(`ℹ️ No role was set for ${itemEmoji} **${seedName}** alerts to begin with.`);
                    }
                }
            }
        }

        if (!rolesModified) {
            await interaction.editReply({ content: 'ℹ️ No seed roles were specified. Please select one or more seed options to modify.' });
            return;
        }

        await channelDoc.save();
        await interaction.editReply({ content: replyMessages.join('\n') });
    },
};

// Dynamically add a RoleOption for each seed
for (const seed of seeds) {
    module.exports.data.addRoleOption(option =>
        option.setName(toOptionName(seed))
            .setDescription(`Role for ${seed} alerts.`)
            .setRequired(false)
    );
}