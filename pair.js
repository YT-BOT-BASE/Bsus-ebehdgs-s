const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const router = express.Router();

// Store active sessions
const activeSessions = new Map();
const sessionsDir = path.join(os.tmpdir(), 'sos_sessions');
fs.ensureDirSync(sessionsDir);

// Meta AI API
const META_AI_KEY = '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';

// Command Handler
class CommandHandler {
    constructor(socket, number) {
        this.socket = socket;
        this.number = number;
        this.prefix = '.';
        this.setupListener();
    }

    setupListener() {
        this.socket.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message || msg.key.remoteJid === 'status@broadcast') return;

            const sender = msg.key.remoteJid;
            const messageText = msg.message.conversation || 
                               msg.message.extendedTextMessage?.text || 
                               msg.message.imageMessage?.caption || '';

            if (!messageText.startsWith(this.prefix)) return;

            const args = messageText.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            try {
                await this.handleCommand(command, args, msg, sender);
            } catch (error) {
                console.error('Command error:', error);
            }
        });
    }

    async handleCommand(command, args, msg, sender) {
        // Send reaction
        await this.socket.sendMessage(sender, { react: { text: '⚡', key: msg.key } });

        switch(command) {
            // 🌟 MAIN MENU - Beautiful Wide Menu with Buttons
            case 'menu':
            case 'help': {
                const menuText = `╭══════════════════════╮
║  ✨ SOS MINI LITE ✨  ║
╰══════════════════════╯

▬▬▬▬▬▬▬▬▬▬▬▬▬▬
   📋 MAIN MENU
▬▬▬▬▬▬▬▬▬▬▬▬▬▬

⭐ *GENERAL*
├─ .menu
├─ .alive
├─ .ping
├─ .profile
├─ .owner
├─ .runtime

🤖 *AI & META*
├─ .ai <question>
├─ .meta <question>
├─ .gpt <question>
├─ .imagine <prompt>

📱 *DOWNLOADER*
├─ .yt <song>
├─ .video <url>
├─ .play <song>
├─ .ig <url>
├─ .tt <url>

🎨 *CREATIVE*
├─ .sticker
├─ .toimg
├─ .qr <text>
├─ .short <url>

🌍 *UTILITIES*
├─ .weather <city>
├─ .news
├─ .translate
├─ .weather

⚙️ *SETTINGS*
├─ .autoview
├─ .autolike
├─ .prefix

▬▬▬▬▬▬▬▬▬▬▬▬▬▬
╭──「 📊 STATS 」──╮
│ ⏰ Uptime: Active
│ 🤖 Meta AI: ✅ Online
│ 💗 Version: 2.0.0
╰───────────────╯

> ❤️ *SOS MINI LITE* ❤️
> 👑 Owner: SHANUWA ID`;

                await this.socket.sendMessage(sender, {
                    image: { url: 'https://i.ibb.co/Jt3v8Qc/sos-mini.jpg' },
                    caption: menuText,
                    footer: '⚡ Fast & Reliable ⚡',
                    buttons: [
                        { buttonId: '.alive', buttonText: { displayText: '✨ ALIVE' }, type: 1 },
                        { buttonId: '.ping', buttonText: { displayText: '📡 PING' }, type: 1 },
                        { buttonId: '.owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
                        { buttonId: '.ai help', buttonText: { displayText: '🤖 AI' }, type: 1 },
                        { buttonId: '.sticker', buttonText: { displayText: '🎨 STICKER' }, type: 1 },
                        { buttonId: '.yt', buttonText: { displayText: '🎵 YT' }, type: 1 }
                    ],
                    headerType: 4
                });
                break;
            }

            // ✨ ALIVE - Small and Beautiful with Buttons
            case 'alive': {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                
                const timeNow = moment().tz('Asia/Colombo').format('hh:mm A');
                
                const aliveText = `╭════════════════╮
║  ✨ I'M ALIVE  ║
╰════════════════╯

🤖 *Status:* Online
⏱️ *Uptime:* ${hours}h ${minutes}m
🕐 *Time:* ${timeNow}
💗 *Version:* 2.0.0

> ❤️ SOS MINI LITE`;

                await this.socket.sendMessage(sender, {
                    image: { url: 'https://i.ibb.co/Jt3v8Qc/sos-mini.jpg' },
                    caption: aliveText,
                    footer: '⚡ Ready to serve ⚡',
                    buttons: [
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                        { buttonId: '.ping', buttonText: { displayText: '📡 PING' }, type: 1 },
                        { buttonId: '.owner', buttonText: { displayText: '👑 OWNER' }, type: 1 }
                    ]
                });
                break;
            }

            // 📡 PING - Quick Response with Buttons
            case 'ping': {
                const start = Date.now();
                const pingMsg = await this.socket.sendMessage(sender, { text: '📡 *Pinging...*' });
                const ping = Date.now() - start;

                await this.socket.sendMessage(sender, {
                    text: `╭════════════╮
║  📡 PONG  ║
╰════════════╯

⚡ *Latency:* ${ping}ms
✅ *Status:* Online

> ❤️ SOS MINI LITE`,
                    buttons: [
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                        { buttonId: '.alive', buttonText: { displayText: '✨ ALIVE' }, type: 1 }
                    ]
                });
                break;
            }

            // 👑 OWNER INFO - Small and Sweet
            case 'owner': {
                await this.socket.sendMessage(sender, {
                    image: { url: 'https://i.ibb.co/album/owner.jpg' },
                    caption: `╭════════════╮
║  👑 OWNER  ║
╰════════════╯

🔰 *Name:* SHANUWA ID
🌍 *Country:* Sri Lanka 🇱🇰
📱 *wa.me/94703229057

> ❤️ SOS MINI LITE`,
                    buttons: [
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                        { buttonId: '.alive', buttonText: { displayText: '✨ ALIVE' }, type: 1 }
                    ]
                });
                break;
            }

            // 🤖 META AI - Smart AI Response
            case 'ai':
            case 'meta':
            case 'gpt': {
                const query = args.join(' ');
                if (!query) {
                    return await this.socket.sendMessage(sender, {
                        text: '❌ *Please ask something!*\nExample: .ai What is love?',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }

                await this.socket.sendMessage(sender, { text: '🤔 *Thinking...*' });

                try {
                    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                        model: 'meta-llama/llama-3-8b-instruct',
                        messages: [{ role: 'user', content: query }]
                    }, {
                        headers: {
                            'Authorization': `Bearer ${META_AI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const answer = response.data.choices[0].message.content;

                    await this.socket.sendMessage(sender, {
                        text: `╭═══════════════╮
║  🤖 META AI  ║
╰═══════════════╯

💬 *Q:* ${query}
📝 *A:* ${answer}

> ❤️ SOS MINI LITE`,
                        buttons: [
                            { buttonId: '.ai', buttonText: { displayText: '🤖 ASK AGAIN' }, type: 1 },
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                } catch (error) {
                    await this.socket.sendMessage(sender, {
                        text: '❌ *AI Error*\nPlease try again later.',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }
                break;
            }

            // 🎨 STICKER MAKER
            case 'sticker':
            case 's': {
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                
                if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
                    return await this.socket.sendMessage(sender, {
                        text: '❌ *Reply to an image/video!*',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }

                await this.socket.sendMessage(sender, { text: '🎨 *Creating sticker...*' });

                try {
                    let media;
                    if (quoted.imageMessage) {
                        media = await this.socket.downloadMediaMessage(msg);
                    }

                    await this.socket.sendMessage(sender, {
                        sticker: media
                    });
                } catch (error) {
                    await this.socket.sendMessage(sender, {
                        text: '❌ *Failed to create sticker*',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }
                break;
            }

            // 🎵 YOUTUBE DOWNLOADER
            case 'yt':
            case 'play': {
                const query = args.join(' ');
                if (!query) {
                    return await this.socket.sendMessage(sender, {
                        text: '❌ *Enter song name!*\nExample: .yt Shape of You',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }

                await this.socket.sendMessage(sender, { text: '🎵 *Searching...*' });

                try {
                    const search = await axios.get(`https://yt-search.lol/api/search?q=${encodeURIComponent(query)}`);
                    const video = search.data.videos[0];

                    await this.socket.sendMessage(sender, {
                        image: { url: video.thumbnail },
                        caption: `╭══════════════╮
║  🎵 FOUND  ║
╰══════════════╯

📌 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👤 *Channel:* ${video.author.name}

> ❤️ SOS MINI LITE`,
                        buttons: [
                            { buttonId: '.ytdl ' + video.videoId, buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
                            { buttonId: '.video ' + video.videoId, buttonText: { displayText: '🎬 VIDEO' }, type: 1 },
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                } catch (error) {
                    await this.socket.sendMessage(sender, {
                        text: '❌ *Song not found*',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }
                break;
            }

            // 🌤️ WEATHER
            case 'weather': {
                const city = args.join(' ');
                if (!city) {
                    return await this.socket.sendMessage(sender, {
                        text: '❌ *Enter city name!*\nExample: .weather Colombo',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }

                try {
                    const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`);

                    await this.socket.sendMessage(sender, {
                        text: `╭══════════════╮
║  🌤️ WEATHER  ║
╰══════════════╯

📍 *City:* ${weather.data.name}
🌡️ *Temp:* ${weather.data.main.temp}°C
💧 *Humidity:* ${weather.data.main.humidity}%
🌬️ *Wind:* ${weather.data.wind.speed} m/s

> ❤️ SOS MINI LITE`,
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                            { buttonId: '.alive', buttonText: { displayText: '✨ ALIVE' }, type: 1 }
                        ]
                    });
                } catch (error) {
                    await this.socket.sendMessage(sender, {
                        text: '❌ *City not found*',
                        buttons: [
                            { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                }
                break;
            }

            // DEFAULT
            default: {
                await this.socket.sendMessage(sender, {
                    text: `❌ *Unknown command: ${command}*\nType .menu for commands`,
                    buttons: [
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                    ]
                });
            }
        }
    }
}

// Main pairing endpoint
router.get('/', async (req, res) => {
    try {
        const { number } = req.query;
        
        if (!number) {
            return res.status(400).json({ 
                success: false,
                error: 'Phone number required',
                example: '/code?number=94703229057'
            });
        }

        const cleanNumber = number.replace(/[^0-9]/g, '');
        
        if (cleanNumber.length < 10) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid number'
            });
        }

        console.log(`\n📱 Pairing: ${cleanNumber}`);

        if (activeSessions.has(cleanNumber)) {
            return res.json({ 
                success: true,
                status: 'connected',
                message: '✅ Already Connected!'
            });
        }

        const sessionPath = path.join(sessionsDir, cleanNumber);
        await fs.ensureDir(sessionPath);

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const socket = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['SOS MINI LITE', 'Safari', '2.0.0']
        });

        // Initialize command handler
        new CommandHandler(socket, cleanNumber);

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update;
            
            if (connection === 'open') {
                console.log(`✅ Connected: ${cleanNumber}`);
                activeSessions.set(cleanNumber, socket);

                // Send welcome message with buttons
                await socket.sendMessage(socket.user.id, {
                    image: { url: 'https://i.ibb.co/Jt3v8Qc/sos-mini.jpg' },
                    caption: `╭══════════════════════╗
║  ✨ WELCOME TO ✨    ║
║  🤖 SOS MINI LITE   ║
╰══════════════════════╯

✅ *Connected Successfully!*
📱 *Number:* ${cleanNumber}
⚡ *Status:* Online
🤖 *Meta AI:* Active

> Type .menu to start`,
                    footer: '❤️‍🔥 SOS MINI LITE ❤️‍🔥',
                    buttons: [
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                        { buttonId: '.alive', buttonText: { displayText: '✨ ALIVE' }, type: 1 },
                        { buttonId: '.owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
                        { buttonId: '.ai help', buttonText: { displayText: '🤖 AI' }, type: 1 }
                    ],
                    headerType: 4
                });
            }
        });

        socket.ev.on('creds.update', saveCreds);

        if (!socket.authState.creds.registered) {
            console.log(`🔐 Generating code...`);
            
            let pairingCode = await socket.requestPairingCode(cleanNumber);

            if (pairingCode) {
                const formattedCode = pairingCode.match(/.{1,4}/g)?.join('-') || pairingCode;
                
                console.log('\n' + '🔐'.repeat(20));
                console.log(`🔐 CODE: ${formattedCode}`);
                console.log('🔐'.repeat(20) + '\n');
                
                return res.json({
                    success: true,
                    code: formattedCode,
                    number: cleanNumber,
                    message: '✨ Enter code in WhatsApp > Linked Devices'
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Server error'
        });
    }
});

// Get active sessions
router.get('/active', (req, res) => {
    const sessions = Array.from(activeSessions.keys());
    res.json({
        success: true,
        count: sessions.length,
        sessions: sessions
    });
});

module.exports = router;