'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { chatsAPI } from '@/lib/api'
import { socketManager } from '@/lib/socket'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Settings,
  MessageCircle,
  Hash,
  Archive,
  Edit3,
  Bot,
  Settings2
} from 'lucide-react'

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Sample data for demonstration (matching the screenshot design)
  const sampleChats = [
    {
      id: '1',
      name: 'لوازم خانگی نیشت بانه',
      lastMessage: 'تجاری الیت شرکت اصیل اورجینال',
      time: '11:00 AM',
      unread: 105,
      avatar: null,
      type: 'channel'
    },
    {
      id: '2', 
      name: 'Proxy MTProto | پروکسی',
      lastMessage: 'New MTProto Proxy! Server: U...',
      time: '11:00 AM',
      unread: 254,
      avatar: null,
      type: 'channel'
    },
    {
      id: '3',
      name: 'Скачать видео из Инст...',
      lastMessage: 'Kako Band – Dance In Fire, https://...',
      time: '7/29/2025',
      unread: 0,
      avatar: null,
      type: 'channel'
    },
    {
      id: '4',
      name: 'Saved Messages',
      lastMessage: '@Timand_Music – Amadi (Raibod) ...',
      time: 'Sat',
      unread: 0,
      avatar: null,
      type: 'saved'
    },
    {
      id: '5',
      name: 'Appsooner',
      lastMessage: 'V2RAYNG vless://.... تشکر برای',
      time: 'Fri',
      unread: 1,
      avatar: null,
      type: 'channel'
    },
    {
      id: '6',
      name: 'Sabz | FrontEnd - VIP',
      lastMessage: '6 files',
      time: '3/17/2025',
      unread: 0,
      avatar: null,
      type: 'group'
    },
    {
      id: '7',
      name: 'Hyperliquid Live Tracker',
      lastMessage: 'Increased Long #Hyp... 482472',
      time: '11:04 AM',
      unread: 0,
      avatar: null,
      type: 'bot'
    },
    {
      id: '8',
      name: 'PROXY | پروکسی',
      lastMessage: 'آپ داشتن دیپوتیم کرده بود، یه بوو شروع کرد.',
      time: '11:04 AM',
      unread: 57,
      avatar: null,
      type: 'channel'
    },
    {
      id: '9',
      name: 'فیلم سریال ترکی',
      lastMessage: 'اگر نتونی حیل ضمیمه به این فیلمبردن ...',
      time: '10:58 AM',
      unread: 3,
      avatar: null,
      type: 'channel'
    },
    {
      id: '10',
      name: 'APKHUB_VIP',
      lastMessage: 'Rohit: ARCHIVE OF YOUR XXX DR...',
      time: '10:57 AM',
      unread: 20603,
      avatar: null,
      type: 'channel'
    },
    {
      id: '11',
      name: 'SEO 360 | گروه سئو',
      lastMessage: 'roshanak💜🅰️: 🔥 میمیم',
      time: '10:56 AM',
      unread: 701,
      avatar: null,
      type: 'group'
    },
    {
      id: '12',
      name: '... ⬜ ⬜ ⬜ ⬜ کانال خنده',
      lastMessage: '',
      time: '10:54 AM',
      unread: 0,
      avatar: null,
      type: 'channel'
    }
  ]

  const sidebarItems = [
    { icon: MessageCircle, label: 'All chats', count: null, active: true },
    { icon: Users, label: 'Personal', count: 1 },
    { icon: Hash, label: 'University', count: 4 },
    { icon: Archive, label: 'Turkish', count: 4 },
    { icon: Edit3, label: 'School', count: 1 },
    { icon: Bot, label: 'Website G', count: 3 },
    { icon: Settings2, label: 'Programm er', count: 2 },
    { icon: Archive, label: 'ورزش', count: 1 },
    { icon: Bot, label: 'Bot', count: null },
    { icon: Settings, label: 'Edit', count: null }
  ]

  useEffect(() => {
    if (user) {
      loadChats()
      setupSocketListeners()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChats = async () => {
    try {
      // For now, use sample data
      setChats(sampleChats)
      setIsLoading(false)
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری چت‌ها",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const setupSocketListeners = () => {
    socketManager.on('new_message', (data) => {
      if (data.chatId === activeChat?.id) {
        setMessages(prev => [...prev, data.message])
      }
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { ...chat, lastMessage: data.message.content, time: new Date().toLocaleTimeString() }
          : chat
      ))
    })

    socketManager.on('user_typing', (data) => {
      if (data.chatId === activeChat?.id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
      }
    })

    socketManager.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })
  }

  const handleChatSelect = (chat) => {
    setActiveChat(chat)
    // Load messages for this chat
    setMessages([])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || isSending) return

    setIsSending(true)
    try {
      // Add message to local state immediately for better UX
      const tempMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        sender: user,
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, tempMessage])
      setNewMessage('')
      
      // Here you would send to API
      // await chatsAPI.sendMessage(activeChat.id, { content: newMessage.trim() })
      
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ارسال پیام",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getChannelIcon = (type) => {
    switch (type) {
      case 'channel':
        return <Hash className="w-4 h-4 text-blue-500" />
      case 'group':
        return <Users className="w-4 h-4 text-green-500" />
      case 'bot':
        return <Bot className="w-4 h-4 text-purple-500" />
      case 'saved':
        return <Archive className="w-4 h-4 text-blue-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Categories */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative group">
            <div className={`p-2 rounded-lg cursor-pointer transition-colors ${
              item.active 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            {item.count && (
              <div className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.count}
              </div>
            )}
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Chat List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">چت‌ها</h1>
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="جست‌وجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-gray-100 dark:bg-gray-700 border-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sampleChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  activeChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="relative ml-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getChannelIcon(chat.type)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === 'channel' && (
                    <div className="absolute -bottom-1 -left-1 bg-blue-500 rounded-full p-1">
                      <Hash className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div className="bg-gray-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread > 999 ? '999+' : chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getChannelIcon(activeChat.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-gray-900 dark:text-white">
                      {activeChat.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {typingUsers.length > 0 
                        ? 'در حال تایپ...'
                        : activeChat.type === 'group' 
                          ? `${activeChat.members || 0} عضو`
                          : 'آنلاین'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button size="sm" variant="ghost">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>شروع مکالمه</p>
                    <p className="text-sm">اولین پیام خود را ارسال کنید</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender.id === user.id
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm border dark:border-gray-600'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.sender.id === user.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 space-x-reverse">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="pl-10"
                    disabled={isSending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  // Handle file upload
                  console.log('Files selected:', e.target.files)
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                یک چت انتخاب کنید تا شروع به گفت‌وگو کنید
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}