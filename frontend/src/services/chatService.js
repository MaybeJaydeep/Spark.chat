import api from './authService';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

/**
 * Chat service for managing real-time messaging operations
 */

class ChatService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.currentUser = null;
  }

  /**
   * Initialize WebSocket connection with authentication
   */
  connect(user) {
    // Always disconnect first to ensure clean connection
    if (this.stompClient) {
      this.disconnect();
    }

    return new Promise((resolve, reject) => {
      try {
        this.currentUser = user;
        
        // Create SockJS connection with unique session
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        
        // Disable debug to reduce console noise
        this.stompClient.debug = () => {};
        
        // Configure reconnection
        this.stompClient.reconnectDelay = 5000;
        this.stompClient.heartbeatIncoming = 4000;
        this.stompClient.heartbeatOutgoing = 4000;
        
        // Configure STOMP client
        this.stompClient.configure({
          connectHeaders: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onConnect: (frame) => {
            console.log(`WebSocket connected for user: ${user.username}`);
            this.isConnected = true;
            
            // Only subscribe to user-specific messages for DM
            this.stompClient.subscribe(`/user/${user.username}/queue/messages`, (message) => {
              const messageData = JSON.parse(message.body);
              this.notifyMessageHandlers(messageData);
            });
            
            // Notify connection handlers
            this.notifyConnectionHandlers(true);
            
            // Send join message to establish session
            this.stompClient.publish({
              destination: '/app/chat.addUser',
              body: JSON.stringify({
                sender: { username: user.username },
                messageTypeString: 'JOIN'
              })
            });
            
            resolve();
          },
          
          onDisconnect: () => {
            console.log(`WebSocket disconnected for user: ${user.username}`);
            this.isConnected = false;
            this.notifyConnectionHandlers(false);
          },
          
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.isConnected = false;
            this.notifyConnectionHandlers(false);
            reject(new Error('WebSocket connection failed'));
          },
          
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
            this.notifyConnectionHandlers(false);
          }
        });
        
        // Connect to WebSocket
        this.stompClient.activate();
        
      } catch (error) {
        console.error('WebSocket connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      console.log(`Disconnecting WebSocket for user: ${this.currentUser?.username}`);
      try {
        if (this.isConnected) {
          this.stompClient.deactivate();
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
      this.stompClient = null;
      this.isConnected = false;
      this.currentUser = null;
    }
  }

  /**
   * Send a message to the chat room
   */
  sendMessage(content, recipient, messageType = 'TEXT') {
    if (!this.isConnected || !this.stompClient) {
      throw new Error('Not connected to WebSocket');
    }
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const message = {
      sender: { 
        username: this.currentUser.username,
        displayName: this.currentUser.displayName 
      },
      recipient: recipient, // Add recipient for DM
      content: content,
      messageTypeString: messageType,
      sentAt: new Date().toISOString()
    };

    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message)
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator() {
    if (this.isConnected && this.stompClient && this.currentUser) {
      this.stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          username: this.currentUser.username,
          typing: true
        })
      });
    }
  }

  /**
   * Notify message handlers of new messages
   */
  notifyMessageHandlers(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notify connection handlers of connection changes
   */
  notifyConnectionHandlers(isConnected) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Add message handler for real-time updates
   */
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Add connection status handler
   */
  onConnectionChange(handler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Send a message to a chat room via REST API
   * TODO: Implement REST API message sending for persistence
   */
  async sendMessageToAPI(chatRoomId, content, messageType = 'TEXT') {
    try {
      const response = await api.post('/chat/messages', {
        chatRoomId,
        content,
        messageType
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  /**
   * Get chat rooms for current user
   * TODO: Implement chat room retrieval
   */
  async getChatRooms() {
    try {
      const response = await api.get('/chat/rooms');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get chat rooms');
    }
  }

  /**
   * Get message history for a chat room
   * TODO: Implement message history with pagination
   */
  async getMessageHistory(chatRoomId, page = 0, size = 50) {
    try {
      const response = await api.get(`/chat/messages/${chatRoomId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get message history');
    }
  }

  /**
   * Create a new chat room
   * TODO: Implement chat room creation
   */
  async createChatRoom(name, description, members = []) {
    try {
      const response = await api.post('/chat/rooms', {
        name,
        description,
        members
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create chat room');
    }
  }

  /**
   * Upload file/media
   * TODO: Implement file upload functionality
   */
  async uploadFile(file, chatRoomId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatRoomId', chatRoomId);

      const response = await api.post('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  }

  /**
   * Search messages
   * TODO: Implement message search functionality
   */
  async searchMessages(query, chatRoomId = null) {
    try {
      const params = new URLSearchParams({ query });
      if (chatRoomId) params.append('chatRoomId', chatRoomId);
      
      const response = await api.get(`/chat/search?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search messages');
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;