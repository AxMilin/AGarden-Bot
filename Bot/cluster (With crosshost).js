const { Client } = require('discord-cross-hosting');
const { ClusterManager } = require('discord-hybrid-sharding'); // <--- THIS LINE IS THE FIX
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

// Retry logic for connecting to bridge:
async function connectToBridge(retryDelay = 3000) {
    while (true) {
        try {
            console.log('[CM] Trying to connect to Bridge...');
            await client.connect();
            console.log('[CM] Connected to Bridge!');
            break; // exit loop on success
        } catch (err) {
            console.error('[CM] Bridge connect failed:', err.message);
            console.log(`[CM] Retrying in ${retryDelay}ms...`);
            await new Promise(res => setTimeout(res, retryDelay));
        }
    }
}

// Initialize the ClusterManager
const manager = new ClusterManager(`${__dirname}/bot.js`, {
    totalShards: 5,
    totalClusters: 'auto',
    restarts: {
        max: Infinity,
    },
});

// Events
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.on('debug', console.log);

// Connect to bridge and listen for cluster manager events
client.listen(manager); // ← AFTER extend()

client.on('disconnect', () => {
    console.warn('🚨 Bridge disconnected!');
});

client.on('connect', () => {
    console.log('✅ Connected to bridge.');
});

client.on('reconnecting', () => {
    console.log('🔄 Reconnecting to bridge...');
});

// Wait for shard data retry loop
async function waitForShardData(delay = 3000) {
    while (true) {
        try {
            const e = await client.requestShardData();
            if (e && e.shardList?.length > 0) {
                console.log('✅ Shard data received.');
                return e;
            } else {
                console.log('⏳ Waiting for bridge to be ready...');
            }
        } catch (err) {
            console.log('⚠️ Error requesting shard data:', err.message);
        }
        await new Promise(res => setTimeout(res, delay));
    }
}

// Run connection + wait for shard data + spawn clusters
(async () => {
    await connectToBridge();

    try {
        const e = await waitForShardData();
        manager.totalShards = e.totalShards;
        manager.totalClusters = e.shardList.length;
        manager.shardList = e.shardList;
        manager.clusterList = e.clusterList;
        manager.spawn({ timeout: -1 });
    } catch (err) {
        console.error('❌ Cluster manager failed to start:', err);
        process.exit(1);
    }
})();
