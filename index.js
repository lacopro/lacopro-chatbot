// Ignorar advertencia de deprecación de punycode
process.noDeprecation = true;

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const conversations = {};

// Sistema de caché para respuestas frecuentes
const responseCache = {
  cache: {},
  maxSize: 100, // Máximo número de entradas en caché
  
  // Generar una clave única para cada consulta
  getKey(message, sessionContext = '') {
    // Simplificar el mensaje para mejorar las coincidencias de caché
    const normalizedMessage = message.toLowerCase().trim();
    return `${normalizedMessage}|${sessionContext}`;
  },
  
  // Añadir una respuesta a la caché
  add(message, reply, sessionContext = '') {
    const key = this.getKey(message, sessionContext);
    const timestamp = Date.now();
    
    // Si la caché está llena, eliminar la entrada más antigua
    if (Object.keys(this.cache).length >= this.maxSize) {
      const oldestKey = Object.keys(this.cache)
        .sort((a, b) => this.cache[a].timestamp - this.cache[b].timestamp)[0];
      delete this.cache[oldestKey];
    }
    
    this.cache[key] = { reply, timestamp };
    console.log(`Added to cache: "${message.substring(0, 30)}..."`);
  },
  
  // Obtener una respuesta de la caché
  get(message, sessionContext = '') {
    const key = this.getKey(message, sessionContext);
    const cacheHit = this.cache[key];
    
    if (cacheHit) {
      console.log(`Cache hit: "${message.substring(0, 30)}..."`);
      // Actualizar timestamp para algoritmo LRU (Least Recently Used)
      cacheHit.timestamp = Date.now();
      return cacheHit.reply;
    }
    
    return null;
  }
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://lacopro-chatbot.onrender.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Verificar variables de entorno al inicio
console.log('Checking environment variables:');
console.log('GROQ_API_KEY:', GROQ_API_KEY ? 'Set' : 'Not set');
console.log('WEBSITE_URL:', WEBSITE_URL);
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'Set' : 'Not set');

// Inicializar cliente de Supabase si las variables de entorno están disponibles
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client initialized');
}

// Función para cargar productos desde Supabase (solo lectura)
let productsData = [];
async function loadProducts() {
  if (!supabase) {
    console.log('Supabase client not initialized, skipping product loading');
    return false;
  }
  
  try {
    console.log('Cargando productos desde Supabase (solo lectura)...');
    const { data, error } = await supabase
      .from('productos')
      .select('id, post_title, post_name, post_content, product_page_url');
    
    if (error) {
      console.error('Error loading products from Supabase:', error);
      return false;
    }
    
    productsData = data || [];
    console.log(`Loaded ${productsData.length} products from Supabase`);
    return productsData.length > 0;
  } catch (error) {
    console.error('Failed to load products:', error);
    return false;
  }
}

