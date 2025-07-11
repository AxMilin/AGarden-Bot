const { Shard } = require('discord-cross-hosting');
const { Cluster, getInfo } = require('discord-hybrid-sharding');
const { Client, GatewayIntentBits, Partials, REST, Routes, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');

const { DISCORD_BOT_TOKEN, CLIENT_ID, MONGO_URI } = require('./config');

// Handlers
const interactionHandler = require('./handlers/interactionHandler');

// Scheduled Tasks
const stockNotifier = require('./tasks/stockNotifier');
const weatherNotifier = require('./tasks/weatherNotifier');
const eggNotifier = require('./tasks/eggNotifier');
const userNotifier = require('./tasks/userNotifier');
const cleanInvalidTargets = require('./tasks/cleanInvalidTargets');
const updateBotStatus = require('./tasks/statusUpdater');

// Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // for slash commands, roles, channels
        GatewayIntentBits.GuildMessages,    // for responding to interactions, embeds, etc.
        GatewayIntentBits.DirectMessages,   // if your bot DMs users (e.g. for stock notifications)
        // GatewayIntentBits.MessageContent // ❌ not needed (you're using slash commands)
    ],
    partials: [
        Partials.Channel                     // required to receive DMs (if you send DM notifs)
    ],
    shards: Cluster.shardList, // An Array of Shard list, which will get spawned
    shardCount: Cluster.totalShards, // The Number of Total Shards
});

client.cluster = new Cluster.Client(client); // Corrected: Use the destructured ClusterClient directly
client.machine = new Shard(client.cluster); // Pass the raw discord.js client instance

// Store commands in a Collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commandsForRegistration = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsForRegistration.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Discord API setup for Slash Commands
const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commandsForRegistration.length} application (/) commands.`);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsForRegistration });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error reloading application commands:', error);
    }
})();

// MongoDB Connect
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('🟢 MongoDB connected'))
    .catch(err => console.error('🔴 MongoDB error', err));

// Interaction Handler
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            // Pass the client object to the execute function if needed (e.g., for 'status' command)
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    } else if (interaction.isStringSelectMenu()) {
        await interactionHandler(interaction);
    }
});

// Timer Loop Helper
const startSyncedInterval = (fn, intervalMs, clientInstance) => { // Added clientInstance parameter
    const delay = intervalMs - (Date.now() % intervalMs);

    setTimeout(() => {
        // after the 'delay' for syncing.
        setTimeout(() => fn(clientInstance), 60 * 1000); // <-- This now correctly passes clientInstance

        setInterval(() => {
            setTimeout(() => fn(clientInstance), 60 * 1000); // <-- This also correctly passes clientInstance
        }, intervalMs);
    }, delay);
};

// Start Intervals
client.once('ready', () => {
    // console.clear();
    console.log('==============================');
    console.log('✅ AGarden Bot is now online!');
    console.log(`👤 Logged in as: ${client.user.tag} (ID: ${client.user.id})`);
    console.log('==============================');

    // Run initial cleanup on startup
    cleanInvalidTargets(client, ({ type, id, serverId, error }) => {
        console.log(`[🧹] Deleted invalid ${type}: ${id} (Server: ${serverId || 'N/A'}) - Error: ${error}`);
    });

    // Schedule periodic tasks
    startSyncedInterval(cleanInvalidTargets, 60 * 60 * 1000, client); // <--- This 'client' must be your Discord.js Client instance
    startSyncedInterval(userNotifier, 5 * 60 * 1000, client);
    startSyncedInterval(stockNotifier, 5 * 60 * 1000, client);
    startSyncedInterval(weatherNotifier, 5 * 60 * 1000, client);
    startSyncedInterval(eggNotifier, 30 * 60 * 1000, client);
    
    startSyncedInterval(updateBotStatus, 30 * 1000, client);
});

client.on('ready', () => {
    client.machine
        .broadcastEval(`this.guilds.cache.size`)
        .then(results => {
            console.log(results);
        })
        .catch(e => console.log(e)); // broadcastEval() over all cross-hosted clients
});

// Bot Login
client.login(DISCORD_BOT_TOKEN);