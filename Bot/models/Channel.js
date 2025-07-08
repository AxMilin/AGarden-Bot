const { Schema, model } = require('mongoose');

const channelSchema = new Schema({
    serverId: String,
    channelId: String,
    type: String, // 'stock', 'weather', or 'egg'
    alertRoles: { // New field for storing item-specific roles
        type: Map, // Use Map to store flexible key-value pairs (item name -> role ID)
        of: String // Values will be role IDs (strings)
    },
    lastSentAt: Date,
});

module.exports = model('Channel', channelSchema);
