const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const {
  seeds,
  gear,
  eggs,
  EggEmoji,
  SeedsEmoji,
  GearEmoji,
} = require("../utils/helpers");

// helper to chunk arrays evenly
function splitEvenly(arr, maxPerChunk = 25) {
  if (arr.length <= maxPerChunk) return [arr];
  const numChunks = Math.ceil(arr.length / maxPerChunk);
  const avgSize = Math.ceil(arr.length / numChunks);
  const chunks = [];
  for (let i = 0; i < arr.length; i += avgSize) {
    chunks.push(arr.slice(i, i + avgSize));
  }
  return chunks;
}

// helper to build a select menu
function buildSelectMenus(options, idBase, placeholderBase, emoji) {
  const chunks = splitEvenly(options);
  return chunks.map((chunk, i) => {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`${idBase}_${i + 1}`)
      .setPlaceholder(
        `${placeholderBase}${chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : ""}`
      )
      .setMinValues(0)
      .setMaxValues(chunk.length)
      .addOptions(
        chunk.map((item) => ({
          label: item,
          value: item.toLowerCase().replace(/ /g, "_"),
          emoji: emoji[item] ? { name: emoji[item] } : undefined,
        }))
      );
    return new ActionRowBuilder().addComponents(select);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("notify")
    .setDescription("Set your item notification preferences"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const seedRows = buildSelectMenus(seeds, "select_seeds", "🌱 Select seeds", SeedsEmoji);
    const gearRows = buildSelectMenus(gear, "select_gears", "⚙️ Select gears", GearEmoji);
    const eggRows = buildSelectMenus(eggs, "select_eggs", "🥚 Select eggs", EggEmoji);

    await interaction.editReply({
      content: "Choose your 🌱 seeds, ⚙️ gear, and 🥚 egg notifications:",
      components: [...seedRows, ...gearRows, ...eggRows],
    });
  },
};
