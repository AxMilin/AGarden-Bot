require('dotenv').config();
const { Bridge } = require('discord-cross-hosting');

const totalShards = process.env.TOTAL_SHARDS === 'auto' ? 'auto' : Number(process.env.TOTAL_SHARDS);

const server = new Bridge({
    port: Number(process.env.BRIDGE_PORT),
    authToken: process.env.CROSS_HOST_AUTH_TOKEN,
    totalShards,
    totalMachines: Number(process.env.TOTAL_MACHINES),
    shardsPerCluster: Number(process.env.SHARDS_PER_CLUSTER),
    token: process.env.DISCORD_BOT_TOKEN,
});

server.on('debug', console.log);
server.start();
server.on('ready', url => {
    console.log('Server is ready' + url);
    setInterval(() => {
    setTimeout(() => {
    server.broadcastEval(c => c.guilds.cache.size)
        .then(results => {
        console.log('Guild counts per machine:', results);
        const total = results.reduce((acc, val) => acc + val, 0);
        console.log('Total guilds across all machines:', total);
        })
        .catch(console.error);
    }, 30000); // wait 30 seconds after bridge start
    }, 10000);
});