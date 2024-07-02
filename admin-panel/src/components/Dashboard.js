import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css'
const Dashboard = () => {
    const [currentView, setCurrentView] = useState('send');
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [welcomeText, setWelcomeText] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [messageStatus, setMessageStatus] = useState('');

    // Replace with your bot token and chat ID
    const BOT_TOKEN = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';
    const CHAT_ID = '5230934145';

    const handleTextChange = (e) => setTextMessage(e.target.value);
    const handleVideoChange = (e) => setVideoFile(e.target.files[0]);

    const sendMessageToTelegram = async () => {
        try {
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('caption', textMessage);
            formData.append('video', videoFile);

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTextMessage('');
            setVideoFile(null);
            setMessageStatus('Video sent successfully!');
        } catch (error) {
            console.error('Error sending video to Telegram:', error);
            setMessageStatus('Failed to send video. Please try again.');
        }
    };

    // Handlers for updating bot content
    const handleWelcomeTextChange = (e) => setWelcomeText(e.target.value);
    const handleNewImageChange = (e) => setNewImage(e.target.files[0]);

    const updateBotContent = async () => {
        try {
            await axios.post('http://localhost:5000/api/update-text', { text: welcomeText });
            const formData = new FormData();
            formData.append('image', newImage);

            await axios.post('http://localhost:5000/api/update-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setWelcomeText('');
            setNewImage(null);
            setMessageStatus('Bot content updated successfully!');
        } catch (error) {
            console.error('Error updating bot content:', error);
            setMessageStatus('Failed to update bot content. Please try again.');
        }
    };

    // Toggle between views
    const switchView = (view) => setCurrentView(view);
    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div>
                <button onClick={() => switchView('send')}>Send Messages and Video</button>
                <button onClick={() => switchView('update')}>Update Bot Content</button>
            </div>
            {currentView === 'send' ? (
                <div className="view">
                    <h3>Send Message and Video to Telegram</h3>
                    <div>
                        <label>Text Message:</label>
                        <textarea value={textMessage} onChange={handleTextChange} rows="4" cols="50" />
                    </div>
                    <div>
                        <label>Video File (MP4):</label>
                        <input type="file" accept="video/mp4" onChange={handleVideoChange} />
                    </div>
                    <button onClick={sendMessageToTelegram}>Send Message and Video</button>
                </div>
            ) : (
                <div className="view">
                    <h3>Update Bot Content</h3>
                    <div>
                        <label>Welcome Text:</label>
                        <textarea value={welcomeText} onChange={handleWelcomeTextChange} rows="4" cols="50" />
                    </div>
                    <div>
                        <label>New Image:</label>
                        <input type="file" accept="image/*" onChange={handleNewImageChange} />
                    </div>
                    <button onClick={updateBotContent}>Update Bot Content</button>
                </div>
            )}
            {messageStatus && <p>{messageStatus}</p>}
        </div>
    );
};

export default Dashboard;
