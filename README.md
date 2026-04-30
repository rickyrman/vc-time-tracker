# VC Time Tracker Discord App for Railway

This is a Railway-ready Discord app that works in DMs and group DMs using manual slash-command tracking.

## Commands

- `/checkin` starts your timer
- `/checkin hours:X minutes:Y` starts your timer as if you joined earlier
- `/checkout` stops your timer and saves the time
- `/forgotcheckout hours:X minutes:Y` removes time from your total
- `/vctime` shows total saved time and your current session if active

## 1. Create the Discord app

1. Go to the Discord Developer Portal.
2. Click **New Application**.
3. Name it something like `VC Time Tracker`.
4. Open **General Information**.
5. Copy:
   - **Application ID**
   - **Public Key**

## 2. Create a bot token

1. Go to **Bot**.
2. Click **Reset Token** or **View Token**.
3. Copy the bot token.
4. Keep it private.

## 3. Enable user install

1. Go to **Installation**.
2. Under **Installation Contexts**, enable:
   - **User Install**
3. You may leave **Guild Install** on too, but this project is built for user install.
4. Under install link/scopes, make sure these scopes are available:
   - `applications.commands`

## 4. Deploy on Railway

1. Go to Railway.
2. Create a new project.
3. Choose **Deploy from GitHub repo** or upload this project.
4. Add these Railway variables:

```env
DISCORD_APPLICATION_ID=your_application_id
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_BOT_TOKEN=your_bot_token
DATABASE_PATH=./data/vctime.sqlite
```

Railway automatically provides `PORT`, so you do not need to add it.

## 5. Add a Railway volume if you want saved time to survive redeploys

SQLite is a file database. On Railway, add a volume if you want the database file to persist safely.

Recommended:

```env
DATABASE_PATH=/data/vctime.sqlite
```

Then mount a Railway volume at:

```txt
/data
```

If you skip this, the app can still work, but saved time may reset after redeploys.

## 6. Set the Discord Interactions Endpoint URL

After Railway deploys, copy your Railway public domain.

Your endpoint URL should be:

```txt
https://YOUR-RAILWAY-DOMAIN.up.railway.app/interactions
```

Put that in Discord Developer Portal:

1. Open your app.
2. Go to **General Information**.
3. Paste the URL into **Interactions Endpoint URL**.
4. Save changes.

If Discord says the endpoint is invalid, check:
- Railway app is deployed
- `DISCORD_PUBLIC_KEY` is correct
- URL ends with `/interactions`

## 7. Register slash commands

In Railway:

1. Open your service.
2. Go to the shell/terminal if available, or run a one-off command.
3. Run:

```bash
npm run register
```

You should see:

```txt
Registering global user-install commands...
Done.
```

Discord global commands may take a few minutes to appear.

## 8. Install the app to your Discord account

1. Go to Discord Developer Portal.
2. Open your app.
3. Go to **Installation**.
4. Copy the user install link.
5. Open it in your browser.
6. Authorize the app to your account.

Now try the commands inside:
- A DM
- A group DM

## Important

This does not automatically detect Discord call join/leave events. Discord does not expose group DM voice call tracking to bots like that. This app uses manual check-in/check-out slash commands, which is the safe workaround.
