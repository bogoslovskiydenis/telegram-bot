import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [messageStatus, setMessageStatus] = useState('');

    // Replace with your bot token and chat ID
    const BOT_TOKEN = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';
    const CHAT_ID = '5230934145';

    const handleTextChange = (e) => {
        setTextMessage(e.target.value);
    };

    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const sendMessageToTelegram = async () => {
        try {
            // Prepare form data for both text and video
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('caption', textMessage); // Caption for the video
            formData.append('video', videoFile);

            // Send POST request to Telegram Bot API's sendVideo endpoint
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Clear form fields and show success message
            setTextMessage('');
            setVideoFile(null);
            setMessageStatus('Video sent successfully!');
        } catch (error) {
            console.error('Error sending video to Telegram:', error);
            setMessageStatus('Failed to send video. Please try again.');
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <div>
                <label htmlFor="textMessage">Text Message:</label>
                <textarea id="textMessage" value={textMessage} onChange={handleTextChange} rows="4" cols="50" />
            </div>
            <div>
                <label htmlFor="videoFile">Video File (MP4):</label>
                <input type="file" id="videoFile" accept="video/mp4" onChange={handleVideoChange} />
            </div>
            <button onClick={sendMessageToTelegram}>Send Message and Video to Telegram</button>
            {messageStatus && <p>{messageStatus}</p>}
        </div>
    );
};

export default Dashboard;
