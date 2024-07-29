import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "../firebase";
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getAuth, signOut } from "firebase/auth";

const Dashboard = () => {
    const [currentView, setCurrentView] = useState('send');
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [updateTextMessage, setUpdateTextMessage] = useState('');
    const [welcomeText, setWelcomeText] = useState('');
    const [messageStatus, setMessageStatus] = useState('');
    const [userIds, setUserIds] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState('welcomeText');
    const [contentText, setContentText] = useState('');

    const navigate = useNavigate();

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const BOT_TOKEN = process.env.REACT_APP_BOT_TOKEN;

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

    const fetchWelcomeText = async () => {
        try {
            const response = await axios.get('http://localhost:5004/api/get-text');
            setWelcomeText(response.data.text);
            setUpdateTextMessage(response.data.text);
        } catch (error) {
            console.error('Error fetching welcome text:', error);
            setMessageStatus('Failed to fetch welcome text. Please try again.');
        }
    };

    const fetchContent = async (contentType) => {
        try {
            const response = await axios.get(`http://localhost:5004/api/get-text/${contentType}`);
            setContentText(response.data.text);
        } catch (error) {
            console.error(`Error fetching ${contentType}:`, error);
            setMessageStatus(`Failed to fetch ${contentType}. Please try again.`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchContent(selectedContentType);
                await fetchUserIds();
                await fetchWelcomeText();
            } catch (error) {
                console.error('Error fetching data:', error);
                setMessageStatus('Failed to fetch data. Please try again.');
            }
        };

        fetchData();
    }, [fetchUserIds, selectedContentType]);

    const handleTextMessageChange = (e) => setTextMessage(e.target.value);
    const handleVideoChange = (e) => setVideoFile(e.target.files[0]);
    const handleUpdateTextChange = (e) => setUpdateTextMessage(e.target.value);

    const sendMessageAndVideoToTelegram = async () => {
        if (!videoFile && !textMessage) {
            setMessageStatus('Please select a video file or enter a text message.');
            return;
        }

        setMessageStatus('Sending message and/or video to all users...');
        let successCount = 0;
        let failCount = 0;

        for (const userId of userIds) {
            try {
                if (videoFile) {
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
                        console.error(`Failed to send video to user ${userId}:`, response.data);
                    }
                } else if (textMessage) {
                    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        chat_id: userId,
                        text: textMessage
                    });

                    if (response.data && response.data.ok) {
                        successCount++;
                    } else {
                        failCount++;
                        console.error(`Failed to send message to user ${userId}:`, response.data);
                    }
                }
            } catch (error) {
                failCount++;
                console.error(`Error sending to user ${userId}:`, error.response ? error.response.data : error.message);
            }
        }

        setTextMessage('');
        setVideoFile(null);
        setMessageStatus(`Message/Video sent to ${successCount} users. Failed for ${failCount} users.`);
    };

    const updateBotContent = async () => {
        try {
            const response = await axios.post('http://localhost:5004/api/update-text', {
                type: selectedContentType,
                text: contentText
            });
            setMessageStatus(`${selectedContentType} updated successfully`);
        } catch (error) {
            console.error('Error updating bot content:', error);
            setMessageStatus('Failed to update bot content. Please try again.');
        }
    };

    const switchView = (view) => setCurrentView(view);

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const userSnapshot = await getDocs(usersCollection);
            const names = userSnapshot.docs.map(doc => doc.data().username);
            setUserNames(names);
            setMessageStatus(`Fetched ${names.length} user names`);
        } catch (error) {
            console.error('Error fetching user names:', error);
            setMessageStatus('Failed to fetch user names. Please try again.');
        }
    };

    const exportUsersToExcel = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const userSnapshot = await getDocs(usersCollection);
            const users = userSnapshot.docs.map(doc => doc.data());
            const worksheet = XLSX.utils.json_to_sheet(users);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
            XLSX.writeFile(workbook, "users.xlsx");
            setMessageStatus('Users exported to Excel successfully');
        } catch (error) {
            console.error('Error exporting users to Excel:', error);
            setMessageStatus('Failed to export users to Excel. Please try again.');
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="dashboard">
            <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`}>
                <button onClick={toggleMenu}>☰</button>
                {isMenuOpen && (
                    <div className="dropdown-menu">
                        <button onClick={fetchAllUsers}>Fetch All Users</button>
                        <button onClick={exportUsersToExcel}>Export Users to Excel</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
            <div className="sidebar">
                <h2>Dashboard</h2>
                <button onClick={() => switchView('send')}>Send Message and Video to Telegram</button>
                <button onClick={() => switchView('update')}>Update Bot Content</button>
            </div>
            <div className="content">
                {currentView === 'send' && (
                    <div>
                        <h3>Send Message and Video to Telegram</h3>
                        <div>
                            <label>Text Message:</label>
                            <textarea
                                value={textMessage}
                                onChange={handleTextMessageChange}
                                rows="4"
                                cols="50"
                            />
                        </div>
                        <div>
                            <label>Video File (MP4):</label>
                            <input
                                type="file"
                                accept="video/mp4"
                                onChange={handleVideoChange}
                            />
                        </div>
                        <button onClick={sendMessageAndVideoToTelegram}>
                            Send Message and/or Video to All Users ({userIds.length})
                        </button>
                    </div>
                )}
                {currentView === 'update' && (
                    <div>
                        <h3>Update Bot Content</h3>
                        <select
                            value={selectedContentType}
                            onChange={(e) => setSelectedContentType(e.target.value)}
                        >
                            <option value="welcomeText">Welcome Text</option>
                            <option value="newPlayerBonuses">New Player Bonuses</option>
                            <option value="otherBonuses">Other Bonuses</option>
                            <option value="topWins">Top Wins</option>
                            <option value="topSlots">Top Slots</option>
                        </select>
                        <button onClick={() => fetchContent(selectedContentType)}>Load Text</button>
                        <div>
                            <label>Text Content:</label>
                            <textarea
                                value={contentText}
                                onChange={(e) => setContentText(e.target.value)}
                                rows="4"
                                cols="50"
                            />
                        </div>
                        <button onClick={updateBotContent}>Update Bot Content</button>
                    </div>
                )}
                {messageStatus && <p>{messageStatus}</p>}
                {userNames.length > 0 && (
                    <div>
                        <h3>User Names:</h3>
                        <ul>
                            {userNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;