# Spark.chat API Documentation

## Overview

Spark.chat provides a RESTful API for user authentication and management, along with WebSocket endpoints for real-time messaging.

**Base URL**: `http://localhost:8080`  
**WebSocket URL**: `ws://localhost:8080/ws`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## REST API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "displayName": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "john_doe",
    "displayName": "John Doe"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "john_doe",
    "displayName": "John Doe"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "displayName": "John Doe"
}
```

### User Management Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "displayName": "John Doe"
  },
  {
    "id": 2,
    "username": "jane_smith",
    "displayName": "Jane Smith"
  }
]
```

#### Search Users
```http
GET /api/users/search?username=john
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "displayName": "John Doe"
}
```

### Chat Endpoints

#### Get DM History
```http
GET /api/chat/dm/{username}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "sender": {
      "username": "john_doe",
      "displayName": "John Doe"
    },
    "content": "Hello there!",
    "messageType": "TEXT",
    "sentAt": "2024-01-15T10:30:00Z"
  }
]
```

## WebSocket API

### Connection

Connect to WebSocket endpoint:
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({
  'Authorization': 'Bearer ' + token
}, onConnected, onError);
```

### Subscribe to Messages

Subscribe to receive direct messages:
```javascript
stompClient.subscribe('/user/' + username + '/queue/messages', onMessageReceived);
```

### Send Messages

#### Join Chat
```javascript
stompClient.send('/app/chat.addUser', {}, JSON.stringify({
  sender: { username: 'john_doe' },
  messageTypeString: 'JOIN'
}));
```

#### Send Direct Message
```javascript
stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
  sender: { 
    username: 'john_doe',
    displayName: 'John Doe'
  },
  recipient: 'jane_smith',
  content: 'Hello Jane!',
  messageTypeString: 'TEXT'
}));
```

#### Send Typing Indicator
```javascript
stompClient.send('/app/chat.typing', {}, JSON.stringify({
  username: 'john_doe',
  typing: true
}));
```

## Message Types

- `TEXT` - Regular text message
- `JOIN` - User joined notification
- `LEAVE` - User left notification

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "User not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- Message sending: 60 messages per minute per user
- User search: 10 requests per minute per user

## Security Considerations

- All passwords are hashed using BCrypt
- JWT tokens expire after 24 hours
- WebSocket connections require valid JWT tokens
- CORS is configured for development (localhost:3000)
- Input validation is applied to all endpoints

## Example Usage

### JavaScript/React Example

```javascript
// Login and get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john_doe', password: 'password123' })
});
const { token, user } = await loginResponse.json();

// Use token for authenticated requests
const usersResponse = await fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const users = await usersResponse.json();

// Connect to WebSocket
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);
stompClient.connect({ 'Authorization': `Bearer ${token}` }, () => {
  // Subscribe to messages
  stompClient.subscribe(`/user/${user.username}/queue/messages`, (message) => {
    const messageData = JSON.parse(message.body);
    console.log('Received message:', messageData);
  });
});
```

## Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","displayName":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get users (replace TOKEN with actual JWT token)
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer TOKEN"
```