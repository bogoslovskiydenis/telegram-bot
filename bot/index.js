import TelegramBot from 'node-telegram-bot-api';
import path from "path";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {firebaseConfig} from "./firebase.js"
const token = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';

const bot = new TelegramBot(token, {polling: true});
// const firebaseConfig = {
//     apiKey: "AIzaSyCHzKeTsZ43c86z4y6cvbZDOtNxnl0CM7U",
//     authDomain: "tgbot-cc51a.firebaseapp.com",
//     projectId: "tgbot-cc51a",
//     storageBucket: "tgbot-cc51a.appspot.com",
//     messagingSenderId: "42637878178",
//     appId: "1:42637878178:web:129d927716a8ee291288fb"
// };

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
    writeUserData(userId );

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
                },
                parse_mode: 'Markdown'
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
            bot.sendPhoto(chatId, imageURL )
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
            const topSlotsMessage = `
                Самые популярные слоты за прошлую неделю:

                1. **Sweet bonanza** - 5 776 698
                2. **The ref reactor** - 3 455 893
                3. **Sweet coin** - 3 398 765
                4. **Book of ra** - 3 387 112
                5. **Fortune five** - 3 000 453
                6. **Gold rush** - 2 954 777
                7. **Frozen crown** - 2 854 121
                8. **Zeus** - 2 765 443
                9. **Book of mystery** - 2 690 418
            `;
            const topSlotsOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const top_slotsImageURL = 'assets/1.png';
            bot.sendPhoto(chatId, top_slotsImageURL)
                .then(() => {
                    bot.sendMessage(chatId, topSlotsMessage, topSlotsOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
            break;

        case 'top_wins':
            // Открываем раздел с топ популярных слотов
            const topWinsMessage = `
                Самые популярные слоты за прошлую неделю:

                1. **Sweet bonanza** - 5 776 698 USD
                2. **The ref reactor** - 3 455 893 USD
                3. **Sweet coin** - 3 398 765 USD
                4. **Book of ra** - 3 387 112 USD
                5. **Fortune five** - 3 000 453 USD
                6. **Gold rush** - 2 954 777 USD
                7. **Frozen crown** - 2 854 121 USD
                8. **Zeus** - 2 765 443 USD
                9. **Book of mystery** - 2 690 418 USD
            `;
            const topWinsOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const topWinsImageURL = 'assets/1.png';
            bot.sendPhoto(chatId, topWinsImageURL)
                .then(() => {
                    bot.sendMessage(chatId, topWinsMessage, topWinsOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
            break;

        case 'winning_strategies':
            bot.sendMessage(chatId, 'Здесь будут победные стратегии');
            break;
        case 'qna_reviews':
            bot.sendMessage(chatId, 'Здесь будут вопросы-ответы и отзывы');
            break;
        case 'new_player_bonuses':
            // Открываем новый раздел с картинкой, текстом и кнопками
            const newPlayerBonusMessage = 'Всем новым игрокам Казино дарит приветственные бонус в 150% от суммы первого депозита в размере до 75000 тенге, а также 50 фриспинов.';
            const newPlayerBonusOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua/' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                }
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const newPlayerBonusImageURL = 'assets/1.png';
            bot.sendPhoto(chatId, newPlayerBonusImageURL)
                .then(() => {
                    bot.sendMessage(chatId, newPlayerBonusMessage, newPlayerBonusOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
            break;

        case 'other_bonuses':
            // Открываем новый раздел с картинкой, текстом и кнопками
            const otherBonusesMessage = `
[ПЕРВЫЙ КАЗИНО БОНУС](https://google.com)
100% до ₸250000

                                                            *ВТОРОЙ КАЗИНО БОНУС*
50% до ₸250000

*ТРЕТИЙ КАЗИНО БОНУС*
500FS

*СЕКРЕТНЫЕ БОНУСЫ*
Только в нашем предложении

*LIVE-РЕЛОАД В ПОНЕДЕЛЬНИК*
Live-казино бонус 25%

*ФРИСПИНЫ СРЕДЫ*
100 фриспинов на удачу

*ПЯТНИЧНЫЙ РЕЛОАД*
30% до ₸50000`;
            const otherBonusesOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Забрать бонус', url: 'https://google.com.ua' }],
                        [{ text: 'Главное меню', callback_data: 'back_to_start' }]
                    ]
                },
                parse_mode: 'Markdown'
            };

            // Отправляем сообщение с картинкой (замените путь на ваше изображение)
            const otherBonusesImageURL = 'assets/1.png';
            bot.sendPhoto(chatId, otherBonusesImageURL)
                .then(() => {
                    bot.sendMessage(chatId, otherBonusesMessage, otherBonusesOptions);
                })
                .catch((error) => {
                    console.error('Ошибка при отправке изображения:', error);
                    bot.sendMessage(chatId, 'Не удалось загрузить изображение. Попробуйте позже.');
                });
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


    }
});