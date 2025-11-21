require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Store conversation history per session (simple in-memory store)
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    const history = conversations.get(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: history,
    });

    const assistantMessage = response.content[0].text;

    // Add assistant response to history
    history.push({ role: 'assistant', content: assistantMessage });

    // Keep only last 20 messages to prevent token overflow
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.json({
      reply: assistantMessage,
      sessionId
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to get response from Claude',
      details: error.message
    });
  }
});

// Clear conversation history
app.post('/api/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  conversations.delete(sessionId);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
