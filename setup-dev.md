# Spark.chat Development Setup

## Prerequisites

### Required Software
- **Java 17+** - [Download from Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
- **Maven 3.6+** - [Download from Apache Maven](https://maven.apache.org/download.cgi)
- **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Optional (for containerized development)
- **Docker** - [Download from docker.com](https://www.docker.com/get-started)
- **Docker Compose** - Usually included with Docker Desktop

## Quick Start

### 1. Backend Setup (Java Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Install dependencies and compile
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on `http://localhost:3000`

### 3. Using Docker (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## Development Workflow

### IntelliJ IDEA Setup
1. Open IntelliJ IDEA
2. File → Open → Select the `SparkChat` folder
3. IntelliJ will automatically detect the Maven project in `backend/`
4. Wait for Maven to download dependencies
5. Run `SparkChatApplication.java` to start the backend

### VS Code Setup (Alternative)
1. Install Java Extension Pack
2. Install Spring Boot Extension Pack
3. Open the project folder
4. Use integrated terminal for frontend development

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Health Check
- `GET /api/health` - Service health status

## Database

### Development (H2 In-Memory)
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`

### Production (PostgreSQL)
Configure in `application.yml` or use environment variables:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sparkchat
    username: your_username
    password: your_password
```

## Environment Variables

### Backend
```bash
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# Database (Production)
DB_URL=jdbc:postgresql://localhost:5432/sparkchat
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Frontend
```bash
# API URL
REACT_APP_API_URL=http://localhost:8080
```

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   - Change server port in `application.yml`: `server.port: 8081`

2. **Maven not found**
   - Install Maven or use the Maven wrapper: `./mvnw` (Linux/Mac) or `mvnw.cmd` (Windows)

3. **Node modules issues**
   - Delete `node_modules` and `package-lock.json`, then run `npm install`

4. **CORS errors**
   - Ensure backend CORS configuration allows frontend origin

### Logs
- **Backend logs**: Check console output or configure logging in `application.yml`
- **Frontend logs**: Check browser developer console

## Next Steps

1. **Authentication**: Test login/register functionality
2. **Real-time Chat**: Implement WebSocket connection
3. **Encryption**: Add end-to-end encryption
4. **File Upload**: Implement media sharing
5. **Self-Destructing Messages**: Add timer functionality

## Deployment

### Free Hosting Options

**Backend:**
- Railway.app
- Render.com
- Heroku (with PostgreSQL add-on)

**Frontend:**
- Vercel
- Netlify
- GitHub Pages

**Database:**
- PostgreSQL free tiers on Railway, Render, or Heroku