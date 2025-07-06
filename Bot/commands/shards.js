const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { SHARD_LIST } = require('discord-hybrid-sharding').getInfo();

// Helper to format uptime nicely
function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shards')
        .setDescription('Shows status for all bot shards, paginated.'),
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const shardId = SHARD_LIST.join(',');
        const cluster_Id = client.cluster?.id;
        const currentShardId = interaction.guild ? interaction.guild.shardId : SHARD_LIST.join(',');

        const SHARDS_PER_PAGE = 3;

        let shardData = [];

        try {
            const results = await client.cluster.broadcastEval(c => {
                const shardIds = c.cluster?.shardList ?? [];

                return {
                    clusterId: c.cluster.id,
                    shardIds,
                    guildsSize: c.guilds.cache.size,
                    usersCount: c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                    wsPing: c.ws.ping,
                    processUptime: process.uptime(),
                    processRamUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                };
            });

            shardData = results.filter(Boolean).map(res => ({
                clusterId: res.clusterId,
                shardIds: res.shardIds,
                guilds: res.guildsSize,
                users: res.usersCount,
                ping: res.wsPing,
                uptime: res.processUptime,
                ram: res.processRamUsage,
            }));
        } catch (error) {
            console.error('Error fetching shard data for /shards command:', error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('Shard Status Error')
                .setDescription('Could not fetch shard data. There might be an issue with IPC or some shards are unresponsive.')
                .setColor('Red');
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        if (shardData.length === 0) {
            const noShardsEmbed = new EmbedBuilder()
                .setTitle('Shard Status')
                .setDescription('No active shards found or data could not be retrieved.')
                .setColor('Orange');
            return interaction.editReply({ embeds: [noShardsEmbed] });
        }

        shardData.sort((a, b) => a.clusterId - b.clusterId);

        const totalPages = Math.ceil(shardData.length / SHARDS_PER_PAGE);
        let currentPage = 0;

        const generateEmbed = (page) => {
            const start = page * SHARDS_PER_PAGE;
            const end = start + SHARDS_PER_PAGE;
            const shardsOnPage = shardData.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle(`📊 Bot Shard Status (Page ${page + 1}/${totalPages})`)
                .setColor(0x00AE86)
                .setDescription('Information about each active bot shard.')
				
            shardsOnPage.forEach(shard => {
                embed.addFields({
                    name: `Cluster ${shard.clusterId} (Shards: ${shard.shardIds.length > 0 ? shard.shardIds.join(', ') : 'N/A or connecting'})`,
                    value: `**Guilds:** ${shard.guilds}
**Users:** ${shard.users}
**Ping:** ${shard.ping}ms
**Uptime:** ${formatUptime(shard.uptime)}
**RAM:** ${shard.ram} MB`,
                    inline: false
                });
            });
            embed
           		.setFooter({ text: `Command executed on Shard ${currentShardId} (Cluster ${cluster_Id})` })
                .setTimestamp();


            return embed;
        };

        const getPaginationButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_shard_page')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_shard_page')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1),
                );
        };

        let replyMessage = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: [getPaginationButtons(currentPage)],
            fetchReply: true
        });

        const collector = replyMessage.createMessageComponentCollector({
            filter: i => ['prev_shard_page', 'next_shard_page'].includes(i.customId),
            time: 60 * 1000
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'You can\'t control this pagination!', ephemeral: true });
            }

            if (i.customId === 'prev_shard_page') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i.customId === 'next_shard_page') {
                currentPage = Math.min(currentPage + 1, totalPages - 1);
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [getPaginationButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            const disabledButtons = getPaginationButtons(currentPage);
            disabledButtons.components.forEach(button => button.setDisabled(true));
            replyMessage.edit({ components: [disabledButtons] }).catch(() => {});
        });
    },
};
