const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Ваш Verify Token (должен совпадать с тем, что указан в настройках Meta)
const VERIFY_TOKEN = 'my_verify_token_123';

// Обработка GET-запроса для подтверждения вебхука
app.get('/webhook', (req, res) => {
  // Получаем параметры из запроса
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Проверяем, совпадает ли токен
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return res.status(200).send(challenge); // Возвращаем hub.challenge
    } else {
      console.log('Verification failed. Tokens do not match.');
      return res.sendStatus(403); // Возвращаем ошибку, если токены не совпадают
    }
  } else {
    console.log('Invalid request. Missing hub.mode or hub.verify_token.');
    return res.sendStatus(400); // Возвращаем ошибку, если запрос некорректен
  }
});

// Обработка POST-запроса для получения входящих сообщений
app.post('/webhook', (req, res) => {
  const data = req.body;

  // Проверяем, что это сообщение от WhatsApp
  if (data.object === 'whatsapp_business_account') {
    data.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        if (change.field === 'messages') {
          const message = change.value.messages[0];
          const senderNumber = message.from;
          const messageText = message.text.body;

          console.log(`Received message from ${senderNumber}: ${messageText}`);

          // Здесь можно добавить логику для обработки сообщения
          const responseText = `Вы сказали: "${messageText}"`;
          sendWhatsAppMessage(senderNumber, responseText); // Отправляем ответ
        }
      });
    });
  }

  res.sendStatus(200); // Подтверждаем получение данных
});

// Функция для отправки сообщения через WhatsApp API
function sendWhatsAppMessage(phoneNumber, message) {
  const ACCESS_TOKEN = 'EAAHd0CpZAsycBO0nZAUCnK3Q1PO6Lq5fdGOrCkAevjl1bmJFvtNoQdEQvAbZBaafDIeZBZBzL4eTUSIs0ApD8Hw6Ptsy2s14eHOEt4QqjQ3LyEbr4H2aLBkYlZASyyZAMqgAbsWVPwasefZBGCUS4ehaZBgZBXUmE2m586f3neg37dC0Q6tERJnFs5bxINHt9oD16ASDyXGTkdgzFP3qZAtzSuM2FZALReAZD'; // Замените на ваш Access Token
  const PHONE_NUMBER_ID = '594973807030536'; // Замените на ваш Phone Number ID

  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: { body: message },
  };

  // Отправляем запрос к WhatsApp API
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => console.log('Message sent:', data))
    .catch((error) => console.error('Error sending message:', error));
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
