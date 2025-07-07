const Lock = require('../models/Lock');

async function acquireLock(lockName, lockTimeoutMs) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + lockTimeoutMs);

  // Try update first
  const updateResult = await Lock.findOneAndUpdate(
    {
      name: lockName,
      $or: [
        { expiresAt: { $lt: now } },  // expired lock
        { expiresAt: null }          // no expiry set
      ]
    },
    {
      $set: {
        lockedAt: now,
        expiresAt
      }
    },
    {
      new: true
    }
  );

  if (updateResult) {
    return true; // Lock updated (acquired)
  }

  // Try insert if no lock was available to update
  try {
    await Lock.create({
      name: lockName,
      lockedAt: now,
      expiresAt
    });
    return true; // Lock created
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate means another process created it first
      return false;
    }
    throw err; // Unexpected error
  }
}

module.exports = {
    acquireLock,
};