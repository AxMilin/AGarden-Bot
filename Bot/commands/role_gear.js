const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');
const { gears = [], GearsEmoji = {} } = require('../utils/helpers'); // safe defaults

const toOptionName = (itemName) => itemName.toLowerCase().replace(/ /g, '_');

function chunkArray(arr, size) {
    return arr.reduce((chunks, item, i) => {
        const chunkIndex = Math.floor(i / size);
        if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
        chunks[chunkIndex].push(item);
        return chunks;
    }, []);
}

const gearChunks = chunkArray(gears, 25);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_gear')
        .setDescription('Assign or remove roles for specific gear alerts.')
        .addSubcommandGroup(group => {
            group.setName('page')
                 .setDescription('Pages of gear roles');
            gearChunks.forEach((chunk, i) => {
                group.addSubcommand(sub => {
                    sub.setName(`p${i+1}`)
                       .setDescription(`Gear roles page ${i+1}`);
                    chunk.forEach(gear => {
                        sub.addRoleOption(option =>
                            option.setName(toOptionName(gear))
                                  .setDescription(`Role for ${gear} alerts.`)
                                  .setRequired(false)
                        );
                    });
                    return sub;
                });
            });
            return group;
        }),

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
            await interaction.editReply({ content: '❌ I cannot send messages in this channel. Please grant **Send Messages** permission.' });
            return;
        }

        const serverId = interaction.guild.id;
        const channelType = 'stock';
        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **stock** notifications in this server before setting gear-specific roles.` });
            return;
        }

        if (!channelDoc.alertRoles) channelDoc.alertRoles = new Map();

        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();
        if (group !== 'page') {
            await interaction.editReply({ content: '❌ Invalid page selection.' });
            return;
        }

        const pageIndex = parseInt(sub.replace('p', '')) - 1;
        const chosenGears = gearChunks[pageIndex] || [];

        let replyMessages = [];
        let rolesModified = false;

        for (const gearName of chosenGears) {
            const optionName = toOptionName(gearName);
            const role = interaction.options.getRole(optionName);
            const roleId = role ? role.id : null;
            const itemEmoji = GearsEmoji[gearName] || '';

            if (interaction.options.data.some(opt => opt.name === optionName)) {
                rolesModified = true;
                if (roleId) {
                    channelDoc.alertRoles.set(gearName, roleId);
                    replyMessages.push(`✅ ${itemEmoji} **${gearName}** alerts will now ping ${role}.`);
                } else if (channelDoc.alertRoles.has(gearName)) {
                    channelDoc.alertRoles.delete(gearName);
                    replyMessages.push(`🗑️ Role for ${itemEmoji} **${gearName}** alerts has been removed.`);
                }
            }
        }

        if (!rolesModified) {
            await interaction.editReply({ content: 'ℹ️ No gear roles were specified on this page.' });
            return;
        }

        await channelDoc.save();
        await interaction.editReply({ content: replyMessages.join('\n') });
    }
};
