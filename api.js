const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('./config');

// Meta AI API
router.post('/ai', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3-8b-instruct',
            messages: [{ role: 'user', content: query }]
        }, {
            headers: {
                'Authorization': `Bearer ${config.META_AI_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            answer: response.data.choices[0].message.content
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Weather API
router.get('/weather', async (req, res) => {
    try {
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${config.WEATHER_API_KEY}&units=metric`);

        res.json({
            success: true,
            data: {
                city: response.data.name,
                temp: response.data.main.temp,
                humidity: response.data.main.humidity,
                wind: response.data.wind.speed,
                description: response.data.weather[0].description
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bot Stats
router.get('/stats', (req, res) => {
    const activeSessions = require('./pair').activeSessions;
    
    res.json({
        success: true,
        stats: {
            botName: config.BOT_NAME,
            version: config.BOT_VERSION,
            owner: config.OWNER_NAME,
            activeSessions: activeSessions?.size || 0,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        }
    });
});

module.exports = router;