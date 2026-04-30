require("dotenv").config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { commands } = require("./commands");

const applicationId = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !token) {
  console.error("Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN in environment variables.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  console.log("Registering global user-install commands...");
  await rest.put(
    Routes.applicationCommands(applicationId),
    { body: commands }
  );
  console.log("Done. Discord global commands can take a few minutes to appear.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
