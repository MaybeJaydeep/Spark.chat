# Spark.chat - Project Structure

## Overview
End-to-end encrypted chat application for small groups with media sharing capabilities.

## Tech Stack
- **Backend**: Java (Spring Boot) - Learning-focused
- **Frontend**: React/React Native (Mobile-first, responsive)
- **Database**: PostgreSQL (free tier deployment)
- **Real-time**: WebSocket/Socket.IO
- **Encryption**: Signal Protocol or similar E2E encryption

## Project Structure
```
SparkChat/
├── backend/                 # Java Spring Boot application
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/java/
│   └── pom.xml
├── frontend/               # React/React Native application
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/                   # Documentation
├── docker-compose.yml      # Local development setup
└── README.md
```

## Core Features
1. **Authentication & User Management**
2. **Real-time Messaging**
3. **End-to-End Encryption**
4. **Self-Destructing Messages**
5. **Media Sharing**
6. **Group Chat Management**

## Development Approach
- IntelliJ IDEA friendly structure
- Separate backend/frontend for clear separation
- Docker for easy local development
- Free deployment options (Heroku, Railway, or similar)