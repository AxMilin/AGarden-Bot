require('dotenv').config();

module.exports = {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    MONGO_URI: process.env.MONGO_URI,

    AGENT: process.env.AGENT,
    CROSS_HOST_AUTH_TOKEN: process.env.CROSS_HOST_AUTH_TOKEN,
    BRIDGE_PORT: Number(process.env.BRIDGE_PORT),
    BRIDGE_HOST: process.env.BRIDGE_HOST,
};
