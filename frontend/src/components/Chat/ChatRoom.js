import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { chatService } from '../../services/chatService';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [dmMessages, setDmMessages] = useState({}); // Store messages per user
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Load users for DM
        await loadUsers();
        
        // Connect to WebSocket
        await chatService.connect(currentUser);
        
        // Set up message handler
        const unsubscribeMessages = chatService.onMessage((message) => {
          // Add all received messages (they're already filtered on the backend)
          const senderUsername = message.sender.username;
          setDmMessages(prev => ({
            ...prev,
            [senderUsername]: [...(prev[senderUsername] || []), message]
          }));
        });
        
        // Set up connection handler
        const unsubscribeConnection = chatService.onConnectionChange((connected) => {
          setIsConnected(connected);
          if (connected) {
            toast.success('Connected to chat!');
          } else {
            toast.error('Disconnected from chat');
          }
        });
        
        return () => {
          unsubscribeMessages();
          unsubscribeConnection();
        };
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast.error('Failed to connect to chat: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userList = await response.json();
          setUsers(userList);
          
          // Load DM history for each user
          for (const contact of userList) {
            await loadDmHistory(contact.username);
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    const loadDmHistory = async (username) => {
      try {
        const response = await fetch(`http://localhost:8080/api/chat/dm/${username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const history = await response.json();
          if (history.length > 0) {
            setDmMessages(prev => ({
              ...prev,
              [username]: history
            }));
          }
        }
      } catch (error) {
        console.error(`Error loading DM history for ${username}:`, error);
      }
    };

    initializeChat();
    
    return () => {
      chatService.disconnect();
    };
  }, [navigate]);

  // Scroll to bottom when new messages arrive or user changes
  useEffect(() => {
    scrollToBottom();
  }, [dmMessages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected || !selectedUser) {
      return;
    }
    
    try {
      // Add message to local DM history immediately for sender
      const localMessage = {
        sender: { 
          username: user.username,
          displayName: user.displayName 
        },
        content: newMessage.trim(),
        messageTypeString: 'TEXT',
        sentAt: new Date().toISOString()
      };
      
      setDmMessages(prev => ({
        ...prev,
        [selectedUser.username]: [...(prev[selectedUser.username] || []), localMessage]
      }));
      
      // Send via WebSocket with recipient
      chatService.sendMessage(newMessage.trim(), selectedUser.username);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUserSearch = async () => {
    if (!searchUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/search?username=${searchUsername}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const foundUser = await response.json();
        if (foundUser && !users.find(u => u.username === foundUser.username)) {
          setUsers(prev => [...prev, foundUser]);
          toast.success(`Found user: ${foundUser.username}`);
        } else {
          toast.info('User already in your list or not found');
        }
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Error searching user');
    }
    
    setSearchUsername('');
  };

  const handleLogout = async () => {
    try {
      chatService.disconnect();
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Users List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg font-bold">Spark.chat</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors"
            >
              Logout
            </button>
          </div>
          {user && (
            <div className="text-sm opacity-90">
              Welcome, {user.displayName || user.username}!
              <span className={`ml-2 inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className="ml-1 text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>

        {/* Add User Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Search username..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
            />
            <button
              onClick={handleUserSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 px-2">Contacts</h3>
            {users.length === 0 ? (
              <p className="text-sm text-gray-500 px-2">No contacts yet. Search for users to start chatting!</p>
            ) : (
              users.map((contact) => (
                <div
                  key={contact.username}
                  onClick={() => setSelectedUser(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.username === contact.username
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.displayName ? contact.displayName[0].toUpperCase() : contact.username[0].toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{contact.displayName || contact.username}</p>
                      <p className="text-sm text-gray-500">@{contact.username}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.displayName ? selectedUser.displayName[0].toUpperCase() : selectedUser.username[0].toUpperCase()}
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-900">{selectedUser.displayName || selectedUser.username}</h2>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {(!dmMessages[selectedUser.username] || dmMessages[selectedUser.username].length === 0) ? (
                <div className="text-center text-gray-500 mt-8">
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p>Send a message to {selectedUser.displayName || selectedUser.username}</p>
                </div>
              ) : (
                dmMessages[selectedUser.username].map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender?.username === user?.username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender?.username === user?.username
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-white text-gray-900 shadow-md'
                      }`}
                    >
                      {message.sender?.username !== user?.username && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.sender?.displayName || message.sender?.username}
                        </p>
                      )}
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender?.username === user?.username ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isConnected ? `Message ${selectedUser.displayName || selectedUser.username}...` : "Connecting..."}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Send
                </button>
              </form>
              {!isConnected && (
                <p className="text-center text-red-500 text-sm mt-2">
                  Reconnecting to chat...
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                💬
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Spark.chat!</h2>
              <p>Select a contact from the sidebar to start chatting</p>
              <p className="text-sm mt-2">Or search for new users to add them to your contacts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;