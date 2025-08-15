# Persona AI Chatbot 🤖

A modern AI chatbot featuring authentic conversations with **Hitesh Choudhary** and **Piyush Garg** personas, powered by Google's Gemini AI.

## ✨ Features

- **Dual Personas**: Chat with Hitesh Choudhary (Chai aur Code) or Piyush Garg (Teachyst founder)
- **Authentic Conversations**: Each AI maintains unique speaking patterns and teaching styles
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Chat**: Instant responses with typing indicators
- **Production Ready**: Optimized for Vercel deployment
- **Secure**: Rate limiting, CORS protection, and environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and setup**
```bash
cd personas
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

3. **Add your Gemini API key to `.env`**
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

4. **Start the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🎭 Personas

### Hitesh Choudhary
- **Style**: Hindi/Hinglish with chai analogies
- **Expertise**: JavaScript, React, Teaching, Community Building
- **Signature**: "Namaskarrr dosto! Chai ready hai?"

### Piyush Garg  
- **Style**: Project-focused, reality-check approach
- **Expertise**: Full-Stack, MERN, System Design, Real Projects
- **Signature**: "Hey everyone! Ready to build real applications?"

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini Pro API
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Vercel-optimized

## 📁 Project Structure

```
personas/
├── public/
│   ├── index.html          # Landing page & chat interface
│   ├── script.js           # Frontend JavaScript
│   └── images/             # Avatar images
├── hitesh.js               # Hitesh persona configuration
├── piyush.js               # Piyush persona configuration  
├── server.js               # Express.js backend
├── package.json            # Dependencies
├── vercel.json             # Vercel deployment config
├── .env                    # Environment variables
└── README.md               # This file
```

## 🚀 Deployment to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add GEMINI_API_KEY
```

### Method 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add `GEMINI_API_KEY` in Vercel dashboard → Settings → Environment Variables
4. Deploy automatically

### Environment Variables for Production
```env
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

## 🔧 API Endpoints

- `GET /` - Main application
- `GET /api/personas` - Get persona information
- `POST /api/chat` - Send message to AI
- `GET /api/health` - Health check

## 🎨 Customization

### Adding New Personas
1. Create persona configuration file (follow `hitesh.js` format)
2. Import in `server.js`
3. Add to personas object
4. Update frontend persona selection

### Styling
- Modify Tailwind classes in `index.html`
- Update color scheme in Tailwind config
- Customize animations and transitions

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Content Security Policy**: XSS protection
- **Input Validation**: Message and persona validation
- **Environment Variables**: Secure API key storage

## 🐛 Troubleshooting

### Common Issues

**"Failed to generate response"**
- Check your Gemini API key in `.env`
- Verify API key has proper permissions
- Check network connectivity

**Port already in use**
- Change PORT in `.env` file
- Kill existing process: `npx kill-port 3000`

**Vercel deployment fails**
- Ensure `vercel.json` is properly configured
- Check environment variables are set
- Verify Node.js version compatibility

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 📝 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed reproduction steps for bugs

---

**Built with ❤️ from Arpan**
