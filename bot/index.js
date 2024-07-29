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
const writeUserData = async (userId, firstName, username) => {
    try {
        await setDoc(doc(db, 'users', String(userId)), {
            userId: userId,
            firstName: firstName,
            username: username
        });
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error writing user data to Firestore:', error);
    }
};

let currentWelcomeText = '';
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

setInterval(async () => {
    try {
        const newWelcomeText = await getContentFromServer();
        if (newWelcomeText !== currentWelcomeText) {
            currentWelcomeText = newWelcomeText;
            console.log('Updated welcome text from API.');
        }
    } catch (error) {
        console.error('Error updating welcome text from API:', error);
    }
}, 10 * 1000);
// Слушаем команду /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username || ''; // Use an empty string if the username is not available

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
        // Handle the error as needed
    }
});

// Слушаем нажатие кнопки "Старт"
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toLowerCase() === 'старт') {
        const videoPath = './assets/1th.mp4';
        const welcomeText = await getContentFromServer('welcomeText');

        try {
            await bot.sendVideo(chatId, videoPath);
            await bot.sendMessage(chatId, welcomeText, {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Начать использование' }]
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

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === 'Начать использование') {
        // Отправляем новый раздел с кнопками через Inline Keyboard
        const sectionMessage = 'Выберите раздел:';
        bot.sendMessage(chatId, sectionMessage, {
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
            const VideoURL = path.join("assets/bonus.mp4");
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

            const topSlotsImageURL = './assets/topSlots.mp4';
            try{
         await   bot.sendVideo(chatId, topSlotsImageURL)
               await     bot.sendMessage(chatId, topSlotsMessage, topSlotsOptions);
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

            const topWinsVideoURL = './assets/bigwin.mp4';
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
            // const winningStrategiesURL = './assets/';
            // bot.sendPhoto(chatId, winningStrategiesURL)
            //     .then(() => {
            //         bot.sendMessage(chatId, winningStrategiesMessage, winningStrategiesOptions);
            //     })
            //     .catch((error) => {
            //         console.error('Ошибка при отправке изображения:', error);
            //         bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
            //     });
            // Отправляем сообщение с текстом
            await bot.sendMessage(chatId, winningStrategiesMessage, winningStrategiesOptions);
            break;
        case 'qna_reviews':
            await bot.sendMessage(chatId, 'Здесь будут вопросы-ответы и отзывы');
            break;
        case 'new_player_bonuses':
            const newPlayerBonusMessage = await getContentFromServer('newPlayerBonuses');
            const newPlayerBonusOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua/' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            const newPlayerBonusVideoURL = './assets/bonus.mp4';
            try {
                await bot.sendVideo(chatId, newPlayerBonusVideoURL);
                await bot.sendMessage(chatId, newPlayerBonusMessage || 'Информация о бонусах для новых игроков недоступна', newPlayerBonusOptions);
            } catch(error) {
                console.error('Ошибка при отправке видео или сообщения:', error);
                await bot.sendMessage(chatId, 'Не удалось загрузить видео или информацию. Попробуйте позже.');
            }
            break;
        case 'other_bonuses':
            const otherBonusesMessage = await getContentFromServer('otherBonuses');
            const otherBonusesOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            const otherBonusesVideoURL = './assets/bonus.mp4';
            try {
                await bot.sendVideo(chatId, otherBonusesVideoURL);
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