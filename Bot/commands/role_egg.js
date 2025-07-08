const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');
const { eggs, EggEmoji } = require('../utils/helpers');

// Function to convert item names to valid Discord option names (lowercase, snake_case)
const toOptionName = (itemName) => itemName.toLowerCase().replace(/ /g, '_');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_egg')
        .setDescription('Assign or remove roles for specific egg alerts.'),
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
        const channelType = 'egg'; // Eggs fall under 'egg' type

        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **egg** notifications in this server before setting egg-specific roles.` });
            return;
        }

        if (!channelDoc.alertRoles) {
            channelDoc.alertRoles = new Map();
        }

        let replyMessages = [];
        let rolesModified = false;

        // Iterate over all possible egg options
        for (const eggName of eggs) {
            const optionName = toOptionName(eggName);
            const role = interaction.options.getRole(optionName);
            const roleId = role ? role.id : null;
            const itemEmoji = EggEmoji[eggName] || '';

            if (interaction.options.data.some(opt => opt.name === optionName)) {
                rolesModified = true;

                if (roleId) {
                    channelDoc.alertRoles.set(eggName, roleId);
                    replyMessages.push(`✅ ${itemEmoji} **${eggName}** alerts will now ping ${role}.`);
                } else {
                    if (channelDoc.alertRoles.has(eggName)) {
                        channelDoc.alertRoles.delete(eggName);
                        replyMessages.push(`🗑️ Role for ${itemEmoji} **${eggName}** alerts has been removed.`);
                    } else {
                        replyMessages.push(`ℹ️ No role was set for ${itemEmoji} **${eggName}** alerts to begin with.`);
                    }
                }
            }
        }

        if (!rolesModified) {
            await interaction.editReply({ content: 'ℹ️ No egg roles were specified. Please select one or more egg options to modify.' });
            return;
        }

        await channelDoc.save();
        await interaction.editReply({ content: replyMessages.join('\n') });
    },
};

// Dynamically add a RoleOption for each egg
for (const egg of eggs) {
    module.exports.data.addRoleOption(option =>
        option.setName(toOptionName(egg))
            .setDescription(`Role for ${egg} alerts.`)
            .setRequired(false)
    );
}