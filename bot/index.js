import TelegramBot from 'node-telegram-bot-api';
import path from "path";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const token = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';

const bot = new TelegramBot(token, {polling: true});
const firebaseConfig = {
    apiKey: "AIzaSyCHzKeTsZ43c86z4y6cvbZDOtNxnl0CM7U",
    authDomain: "tgbot-cc51a.firebaseapp.com",
    projectId: "tgbot-cc51a",
    storageBucket: "tgbot-cc51a.appspot.com",
    messagingSenderId: "42637878178",
    appId: "1:42637878178:web:129d927716a8ee291288fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция записи user_id в Firebase
const writeUserData = async (userId) => {
    try {
        await setDoc(doc(db, 'users', String(userId)), {
            userId: userId,
        });
        console.log('User data saved successfully');
    } catch (error) {
        console.error('Error writing user data to Firestore:', error);
    }
};

// Слушаем команду /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Записываем userId в Firebase
    writeUserData(userId);

    // Приветственное сообщение с кнопкой "Старт"
    const welcomeMessage = 'Добро пожаловать! Нажмите кнопку "Старт" ниже, чтобы узнать больше о боте.';
    bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
            keyboard: [
                [{text: 'Старт'}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Слушаем нажатие кнопки "Старт"
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toLowerCase() === 'старт') {
        // Отправляем приветственное видео и текст
        const videoPath = './assets/1th.mp4';
        const welcomeDescription = `
*Супер-Бонусы лучшего казино Казахстана!*
*Рейтинг популярных слотов*
*Слоты с самыми большими выигрышами*
*Победные схемы от наших подписчиков*
*Вопрос-ответ и отзыв*
        `;

        // Отправляем видео
        bot.sendVideo(chatId, videoPath).then(() => {
            // Отправляем текстовое сообщение после видео
            bot.sendMessage(chatId, welcomeDescription, {
                reply_markup: {
                    keyboard: [
                        [{text: 'Начать использование'}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }).catch(err => {
            console.error('Ошибка при отправке видео:', err);
            bot.sendMessage(chatId, 'Не удалось отправить видео. Попробуйте позже.');
        });
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
bot.on('callback_query', (callbackQuery) => {
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
                        [{ text: 'Вернуться', callback_data: 'back_to_start' }]
                    ]
                }
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const imageURL = path.join("assets/1.png");
            bot.sendPhoto(chatId, imageURL, { caption: bonusSectionMessage })
                .then(() => {
                    bot.sendMessage(chatId, bonusSectionMessage, bonusOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
            break;
        case 'top_slots':
            bot.sendMessage(chatId, 'Здесь будет список TOP популярных слотов');
            break;
        case 'top_wins':
            bot.sendMessage(chatId, 'Здесь будет список TOP выигрышей');
            break;
        case 'winning_strategies':
            bot.sendMessage(chatId, 'Здесь будут победные стратегии');
            break;
        case 'qna_reviews':
            bot.sendMessage(chatId, 'Здесь будут вопросы-ответы и отзывы');
            break;
        case 'back_to_start':
            // Возвращаемся к основному разделу выбора
            const startMessage = 'Выберите раздел:';
            bot.sendMessage(chatId, startMessage, {
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
            break;
        default:
            break;
    }
});