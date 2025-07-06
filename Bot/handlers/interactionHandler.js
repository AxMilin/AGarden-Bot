const Notify = require('../models/Notify');

module.exports = async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    // ✅ Only handle the relevant custom IDs
    if (!['select_seeds', 'select_gears', 'select_egg'].includes(interaction.customId)) return;

    const categories = {
        select_seeds: 'seeds',
        select_gears: 'gears',
        select_egg: 'eggs',
    };

    const category = categories[interaction.customId];
    if (!category) return;

    await interaction.deferReply({ ephemeral: true });

    const selectedValues = interaction.values;

    await Notify.findOneAndUpdate(
        { userId: interaction.user.id },
        { [category]: selectedValues },
        { upsert: true, new: true }
    );

    await interaction.editReply({ content: `✅ Preferences saved for **${category}**.` });
};
