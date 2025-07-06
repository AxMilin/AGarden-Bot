const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const lockSchema = new Schema({
  name: { type: String, unique: true, required: true },
  lockedAt: { type: Date, default: null },
  expiresAt: { type: Date },
});

module.exports = model('Lock', lockSchema);
