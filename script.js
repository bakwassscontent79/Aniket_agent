// AI Agent JavaScript functionality with chat history and context management
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryList = document.getElementById('chat-history-list');
    
    // Modal elements
    const renameModal = document.getElementById('rename-modal');
    const deleteModal = document.getElementById('delete-modal');
    const newChatTitleInput = document.getElementById('new-chat-title');
    const cancelRenameBtn = document.getElementById('cancel-rename');
    const confirmRenameBtn = document.getElementById('confirm-rename');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    // Application state
    let chats = {}; // Store all chats
    let currentChatId = null; // ID of currently active chat
    let chatToManage = null; // ID of chat being renamed/deleted
    const MAX_HISTORY_MESSAGES = 30; // Maximum messages per chat
    let currentResponseElement = null; // Element for current streaming response
    let currentResponseText = ''; // Accumulated response text
    
    // Initialize the app
    function init() {
        loadChatsFromStorage();
        if (Object.keys(chats).length === 0) {
            createNewChat();
        } else {
            // Load the most recent chat
            const chatIds = Object.keys(chats);
            switchToChat(chatIds[chatIds.length - 1]);
        }
        renderChatHistory();
    }
    
    // Create a new chat
    function createNewChat() {
        const chatId = Date.now().toString();
        chats[chatId] = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            pinned: false
        };
        switchToChat(chatId);
        saveChatsToStorage();
        renderChatHistory();
    }
    
    // Switch to a specific chat
    function switchToChat(chatId) {
        currentChatId = chatId;
        renderChatMessages();
        updateActiveChatInHistory();
    }
    
    // Render chat messages for current chat
    function renderChatMessages() {
        if (!currentChatId || !chats[currentChatId]) return;
        
        const chat = chats[currentChatId];
        chatMessages.innerHTML = '';
        
        // Add welcome message for empty chats
        if (chat.messages.length === 0) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'message welcome-message';
            welcomeDiv.innerHTML = '<p>Hello! I\'m Aniket, your AI assistant. How can I help you today?</p>';
            chatMessages.appendChild(welcomeDiv);
            return;
        }
        
        // Render all messages
        chat.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role === 'user' ? 'user-message' : 'ai-message'}`;
            
            // Format the message content
            if (message.role === 'assistant') {
                messageDiv.innerHTML = formatResponse(message.content);
            } else {
                messageDiv.textContent = message.content;
            }
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Format response with markdown-like syntax
    function formatResponse(text) {
        // Convert markdown-like formatting to HTML
        let formatted = text
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Bullet points
            .replace(/^\s*\*\s*(.*$)/gim, '<li>$1</li>')
            // Numbered lists
            .replace(/^\s*\d+\.\s*(.*$)/gim, '<li>$1</li>')
            // Wrap lists
            .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Blockquotes
            .replace(/^>\s*(.*$)/gim, '<blockquote>$1</blockquote>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Line breaks
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already wrapped
        if (!formatted.startsWith('<')) {
            formatted = '<p>' + formatted + '</p>';
        }
        
        return formatted;
    }
    
    // Render chat history sidebar
    function renderChatHistory() {
        chatHistoryList.innerHTML = '';
        
        // Convert chats object to array and sort by creation date
        const sortedChats = Object.values(chats).sort((a, b) => {
            // Pinned chats come first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('li');
            chatItem.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''} ${chat.pinned ? 'pinned' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            // Chat title
            const chatTitle = document.createElement('span');
            chatTitle.className = 'chat-title';
            chatTitle.textContent = chat.title || 'New Chat';
            chatTitle.addEventListener('click', () => switchToChat(chat.id));
            
            // Chat actions
            const chatActions = document.createElement('div');
            chatActions.className = 'chat-actions';
            
            // Pin button
            const pinBtn = document.createElement('button');
            pinBtn.className = 'chat-action-btn';
            pinBtn.innerHTML = chat.pinned ? '📍' : '📌';
            pinBtn.title = chat.pinned ? 'Unpin chat' : 'Pin chat';
            pinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePinChat(chat.id);
            });
            
            // Rename button
            const renameBtn = document.createElement('button');
            renameBtn.className = 'chat-action-btn';
            renameBtn.innerHTML = '✏️';
            renameBtn.title = 'Rename chat';
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openRenameModal(chat.id);
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'chat-action-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Delete chat';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteModal(chat.id);
            });
            
            // Append elements
            chatActions.appendChild(pinBtn);
            chatActions.appendChild(renameBtn);
            chatActions.appendChild(deleteBtn);
            
            chatItem.appendChild(chatTitle);
            chatItem.appendChild(chatActions);
            
            chatHistoryList.appendChild(chatItem);
        });
    }
    
    // Update active chat highlighting in history
    function updateActiveChatInHistory() {
        document.querySelectorAll('.chat-history-item').forEach(item => {
            if (item.dataset.chatId === currentChatId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Add a message to the current chat
    function addMessageToChat(role, content) {
        if (!currentChatId || !chats[currentChatId]) return;
        
        const chat = chats[currentChatId];
        chat.messages.push({ role, content, timestamp: new Date().toISOString() });
        
        // Limit to MAX_HISTORY_MESSAGES
        if (chat.messages.length > MAX_HISTORY_MESSAGES) {
            chat.messages.shift();
        }
        
        // Update chat title based on first user message
        if (role === 'user' && chat.messages.length <= 2 && chat.title === 'New Chat') {
            chat.title = content.length > 20 ? content.substring(0, 20) + '...' : content;
        }
        
        saveChatsToStorage();
    }
    
    // Create a new message element for streaming response
    function createResponseElement() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }
    
    // Update streaming response
    function updateStreamingResponse(text) {
        if (!currentResponseElement) {
            currentResponseElement = createResponseElement();
        }
        
        currentResponseText = text;
        currentResponseElement.innerHTML = formatResponse(text);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Finalize streaming response
    function finalizeResponse() {
        if (currentResponseElement && currentResponseText) {
            // Add final response to chat
            addMessageToChat('assistant', currentResponseText);
            currentResponseElement = null;
            currentResponseText = '';
        }
    }
    
    // Delete a chat
    function deleteChat(chatId) {
        if (chats[chatId]) {
            delete chats[chatId];
            
            // If we're deleting the current chat, switch to another one
            if (chatId === currentChatId) {
                const remainingChatIds = Object.keys(chats);
                if (remainingChatIds.length > 0) {
                    switchToChat(remainingChatIds[0]);
                } else {
                    createNewChat();
                }
            }
            
            saveChatsToStorage();
            renderChatHistory();
        }
    }
    
    // Rename a chat
    function renameChat(chatId, newTitle) {
        if (chats[chatId] && newTitle.trim() !== '') {
            chats[chatId].title = newTitle.trim();
            saveChatsToStorage();
            renderChatHistory();
        }
    }
    
    // Toggle pin status of a chat
    function togglePinChat(chatId) {
        if (chats[chatId]) {
            chats[chatId].pinned = !chats[chatId].pinned;
            saveChatsToStorage();
            renderChatHistory();
        }
    }
    
    // Open rename modal
    function openRenameModal(chatId) {
        chatToManage = chatId;
        const chat = chats[chatId];
        if (chat) {
            newChatTitleInput.value = chat.title;
            renameModal.style.display = 'flex';
            newChatTitleInput.focus();
        }
    }
    
    // Open delete modal
    function openDeleteModal(chatId) {
        chatToManage = chatId;
        deleteModal.style.display = 'flex';
    }
    
    // Close all modals
    function closeModals() {
        renameModal.style.display = 'none';
        deleteModal.style.display = 'none';
        chatToManage = null;
    }
    
    // Create enhanced loading indicator with "Aniket is thinking..." and animated dots
    function createLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.id = 'loading-indicator';
        
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-text">Aniket is thinking
                    <div class="ellipsis">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </div>
                </div>
                <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        return loadingDiv;
    }
    
    // Call the AI API with conversation context and streaming
    async function callAI(userMessage) {
        if (!currentChatId || !chats[currentChatId]) return;
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        renderChatMessages();
        
        // Show enhanced loading indicator
        const loadingDiv = createLoadingIndicator();
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Prepare messages for API (limit to last few for context)
            const chat = chats[currentChatId];
            const recentMessages = chat.messages.slice(-10); // Last 10 messages for context
            
            // Check if user is addressing "Aniket"
            const lowerMessage = userMessage.toLowerCase();
            const isAddressingAniket = lowerMessage.includes('aniket') || 
                                     lowerMessage.startsWith('hey') || 
                                     lowerMessage.startsWith('hello') ||
                                     lowerMessage.startsWith('hi');
            
            // Modify prompt if not addressing Aniket
            let prompt = userMessage;
            if (!isAddressingAniket) {
                prompt = `Respond as Aniket, an AI assistant. User says: "${userMessage}"`;
            }
            
            // Prepare messages array for API
            const apiMessages = [
                { role: "system", content: "You are Aniket, a helpful AI assistant. Provide well-structured responses with clear paragraphs, bullet points where appropriate, and summaries when relevant. Always respond as Aniket when addressed by name." },
                ...recentMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: "user", content: prompt }
            ];
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "HTTP-Referer": "https://your-site-url.com",
                    "X-Title": "Aniket AI Assistant",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "deepseek/deepseek-chat-v3.1:free",
                    "messages": apiMessages,
                    "stream": false // Streaming would require a different implementation
                })
            });
            
            // Remove loading indicator
            document.getElementById('loading-indicator')?.remove();
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // For now, we'll display the full response at once
            // In a real implementation, we would stream the response token by token
            updateStreamingResponse(aiResponse);
            finalizeResponse();
            renderChatMessages();
        } catch (error) {
            console.error('Error calling AI API:', error);
            // Remove loading indicator
            document.getElementById('loading-indicator')?.remove();
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message';
            errorDiv.textContent = 'Sorry, I encountered an error. Please try again.';
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Save chats to localStorage
    function saveChatsToStorage() {
        try {
            localStorage.setItem('aniket-chats', JSON.stringify(chats));
        } catch (error) {
            console.error('Failed to save chats to storage:', error);
        }
    }
    
    // Load chats from localStorage
    function loadChatsFromStorage() {
        try {
            const storedChats = localStorage.getItem('aniket-chats');
            if (storedChats) {
                chats = JSON.parse(storedChats);
            }
        } catch (error) {
            console.error('Failed to load chats from storage:', error);
            chats = {};
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            userInput.value = '';
            callAI(message);
        }
    });
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                userInput.value = '';
                callAI(message);
            }
        }
    });
    
    newChatBtn.addEventListener('click', createNewChat);
    
    // Modal event listeners
    cancelRenameBtn.addEventListener('click', closeModals);
    confirmRenameBtn.addEventListener('click', () => {
        if (chatToManage) {
            renameChat(chatToManage, newChatTitleInput.value);
            closeModals();
        }
    });
    
    cancelDeleteBtn.addEventListener('click', closeModals);
    confirmDeleteBtn.addEventListener('click', () => {
        if (chatToManage) {
            deleteChat(chatToManage);
            closeModals();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === renameModal) {
            closeModals();
        }
        if (e.target === deleteModal) {
            closeModals();
        }
    });
    
    // Allow Enter key in rename modal
    newChatTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatToManage) {
            renameChat(chatToManage, newChatTitleInput.value);
            closeModals();
        }
    });
    
    // Initialize the app
    init();
});