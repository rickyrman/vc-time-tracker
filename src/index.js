require("dotenv").config();

const express = require("express");
const { verifyKeyMiddleware, InteractionType, InteractionResponseType } = require("discord-interactions");
const { getUser, setUsername, setActiveStart, addSeconds, clearActive, getLeaderboard } = require("./db");
const { secondsFromOptions, formatDuration } = require("./time");

const app = express();
const publicKey = process.env.DISCORD_PUBLIC_KEY;

if (!publicKey) {
  console.error("Missing DISCORD_PUBLIC_KEY in environment variables.");
  process.exit(1);
}

function reply(content) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content }
  };
}

function getActorId(interaction) {
  return interaction.user?.id || interaction.member?.user?.id;
}

function getActorName(interaction) {
  return interaction.user?.username || interaction.member?.user?.username || "Unknown";
}

function getLocation(interaction) {
  // context: 0 = guild, 1 = bot DM, 2 = private/group DM
  const context = interaction.context;
  const channelName = interaction.channel?.name;
  const channelType = interaction.channel?.type;

  // Channel types: 1 = DM, 3 = Group DM, 0/2/4/etc = server channels
  if (channelType === 1) return "DM";
  if (channelType === 3) {
    return channelName ? `Group DM: ${channelName}` : "Group DM";
  }
  if (context === 0 && channelName) return `Server: #${channelName}`;
  if (context === 0) return "Server";
  return "DM";
}

app.get("/", (_req, res) => {
  res.send("VC Time Tracker is running.");
});

app.post("/interactions", verifyKeyMiddleware(publicKey), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return res.send(reply("I only handle slash commands."));
  }

  const userId = getActorId(interaction);
  const username = getActorName(interaction);
  const command = interaction.data.name;

  if (!userId) {
    return res.send(reply("I couldn't identify your Discord user."));
  }

  const user = getUser(userId);
  setUsername(userId, username);
  const now = Date.now();

  try {
    if (command === "checkin") {
      if (user.active_start_ms) {
        const activeSeconds = Math.floor((now - user.active_start_ms) / 1000);
        return res.send(reply(`You're already checked in. Current session: **${formatDuration(activeSeconds)}**.`));
      }

      const backdateSeconds = secondsFromOptions(interaction);
      const startMs = now - backdateSeconds * 1000;
      const location = getLocation(interaction);
      setActiveStart(userId, startMs, location);

      if (backdateSeconds > 0) {
        return res.send(reply(`Checked in from **${location}**. I counted you as starting **${formatDuration(backdateSeconds)}** ago.`));
      }

      return res.send(reply(`Checked in from **${location}**. Timer started.`));
    }

    if (command === "checkout") {
      if (!user.active_start_ms) {
        return res.send(reply("You're not checked in right now."));
      }

      const sessionSeconds = Math.max(0, Math.floor((now - user.active_start_ms) / 1000));
      addSeconds(userId, sessionSeconds);
      clearActive(userId);

      const updated = getUser(userId);
      return res.send(reply(`Checked out. Added **${formatDuration(sessionSeconds)}**. Total VC time: **${formatDuration(updated.total_seconds)}**.`));
    }

    if (command === "forgotcheckout") {
      const removeSeconds = secondsFromOptions(interaction);

      if (removeSeconds <= 0) {
        return res.send(reply("Tell me how much to remove, like `/forgotcheckout hours:1 minutes:30`."));
      }

      addSeconds(userId, -removeSeconds);
      const updated = getUser(userId);

      return res.send(reply(`Removed **${formatDuration(removeSeconds)}**. New total: **${formatDuration(updated.total_seconds)}**.`));
    }

    if (command === "vctime") {
      const updated = getUser(userId);
      let message = `Total saved VC time: **${formatDuration(updated.total_seconds)}**.`;

      if (updated.active_start_ms) {
        const activeSeconds = Math.max(0, Math.floor((now - updated.active_start_ms) / 1000));
        message += `\nCurrent session: **${formatDuration(activeSeconds)}**.`;
        message += `\nTotal including current session: **${formatDuration(updated.total_seconds + activeSeconds)}**.`;
      } else {
        message += "\nNo active session right now.";
      }

      if (updated.last_location) {
        message += `\nLast checked in from: **${updated.last_location}**.`;
      }

      return res.send(reply(message));
    }

    if (command === "leaderboard") {
      const rows = getLeaderboard(10);

      if (rows.length === 0) {
        return res.send(reply("No one has any VC time yet. Use `/checkin` to start tracking!"));
      }

      const medals = ["🥇", "🥈", "🥉"];
      const lines = rows.map((row, i) => {
        const medal = medals[i] || `**${i + 1}.**`;
        const name = row.username || `User ${row.user_id}`;
        return `${medal} **${name}** — ${formatDuration(row.total_seconds)}`;
      });

      return res.send(reply(`🏆 **VC Time Leaderboard**\n\n${lines.join("\n")}`));
    }

    return res.send(reply("Unknown command."));
  } catch (error) {
    console.error(error);
    return res.send(reply("Something went wrong. Check Railway logs."));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`VC Time Tracker listening on port ${port}`);
});
