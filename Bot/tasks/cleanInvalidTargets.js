const Channel = require('../models/Channel');
const Notify = require('../models/Notify');
const { DiscordAPIError } = require('discord.js'); // Import DiscordAPIError for better error checking

// Helper function to pause execution (useful if you decide to add pauses for very large cleanups)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (client, logFn = () => {}) => {
    // Get the current shard ID and total shard count
    const shardId = client.shard ? client.shard.ids[0] : 0; // Default to 0 if no sharding
    const shardCount = client.shard ? client.shard.count : 1; // Default to 1 if no sharding

    console.log(`[🧹] Cleaning invalid targets on Shard ${shardId}/${shardCount}...`);

    // --- Clean Channels (Shard-Aware) ---
    // Get all guild IDs managed by the current shard.
    // If not sharded, this will include all cached guilds (which is typically all for a non-sharded bot).
    const guildIdsOnThisShard = client.guilds.cache.map(guild => guild.id);

    let channelsToClean = [];
    if (guildIdsOnThisShard.length === 0 && client.shard) { // Only log if sharded and no guilds on this specific shard
        console.log(`[🧹] Shard ${shardId}: No guilds managed by this shard. Skipping channel cleanup.`);
    } else {
        // Fetch only channels associated with guilds managed by this shard
        channelsToClean = await Channel.find({
            serverId: { $in: guildIdsOnThisShard }
        });
        console.log(`[🧹] Shard ${shardId}: Found ${channelsToClean.length} channels to verify for its guilds.`);
    }

    let channelsCleaned = 0;

    for (const { serverId, channelId } of channelsToClean) {
        let channelIsInvalid = false;
        let errorMessage = '';
        let messageForOwner = null; // This will hold the message if we need to notify the owner

        try {
            const channel = await client.channels.fetch(channelId); // Fetch the channel details

            // Case 1: Channel no longer exists on Discord
            if (!channel) {
                channelIsInvalid = true;
                errorMessage = 'Channel not found on Discord.';
            }
            // Case 2: Channel exists, but it's not a guild channel (e.g., DM or Group DM)
            else if (!channel.guild) {
                channelIsInvalid = true;
                errorMessage = 'Channel is not a guild channel (e.g., DM or Group DM).';
            }
            // Case 3: Bot cannot view the channel (e.g., Missing Access error, private channel without permissions)
            else if (!channel.viewable) {
                channelIsInvalid = true;
                errorMessage = 'Bot cannot view channel (Missing Access).';
                messageForOwner = `The channel <#${channelId}> was removed from our system because I no longer have permission to **view** it in your server. Please ensure I have appropriate permissions and use \`/setup\` again to reconfigure.`;
            }
            // Case 4: Channel exists and is viewable, but bot cannot send messages in it (if it's a text-based channel)
            else if (channel.isTextBased() && !channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
                channelIsInvalid = true;
                errorMessage = 'Bot cannot send messages in channel (Missing SEND_MESSAGES permission).';
                messageForOwner = `The channel <#${channelId}> was removed from our system because I no longer have permission to **send messages** in it. Please ensure I have appropriate permissions and use \`/setup\` again to reconfigure.`;
            }

        } catch (err) {
            // General error catching during fetch (e.g., channel deleted, bot kicked from guild)
            channelIsInvalid = true;
            if (err instanceof DiscordAPIError) {
                if (err.code === 10003) { // Unknown Channel
                    errorMessage = 'Channel not found on Discord (API Error 10003).';
                } else if (err.code === 50001) { // Missing Access / Cannot see guild or channel
                    errorMessage = 'Bot missing access to guild/channel (API Error 50001).';
                    messageForOwner = `The channel <#${channelId}> was removed from our system because I no longer have permission to **view** it in your server. Please ensure I have appropriate permissions and use \`/setup\` again to reconfigure.`;
                } else {
                    errorMessage = `Discord API Error: ${err.code} - ${err.message}`;
                }
            } else {
                errorMessage = `General error fetching channel: ${err.message}`;
            }
        }

        // If the channel is deemed invalid for any reason, clean it up
        if (channelIsInvalid) {
            logFn({
                type: 'channel',
                id: channelId,
                serverId,
                error: errorMessage,
            });

            // Delete the invalid channel from your database
            await Channel.deleteOne({ serverId, channelId });
            channelsCleaned++;
            console.log(`[🧹] Shard ${shardId}: Cleaned invalid channel ${channelId} from server ${serverId}. Reason: ${errorMessage}`);


            // If there's a specific message for the server owner, try to send it
            if (messageForOwner) {
                try {
                    const guild = await client.guilds.fetch(serverId);
                    if (guild) {
                        const owner = await guild.fetchOwner(); // Fetch the GuildMember object for the owner
                        const ownerUser = owner?.user; // Get the User object from the GuildMember

                        if (ownerUser) {
                            try {
                                await ownerUser.send(messageForOwner);
                                console.log(`[🧹] Shard ${shardId}: Sent DM to owner ${ownerUser.tag} of "${guild.name}" about channel ${channelId}.`);
                            } catch (dmErr) {
                                console.warn(`[🧹] Shard ${shardId}: Could not DM owner ${ownerUser.tag} of "${guild.name}" (${guild.id}): ${dmErr.message}`);
                                // Fallback: Try to send in a system channel or a generally accessible channel
                                if (guild.systemChannel && guild.systemChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {
                                    await guild.systemChannel.send(`${ownerUser.toString()}, ${messageForOwner}`); // Tag owner in public channel
                                    console.log(`[🧹] Shard ${shardId}: Sent message in system channel of "${guild.name}" about channel ${channelId}.`);
                                } else {
                                    console.warn(`[🧹] Shard ${shardId}: No suitable public channel to send message in "${guild.name}" (${guild.id}) about channel ${channelId}.`);
                                }
                            }
                        } else {
                            console.warn(`[🧹] Shard ${shardId}: Could not determine owner user for guild "${guild.name}" (${guild.id}) to send message.`);
                        }
                    } else {
                        console.warn(`[🧹] Shard ${shardId}: Guild ${serverId} not found on Discord to send owner message.`);
                    }
                } catch (guildErr) {
                    console.warn(`[🧹] Shard ${shardId}: Error fetching guild ${serverId} or its owner to send message: ${guildErr.message}`);
                }
            }
        }
    }
    console.log(`[🧹] Shard ${shardId}: Channels cleanup done. Cleaned: ${channelsCleaned}.`);

    // --- Clean Users (Shard-Aware) ---
    const allUsers = await Notify.find(); // Fetch all users from the DB
    console.log(`[🧹] Shard ${shardId}: Fetched ${allUsers.length} total users for DM cleanup.`);

    // Filter users so each shard only processes its assigned subset
    const usersForThisShard = allUsers.filter(user => {
        // Convert userId to BigInt to handle large Discord IDs reliably
        return (BigInt(user.userId) % BigInt(shardCount)) === BigInt(shardId);
    });
    console.log(`[🧹] Shard ${shardId}: Responsible for ${usersForThisShard.length} users for DM cleanup.`);


    let usersCleaned = 0;

    for (const { userId } of usersForThisShard) {
        let userIsInvalid = false;
        let errorMessage = ''; // Variable to store a more specific error message

        try {
            const user = await client.users.fetch(userId); // Fetch the user details
            if (!user) {
                // If fetch returns null, it's a "User not found" scenario
                userIsInvalid = true;
                errorMessage = 'User not found on Discord.';
            } else {
                // Attempt to create DM. This will throw if DMs are closed or bot is blocked.
                await user.createDM();
            }
        } catch (err) {
            userIsInvalid = true; // Mark user as invalid regardless of the specific error
            if (err instanceof DiscordAPIError) {
                if (err.code === 10003) { // DiscordAPIError: Unknown User
                    errorMessage = 'User not found on Discord (API Error 10003).';
                } else if (err.code === 50007) { // DiscordAPIError: Cannot send messages to this user
                    errorMessage = 'Cannot send messages to user (DMs closed or bot blocked - API Error 50007).';
                } else {
                    errorMessage = `Discord API Error: ${err.code} - ${err.message}`;
                }
            } else {
                // Other unexpected errors
                errorMessage = `General error fetching user or creating DM: ${err.message}`;
            }
        }

        if (userIsInvalid) {
            logFn({
                type: 'user',
                id: userId,
                error: errorMessage, // Use the specific error message
            });
            await Notify.deleteOne({ userId }); // Delete the user from your database
            usersCleaned++;
            console.log(`[🧹] Shard ${shardId}: Cleaned invalid user ${userId} from DM notifications. Reason: ${errorMessage}`);
        }
    }
    console.log(`[🧹] Shard ${shardId}: Users cleanup done. Cleaned: ${usersCleaned}.`);

    console.log(`[🧹] Shard ${shardId}: Total cleanup cycle completed.`);
};
