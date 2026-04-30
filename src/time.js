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
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length) parts.push("0m");
  return parts.join(" ");
}

module.exports = {
  secondsFromOptions,
  formatDuration
};
