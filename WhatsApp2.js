const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAHd0CpZAsycBOzbOO842RaZANP7ngZBrQ1xBCeJp8GnPlKaTeuXZAM9Oeot866NljgOXIfjgZBxHu04Lq7v4KUceM5wSzVte4xSnR4PYrdEKl5zvhpgFKiED9mKHjrRlKAH19BpLui8ev8ikYegNbEk7N7t9SDHTP7zayvPl0whzYJWHFoAJZByXNartdh3xISFeZCjtsboR1gg0VLaMGOCe9ZAMMYZD';

app.use(bodyParser.json());

// Вебхук для проверки подлинности
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Invalid verification token');
});

// Вебхук для обработки входящих сообщений
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    body.entry.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.value.messages) {
          change.value.messages.forEach(message => {
            console.log('Received message:', message);
            handleIncomingMessage(message);
          });
        }
      });
    });
  }

  res.sendStatus(200);
});

// Функция обработки входящих сообщений
async function handleIncomingMessage(message) {
  const senderId = message.from;
  const text = message.text?.body || '';

  const replyText = `Вы сказали: ${text}`;
  await sendWhatsAppMessage(senderId, replyText);
}

// Функция отправки сообщений через WhatsApp Cloud API
async function sendWhatsAppMessage(to, text) {
  try {
    await axios.post('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: text },
    }, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Message sent to ${to}: ${text}`);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