// Generar texto de productos para el prompt del sistema
function generateProductsPrompt() {
  if (!productsData || productsData.length === 0) {
    return '';
  }
  
  let productsPrompt = '\n\nCatálogo de Productos Disponibles:\n\n';
  
  // Limitar a máximo 50 productos para evitar que el prompt sea demasiado largo
  const maxProductsInPrompt = 50;
  const productsToShow = productsData.slice(0, maxProductsInPrompt);
  
  productsToShow.forEach(product => {
    // Limpiar el título del producto y manejar posibles valores nulos
    const title = product.post_title ? product.post_title.replace(/"/g, '').trim() : 'Producto sin nombre';
    const url = product.product_page_url || `https://www.lacopro.cl/producto/${product.post_name || 'producto'}`;
    
    // Formato simplificado con guiones como solicitado
    productsPrompt += `- ${title}: ${url}\n`;
  });
  
  // Agregar información sobre productos adicionales si se alcanzó el límite
  if (productsData.length > maxProductsInPrompt) {
    productsPrompt += `\n... y ${productsData.length - maxProductsInPrompt} productos más disponibles.\n`;
  }
  
  productsPrompt += '\n¡IMPORTANTE! - SIEMPRE debes incluir enlaces de productos en tus respuestas, especialmente cuando te pregunten por un tipo de producto. Copia y pega el enlace completo exactamente como aparece aquí arriba.';
  
  return productsPrompt;
}

// Base del prompt del sistema
const baseSystemPrompt = `Eres el asistente virtual de Lacopro.
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

3. MUY IMPORTANTE - SIEMPRE ofrece productos con sus enlaces:
   - Cuando un usuario pregunte por productos, SIEMPRE muestra 2-3 opciones con sus enlaces completos
   - SIEMPRE que menciones un producto, incluye su enlace completo a continuación
   - Asegúrate de compartir los enlaces tal cual están en el catálogo de productos
   - Sé proactivo ofreciendo productos relacionados a las consultas del usuario

4. Si el usuario muestra interés real en algún producto o servicio:
   - Pregunta si quiere más detalles
   - Si confirma, comparte el número de WhatsApp: +56992322998
   - Indica que pueden agendar una llamada para más información

5. No des información técnica muy específica, mejor invita a una conversación más detallada

6. Si el usuario pregunta por precios, indica que varían según el proyecto y que es mejor conversarlo en persona

7. No prometas tiempos de entrega específicos sin consultar primero

Recuerda: Tu objetivo es ser amigable y cercano, compartir información útil y SIEMPRE ofrecer productos con sus enlaces completos. Esto es fundamental para ayudar al usuario.

Muy importante: Cuando entregues URLs, escríbelas COMPLETAS tal cual están en el catálogo. Por ejemplo:
https://www.lacopro.cl/producto/lima-recta-negra-80-80/

Para el WhatsApp, usa este formato: https://wa.me/+56992322998`;

// Inicialización
let systemPrompt = baseSystemPrompt;
const initialAssistantMessage = 'Hola 👋 ¿Cómo te puedo ayudar hoy?';

// Carga inicial de productos y actualización del prompt
(async () => {
  await loadProducts();
  systemPrompt = baseSystemPrompt + generateProductsPrompt();
  console.log('System prompt updated with products information');
})();

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

  // Intentar obtener respuesta de la caché primero
  // Para las consultas de caché, solo usamos el último mensaje del usuario para simplicidad
  const cachedReply = responseCache.get(message);
  if (cachedReply) {
    console.log('Using cached response');
    conversations[sessionId].push({ role: 'assistant', content: cachedReply });
    return res.json({ reply: cachedReply });
  }

  const messagesToSend = conversations[sessionId].slice(-10);
  console.log('Sending request to Groq API with messages:', messagesToSend);

  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }

    const response = await axios.post(GROQ_API_URL, {
      model: 'gemma2-9b-it',  // Cambiado de llama3-8b-8192 a gemma2-9b-it
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

    // Guardar la respuesta en la caché
    responseCache.add(message, reply);

    conversations[sessionId].push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // Si es un error de límite de tasa (429), intentar devolver una respuesta aproximada de la caché
    if (error.response?.status === 429) {
      // Buscar en la caché una respuesta similar para este tipo de consulta
      // Aquí simplificamos y buscamos palabras clave
      const keywords = message.toLowerCase().split(/\s+/);
      let bestMatch = null;
      
      for (const key in responseCache.cache) {
        const matchScore = keywords.filter(word => 
          key.toLowerCase().includes(word) && word.length > 3
        ).length;
        
        if (matchScore >= 2) { // Si hay al menos 2 palabras clave coincidentes
          bestMatch = responseCache.cache[key].reply;
          console.log('Found approximate cache match');
          break;
        }
      }
      
      if (bestMatch) {
        conversations[sessionId].push({ role: 'assistant', content: bestMatch });
        return res.json({ reply: bestMatch });
      }
      
      // Si no hay coincidencia, devolver un mensaje amigable sobre el límite de tasa
      const fallbackMsg = "Lo siento, estamos experimentando mucho tráfico en este momento. Por favor, espera unos segundos e intenta nuevamente. ¡Gracias por tu paciencia! 😊";
      return res.json({ reply: fallbackMsg });
    }
    
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
});

// Endpoint para actualizar productos manualmente (solo recarga desde Supabase)
app.post('/update-products', async (req, res) => {
  try {
    const success = await loadProducts();
    if (success) {
      systemPrompt = baseSystemPrompt + generateProductsPrompt();
      res.json({ 
        success: true, 
        message: 'Products loaded successfully from Supabase', 
        count: productsData.length 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Failed to load products from Supabase or no products found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to load products', 
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