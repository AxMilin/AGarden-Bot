const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Channel = require('../models/Channel');
const { seeds, SeedsEmoji } = require('../utils/helpers');

const toOptionName = (itemName) => itemName.toLowerCase().replace(/ /g, '_');

// Split array into chunks of size n
function chunkArray(arr, size) {
    return arr.reduce((chunks, item, i) => {
        const chunkIndex = Math.floor(i / size);
        if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
        chunks[chunkIndex].push(item);
        return chunks;
    }, []);
}

const seedChunks = chunkArray(seeds, 25);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_seed')
        .setDescription('Assign or remove roles for specific seed alerts.')
        .addSubcommandGroup(group => {
            group.setName('page')
                 .setDescription('Pages of seed roles');
            seedChunks.forEach((chunk, i) => {
                group.addSubcommand(sub =>
                    sub.setName(`p${i+1}`)
                       .setDescription(`Seed roles page ${i+1}`)
                       .addRoleOptions(opts => {
                           chunk.forEach(seed => {
                               opts.addRoleOption(option =>
                                   option.setName(toOptionName(seed))
                                         .setDescription(`Role for ${seed} alerts.`)
                                         .setRequired(false)
                               );
                           });
                           return opts;
                       })
                );
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
            await interaction.editReply({ content: '❌ I do not have permission to send messages in this channel. Please grant me the **Send Messages** permission.' });
            return;
        }

        const serverId = interaction.guild.id;
        const channelType = 'stock';
        let channelDoc = await Channel.findOne({ serverId, type: channelType });

        if (!channelDoc) {
            await interaction.editReply({ content: `⚠️ Please use \`/alert_set\` for **stock** notifications in this server before setting seed-specific roles.` });
            return;
        }

        if (!channelDoc.alertRoles) channelDoc.alertRoles = new Map();

        // figure out which subcommand (page) was used
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();
        if (group !== 'page') {
            await interaction.editReply({ content: '❌ Invalid page selection.' });
            return;
        }

        const pageIndex = parseInt(sub.replace('p', '')) - 1;
        const chosenSeeds = seedChunks[pageIndex] || [];

        let replyMessages = [];
        let rolesModified = false;

        for (const seedName of chosenSeeds) {
            const optionName = toOptionName(seedName);
            const role = interaction.options.getRole(optionName);
            const roleId = role ? role.id : null;
            const itemEmoji = SeedsEmoji[seedName] || '';

            if (interaction.options.data.some(opt => opt.name === optionName)) {
                rolesModified = true;
                if (roleId) {
                    channelDoc.alertRoles.set(seedName, roleId);
                    replyMessages.push(`✅ ${itemEmoji} **${seedName}** alerts will now ping ${role}.`);
                } else if (channelDoc.alertRoles.has(seedName)) {
                    channelDoc.alertRoles.delete(seedName);
                    replyMessages.push(`🗑️ Role for ${itemEmoji} **${seedName}** alerts has been removed.`);
                }
            }
        }

        if (!rolesModified) {
            await interaction.editReply({ content: 'ℹ️ No seed roles were specified on this page.' });
            return;
        }

        await channelDoc.save();
        await interaction.editReply({ content: replyMessages.join('\n') });
    }
};
