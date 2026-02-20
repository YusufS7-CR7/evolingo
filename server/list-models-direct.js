const axios = require('axios');
require('dotenv').config();

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await axios.get(url);
        console.log('Available models for this key:');
        console.log(JSON.stringify(response.data.models.map(m => m.name), null, 2));
    } catch (e) {
        console.error('Error fetching models:');
        console.error(e.response?.data || e.message);
    }
}

listModels();
