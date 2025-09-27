require('dotenv').config();
const { ClusterManager } = require('discord-hybrid-sharding');

const manager = new ClusterManager(`${__dirname}/bot.js`, {
    totalShards: Number(process.env.TOTAL_SHARDS) || 'auto',
    totalClusters: Number(process.env.TOTAL_MACHINES) || 'auto',
    shardsPerClusters: Number(process.env.SHARDS_PER_CLUSTER) || 1,
    respawn: true,
    token: process.env.DISCORD_BOT_TOKEN,
});

// Events
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.on('debug', console.log);

// Spawn all clusters
manager.spawn({ timeout: -1 }).catch(err => {
    console.error('❌ Failed to spawn clusters:', err);
    process.exit(1);
});
