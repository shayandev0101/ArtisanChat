# ArtisanChat Frontend

Modern Next.js frontend application for ArtisanChat - a professional messenger designed for creative professionals.

## 🚀 Features

- **Modern UI/UX** with glassmorphism design
- **Real-time messaging** with Socket.IO
- **Responsive design** for all devices
- **Persian RTL support** with proper typography
- **SEO optimized** with Next.js App Router
- **Progressive Web App** capabilities
- **Toast notifications** for better UX
- **Smooth animations** with Framer Motion

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── chat/              # Chat interface
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Home page
│   │   └── sitemap.js         # Dynamic sitemap
│   ├── components/            # Reusable components
│   │   └── ui/               # UI components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.js    # Authentication context
│   ├── lib/                  # Utilities and configurations
│   │   ├── api.js           # API client
│   │   ├── socket.js        # Socket.IO client
│   │   └── utils.js         # Utility functions
│   └── styles/              # Global styles
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   └── robots.txt          # SEO robots file
├── tailwind.config.js       # Tailwind configuration
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary (Artisan)**: Blue gradient (#0ea5e9 to #0284c7)
- **Secondary (Creative)**: Purple gradient (#d946ef to #c026d3)
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur

### Typography
- **Persian**: Vazirmatn font family
- **English**: Inter font family
- **RTL Support**: Proper right-to-left layout

### Components
- **Glassmorphism cards** with backdrop blur
- **Smooth animations** and micro-interactions
- **Responsive grid** layouts
- **Modern form** elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to http://localhost:3000

## 📱 Pages and Features

### 🏠 **Home Page** (`/`)
- Hero section with call-to-action
- Feature showcase
- Modern glassmorphism design
- SEO optimized content

### 🔐 **Authentication** (`/auth/*`)
- **Login** (`/auth/login`) - User sign in
- **Register** (`/auth/register`) - Multi-step registration
- Form validation and error handling
- Social login options (UI ready)

### 💬 **Chat Interface** (`/chat`)
- Real-time messaging
- Chat list with search
- Message status indicators
- Typing indicators
- File upload support
- Emoji picker (UI ready)

### ℹ️ **About Page** (`/about`)
- Company story and mission
- Team information
- Values and statistics
- Professional presentation

### 📞 **Contact Page** (`/contact`)
- Contact form with validation
- Company information
- FAQ section
- Interactive design

## 🔧 API Integration

### Authentication
```javascript
// Login user
const result = await authAPI.login({ email, password })

// Register user
const result = await authAPI.register(userData)

// Get current user
const user = await authAPI.getMe()
```

### Chat Operations
```javascript
// Get user chats
const chats = await chatsAPI.getChats()

// Send message
await chatsAPI.sendMessage(chatId, messageData)

// Get messages
const messages = await chatsAPI.getMessages(chatId)
```

### Real-time Features
```javascript
// Connect to socket
socketManager.connect(token)

// Join chat room
socketManager.joinChat(chatId)

// Send message
socketManager.sendMessage(messageData)

// Listen for new messages
socketManager.on('new_message', handleNewMessage)
```

## 🎯 SEO Features

### Meta Tags
- Dynamic page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs

### Structured Data
- JSON-LD markup for better search visibility
- Organization and WebApplication schemas

### Performance
- Image optimization with Next.js
- Code splitting and lazy loading
- Compression and caching headers

## 📱 PWA Features

### Manifest
- App icons and splash screens
- Display modes and orientation
- Theme colors and branding

### Service Worker (Ready)
- Offline functionality
- Background sync
- Push notifications

## 🌐 Internationalization

### RTL Support
- Proper text direction handling
- Mirrored layouts for Persian
- Font optimization for Persian text

### Language Features
- Persian (Farsi) primary language
- English support ready
- Localized date and time formatting

## 🎨 UI Components

### Core Components
```javascript
// Button with variants
<Button variant="artisan" size="lg">Click me</Button>

// Input with validation
<Input placeholder="Enter text" error={error} />

// Toast notifications
showToast.success('Operation successful!')
showToast.error('Something went wrong')
```

### Layout Components
- Responsive navigation
- Sidebar layouts
- Modal dialogs
- Loading states

## 🔄 State Management

### Context API
- **AuthContext** - User authentication state
- Global state management
- Persistent login sessions

### Local State
- Component-level state with hooks
- Form state management
- UI state (modals, dropdowns)

## 📊 Performance Optimization

### Bundle Optimization
- Tree shaking unused code
- Dynamic imports for large components
- Optimized font loading

### Image Optimization
- Next.js Image component
- WebP format support
- Responsive images

### Caching
- Static asset caching
- API response caching
- Service worker caching (ready)

## 🧪 Development

### Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Code Quality
- ESLint configuration
- Prettier formatting
- Component documentation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set these in your deployment platform:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

### Build Optimization
- Static generation where possible
- Image optimization
- Bundle analysis

## 🐛 Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Check backend server is running
   - Verify CORS settings
   - Check environment variables

2. **Styles not loading**
   - Clear browser cache
   - Check Tailwind configuration
   - Verify CSS imports

3. **Authentication issues**
   - Check JWT token storage
   - Verify API endpoints
   - Check network requests

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types (if converting)
3. Test on multiple devices
4. Update documentation

## 📄 License

This project is part of ArtisanChat and follows the same MIT license.

---

**ArtisanChat Frontend** - Modern, responsive, and feature-rich user interface for creative professionals.