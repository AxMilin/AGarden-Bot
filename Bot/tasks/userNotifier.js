const Notify = require('../models/Notify'); // Your model for user DM preferences
const { fetchStockData } = require('../utils/api'); // Function to fetch stock data
const { SeedsEmoji, GearEmoji, EggEmoji } = require('../utils/helpers'); 
const Lock = require('../models/Lock'); // Adjust path as needed

async function acquireLock(lockName, lockTimeoutMs) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + lockTimeoutMs);

  const updateResult = await Lock.findOneAndUpdate(
    {
      name: lockName,
      $or: [
        { expiresAt: { $lt: now } },  // expired lock
        { expiresAt: null }           // no expiry set
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

  try {
    await Lock.create({
      name: lockName,
      lockedAt: now,
      expiresAt
    });
    return true; // Lock created
  } catch (err) {
    if (err.code === 11000) {
      return false; // Duplicate lock
    }
    throw err;
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const GROUP_COUNT = 24; // Number of groups for processing DMs within a shard
const PAUSE_BETWEEN_GROUPS_MS = 5 * 1000; // 5 seconds pause between DM groups

const LOCK_NAME = 'dm_stock_notification';
const LOCK_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes lock duration

module.exports = async (client) => {
  const shardId = client.shard ? client.shard.ids[0] : 0;
  const shardCount = client.shard ? client.shard.count : 1;

  const gotLock = await acquireLock(LOCK_NAME, LOCK_TIMEOUT_MS);
  if (!gotLock) {
    console.log(`[✉️] Shard ${shardId}: Lock not acquired, skipping notification.`);
    return;
  }

  console.log(`[✉️] Shard ${shardId}: Lock acquired, running notification job.`);

  if (client.shard) {
    console.log(`[🚀] Bot is running in sharded mode. Current Shard: ${shardId}/${shardCount}`);
  } else {
    console.log(`[⚙️] Bot is running in non-sharded mode.`);
  }
  console.log(`[✉️] DM Stock Notifier running on Shard ${shardId}/${shardCount}...`);

  try {
    const users = await Notify.find({});
    console.log(`[✉️] Shard ${shardId}: Fetched ${users.length} total users from DB.`);

    const fetchedData = await fetchStockData();
    if (!fetchedData || !fetchedData.Data) {
      console.log(`[❌] Shard ${shardId}: No valid stock data fetched or 'Data' key missing. Skipping DM notifications.`);
      return;
    }

    const data = fetchedData.Data;
    const seedsStock = data.seeds?.filter(i => i.stock > 0) || [];
    const gearStock = data.gear?.filter(i => i.stock > 0) || [];
    const eggStock = data.egg?.filter(i => i.stock > 0) || [];

    const now = new Date();
    const currentMinute = now.getMinutes();

    // Determine if we are in egg notification window
    // Allowed minutes: 30-35 OR 0-5
    const eggWindow = (currentMinute >= 30 && currentMinute <= 35) || (currentMinute >= 0 && currentMinute <= 5);

    const usersForThisShard = users.filter(user => 
      (BigInt(user.userId) % BigInt(shardCount)) === BigInt(shardId)
    );

    console.log(`[✉️] Shard ${shardId}: Responsible for ${usersForThisShard.length} users.`);

    const usersToSendDm = [];

    for (const user of usersForThisShard) {
      if (user.lastSentAt && now.getTime() - new Date(user.lastSentAt).getTime() < 5 * 1000) {
        console.log(`[❌] Shard ${shardId}: Skipping DM to ${user.userId} due to recent send.`);
        continue;
      }

      let message = '';

      if (user.seeds && user.seeds.length > 0) {
        const filteredSeeds = seedsStock.filter(s =>
          user.seeds.includes(s.name.toLowerCase().replace(/ /g, '_'))
        );

        if (filteredSeeds.length > 0) {
          message += `🌱 **Seeds In Stock**\n`;
          filteredSeeds.forEach(i => {
            if (!SeedsEmoji[i.name]) console.warn(`[⚠️] Missing emoji for seed: "${i.name}"`);
            message += `${SeedsEmoji[i.name] || ''} x${i.stock} ${i.name}\n`;
          });
        }
      }

      if (user.gears && user.gears.length > 0) {
        const filteredGears = gearStock.filter(g =>
          user.gears.includes(g.name.toLowerCase().replace(/ /g, '_'))
        );

        if (filteredGears.length > 0) {
          message += `🛠️ **Gears In Stock**\n`;
          filteredGears.forEach(i => {
            if (!GearEmoji[i.name]) console.warn(`[⚠️] Missing emoji for gear: "${i.name}"`);
            message += `${GearEmoji[i.name] || '🛠️'} x${i.stock} ${i.name}\n`;
          });
        }
      }

      if (eggWindow && user.eggs && user.eggs.length > 0) {
        const filteredEggs = eggStock.filter(e =>
          user.eggs.includes(e.name.toLowerCase().replace(/ /g, '_'))
        );

        if (filteredEggs.length > 0) {
          message += `🥚 **Eggs In Stock**\n`;
          filteredEggs.forEach(i => {
            if (!EggEmoji[i.name]) console.warn(`[⚠️] Missing emoji for egg: "${i.name}"`);
            message += `${EggEmoji[i.name] || '🥚'} x${i.stock} ${i.name}\n`;
          });
        }
      }

      if (message) {
        usersToSendDm.push({ userId: user.userId, message });
      }
    }

    if (usersToSendDm.length === 0) {
      console.log(`[✉️] Shard ${shardId}: No stock notifications to send via DM this cycle.`);
      return;
    }

    for (let i = usersToSendDm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [usersToSendDm[i], usersToSendDm[j]] = [usersToSendDm[j], usersToSendDm[i]];
    }

    const usersPerGroup = Math.ceil(usersToSendDm.length / GROUP_COUNT);
    console.log(`[✉️] Shard ${shardId}: Will notify ${usersToSendDm.length} users in total. Users per group: ${usersPerGroup}`);

    let successfulDmSends = 0;
    let failedDmSends = 0;

    for (let i = 0; i < GROUP_COUNT; i++) {
      const startIdx = i * usersPerGroup;
      const endIdx = Math.min(startIdx + usersPerGroup, usersToSendDm.length);
      const group = usersToSendDm.slice(startIdx, endIdx);

      if (group.length === 0) {
        console.log(`[✉️] Shard ${shardId}: DM Group ${i + 1} is empty. Skipping.`);
        continue;
      }

      console.log(`[✉️] Shard ${shardId}: Processing DM Group ${i + 1} (${group.length} users)...`);

      const groupDmPromises = group.map(async (user) => {
        try {
          const dmUser = await client.users.fetch(user.userId);
          await dmUser.send(user.message);
          await Notify.updateOne({ userId: user.userId }, { lastSentAt: new Date(now) });
          console.log(`[✅] Shard ${shardId}: DM sent to ${user.userId}.`);
          return true;
        } catch (error) {
          console.log(`[❌] Shard ${shardId}: Failed to send DM to ${user.userId}. Error: ${error.message}`);
          return false;
        }
      });

      const dmGroupResults = await Promise.allSettled(groupDmPromises);
      dmGroupResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value === true) {
          successfulDmSends++;
        } else {
          failedDmSends++;
        }
      });

      const isLastGroup = i >= GROUP_COUNT - 1 || usersToSendDm.length <= (i + 1) * usersPerGroup;
      if (!isLastGroup) {
        console.log(`[⏳] Shard ${shardId}: Pausing for ${PAUSE_BETWEEN_GROUPS_MS / 1000} seconds before next DM group...`);
        await sleep(PAUSE_BETWEEN_GROUPS_MS);
      }
    }

    console.log(`[✉️] Shard ${shardId}: DM Stock Notifier done. ${successfulDmSends} success, ${failedDmSends} skipped/failed.`);

  } catch (err) {
    console.error(`[❌] Shard ${shardId}: Overall DM stock notification error:`, err);
  }
};
