class TiempoespacioChat {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'bottom-right',
            primaryColor: options.primaryColor || '#ff69b4',
            ...options
        };
        this.init();
    }

    init() {
        // Crear estilos
        const style = document.createElement('style');
        style.textContent = `
            .tiempoespacio-chat-widget {
                position: fixed;
                z-index: 9999;
                ${this.options.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                ${this.options.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            }

            .tiempoespacio-chat-button {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: ${this.options.primaryColor};
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                transition: transform 0.3s, box-shadow 0.3s;
            }

            .tiempoespacio-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            }

            .tiempoespacio-chat-window {
                display: none;
                position: fixed;
                bottom: 120px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                overflow: hidden;
                z-index: 9999;
            }

            .tiempoespacio-chat-header {
                background: ${this.options.primaryColor};
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }

            .tiempoespacio-chat-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 24px;
                padding: 5px;
            }

            .tiempoespacio-chat-messages {
                height: calc(100% - 140px);
                overflow-y: auto;
                padding: 15px;
                margin-bottom: 80px;
            }

            .tiempoespacio-chat-message {
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 10px;
                max-width: 80%;
            }

            .tiempoespacio-chat-user {
                background: #e3f2fd;
                margin-left: auto;
            }

            .tiempoespacio-chat-bot {
                background: #f5f5f5;
            }

            .tiempoespacio-chat-input {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                background: white;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                box-sizing: border-box;
            }

            .tiempoespacio-chat-input textarea {
                flex: 1;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 10px;
                resize: none;
                height: 50px;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.4;
                box-sizing: border-box;
            }

            .tiempoespacio-chat-input button {
                padding: 12px 20px;
                background: ${this.options.primaryColor};
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                height: 50px;
                min-width: 80px;
                font-weight: bold;
                font-size: 14px;
                transition: background-color 0.3s;
            }

            .tiempoespacio-chat-input button:hover {
                background: #ff4da6;
            }

            .tiempoespacio-chat-loading {
                display: none;
                text-align: center;
                padding: 10px;
            }

            .tiempoespacio-chat-loading::after {
                content: '...';
                animation: dots 1.5s steps(4, end) infinite;
            }

            @keyframes dots {
                0%, 20% { content: '.'; }
                40% { content: '..'; }
                60% { content: '...'; }
                80%, 100% { content: ''; }
            }
        `;
        document.head.appendChild(style);

        // Crear botón flotante
        const button = document.createElement('button');
        button.className = 'tiempoespacio-chat-widget tiempoespacio-chat-button';
        button.innerHTML = '📱';
        button.onclick = () => this.toggleChat();
        document.body.appendChild(button);

        // Crear ventana de chat
        const chatWindow = document.createElement('div');
        chatWindow.className = 'tiempoespacio-chat-window';
        chatWindow.innerHTML = `
            <div class="tiempoespacio-chat-header">
                <span>Chat Tiempoespacio</span>
                <button class="tiempoespacio-chat-close">×</button>
            </div>
            <div class="tiempoespacio-chat-messages"></div>
            <div class="tiempoespacio-chat-loading">Pensando</div>
            <div class="tiempoespacio-chat-input">
                <textarea placeholder="Escribe tu mensaje..." rows="3"></textarea>
                <button>Enviar</button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Configurar eventos
        this.chatWindow = chatWindow;
        this.messagesContainer = chatWindow.querySelector('.tiempoespacio-chat-messages');
        this.input = chatWindow.querySelector('textarea');
        this.sendButton = chatWindow.querySelector('.tiempoespacio-chat-input button');
        this.closeButton = chatWindow.querySelector('.tiempoespacio-chat-close');
        this.loading = chatWindow.querySelector('.tiempoespacio-chat-loading');

        this.sendButton.onclick = () => this.sendMessage();
        this.closeButton.onclick = () => this.toggleChat();
        this.input.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        };

        // Añadir mensaje inicial
        this.addMessage('¡Wena! 👋 Soy Guille, el asistente de Tiempoespacio.cl. ¿Cómo te puedo ayudar hoy?', 'bot');
    }

    toggleChat() {
        this.chatWindow.style.display = this.chatWindow.style.display === 'none' ? 'block' : 'none';
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `tiempoespacio-chat-message tiempoespacio-chat-${sender}`;
        messageDiv.textContent = message;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.input.value = '';
        this.loading.style.display = 'block';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: 'session-' + Math.random().toString(36).substr(2, 9)
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.addMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', 'bot');
        } finally {
            this.loading.style.display = 'none';
        }
    }
}

// Exportar la clase para uso global
window.TiempoespacioChat = TiempoespacioChat; 