# ArtisanChat Backend

Node.js backend API for ArtisanChat - a professional messenger platform designed for creative professionals.

## 🚀 Features

- **RESTful API** with Express.js
- **Real-time messaging** with Socket.IO
- **JWT Authentication** with refresh tokens
- **MongoDB integration** with Mongoose
- **File upload** support with Cloudinary
- **Rate limiting** and security middleware
- **Input validation** and sanitization
- **Comprehensive logging** with Morgan

## 🛠️ Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Media management
- **Helmet** - Security middleware

## 📁 Project Structure

```
Backend/
├── models/                 # MongoDB models
│   ├── User.js            # User model
│   ├── Chat.js            # Chat and messages model
│   ├── Group.js           # Group model
│   ├── Portfolio.js       # Portfolio model
│   └── Task.js            # Task model
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── chats.js          # Chat routes
│   ├── groups.js         # Group routes
│   ├── portfolios.js     # Portfolio routes
│   └── tasks.js          # Task routes
├── middleware/            # Custom middleware
│   └── auth.js           # Authentication middleware
├── socket/               # Socket.IO handlers
│   └── socketHandler.js  # Real-time event handlers
├── server.js            # Main server file
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🗄️ Database Models

### User Model
```javascript
{
  username: String,      // Unique username
  email: String,         // Unique email
  password: String,      // Hashed password
  fullName: String,      // Full name
  bio: String,          // User biography
  skills: [String],     // Array of skills
  location: String,     // User location
  profilePicture: String, // Profile image URL
  portfolio: [ObjectId], // Portfolio references
  followers: [ObjectId], // Follower references
  following: [ObjectId], // Following references
  isOnline: Boolean,    // Online status
  lastSeen: Date,       // Last activity
  settings: Object      // User preferences
}
```

### Chat Model
```javascript
{
  type: String,         // 'private' or 'group'
  participants: [ObjectId], // User references
  messages: [{
    sender: ObjectId,   // Message sender
    content: String,    // Message content
    type: String,       // Message type
    seenBy: [Object],   // Read receipts
    createdAt: Date
  }],
  lastMessage: Object,  // Last message info
  typingUsers: [Object] // Currently typing users
}
```

### Portfolio Model
```javascript
{
  user: ObjectId,       // Owner reference
  title: String,        // Portfolio title
  description: String,  // Description
  fileUrl: String,      // File URL
  category: String,     // Portfolio category
  tags: [String],       // Tags array
  likes: [Object],      // Likes with user refs
  comments: [Object],   // Comments array
  views: [Object],      // View tracking
  analytics: Object     // View/like statistics
}
```

### Task Model
```javascript
{
  title: String,        // Task title
  description: String,  // Task description
  group: ObjectId,      // Group reference
  assignedTo: ObjectId, // Assigned user
  createdBy: ObjectId,  // Creator reference
  status: String,       // Task status
  priority: String,     // Task priority
  dueDate: Date,        // Due date
  comments: [Object],   // Comments array
  activities: [Object], // Activity log
  subtasks: [Object]    // Subtasks array
}
```

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh` | Refresh JWT token | Yes |
| POST | `/forgot-password` | Password reset | No |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search` | Search users | Yes |
| GET | `/:userId` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/:userId/follow` | Follow/unfollow user | Yes |
| GET | `/:userId/followers` | Get user followers | Yes |
| GET | `/:userId/following` | Get user following | Yes |
| PUT | `/settings` | Update user settings | Yes |
| GET | `/suggestions` | Get user suggestions | Yes |

### Chat Routes (`/api/chats`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user chats | Yes |
| POST | `/` | Create new chat | Yes |
| GET | `/:chatId/messages` | Get chat messages | Yes |
| POST | `/:chatId/messages` | Send message | Yes |
| PUT | `/:chatId/messages/:messageId/seen` | Mark message as seen | Yes |
| DELETE | `/:chatId` | Delete chat | Yes |

### Group Routes (`/api/groups`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create group | Yes |
| GET | `/:groupId` | Get group details | Yes |
| PUT | `/:groupId` | Update group | Yes |
| POST | `/:groupId/members` | Add member | Yes |
| DELETE | `/:groupId/members/:userId` | Remove member | Yes |
| PUT | `/:groupId/members/:userId` | Update member role | Yes |
| GET | `/search` | Search groups | Yes |

