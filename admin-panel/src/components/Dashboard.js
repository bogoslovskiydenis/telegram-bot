import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css'
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "./firebase";

const Dashboard = () => {
    const [currentView, setCurrentView] = useState('send');
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [welcomeText, setWelcomeText] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [messageStatus, setMessageStatus] = useState('');
    const [userIds, setUserIds] = useState([]);

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const BOT_TOKEN = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';

    const fetchUserIds = useCallback(async () => {
        try {
            const usersCollection = collection(db, 'users');
            const userSnapshot = await getDocs(usersCollection);
            const ids = userSnapshot.docs.map(doc => doc.data().userId);
            setUserIds(ids);
        } catch (error) {
            console.error('Error fetching user IDs:', error);
            setMessageStatus('Failed to fetch user IDs. Please try again.');
        }
    }, [db]);

    useEffect(() => {
        fetchUserIds();
    }, [fetchUserIds]);

    const handleTextChange = (e) => setTextMessage(e.target.value);
    const handleVideoChange = (e) => setVideoFile(e.target.files[0]);
    const handleWelcomeTextChange = (e) => setWelcomeText(e.target.value);
    const handleNewImageChange = (e) => setNewImage(e.target.files[0]);

    const sendMessageToTelegram = async () => {
        if (!videoFile) {
            setMessageStatus('Please select a video file.');
            return;
        }

        setMessageStatus('Sending video to all users...');
        let successCount = 0;
        let failCount = 0;

        for (const userId of userIds) {
            try {
                const formData = new FormData();
                formData.append('chat_id', userId);
                formData.append('caption', textMessage);
                formData.append('video', videoFile);

                const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data && response.data.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to send to user ${userId}:`, response.data);
                }
            } catch (error) {
                failCount++;
                console.error(`Error sending to user ${userId}:`, error.response ? error.response.data : error.message);
            }
        }

        if (successCount > 0) {
            setTextMessage('');
            setVideoFile(null);
        }

        setMessageStatus(`Video sent to ${successCount} users. Failed for ${failCount} users.`);
    };

    const updateBotContent = async () => {
        try {
            await axios.post('http://localhost:5004/api/update-text', { text: welcomeText });

            if (newImage) {
                const formData = new FormData();
                formData.append('image', newImage);
                await axios.post('http://localhost:5004/api/update-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setWelcomeText('');
            setNewImage(null);
            setMessageStatus('Bot content updated successfully!');
        } catch (error) {
            console.error('Error updating bot content:', error);
            setMessageStatus('Failed to update bot content. Please try again.');
        }
    };

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
                    <button onClick={sendMessageToTelegram}>Send Message and Video to All Users ({userIds.length})</button>
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