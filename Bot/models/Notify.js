const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const notifySchema = new Schema({
    userId: String,
    seeds: { type: [String], default: [] },
    gears: { type: [String], default: [] },
    eggs: { type: [String], default: [] },
    lastSentAt: Date,
});

module.exports = model('Notify', notifySchema);