### Portfolio Routes (`/api/portfolios`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create portfolio | Yes |
| GET | `/:userId` | Get user portfolios | No |
| GET | `/single/:portfolioId` | Get single portfolio | No |
| PUT | `/:portfolioId` | Update portfolio | Yes |
| DELETE | `/:portfolioId` | Delete portfolio | Yes |
| POST | `/:portfolioId/like` | Like/unlike portfolio | Yes |
| POST | `/:portfolioId/comment` | Add comment | Yes |
| GET | `/popular` | Get popular portfolios | No |
| GET | `/trending` | Get trending portfolios | No |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create task | Yes |
| GET | `/group/:groupId` | Get group tasks | Yes |
| GET | `/:taskId` | Get single task | Yes |
| PUT | `/:taskId` | Update task | Yes |
| DELETE | `/:taskId` | Delete task | Yes |
| POST | `/:taskId/comment` | Add comment | Yes |
| PUT | `/:taskId/status` | Update task status | Yes |
| GET | `/group/:groupId/overdue` | Get overdue tasks | Yes |
| GET | `/group/:groupId/due-soon` | Get tasks due soon | Yes |

## 🔐 Authentication

### JWT Implementation
```javascript
// Generate token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// Verify token middleware
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  // Verification logic...
}
```

### Password Security
```javascript
// Hash password
const salt = await bcrypt.genSalt(12)
const hashedPassword = await bcrypt.hash(password, salt)

// Compare password
const isMatch = await bcrypt.compare(candidatePassword, hashedPassword)
```

## 🔄 Real-time Features

### Socket.IO Events

#### Client to Server
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `send_message` - Send message
- `typing_start` - Start typing
- `typing_stop` - Stop typing
- `mark_seen` - Mark message as seen

#### Server to Client
- `new_message` - New message received
- `user_typing` - User started typing
- `user_stop_typing` - User stopped typing
- `message_seen` - Message marked as seen
- `user_online` - User came online
- `user_offline` - User went offline

### Socket Authentication
```javascript
// Authenticate socket connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  socket.userId = decoded.userId
  next()
})
```

## 🛡️ Security Features

### Middleware Stack
```javascript
app.use(helmet())              // Security headers
app.use(compression())         // Response compression
app.use(cors())               // CORS handling
app.use(rateLimit())          // Rate limiting
app.use(express.json())       // JSON parsing
```

### Input Validation
```javascript
// Example validation
[
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').isAlphanumeric().isLength({ min: 3, max: 30 })
]
```

### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and configure:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   MONGODB_URI=mongodb://localhost:27017/artisanchat
   JWT_SECRET=your-super-secret-jwt-key-here
   
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

3. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 mongo
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Server running**
   API available at http://localhost:5000

## 📊 Database Operations

### Connection
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
```

### Indexing
```javascript
// User model indexes
userSchema.index({ username: 'text', fullName: 'text', skills: 'text' })
userSchema.index({ email: 1 })

// Chat model indexes
chatSchema.index({ participants: 1 })
chatSchema.index({ 'messages.createdAt': -1 })
```

## 🔧 Development

### Scripts
```bash
# Development with nodemon
npm run dev

# Production start
npm start

# Seed database (if available)
npm run seed
```

### Logging
```javascript
// Morgan HTTP logging
app.use(morgan('combined'))

// Custom error logging
console.error('Error:', error.message)
```

### Error Handling
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})
```

## 📁 File Upload

### Cloudinary Integration
```javascript
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
```

### Upload Middleware
```javascript
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artisanchat',
    allowed_formats: ['jpg', 'png', 'pdf', 'mp4']
  }
})
```

## 🧪 Testing

### API Testing
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Using Postman
# Import API collection for comprehensive testing
```

### Socket Testing
```javascript
// Test socket connection
const io = require('socket.io-client')
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
})
```

## 🚀 Deployment

### Environment Variables
Set these in production:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Production Optimizations
- Enable compression
- Set proper CORS origins
- Configure rate limiting
- Enable MongoDB connection pooling
- Set up proper logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Check
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ArtisanChat API is running',
    timestamp: new Date().toISOString()
  })
})
```

### Performance Monitoring
- Request/response times
- Database query performance
- Memory usage tracking
- Error rate monitoring

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB connection fails**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **JWT token issues**
   ```bash
   # Verify JWT secret is set
   echo $JWT_SECRET
   
   # Check token expiration
   ```

3. **Socket.IO connection problems**
   ```bash
   # Check CORS settings
   # Verify frontend URL in environment
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# MongoDB debug
DEBUG=mongoose:* npm run dev
```

## 🤝 Contributing

1. Follow existing code style
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update API documentation

## 📄 License

This project is part of ArtisanChat and follows the same MIT license.

---

**ArtisanChat Backend** - Robust, scalable, and secure API for creative professional messaging platform.