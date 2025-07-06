const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SHARD_LIST, TOTAL_SHARDS } = require('discord-hybrid-sharding').getInfo();

const Channel = require('../models/Channel');
const Notify = require('../models/Notify');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show bot status, uptime, latency, Etcs'),
    async execute(interaction, client) {
        await interaction.deferReply();


        // --- Data from the local shard (where the command was executed) ---
        const uptime = process.uptime();
        const ramUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const apiLatency = Date.now() - interaction.createdTimestamp;
        const wsLatency = client.ws.ping;

        // --- Data that can be fetched locally (as it's usually global or doesn't need aggregation) ---
        const stockServers = await Channel.distinct('serverId', { type: 'stock' });
        const weatherServers = await Channel.distinct('serverId', { type: 'weather' });
        const eggServers = await Channel.distinct('serverId', { type: 'egg' });
        const notifyUsersCount = await Notify.countDocuments();
        const shardIds = SHARD_LIST.join(',');
        const totalShards = TOTAL_SHARDS;
        const clusterId = client.cluster?.id;


        // --- Data to be gathered from ALL shards using broadcastEval ---
        let totalGuilds = 0;
        let totalUsers = 0;
        let allShardLatencies = [];
        let allShardUptimes = [];
        let allShardRamUsages = [];

        let results = []; // Declare results here, initialize as an empty array

        try {
            results = await client.cluster.broadcastEval(c => ({
                guildsSize: c.guilds.cache.size,
                usersCount: c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                wsPing: c.ws.ping,
                processUptime: process.uptime(),
                processRamUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
            }));

            // Aggregate the results
            for (const res of results) {
                totalGuilds += res.guildsSize;
                totalUsers += res.usersCount;
                allShardLatencies.push(res.wsPing);
                allShardUptimes.push(res.processUptime);
                allShardRamUsages.push(parseFloat(res.processRamUsage));
            }

        } catch (error) {
            console.error('Error during broadcastEval for status:', error);
            // Fallback to local data if broadcastEval fails
            totalGuilds = client.guilds.cache.size;
            totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            allShardLatencies.push(wsLatency);
            allShardUptimes.push(uptime);
            allShardRamUsages.push(parseFloat(ramUsageMB));
        }

        // Calculate averages or combined values for shard-specific metrics
        const avgWsLatency = allShardLatencies.length > 0 ? (allShardLatencies.reduce((a, b) => a + b, 0) / allShardLatencies.length).toFixed(0) : wsLatency;
        const totalUptimeSeconds = allShardUptimes.length > 0 ? allShardUptimes[0] : uptime;
        const totalRamUsageMB = allShardRamUsages.length > 0 ? allShardRamUsages.reduce((a, b) => a + b, 0).toFixed(2) : ramUsageMB;

        // Uptime string for total bot uptime
        const totalUptimeStr = (() => {
            const sec = Math.floor(totalUptimeSeconds % 60);
            const min = Math.floor((totalUptimeSeconds / 60) % 60);
            const hr = Math.floor((totalUptimeSeconds / 3600) % 24);
            const day = Math.floor(totalUptimeSeconds / 86400);
            return `${day}d ${hr}h ${min}m ${sec}s`;
        })();


        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot Status (Aggregated)')
            .setColor(0x00AE86)
            .addFields(
                { name: '🌐 Total Servers', value: `${totalGuilds}`, inline: true },
                { name: '👥 Total Users', value: `${totalUsers}`, inline: true },
                { name: '⚡ Latency', value: `Avg. Bot WS: ${avgWsLatency}ms\nAPI: ${apiLatency}ms (Local)`, inline: true },
                { name: '⏳ Uptime', value: totalUptimeStr, inline: true },
                { name: '🧠 Total RAM Usage', value: `${totalRamUsageMB} MB`, inline: true },
                { name: '📦 Notif Servers (Stock/Weather/Egg)', value: `${stockServers.length} / ${weatherServers.length} / ${eggServers.length}`, inline: true },
                { name: '🔔 Users with Notify', value: `${notifyUsersCount}`, inline: true },
                { name: '📊 Shards Running', value: `${results.length} / ${totalShards}`, inline: true }
            )
            // *** THIS IS THE LINE WHERE THE CHANGE GOES ***
            .setFooter({
                text: `Command executed on Shard ${results.length} (Cluster ${clusterId})`
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};