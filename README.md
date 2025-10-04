# Aniket AI Assistant

Aniket is an AI-powered chat assistant built with HTML, CSS, and JavaScript that connects to the OpenRouter API. It features a space-themed UI with animated elements, persistent chat history, and structured response formatting.

## Features

- **Space-Themed UI**: Beautiful space-themed interface with animated stars, orbiting planet, and gradient effects
- **Persistent Chat History**: Save and manage multiple chat conversations with localStorage
- **Chat Management**: Create, rename, delete, and pin important chats
- **Structured Responses**: AI responses formatted with headers, lists, code blocks, and emphasis
- **Loading Indicators**: "Aniket is thinking..." animation with pulsing dots during AI processing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **API Key Management**: Built-in interface for updating OpenRouter API keys

## Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- JavaScript (ES6+)
- OpenRouter API with DeepSeek model

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. Start chatting with Aniket!

## API Key Configuration

The application comes with a default API key, but for production use, you should:

1. Get your own API key from [OpenRouter](https://openrouter.ai/keys)
2. Update it in the application through the settings modal
3. The key will be saved in your browser's localStorage

## Deployment

To deploy this application:

1. **Netlify Deployment**:
   - Connect your GitHub repository to Netlify
   - Set the build command to `# no build command`
   - Set the publish directory to `/`
   - Deploy!

2. **Vercel Deployment**:
   - Import your GitHub repository to Vercel
   - Configure the project settings as a static site
   - Deploy!

3. **GitHub Pages**:
   - Push your code to a GitHub repository
   - Enable GitHub Pages in the repository settings
   - Select the main branch as the source

## Usage

- Type your message in the input box and press Enter or click Send
- Create new chats with the "+ New Chat" button
- Manage existing chats using the sidebar controls
- The AI will respond as "Aniket" when addressed by name
- Update your API key through the settings if needed

## Project Structure

```
Agent/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Security Notice

⚠️ **Important**: The default API key is shared and may be rate-limited or revoked. For production use, please obtain your own API key from [OpenRouter](https://openrouter.ai/keys).

## License

This project is open source and available under the MIT License.