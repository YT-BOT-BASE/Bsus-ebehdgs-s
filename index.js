const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import router
const pairRouter = require('./pair');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/code', pairRouter);

// HTML Pages
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════╗
║  🤖 SOS MINI LITE BOT v2.0    ║
╠════════════════════════════════╣
║  🚀 PORT: ${PORT}                       
║  🌐 URL: http://localhost:${PORT}   
║  🔗 PAIR: http://localhost:${PORT}/pair
║  💗 Status: Online              
╚════════════════════════════════╝
    `);
});

module.exports = app;