const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import personas
const { hiteshPersona } = require('./hitesh.js');
const { piyushPersona } = require('./piyush.js');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Initialize Gemini AI
const { GEMINI_API_KEY, NODE_ENV } = process.env;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing. Set it in your .env file.');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Persona configurations
const personas = {
  hitesh: { data: hiteshPersona },
  piyush: { data: { ...piyushPersona, persona_id: "piyush_garg" } }
};

// Model selection with fallback for SDK compatibility
const PREFERRED_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  'gemini-pro'
];

async function generateWithFallback(prompt) {
  let lastErr;
  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastErr = err;
      // Try next model if the error suggests model issues, otherwise break
      const msg = (err?.message || '').toLowerCase();
      const retriable = msg.includes('not found') || msg.includes('unknown') || msg.includes('unsupported') || msg.includes('invalid') || msg.includes('404');
      if (!retriable) break;
    }
  }
  throw lastErr;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, persona: selectedPersona, history = [] } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing GEMINI_API_KEY' });
    }

    if (!message || !selectedPersona) {
      return res.status(400).json({ error: 'Message and persona are required' });
    }

    if (!personas[selectedPersona]) {
      return res.status(400).json({ error: 'Invalid persona selected' });
    }

    const persona = personas[selectedPersona];

    // Build few-shot examples from persona data (use only 1 to keep prompt tight)
    const examples = Array.isArray(persona.data.training_examples)
      ? persona.data.training_examples.slice(0, 1)
      : [];
    const examplesBlock = examples.length
      ? examples.map((ex, i) => `Example ${i + 1}:
User: ${ex.user_input}
Assistant (${selectedPersona}): ${ex.expected_response}`).join('\n\n')
      : '';

    // Build short chat history (last 6 turns)
    const trimmedHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyBlock = trimmedHistory.length
      ? trimmedHistory.map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : '';

    // Create context-aware prompt
    const systemPrompt = `${persona.data.system_instruction}

IMPORTANT RESPONSE GUIDELINES (STRICT):
- Always respond in character as ${selectedPersona === 'hitesh' ? 'Hitesh Choudhary' : 'Piyush Garg'}
- Answer the user's question directly; do NOT repeat training data or persona background
- Be concise: 2-5 sentences OR up to 5 short bullets (<= 100-120 words)
- No greetings, no sign-offs, no emojis, no disclaimers
- Use Hinglish tone naturally; include a signature phrase only if it fits naturally
- If unclear, ask ONE short clarifying question instead of long filler

${examplesBlock ? `FEW-SHOT EXAMPLES (style reference only, do not copy):\n${examplesBlock}\n` : ''}
${historyBlock ? `RECENT CONVERSATION:\n${historyBlock}\n` : ''}
Current User Message: ${message}

Now respond as ${selectedPersona === 'hitesh' ? 'Hitesh Choudhary' : 'Piyush Garg'} in a concise answer that follows the STRICT guidelines:`;

    const text = await generateWithFallback(systemPrompt);

    res.json({ 
      response: text,
      persona: selectedPersona,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please check your API key, internet connection, and server logs.',
      details: NODE_ENV === 'development' ? (error?.message || String(error)) : undefined
    });
  }
});

// Get persona info
app.get('/api/personas', (req, res) => {
  const personaInfo = {
    hitesh: {
      id: 'hitesh',
      name: 'Hitesh Choudhary',
      title: 'Coding Educator & Chai aur Code Founder',
      description: 'Passionate coding educator with 15+ years experience. Teaches 1.6M+ students with chai analogies and Hindi/Hinglish style.',
      avatar: '/images/hitesh-avatar.jpg',
      specialties: ['JavaScript', 'React', 'Node.js', 'Teaching', 'Community Building'],
      greeting: 'Namaskarrr dosto! Chai ready hai? Let\'s code together! ☕'
    },
    piyush: {
      id: 'piyush',
      name: 'Piyush Garg',
      title: 'Full-Stack Developer & Teachyst Founder',
      description: 'Full-stack developer with 5+ years industry experience. 275K+ YouTube subscribers. Focus on project-based learning.',
      avatar: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.googleusercontent.com%2Fytc%2FAIdro_k7rVfo5FgCqk4zP1BZJrjPTHPEY1Ijuz6hj8ogolyy3HN4%3Ds900-c-k-c0x00ffffff-no-rj&f=1&nofb=1&ipt=41d67241f610b63d7a2bbe31b71774f857a93cc6df0ffbab7c43f45df4e45138',
      specialties: ['Full-Stack', 'MERN', 'System Design', 'Open Source', 'Real Projects'],
      greeting: 'Hey everyone! Ready to build some real-world applications? Let\'s get started! 🚀'
    }
  };
  
  res.json(personaInfo);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Persona AI Chatbot server running on port ${port}`);
    console.log(`📱 Open http://localhost:${port} to start chatting`);
    console.log(`🔑 Make sure to set your GEMINI_API_KEY in .env file`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️  Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });

  return server;
};

startServer(Number(PORT));

module.exports = app;
