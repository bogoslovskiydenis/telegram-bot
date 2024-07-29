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
        return { welcomeText: '' };
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

app.get('/api/get-text', async (req, res) => {
    console.log('GET /api/get-text request received');
    try {
        const config = await readConfig();
        console.log('Sending welcome text:', config.welcomeText);
        res.json({ text: config.welcomeText });
    } catch (error) {
        console.error('Error handling GET /api/get-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/update-text', async (req, res) => {
    console.log('POST /api/update-text request received with body:', req.body);
    const { text } = req.body;
    if (!text) {
        console.log('Text is missing in the request body');
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const config = await readConfig();
        config.welcomeText = text;
        await writeConfig(config);
        console.log('Welcome text updated successfully to:', config.welcomeText);
        res.json({ message: 'Welcome text updated successfully', newText: config.welcomeText });
    } catch (error) {
        console.error('Error handling POST /api/update-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/get-text/:type', async (req, res) => {
    console.log(`GET /api/get-text/${req.params.type} request received`);
    try {
        const config = await readConfig();
        const contentType = req.params.type;
        if (config[contentType]) {
            console.log(`Sending ${contentType}:`, config[contentType]);
            res.json({ text: config[contentType] });
        } else {
            res.status(404).json({ error: 'Content type not found' });
        }
    } catch (error) {
        console.error('Error handling GET /api/get-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/update-text', async (req, res) => {
    console.log('POST /api/update-text request received with body:', req.body);
    const { type, text } = req.body;
    if (!type || !text) {
        console.log('Type or text is missing in the request body');
        return res.status(400).json({ error: 'Type and text are required' });
    }

    try {
        const config = await readConfig();
        if (config.hasOwnProperty(type)) {
            config[type] = text;
            await writeConfig(config);
            console.log(`${type} updated successfully to:`, config[type]);
            res.json({ message: `${type} updated successfully`, newText: config[type] });
        } else {
            res.status(404).json({ error: 'Content type not found' });
        }
    } catch (error) {
        console.error('Error handling POST /api/update-text request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
