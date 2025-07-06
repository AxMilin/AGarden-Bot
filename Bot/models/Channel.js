const { Schema, model } = require('mongoose');

const channelSchema = new Schema({
    serverId: String,
    channelId: String,
    type: String, // 'stock', 'weather', or 'egg'
    lastSentAt: Date,
});

module.exports = model('Channel', channelSchema);