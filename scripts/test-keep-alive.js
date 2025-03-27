const axios = require('axios');

// Configuración
const config = {
    // Cambia esta URL según tu entorno
    url: process.env.KEEP_ALIVE_URL || 'http://localhost:3000/keep-alive',
    interval: process.env.KEEP_ALIVE_INTERVAL || 5 * 60 * 1000, // 5 minutos
};

async function pingKeepAlive() {
    try {
        const response = await axios.get(config.url);
        console.log(`[${new Date().toISOString()}] Keep-alive ping successful:`, response.data);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Keep-alive ping failed:`, error.message);
    }
}

// Ejecutar el ping inmediatamente y luego cada intervalo
console.log(`Starting keep-alive pings to ${config.url} every ${config.interval/1000} seconds`);
pingKeepAlive();
setInterval(pingKeepAlive, config.interval); 