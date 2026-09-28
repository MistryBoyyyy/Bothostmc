# 🎮 RIZOKMC — Premium Minecraft Discord Bot

All-in-one bot for `play.rizokmc.fun` — security, moderation, welcome system, invite tracking,
giveaways, tickets, ranks, timers, leaderboards, premium animated emojis & banners.

## ✨ Features
- 🛡️ Anti-nuke + AutoMod (antilink, antiinvite, antibadwords, anticaps, antispam)
- 👋 Premium animated welcome banners + invite tracking + auto-roles
- 🎁 Giveaways, 🎟️ Tickets (RizokMC Support), ⏰ Timers, 📊 Leaderboards
- 🎵 Music: /play (YouTube search/link), /music skip|pause|resume|stop|queue|np|volume — yt-dlp engine, auto-downloads yt-dlp binary on first use
- 41 slash commands, chat "ip" auto-reply, full staff permission roles

## 🚀 Railway pe deploy (5 minute)

1. **GitHub** — github.com → *New repository* (naam: `rizokmc-bot`) → **"uploading an existing file"** →
   zip ke andar ke **saare files/folders** drag-drop karke *Commit changes* dabao.
2. **Railway** — railway.app → GitHub se login → **New Project → Deploy from GitHub repo** →
   `rizokmc-bot` select karo.
3. **Token** — Railway service → **Variables** tab → **New Variable**:
   - Name: `DISCORD_TOKEN`
   - Value: apna bot token (Discord Developer Portal → Application → Bot → Reset Token → copy)
4. **Deploy** — upar se **Deploy** dabao. Railway khud `npm install` + start karega → bot 24/7 online 🟢

## ⚠️ Zaroori baatein
- Railway pe bot online hote hi **purani copy band kar dena** warna double replies aayenge.
- `.env` aur `node_modules` zip me nahi hain (security) — Railway Variables se token leta hai.
- `data/` folder me server config + premium emoji IDs hain — isko repo me zaroor rakhna.

## 🖥️ Local run (optional)
```
npm install
cp .env.example .env   # token daalo
npm start
```
