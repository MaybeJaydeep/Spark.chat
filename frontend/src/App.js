import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Chat from './components/Chat/Chat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '12px 16px',
            },
            success: {
              style: {
                background: '#059669',
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#dc2626',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;