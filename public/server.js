(function() {
  'use strict';

  if (window.ChatWidget) return;

  class ChatWidget {
    constructor() {
      this.config = {
        primaryColor: '#4F46E5',
        position: 'bottom-right',
        title: 'Chat with us',
        greeting: 'Hello! How can we help you?',
        apiEndpoint: window.location.origin
      };
      this.isOpen = false;
      this.sessionId = this.getSessionId();
    }

    init(userConfig = {}) {
      this.config = { ...this.config, ...userConfig };
      this.render();
    }

    render() {
      this.createStyles();
      this.createWidget();
    }

    createStyles() {
      const styles = `
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .chat-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .chat-widget-button:hover {
          transform: scale(1.1);
        }
        .chat-widget-window {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 25px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        .chat-widget-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 15px;
          text-align: center;
        }
        .chat-widget-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: #f8f9fa;
        }
        .chat-message {
          margin: 10px 0;
          padding: 10px;
          border-radius: 10px;
          max-width: 80%;
        }
        .chat-message.user {
          background: ${this.config.primaryColor};
          color: white;
          margin-left: auto;
        }
        .chat-message.bot {
          background: white;
          border: 1px solid #e0e0e0;
        }
        .chat-widget-input {
          border: none;
          border-top: 1px solid #e0e0e0;
          padding: 15px;
          display: flex;
          gap: 10px;
        }
        .chat-widget-input input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 15px;
          outline: none;
        }
        .chat-widget-input button {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .chat-widget-window { width: 90vw; }
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const container = document.createElement('div');
      container.className = 'chat-widget-container';
      
      container.innerHTML = `
        <button class="chat-widget-button" onclick="window.chatWidget.toggle()">
          💬
        </button>
        <div class="chat-widget-window" id="chat-window">
          <div class="chat-widget-header">
            <h3>${this.config.title}</h3>
          </div>
          <div class="chat-widget-messages" id="chat-messages">
            <div class="chat-message bot">${this.config.greeting}</div>
          </div>
          <div class="chat-widget-input">
            <input type="text" placeholder="Type a message..." id="chat-input" onkeypress="if(event.key==='Enter') window.chatWidget.sendMessage()">
            <button onclick="window.chatWidget.sendMessage()">Send</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);
      window.chatWidget = this;
    }

    toggle() {
      const window = document.getElementById('chat-window');
      this.isOpen = !this.isOpen;
      window.style.display = this.isOpen ? 'flex' : 'none';
    }

    async sendMessage() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (!message) return;

      this.addMessage(message, true);
      input.value = '';

      try {
        const response = await fetch(`${this.config.apiEndpoint}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId: this.sessionId })
        });
        
        const data = await response.json();
        if (data.reply) {
          setTimeout(() => this.addMessage(data.reply, false), 500);
        }
      } catch (error) {
        this.addMessage('Sorry, something went wrong. Please try again.', false);
      }
    }

    addMessage(content, isUser) {
      const messages = document.getElementById('chat-messages');
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${isUser ? 'user' : 'bot'}`;
      messageEl.textContent = content;
      messages.appendChild(messageEl);
      messages.scrollTop = messages.scrollHeight;
    }

    getSessionId() {
      let sessionId = localStorage.getItem('chatSessionId');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatSessionId', sessionId);
      }
      return sessionId;
    }
  }

  window.ChatWidget = {
    init: function(config) {
      const widget = new ChatWidget();
      widget.init(config);
      return widget;
    }
  };
})();
