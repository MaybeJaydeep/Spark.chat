import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast.error('Failed to load chat');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <h1>Spark.chat</h1>
          {user && (
            <span className="user-info">
              Welcome, {user.displayName || user.username}!
            </span>
          )}
        </div>
        <div className="chat-header-right">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-sidebar">
          <div className="sidebar-section">
            <h3>Chats</h3>
            <div className="chat-list">
              <div className="chat-item">
                <div className="chat-avatar">G</div>
                <div className="chat-info">
                  <div className="chat-name">General</div>
                  <div className="chat-last-message">Welcome to Spark.chat!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            <div className="welcome-message">
              <h2>Welcome to Spark.chat! 🚀</h2>
              <p>Your secure, end-to-end encrypted messaging platform.</p>
              <div className="feature-list">
                <div className="feature-item">🔒 End-to-end encryption</div>
                <div className="feature-item">⏰ Self-destructing messages</div>
                <div className="feature-item">📱 Mobile-first design</div>
                <div className="feature-item">👥 Small group chats</div>
              </div>
            </div>
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Type a message..."
                className="chat-input"
                disabled
              />
              <button className="send-button" disabled>
                Send
              </button>
            </div>
            <p className="coming-soon">Chat functionality coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;