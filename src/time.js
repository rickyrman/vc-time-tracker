function optionValue(interaction, name) {
  const options = interaction.data?.options || [];
  return options.find((option) => option.name === name)?.value ?? 0;
}

function secondsFromOptions(interaction) {
  const hours = Number(optionValue(interaction, "hours") || 0);
  const minutes = Number(optionValue(interaction, "minutes") || 0);
  return Math.max(0, Math.floor(hours * 3600 + minutes * 60));
}

function formatDuration(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const totalHours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (totalHours === 0 && minutes === 0) return "0m";
  if (totalHours === 0) return `${minutes}m`;
  if (minutes === 0) return `${totalHours}h`;
  return `${totalHours}h ${minutes}m`;
}

module.exports = {
  secondsFromOptions,
  formatDuration
};
