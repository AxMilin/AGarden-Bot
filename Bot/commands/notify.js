const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const {
    seeds,
    gear,
    eggs,
    EggEmoji,
    SeedsEmoji,
    GearEmoji,
} = require('../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notify')
        .setDescription('Set your item notification preferences'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const seedOptions = seeds.map(s => ({
          label: s,
          value: s.toLowerCase().replace(/ /g, '_'),
          emoji: SeedsEmoji[s] ? { name: SeedsEmoji[s] } : undefined,
        }));

        const gearOptions = gear.map(g => ({
          label: g,
          value: g.toLowerCase().replace(/ /g, '_'),
          emoji: GearEmoji[g] ? { name: GearEmoji[g] } : undefined,
        }));

        const eggOptions = eggs.map(e => ({
          label: e,
          value: e.toLowerCase().replace(/ /g, '_'),
          emoji: EggEmoji[e] ? { name: EggEmoji[e] } : undefined,
        }));

        const seedSelect = new StringSelectMenuBuilder()
            .setCustomId('select_seeds')
            .setPlaceholder('🌱 Select seeds')
            .setMinValues(0)
            .setMaxValues(seedOptions.length)
            .addOptions(seedOptions);

        const gearSelect = new StringSelectMenuBuilder()
            .setCustomId('select_gears')
            .setPlaceholder('⚙️ Select gears')
            .setMinValues(0)
            .setMaxValues(gearOptions.length)
            .addOptions(gearOptions);

        const eggSelect = new StringSelectMenuBuilder()
            .setCustomId('select_egg')
            .setPlaceholder('🥚 Select eggs')
            .setMinValues(0)
            .setMaxValues(eggOptions.length)
            .addOptions(eggOptions);

        const row1 = new ActionRowBuilder().addComponents(seedSelect);
        const row2 = new ActionRowBuilder().addComponents(gearSelect);
        const row3 = new ActionRowBuilder().addComponents(eggSelect);

        await interaction.editReply({
            content: 'Choose your 🌱 seed, ⚙️ gear, and 🥚 egg notifications:',
            components: [row1, row2, row3],
        });
    },
};