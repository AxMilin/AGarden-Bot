require('dotenv').config();
const { Bridge } = require('discord-cross-hosting');

const server = new Bridge({
    port: Number(process.env.BRIDGE_PORT),
    authToken: process.env.CROSS_HOST_AUTH_TOKEN,
    totalShards: Number(process.env.TOTAL_SHARDS),
    totalMachines: Number(process.env.TOTAL_MACHINES),
    shardsPerCluster: Number(process.env.SHARDS_PER_CLUSTER),
    token: process.env.DISCORD_BOT_TOKEN,
});

server.on('debug', console.log);
server.start();
server.on('ready', url => {
    console.log('Server is ready' + url);
    setInterval(() => {
        server.broadcastEval('this.guilds.cache.size').then(console.log).catch(console.log);
    }, 10000);
});
