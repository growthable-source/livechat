const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
const messages = new Map();

// WebSocket server
const wss = new WebSocket.Server({ server });

// Simple message endpoint
app.post('/api/messages', (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  // Store message
  if (!messages.has(sessionId)) {
    messages.set(sessionId, []);
  }
  
  const messageData = {
    id: uuidv4(),
    content: message,
    isUser: true,
    timestamp: new Date().toISOString()
  };
  
  messages.get(sessionId).push(messageData);
  
  // Simple auto-response
  let response = "Thanks for your message! How can I help you?";
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    response = "Hello! Welcome to our chat. How can I assist you today?";
  } else if (message.toLowerCase().includes('help')) {
    response = "I'm here to help! What do you need assistance with?";
  } else if (message.toLowerCase().includes('price')) {
    response = "I'd be happy to help with pricing. Let me connect you with our sales team.";
  }
  
  // Store response
  const responseData = {
    id: uuidv4(),
    content: response,
    isUser: false,
    timestamp: new Date().toISOString()
  };
  
  messages.get(sessionId).push(responseData);
  
  res.json({ reply: response });
});

// Get messages for a session
app.get('/api/messages/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionMessages = messages.get(sessionId) || [];
  res.json(sessionMessages);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
