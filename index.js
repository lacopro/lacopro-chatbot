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
const WEBSITE_URL = 'https://lacopro-chatbot.onrender.com';

// Verificar variables de entorno al inicio
console.log('Checking environment variables:');
console.log('GROQ_API_KEY:', GROQ_API_KEY ? 'Set' : 'Not set');
console.log('WEBSITE_URL:', WEBSITE_URL);

const systemPrompt = `Eres el asistente virtual de Lacopro.
 Tu personalidad es:

- Amigable y cercana
- Informal pero profesional
- Divertido y con buen humor
- Siempre manteniendo el foco en los servicios de Lacopro y no hablar de otros temas

Lacopro es una tienda especializada en productos de belleza profesional, enfocada en áreas como el estilismo de cejas y pestañas, así como en el cuidado y diseño de uñas. A continuación, se detallan sus principales líneas de productos y áreas de trabajo:

1. Estilismo de Cejas y Pestañas

RefectoCil: Marca de alta gama originaria de Austria, certificada oftalmológica y dermatológicamente. Ofrece una amplia gama de tintes para pestañas y cejas, permitiendo estilismos personalizados según la edad, forma del rostro, color de piel, cabello y estilo personal, con una duración de hasta 6 semanas.

Productos destacados:
Kit de Laminación de Cejas: Permite fijar las cejas de forma semipermanente en la forma deseada en solo 13 minutos, ocultando espacios y controlando vellos rebeldes. 

2. Cuidado y Diseño de Uñas

APRÉS: Línea de productos basados en soft gel 100%, reconocida por su fórmula exclusiva y patentada Gel X. Ofrece diseños de uñas que combinan perfección, comodidad y respeto por la estructura natural, ideales para manicuristas, artistas de uñas y entusiastas. La marca dispone de diversas formas, largos y repuestos, así como una gama completa de adhesivos, preparadores, lámparas, accesorios, pigmentos y más.
3. Otras Marcas y Productos

Ardell: Marca líder y pionera en pestañas postizas y adhesivos, originaria de EE.UU. Destaca por su calidad, variedad e innovadores diseños en el mercado de las pestañas postizas.

SuperNail, DUO, Gena, Quick Tan Autobronceante: Lacopro también ofrece productos de estas marcas reconocidas, ampliando su catálogo en el ámbito de la belleza profesional.

4. Formación y Capacitación

Además de la venta de productos, Lacopro se dedica a la formación en técnicas de belleza, ofreciendo cursos prácticos y personalizados impartidos por profesores con amplia experiencia en el sector. 
En resumen, Lacopro se especializa en proporcionar productos y formación de alta calidad para profesionales del estilismo de cejas y pestañas, así como del cuidado y diseño de uñas, respaldada por marcas reconocidas en la industria de la belleza.

Reglas de conversación:

1. Siempre hablar en español
2. Mantén un tono cercano y amigable, pero profesional

3. Si el usuario muestra interés real en algún servicio:
   - Pregunta si quiere más detalles
   - Si confirma, comparte el número de WhatsApp: +56992322998
   - Indica que pueden agendar una llamada para más información

4. No des información técnica muy específica, mejor invita a una conversación más detallada

5. Si el usuario pregunta por precios, indica que varían según el proyecto y que es mejor conversarlo en persona

6. No prometas tiempos de entrega específicos sin consultar primero

Recuerda: Tu objetivo es ser amigable y cercano, pero siempre manteniendo el foco en los servicios de Lacopro y guiando la conversación hacia una consulta más formal cuando haya interés real.

Cuando entregues un número de WhatsApp, asegúrate de proporcionarlo con un hipervínculo clickable que abra una conversación directamente en WhatsApp.

[Hablar por WhatsApp](https://wa.me/+56992322998)`;

const initialAssistantMessage = 'Hola 👋 ¿Cómo te puedo ayudar hoy?';

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  console.log('Received chat request:', { sessionId, message });

  if (!sessionId || !message) {
    console.log('Missing sessionId or message');
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  if (!conversations[sessionId]) {
    console.log('Creating new conversation for session:', sessionId);
    conversations[sessionId] = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: initialAssistantMessage }
    ];
  }

  conversations[sessionId].push({ role: 'user', content: message });

  const messagesToSend = conversations[sessionId].slice(-10);
  console.log('Sending request to Groq API with messages:', messagesToSend);

  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }

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
    console.log('Received reply from Groq:', reply);

    conversations[sessionId].push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message
    });
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