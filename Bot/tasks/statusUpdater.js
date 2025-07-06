const { ActivityType } = require('discord.js');

// This variable will keep track of which status message to display next.
// Since this file is loaded by each cluster/shard process,
// each process will independently cycle through the statuses.
// Discord's API generally handles the eventual consistency of global bot presence.
let currentStatusIndex = 0;

/**
 * Formats a given uptime in seconds into a human-readable string (e.g., "2d 10h 30m").
 * @param {number} seconds The uptime in seconds.
 * @returns {string} The formatted uptime string.
 */
function formatUptime(seconds) {
    function pluralize(count, noun) {
        return `${count} ${noun}${count !== 1 ? 's' : ''}`;
    }

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(pluralize(d, 'day'));
    if (h > 0) parts.push(pluralize(h, 'hour'));
    if (m > 0) parts.push(pluralize(m, 'minute'));

    if (parts.length === 0) return 'less than a minute';
    return parts.join(' ');
}


/**
 * Updates the bot's status (presence) on Discord with aggregated data from all shards.
 * Cycles through different status messages.
 * @param {import('discord.js').Client} client The Discord.js client instance.
 */
async function updateBotStatus(client) {
    try {
        // Use client.cluster.broadcastEval to execute code on all managed clusters/shards.
        // This gathers relevant data (guilds, users, ping) from each active shard.
        const results = await client.cluster.broadcastEval(c => {
            // Optional chaining (?.) and nullish coalescing (||) for robustness
            // in case client.shard or client.guilds.cache isn't fully initialized.
            const guildsCacheSize = c.guilds.cache?.size || 0;
            const usersCount = c.guilds.cache?.reduce((acc, guild) => acc + (guild.memberCount || 0), 0) || 0;
            const wsPing = c.ws?.ping || 0;

            return {
                guildsSize: guildsCacheSize,
                usersCount: usersCount,
                wsPing: wsPing,
                active: true // Indicate this shard is active
            };
        });

        // Filter out any null/undefined results from unresponsive shards
        const activeResults = results.filter(res => res && res.active);

        // Aggregate the data from all active shards
        const totalGuilds = activeResults.reduce((acc, res) => acc + res.guildsSize, 0);
        const totalUsers = activeResults.reduce((acc, res) => acc + res.usersCount, 0);
        const avgPing = activeResults.length > 0
            ? (activeResults.reduce((acc, res) => acc + res.wsPing, 0) / activeResults.length).toFixed(0)
            : 'N/A'; // Handle case with no active shards

        // Get the total number of shards configured in your ClusterManager
        const totalConfiguredShards = client.cluster?.totalShards ?? activeResults.length ?? 1;

        // Define an array of status messages to cycle through
        const statusMessages = [
            `📡 Serving ${totalGuilds} servers!`,                 
            `⚙️ Handling ${totalGuilds} servers!`,               
            `👀 Watching ${totalUsers} members!`,
            `🔔 Notifying ${totalGuilds} servers!`,                 
            `📨 Notifying ${totalUsers} members!`,              
            `🏓 Ping: ${avgPing}ms`,                             
            `🧩 Shards: ${activeResults.length}/${totalConfiguredShards}`, 
            `⏱️ Uptime: ${formatUptime(process.uptime())}`, 
            `👨‍💻 Developed by AGarden Bot Team`,

            // Cool/fun additions:
            `🌱 Growing gardens everywhere!`,
            `🛠️ Updating stocks in real time`,
            `💡 Type /help to get started!`,
            `🧪 Brewing new features...`,
            `😴 Restocking soon... stay tuned!`,
            `🧑‍🌾 Helping farmers farm better`,
            `🔄 Syncing with nature`
        ];

        // Get the current status text from the array and then increment the index
        // The modulo operator ensures it wraps around to 0 when it reaches the end of the array.
        const statusText = statusMessages[currentStatusIndex];
        currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;

        // Set the bot's activity (presence)
        // ActivityType.Watching is a common choice for status messages.
        await client.user.setActivity(statusText, { type: ActivityType.Watching });

        console.log(`[Status Updater] Bot status updated to: "${statusText}"`);

    } catch (error) {
        console.error('[Status Updater] Error updating bot status:', error);
        // Fallback status if aggregation fails or there's an IPC error
        await client.user.setActivity('Experiencing issues...', { type: ActivityType.Playing });
    }
}

module.exports = updateBotStatus;