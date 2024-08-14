import TelegramBot from 'node-telegram-bot-api';
import path from "path";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {firebaseConfig} from "./firebase.js"
import 'dotenv/config';
import axios from "axios";

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция записи user_id в Firebase
const writeUserData = async (userId, firstName, username ,phoneNumber ) => {
    try {
        await setDoc(doc(db, 'users', String(userId)), {
            userId: userId,
            firstName: firstName,
            username: username,
            phoneNumber: phoneNumber
        });
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error writing user data to Firestore:', error);
    }
};

async function getContentFromServer(contentType) {
    if (!contentType) {
        console.error('Content type is undefined');
        return null;
    }
    try {
        const response = await axios.get(`http://localhost:5004/api/get-text/${contentType}`);
        return response.data.text;
    } catch (error) {
        console.error(`Error fetching ${contentType} from server:`, error.message);
        return null;
    }
}

async function getVideoUrlFromServer(contentType) {
    if (!contentType) {
        console.error('Content type is undefined');
        return null;
    }
    try {
        const response = await axios.get(`http://localhost:5004/api/get-video/${contentType}`);
        return response.data.videoUrl;
    } catch (error) {
        console.error(`Error fetching video URL for ${contentType} from server:`, error.message);
        return null;
    }
}
async function getVideoFromServer(contentType) {
    if (!contentType) {
        console.error('Content type is undefined');
        return null;
    }
    try {
        const response = await axios.get(`http://localhost:5004/api/get-video/${contentType}`, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching video for ${contentType} from server:`, error.message);
        return null;
    }
}

// Слушаем команду /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username || '';

    try {
        // Write userId to Firestore
        await writeUserData(userId, firstName, username);

        // Send welcome message
        const welcomeMessage = 'Добро пожаловать! Нажмите кнопку "Старт" ниже, чтобы узнать больше о боте.';
        await bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                keyboard: [
                    [{ text: 'Старт' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } catch (error) {
        console.error('Error handling /start command:', error);
    }
});

// Слушаем нажатие кнопки "Старт"
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text && msg.text.toLowerCase() === 'старт') {
        const videoPath = await getVideoFromServer('welcome');
        const welcomeText = await getContentFromServer('welcome');

        try {
            await bot.sendVideo(chatId, videoPath);
            await bot.sendMessage(chatId, welcomeText, {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Поделиться номером телефона', request_contact: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                },
                parse_mode: 'Markdown'
            });
        } catch (err) {
            console.error('Error sending content:', err);
        }
    }
});

bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username || '';
    const phoneNumber = msg.contact.phone_number;
    try {
        // Update the user data in Firebase with the phone number
        await writeUserData(userId, firstName, username , phoneNumber);

        console.log('Phone number saved successfully');

        // Send a confirmation message
        await bot.sendMessage(chatId, 'Спасибо! Ваш номер телефона сохранен.');

        // Proceed to the main menu
        const sectionMessage = 'Выберите раздел:';
        await bot.sendMessage(chatId, sectionMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Бонусы и акции', callback_data: 'bonuses' }],
                    [{ text: 'TOP популярных слотов', callback_data: 'top_slots' }],
                    [{ text: 'TOP выигрышей', callback_data: 'top_wins' }],
                    [{ text: 'Победные схемы', callback_data: 'winning_strategies' }],
                    [{ text: 'Вопрос-ответ-отзывы', callback_data: 'qna_reviews' }]
                ]
            }
        });
    } catch (error) {
        console.error('Error saving phone number to Firestore:', error);
        await bot.sendMessage(chatId, 'Извините, произошла ошибка при сохранении номера телефона.');
    }
});

// Обработчик для Inline Keyboard
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Обработка нажатия на кнопки Inline Keyboard
    switch (data) {
        case 'bonuses':
            // Открываем новый раздел с картинкой и тремя кнопками
            const bonusSectionMessage = 'Выберите тип бонусов:';
            const bonusOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Бонусы новым игрокам', callback_data: 'new_player_bonuses' }],
                        [{ text: 'Другие бонусы', callback_data: 'other_bonuses' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                }
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const VideoURL = "./assets/bonus.mp4";
            bot.sendVideo(chatId, VideoURL )
                .then(() => {
                    bot.sendMessage(chatId, bonusSectionMessage, bonusOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
            break;
        case 'top_slots':
            // Открываем раздел с топ популярных слотов
            const topSlotsMessage = await getContentFromServer("topSlots");
            const topSlotsOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            const topSlotsImageURL = await getVideoFromServer("topSlots");
            try{
                await bot.sendVideo(chatId, topSlotsImageURL)
                await bot.sendMessage(chatId, topSlotsMessage, topSlotsOptions);
            }
            catch(error) {
                console.error('Ошибка при отправке изображения:', error);
                bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
            };
            break;
        case 'top_wins':
            const topWinsMessage = await getContentFromServer('topWins');
            const topWinsOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };
            const topWinsVideoURL = await getVideoFromServer('topWins');
            try {
                await bot.sendVideo(chatId, topWinsVideoURL);
                await bot.sendMessage(chatId, topWinsMessage || 'Информация о топ выигрышах недоступна', topWinsOptions);
            } catch(error) {
                console.error('Ошибка при отправке видео или сообщения:', error);
                bot.sendMessage(chatId, 'Не удалось загрузить видео или информацию. Попробуйте позже.');
            }
            break;
        case 'winning_strategies':
            // Открываем раздел с победными схемами
            const winningStrategiesMessage = `
Лучшие победные схемы от наших подписчиков:

Также вы можете поделиться со всеми своей победной схемой
            `;
            const winningStrategiesOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Схемы', callback_data: 'view_strategies' }],
                        [{ text: 'Кнопка написать', callback_data: 'write_strategy' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };
            // Отправляем сообщение с текстом
            await bot.sendMessage(chatId, winningStrategiesMessage, winningStrategiesOptions);
            break;
        case 'qna_reviews':
            await bot.sendMessage(chatId, 'Здесь будут вопросы-ответы и отзывы');
            break;
        case 'new_player_bonuses':
            const newPlayerBonusMessage = await getContentFromServer('newPlayerBonuses');
            const newPlayerBonusVideoURL = await getVideoFromServer('newPlayerBonuses');
            const newPlayerBonusOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua/' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            try {
                if (newPlayerBonusVideoURL) {
                    await bot.sendVideo(chatId, newPlayerBonusVideoURL);
                } else {
                    console.log('No video URL provided for new player bonuses');
                }
                await bot.sendMessage(chatId, newPlayerBonusMessage || 'Информация о бонусах для новых игроков недоступна', newPlayerBonusOptions);
            } catch(error) {
                console.error('Ошибка при отправке видео или сообщения:', error);
                await bot.sendMessage(chatId, 'Не удалось загрузить видео или информацию. Попробуйте позже.');
            }
            break;
        case 'other_bonuses':
            const otherBonusesMessage = await getContentFromServer('otherBonuses');
            const otherBonusesVideoURL = await getVideoFromServer('otherBonuses');
            const otherBonusesOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            try {
                if (otherBonusesVideoURL) {
                    await bot.sendVideo(chatId, otherBonusesVideoURL);
                } else {
                    console.log('No video URL provided for other bonuses');
                }
                await bot.sendMessage(chatId, otherBonusesMessage || 'Информация о других бонусах недоступна', otherBonusesOptions);
            } catch(error) {
                console.error('Ошибка при отправке видео или сообщения:', error);
                await bot.sendMessage(chatId, 'Не удалось загрузить видео или информацию. Попробуйте позже.');
            }
            break;
        case 'back_to_start':
            // Возвращаемся к основному разделу выбора
            const startMessage = 'Выберите раздел:';
            await bot.sendMessage(chatId, startMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Бонусы и акции', callback_data: 'bonuses'}],
                        [{text: 'TOP популярных слотов', callback_data: 'top_slots'}],
                        [{text: 'TOP выигрышей', callback_data: 'top_wins'}],
                        [{text: 'Победные схемы', callback_data: 'winning_strategies'}],
                        [{text: 'Вопрос-ответ-отзывы', callback_data: 'qna_reviews'}]
                    ]
                }
            });
            break;
    }
});