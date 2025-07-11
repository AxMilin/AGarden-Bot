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
    server.broadcastEval(`this.guilds.cache.size`)
    .then(results => {
        const total = results.reduce((acc, count) => acc + count, 0);
        console.log(`Total guilds across all machines: ${total}`);
    })
    .catch(console.error);
    }, 10000);
});
