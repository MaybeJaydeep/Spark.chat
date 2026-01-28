# Contributing to Spark.chat

Thank you for your interest in contributing to Spark.chat! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature or bug fix
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request**

## 📋 Development Setup

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.6+
- MySQL (or XAMPP)

### Local Development
1. Follow the setup instructions in [README.md](README.md)
2. Make sure all tests pass before submitting changes
3. Test on both mobile and desktop views

## 🎯 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide system information (OS, browser, etc.)
- Include screenshots if applicable

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Discuss implementation approach if possible

### Code Contributions

#### Backend (Java/Spring Boot)
- Follow Java naming conventions
- Write unit tests for new functionality
- Use proper exception handling
- Document public methods with Javadoc

#### Frontend (React/Tailwind)
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Ensure mobile-first responsive design
- Write meaningful component names

#### Database Changes
- Use JPA annotations properly
- Consider migration scripts for schema changes
- Test with both H2 and MySQL

## 📝 Coding Standards

### Java Backend
```java
// Use descriptive method names
public UserDto createNewUser(RegisterRequest request) {
    // Implementation
}

// Proper exception handling
try {
    // risky operation
} catch (SpecificException e) {
    log.error("Specific error occurred", e);
    throw new ServiceException("User-friendly message");
}
```

### React Frontend
```javascript
// Use functional components
const ChatMessage = ({ message, user }) => {
  return (
    <div className="flex items-start space-x-3 p-4">
      {/* Component content */}
    </div>
  );
};

// Use meaningful prop names
<MessageBubble 
  content={message.content}
  sender={message.sender}
  timestamp={message.sentAt}
/>
```

### CSS/Tailwind
```javascript
// Use Tailwind utility classes
<button className="btn-primary w-full hover:shadow-lg transition-all duration-200">
  Submit
</button>

// Group related classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
```

## 🧪 Testing

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

### Manual Testing Checklist
- [ ] Registration works
- [ ] Login/logout functionality
- [ ] Responsive design on mobile
- [ ] Database persistence
- [ ] Error handling

## 📦 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** if applicable
5. **Request review** from maintainers

### PR Title Format
- `feat: add real-time messaging`
- `fix: resolve login authentication issue`
- `docs: update API documentation`
- `style: improve mobile responsiveness`

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Mobile responsive tested

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🏷 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `priority: low` - Nice to have

## 🎨 Design Guidelines

### UI/UX Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Ensure keyboard navigation and screen reader support
- **Performance**: Optimize for fast loading and smooth interactions
- **Consistency**: Use consistent spacing, colors, and typography

### Color Palette
- Primary: `#667eea` to `#764ba2` (gradient)
- Success: `#10b981`
- Error: `#ef4444`
- Warning: `#f59e0b`
- Gray scale: Tailwind's gray palette

## 📚 Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person

## 📞 Getting Help

- Open an issue for bugs or questions
- Join our discussions for general questions
- Check existing issues before creating new ones

Thank you for contributing to Spark.chat! 🚀