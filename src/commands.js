const { ApplicationCommandOptionType } = require("discord-api-types/v10");

const USER_INSTALL = 1;
const BOT_DM = 1;
const PRIVATE_CHANNEL = 2;

const commandBase = {
  integration_types: [USER_INSTALL],
  contexts: [BOT_DM, PRIVATE_CHANNEL]
};

const timeOptions = [
  {
    name: "hours",
    description: "Hours to adjust",
    type: ApplicationCommandOptionType.Integer,
    min_value: 0,
    required: false
  },
  {
    name: "minutes",
    description: "Minutes to adjust",
    type: ApplicationCommandOptionType.Integer,
    min_value: 0,
    max_value: 59,
    required: false
  }
];

const commands = [
  {
    ...commandBase,
    name: "checkin",
    description: "Start tracking your current call time",
    options: timeOptions
  },
  {
    ...commandBase,
    name: "checkout",
    description: "Stop tracking and save your current call time"
  },
  {
    ...commandBase,
    name: "forgotcheckout",
    description: "Remove time if you forgot to checkout",
    options: timeOptions
  },
  {
    ...commandBase,
    name: "vctime",
    description: "See your saved VC time and current session"
  }
];

module.exports = {
  commands
};
