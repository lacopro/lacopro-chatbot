# 🤖 Tiempoespacio Chatbot

Un chatbot personalizado para lacopro.cl usando la API de Groq, con una interfaz web moderna y fácil de integrar.

![Chatbot Demo](public/demo.gif)

## ✨ Características

- 💬 Chat flotante con diseño moderno y responsive
- 🎨 Personalizable (colores, posición, mensajes)
- 🧠 Integración con Groq AI para respuestas inteligentes
- 💾 Manejo de sesiones para mantener el contexto
- 🚀 Fácil de integrar en cualquier sitio web
- 📱 Diseño optimizado para móviles
- 🌈 Animaciones suaves y feedback visual
- 🔄 Keep-alive para mantener el servicio activo

## 🛠️ Tecnologías

- Node.js 20+
- Express.js
- API de Groq
- Docker
- HTML/CSS/JavaScript (vanilla)

## 🚀 Inicio Rápido

### Usando Docker (recomendado)

1. Clona el repositorio:
   ```bash
   git clone https://github.com/CRPTcuan/tiempoespacio-chatbot.git
   cd tiempoespacio-chatbot
   ```

2. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env y añade tu GROQ_API_KEY
   ```

3. Construye y ejecuta con Docker:
   ```bash
   docker build -t tiempoespacio-chatbot .
   docker run -p 3000:3000 -e GROQ_API_KEY=tu_api_key tiempoespacio-chatbot
   ```

### Instalación Manual

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm run dev   # desarrollo
   npm start     # producción
   ```

## 💻 Integración

Añade el chatbot a tu sitio web con solo dos líneas de código:

```html
<script src="https://tu-servidor.com/chat-widget.js"></script>
<script>
    new TiempoespacioChat({
        position: 'bottom-right',
        primaryColor: '#ff69b4'
    });
</script>
```

### Opciones de Configuración

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| position | string | 'bottom-right' | Posición del botón ('bottom-right', 'bottom-left', 'top-right', 'top-left') |
| primaryColor | string | '#ff69b4' | Color principal del chatbot |

## 🌐 Despliegue en Render

1. Conecta tu repositorio de GitHub a Render
2. Crea un nuevo Web Service
3. Configura las variables de entorno:
   - `GROQ_API_KEY`: Tu API key de Groq
   - `PORT`: 3000

### Mantener Activo el Servicio

Para evitar la inactividad en el plan gratuito de Render:
1. Configura UptimeRobot para hacer ping cada 10 minutos
2. URL del ping: `https://tu-servicio.onrender.com/keep-alive`

## 📝 Personalización del Chatbot

El chatbot viene preconfigurado con una personalidad amigable y cercana, usando chilenismos y enfocado en los servicios de Tiempoespacio. Puedes modificar:

- Prompt del sistema
- Mensajes de bienvenida
- Estilos y diseño
- Comportamiento y respuestas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

Tiempoespacio - [Hablar por WhatsApp](https://wa.me/+56947929330)

[https://github.com/CRPTcuan/tiempoespacio-chatbot](https://github.com/CRPTcuan/tiempoespacio-chatbot) 