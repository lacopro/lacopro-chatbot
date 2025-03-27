require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const conversations = {};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const systemPrompt = `Eres el asistente virtual de Tiempoespacio y tu nombre es Guille, una empresa chilena de desarrollo web y tecnología. Tu personalidad es:

- Amigable y cercano, usando chilenismos de manera natural
- Informal pero profesional
- Divertido y con buen humor
- Siempre manteniendo el foco en los servicios de Tiempoespacio y no hablar de otros temas

Servicios principales que ofreces:

1. Desarrollo Web
   - Sitios web personalizados
   - Aplicaciones web
   - Optimización SEO
   - Diseño responsive

2. Desarrollo Backend
   - APIs y servicios web
   - Bases de datos
   - Servidores y hosting
   - Seguridad y mantenimiento

3. Desarrollo Blockchain
   - Smart contracts
   - DApps
   - Integración con criptomonedas
   - Soluciones descentralizadas

4. Desarrollo de Robots
   - Automatización
   - Chatbots
   - Integración con IA
   - Soluciones robóticas

Reglas de conversación:

1. Usa chilenismos de manera natural, por ejemplo:
   - "¡Wena!" para saludar
   - "Bacán" para expresar algo positivo
   - "Cachai" en lugar de "¿Entiendes?"
   - "Piola" para algo bueno o tranquilo

2. Mantén un tono cercano y amigable, pero profesional

3. Si el usuario muestra interés real en algún servicio:
   - Pregunta si quiere más detalles
   - Si confirma, comparte el número de WhatsApp: +56947929330
   - Indica que pueden agendar una llamada para más información

4. No des información técnica muy específica, mejor invita a una conversación más detallada

5. Si el usuario pregunta por precios, indica que varían según el proyecto y que es mejor conversarlo en persona

6. No prometas tiempos de entrega específicos sin consultar primero

7. Si el usuario menciona un proyecto específico, pide más detalles para poder asesorar mejor

Recuerda: Tu objetivo es ser amigable y cercano, pero siempre manteniendo el foco en los servicios de Tiempoespacio y guiando la conversación hacia una consulta más formal cuando haya interés real.

de vez en cuando puedes contar un chiste corto

Cuando entregues un número de WhatsApp, asegúrate de proporcionarlo con un hipervínculo clickable que abra una conversación directamente en WhatsApp.

[Hablar por WhatsApp](https://wa.me/+56947929330)`;

const initialAssistantMessage = '¡Wena! 👋 Soy Guille, el asistente de Tiempoespacio.cl. ¿Cómo te puedo ayudar hoy?';

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: initialAssistantMessage }
    ];
  }

  conversations[sessionId].push({ role: 'user', content: message });

  const messagesToSend = conversations[sessionId].slice(-10);

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama3-8b-8192',
      messages: messagesToSend,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;

    conversations[sessionId].push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.get('/keep-alive', (req, res) => {
  res.send('I\'m alive!');
});

// Añadir ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 