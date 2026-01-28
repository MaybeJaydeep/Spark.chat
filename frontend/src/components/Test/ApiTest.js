import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/health');
      setBackendStatus('✅ Backend is running');
      console.log('Backend health:', response.data);
    } catch (error) {
      setBackendStatus('❌ Backend not reachable');
      console.error('Backend error:', error);
    }
  };

  const testRegistration = async () => {
    try {
      const testUser = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        displayName: 'Test User'
      };

      const response = await axios.post('http://localhost:8080/api/auth/register', testUser);
      setTestResult('✅ Registration successful: ' + JSON.stringify(response.data));
      console.log('Registration success:', response.data);
    } catch (error) {
      setTestResult('❌ Registration failed: ' + (error.response?.data?.message || error.message));
      console.error('Registration error:', error.response?.data || error);
    }
  };

  const testLogin = async () => {
    try {
      // First register a user
      const testUser = {
        username: 'logintest' + Date.now(),
        email: 'logintest' + Date.now() + '@example.com',
        password: 'password123',
        displayName: 'Login Test User'
      };

      await axios.post('http://localhost:8080/api/auth/register', testUser);
      
      // Then try to login
      const loginData = {
        username: testUser.username,
        password: testUser.password
      };

      const response = await axios.post('http://localhost:8080/api/auth/login', loginData);
      setTestResult('✅ Login successful: ' + JSON.stringify(response.data));
      console.log('Login success:', response.data);
    } catch (error) {
      setTestResult('❌ Login failed: ' + (error.response?.data?.message || error.message));
      console.error('Login error:', error.response?.data || error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Test Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Backend Status:</h3>
        <p>{backendStatus}</p>
        <button onClick={checkBackend}>Refresh Status</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Registration:</h3>
        <button onClick={testRegistration}>Test Register</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Login:</h3>
        <button onClick={testLogin}>Test Login</button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          border: '1px solid ' + (testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'),
          borderRadius: '4px'
        }}>
          <h4>Test Result:</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;