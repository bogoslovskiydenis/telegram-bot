import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css'
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "../firebase";
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {getAuth} from "firebase/auth";
import { signOut } from "firebase/auth";

const Dashboard = () => {
    const [currentView, setCurrentView] = useState('send');
    const [textMessage, setTextMessage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [welcomeText, setWelcomeText] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [messageStatus, setMessageStatus] = useState('');
    const [userIds, setUserIds] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const BOT_TOKEN = "6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU";

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
        const fetchData = async () => {
            try {
                await fetchUserIds();
            } catch (error) {
                console.error('Error fetching user IDs:', error);
                setMessageStatus('Failed to fetch user IDs. Please try again.');
            }
        };

        fetchData();

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
        // ... (остальной код без изменений)
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
            <h2>Dashboard</h2>
            <div className="main-menu">
                {/*<button onClick={() => switchView('send')}>Send Messages and Video</button>*/}
                {/*Update Bot Content We need write node server */}
                {/*<button onClick={() => switchView('update')}>Update Bot Content</button>*/}
            </div>
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
    );
};

export default Dashboard;