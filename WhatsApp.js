// Пример для Node.js (Express)
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Вебхук для проверки подлинности
app.get('/webhook', (req, res) => {
  const verifyToken = 'my_verify_token_123'; // Убедитесь, что токен совпадает с тем, что вы указали в настройках
  if (req.query['hub.verify_token'] === verifyToken) {
    return res.send(req.query['hub.challenge']); // WhatsApp требует вернуть hub.challenge для подтверждения
  }
  return res.status(403).send('Invalid verification token');
});

// Вебхук для обработки входящих сообщений
app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log(data); // Логируем входящие данные
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});