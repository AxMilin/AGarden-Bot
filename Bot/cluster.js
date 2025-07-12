const { Client } = require('discord-cross-hosting');
const { ClusterManager}  = require('discord-hybrid-sharding');
const { CROSS_HOST_AUTH_TOKEN, BRIDGE_PORT, BRIDGE_HOST, AGENT } = require('./config');

const client = new Client({
    agent: AGENT,
    host: BRIDGE_HOST, // Domain without https
    port: BRIDGE_PORT, // Proxy Connection (Replit) needs Port 443
    // handshake: true, When Replit or any other Proxy is used
    authToken: CROSS_HOST_AUTH_TOKEN,
    rollingRestarts: true, // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', console.log);
client.connect();

const manager = new ClusterManager(`${__dirname}/bot.js`, { totalShards: 1, totalClusters: 'auto', restarts: {max: Infinity}}); // Some dummy Data
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.on('debug', console.log);

client.listen(manager);
client
    .requestShardData()
    .then(e => {
        if (!e) return;
        if (!e.shardList) return;
        manager.totalShards = e.totalShards;
        manager.totalClusters = e.shardList.length;
        manager.shardList = e.shardList;
        manager.clusterList = e.clusterList;
        manager.spawn({ timeout: -1 });
    })
    .catch(e => console.log(e));