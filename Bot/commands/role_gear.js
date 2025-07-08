const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');
const { gear, GearEmoji } = require('../utils/helpers');

// Function to convert item names to valid Discord option names (lowercase, snake_case)
const toOptionName = (itemName) => itemName.toLowerCase().replace(/ /g, '_');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_gear')
        .setDescription('Assign or remove roles for specific gear item alerts.'),
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
        const channelType = 'stock'; // Gear falls under 'stock' type

        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **stock** notifications in this server before setting gear-specific roles.` });
            return;
        }

        if (!channelDoc.alertRoles) {
            channelDoc.alertRoles = new Map();
        }

        let replyMessages = [];
        let rolesModified = false;

        // Iterate over all possible gear options
        for (const gearName of gear) {
            const optionName = toOptionName(gearName);
            const role = interaction.options.getRole(optionName);
            const roleId = role ? role.id : null;
            const itemEmoji = GearEmoji[gearName] || '';

            if (interaction.options.data.some(opt => opt.name === optionName)) {
                rolesModified = true;

                if (roleId) {
                    channelDoc.alertRoles.set(gearName, roleId);
                    replyMessages.push(`✅ ${itemEmoji} **${gearName}** alerts will now ping ${role}.`);
                } else {
                    if (channelDoc.alertRoles.has(gearName)) {
                        channelDoc.alertRoles.delete(gearName);
                        replyMessages.push(`🗑️ Role for ${itemEmoji} **${gearName}** alerts has been removed.`);
                    } else {
                        replyMessages.push(`ℹ️ No role was set for ${itemEmoji} **${gearName}** alerts to begin with.`);
                    }
                }
            }
        }

        if (!rolesModified) {
            await interaction.editReply({ content: 'ℹ️ No gear roles were specified. Please select one or more gear options to modify.' });
            return;
        }

        await channelDoc.save();
        await interaction.editReply({ content: replyMessages.join('\n') });
    },
};

// Dynamically add a RoleOption for each gear item
for (const item of gear) {
    module.exports.data.addRoleOption(option =>
        option.setName(toOptionName(item))
            .setDescription(`Role for ${item} alerts.`)
            .setRequired(false)
    );
}