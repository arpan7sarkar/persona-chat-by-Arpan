// Global state
let currentPersona = null;
let personaData = {};
let chatHistory = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadPersonaData();
    setupEventListeners();

    // If we're on chat page and persona is in URL, auto-initialize chat
    const params = new URLSearchParams(window.location.search);
    const personaFromUrl = params.get('persona');
    if (personaFromUrl && (personaFromUrl === 'hitesh' || personaFromUrl === 'piyush')) {
        currentPersona = personaFromUrl;
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.classList.remove('hidden');
        // Ensure chat interface is visible if this page only has chat
        const chat = document.getElementById('chatInterface');
        const landing = document.getElementById('landingPage');
        if (landing) landing.classList.add('hidden');
        if (chat) chat.classList.remove('hidden');
        setupChatInterface();
        if (loading) loading.classList.add('hidden');
        const input = document.getElementById('messageInput');
        if (input) input.focus();
    }
});

// Load persona data from API
async function loadPersonaData() {
    try {
        const response = await fetch('/api/personas');
        personaData = await response.json();
    } catch (error) {
        console.error('Failed to load persona data:', error);
        // Fallback for file:// or when server is not running
        personaData = {
            hitesh: {
                id: 'hitesh',
                name: 'Hitesh Choudhary',
                title: 'Coding Educator & Chai aur Code Founder',
                description: 'Passionate coding educator with 15+ years experience. Teaches 1.6M+ students with chai analogies and Hindi/Hinglish style.',
                avatar: './images/hitesh.png',
                specialties: ['JavaScript', 'React', 'Node.js', 'Teaching', 'Community Building'],
                greeting: "Namaskarrr dosto! Chai ready hai? Let's code together! ☕"
            },
            piyush: {
                id: 'piyush',
                name: 'Piyush Garg',
                title: 'Full-Stack Developer & Teachyst Founder',
                description: 'Full-stack developer with 5+ years industry experience. 275K+ YouTube subscribers. Focus on project-based learning.',
                avatar: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.googleusercontent.com%2Fytc%2FAIdro_k7rVfo5FgCqk4zP1BZJrjPTHPEY1Ijuz6hj8ogolyy3HN4%3Ds900-c-k-c0x00ffffff-no-rj&f=1&nofb=1&ipt=41d67241f610b63d7a2bbe31b71774f857a93cc6df0ffbab7c43f45df4e45138',
                specialties: ['Full-Stack', 'MERN', 'System Design', 'Open Source', 'Real Projects'],
                greeting: "Hey everyone! Ready to build some real-world applications? Let's get started! 🚀"
            }
        };
    }
}

// Setup event listeners
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        
        // Enable/disable send button
        sendButton.disabled = !this.value.trim();
    });

    // Handle Enter key
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim()) {
                sendMessage();
            }
        }
    });
}

// Select persona and switch to chat
async function selectPersona(persona) {
    // Navigate to dedicated chat page with persona param
    const isFile = window.location.protocol === 'file:';
    const url = `${isFile ? '' : '/'}chat.html?persona=${encodeURIComponent(persona)}`;
    window.location.href = url;
}

// Setup chat interface with persona data
function setupChatInterface() {
    const persona = personaData[currentPersona];
    if (!persona) return;

    // Update header
    const avatar = document.getElementById('personaAvatar');
    const name = document.getElementById('personaName');

    avatar.className = `w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl avatar-glow ${
        currentPersona === 'hitesh' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'
    }`;
    if (persona.avatar) {
        avatar.innerHTML = `<img src="${persona.avatar}" alt="${persona.name}" class="w-14 h-14 rounded-2xl object-cover" />`;
    } else {
        avatar.textContent = persona.name.split(' ').map(n => n[0]).join('');
    }
    
    name.textContent = persona.name;

    // Clear chat and add welcome message
    chatHistory = [];
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    addMessage(persona.greeting, 'ai', true);
}

// Go back to persona selection
function goBack() {
    const isFile = window.location.protocol === 'file:';
    const sameOriginRef = document.referrer && document.referrer.startsWith(`${location.protocol}//${location.host}`);
    if (!isFile && sameOriginRef && window.history.length > 1) {
        // Use history when coming from our own index page
        window.history.back();
        return;
    }
    // Fallback hard navigation
    window.location.href = isFile ? 'index.html' : '/';
}

// Add message to chat
function addMessage(content, sender, isWelcome = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    const isUser = sender === 'user';
    const persona = personaData[currentPersona];
    
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-6`;
    
    if (isUser) {
        messageDiv.innerHTML = `
            <div class="message-user text-white px-6 py-4 max-w-md">
                <div class="text-base whitespace-pre-wrap leading-relaxed">${content}</div>
                <div class="text-xs text-blue-100 mt-3 opacity-75 text-right">
                    ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-4 w-full max-w-4xl">
                <div class="w-12 h-12 ${currentPersona === 'hitesh' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-2xl flex-shrink-0 avatar-glow overflow-hidden">
                    ${persona.avatar ? `<img src="${persona.avatar}" alt="${persona.name}" class="w-12 h-12 rounded-2xl object-cover" />` : persona.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="message-ai px-6 py-4 flex-1 min-w-0">
                    ${!isWelcome ? `
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="text-sm font-semibold text-white">${persona.name}</span>
                            <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            <span class="text-xs text-gray-400 font-medium">AI Assistant</span>
                        </div>
                    ` : ''}
                    <div class="text-base text-gray-100 whitespace-pre-wrap leading-relaxed break-words">${content}</div>
                    <div class="text-xs text-gray-500 mt-4 opacity-75">
                        ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to bottom with animation
    setTimeout(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    // Add to history
    if (!isWelcome) {
        chatHistory.push({ content, sender, timestamp: new Date().toISOString() });
    }
}

// Send message
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentPersona) return;
    
    // Clear input and disable send button
    messageInput.value = '';
    messageInput.style.height = 'auto';
    document.getElementById('sendButton').disabled = true;
    
    // Add user message
    addMessage(message, 'user');
    
    // Show typing indicator
    document.getElementById('typingIndicator').classList.remove('hidden');
    
    try {
        // Send to API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                persona: currentPersona,
                history: chatHistory.slice(-10) // Send last 10 messages for context
            })
        });
        
        let data;
        if (!response.ok) {
            // Try to parse error body for details
            try {
                const errJson = await response.json();
                const details = errJson?.details ? ` Details: ${errJson.details}` : '';
                throw new Error(`HTTP ${response.status} - ${errJson?.error || 'Server error.'}${details}`);
            } catch (_) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } else {
            data = await response.json();
        }
        
        // Hide typing indicator
        document.getElementById('typingIndicator').classList.add('hidden');
        
        // Add AI response
        addMessage(data.response, 'ai');
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Hide typing indicator
        document.getElementById('typingIndicator').classList.add('hidden');
        
        // Show error message
        addMessage(
            `Sorry, I'm having trouble connecting right now. Please check your internet connection and try again. ${error.message}`,
            'ai'
        );
    }
    
    // Focus back on input
    messageInput.focus();
}

// Utility functions for better UX
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium animate-slide-up ${
        type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle connection errors gracefully
window.addEventListener('online', () => {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Please check your connection.', 'error');
});

// Prevent form submission on Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Expose functions for inline handlers
// Ensures Start Chat buttons and header back button work in all browsers
window.selectPersona = selectPersona;
window.sendMessage = sendMessage;
window.goBack = goBack;
