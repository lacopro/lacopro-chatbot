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

# Lacopro Chatbot

Chatbot personalizado para Lacopro usando Groq API, con integración a Supabase para gestión de productos.

## Características

- Integración con Groq API para respuestas inteligentes
- Base de datos de productos en Supabase
- Interfaz web para chat en tiempo real
- Soporte para enlaces clickeables en respuestas
- Contenedorización con Docker

## Requisitos

- Node.js (v14 o superior)
- Cuenta en Groq para API key
- Cuenta en Supabase con base de datos de productos
- Docker (opcional, para despliegue)

## Estructura de la base de datos

La tabla de productos en Supabase debe tener la siguiente estructura:

| Campo           | Tipo          | Descripción                          |
|-----------------|---------------|--------------------------------------|
| id              | int8 (bigint) | ID único (auto-generado)             |
| post_title      | text          | Nombre del producto                  |
| post_name       | text          | Slug del producto                    |
| post_content    | text          | Descripción del producto (Nullable)  |
| product_page_url| text          | URL del producto                     |

## Configuración

1. Clonar el repositorio
2. Crear un archivo `.env` basado en `.env.example` con los siguientes valores:
   ```
   PORT=3000
   GROQ_API_KEY=tu_api_key_de_groq
   WEBSITE_URL=tu_url_del_sitio
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_clave_de_supabase
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

## Despliegue con Docker

1. Construir la imagen:
   ```bash
   docker build -t lacopro-chatbot .
   ```
2. Ejecutar el contenedor:
   ```bash
   docker run -p 3000:3000 --env-file .env lacopro-chatbot
   ```

## Actualización de productos

Los productos se cargan automáticamente al iniciar el servidor. Para actualizar los productos manualmente, puede hacer una petición POST al endpoint `/update-products`:

```bash
curl -X POST http://localhost:3000/update-products
```

## Desarrollo

Para ejecutar en modo desarrollo con recarga automática:

```bash
npm run dev
``` 