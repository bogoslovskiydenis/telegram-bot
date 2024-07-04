import TelegramBot from 'node-telegram-bot-api';
const token = '6965532642:AAEGkS3VeQqHYKPueJ0V-xqo4TfPzdSWipU';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Слушаем команду /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Приветственное сообщение с кнопкой "Старт"
    const welcomeMessage = 'Добро пожаловать! Нажмите кнопку "Старт" ниже, чтобы узнать больше о боте.';
    bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
            keyboard: [
                [{ text: 'Старт' }]
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
            Добро пожаловать в нашего бота!
            Этот бот может помочь вам с [описание функционала бота].
        `;

        // Отправляем видео
        bot.sendVideo(chatId,  videoPath ).then(() => {
            // Отправляем текстовое сообщение после видео
            bot.sendMessage(chatId, welcomeDescription, {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Начать использование' }]
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