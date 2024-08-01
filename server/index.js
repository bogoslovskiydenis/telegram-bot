const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

async function readConfig() {
    try {
        console.log('Reading configuration file...');
        const data = await fs.readFile(path.join(__dirname, 'config.json'), 'utf8');
        const config = JSON.parse(data);
        console.log('Configuration read successfully:', config);
        return config;
    } catch (error) {
        console.error('Error reading config:', error);
        return { welcomeText: '', welcomeVideoUrl: '', newPlayerBonuses: '', newPlayerBonusesVideoUrl: '', otherBonuses: '', otherBonusesVideoUrl: '', topWins: '', topWinsVideoUrl: '', topSlots: '', topSlotsVideoUrl: '' };
    }
}

async function writeConfig(config) {
    try {
        console.log('Writing configuration file...');
        await fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 2));
        console.log('Configuration written successfully:', config);
    } catch (error) {
        console.error('Error writing config:', error);
    }
}

app.get('/api/get-text/:type', async (req, res) => {
    const { type } = req.params;
    console.log(`GET /api/get-text/${type} request received`);
    try {
        const config = await readConfig();
        if (config[type]) {
            console.log(`Sending ${type}:`, config[type]);
            res.json({ text: config[type] });
        } else {
            res.status(404).json({ error: `Content type ${type} not found` });
        }
    } catch (error) {
        console.error('Error handling GET /api/get-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/update-text/:type', async (req, res) => {
    const { type } = req.params;
    const { text } = req.body;
    console.log(`POST /api/update-text/${type} request received with body:`, req.body);

    if (!text) {
        console.log('Text is missing in the request body');
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const config = await readConfig();
        config[type] = text;
        await writeConfig(config);
        console.log(`${type} updated successfully to:`, config[type]);
        res.json({ message: `${type} updated successfully`, newText: config[type] });
    } catch (error) {
        console.error('Error handling POST /api/update-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Загрузка ссылки на видео
app.post('/api/upload-video', async (req, res) => {
    const { url, type } = req.body;
    console.log(`POST /api/upload-video request received with body:`, req.body);

    if (!url || !type) {
        return res.status(400).json({ error: 'URL and type are required' });
    }

    try {
        const config = await readConfig();
        config[`${type}VideoUrl`] = url;
        await writeConfig(config);
        res.json({ message: 'Video URL saved successfully', videoUrl: url });
    } catch (error) {
        console.error('Error handling POST /api/upload-video request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение ссылки на видео
app.get('/api/get-video/:type', async (req, res) => {
    const { type } = req.params;
    console.log(`GET /api/get-video/${type} request received`);

    try {
        const config = await readConfig();
        const videoUrl = config[`${type}VideoUrl`];
        if (videoUrl) {
            res.json({ videoUrl: videoUrl });
        } else {
            res.status(404).json({ error: `Video URL for ${type} not found` });
        }
    } catch (error) {
        console.error('Error handling GET /api/get-video request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
