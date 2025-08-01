'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Plus, MoreVertical, Send, Paperclip, Smile, 
  Phone, Video, Info, ArrowLeft, Users, Settings,
  Image, File, Mic, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { chatsAPI } from '@/lib/api'
import { socketManager } from '@/lib/socket'
import { showToast } from '@/components/ui/toast'
import { PageLoader, ChatLoader } from '@/components/ui/loader'
import { formatRelativeTime } from '@/lib/utils'

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

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
      const response = await chatsAPI.getChats()
      setChats(response.data.chats || [])
    } catch (error) {
      showToast.error('خطا در بارگذاری چت‌ها')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const response = await chatsAPI.getMessages(chatId)
      setMessages(response.data.messages || [])
      socketManager.joinChat(chatId)
    } catch (error) {
      showToast.error('خطا در بارگذاری پیام‌ها')
    }
  }

  const setupSocketListeners = () => {
    socketManager.on('new_message', (data) => {
      if (data.chatId === activeChat?._id) {
        setMessages(prev => [...prev, data.message])
      }
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat._id === data.chatId 
          ? { ...chat, lastMessage: data.message, updatedAt: new Date() }
          : chat
      ))
    })

    socketManager.on('user_typing', (data) => {
      if (data.chatId === activeChat?._id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
      }
    })

    socketManager.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    socketManager.on('message_seen', (data) => {
      if (data.chatId === activeChat?._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, seenBy: [...msg.seenBy, data.seenBy] }
            : msg
        ))
      }
    })
  }

  const handleChatSelect = (chat) => {
    if (activeChat?._id) {
      socketManager.leaveChat(activeChat._id)
    }
    setActiveChat(chat)
    loadMessages(chat._id)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || isSending) return

    setIsSending(true)
    try {
      const messageData = {
        chatId: activeChat._id,
        content: newMessage.trim(),
        type: 'text'
      }

      socketManager.sendMessage(messageData)
      setNewMessage('')
    } catch (error) {
      showToast.error('خطا در ارسال پیام')
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (activeChat) {
      socketManager.startTyping(activeChat._id)
      
      // Stop typing after 3 seconds of inactivity
      clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        socketManager.stopTyping(activeChat._id)
      }, 3000)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => 
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (authLoading || isLoading) {
    return <PageLoader />
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">چت‌ها</h1>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="artisan">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="جست‌وجو در چت‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>هنوز چتی ندارید</p>
              <p className="text-sm">چت جدید شروع کنید</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <motion.div
                key={chat._id}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  activeChat?._id === chat._id ? 'bg-artisan-50 border-r-2 border-r-artisan-500' : ''
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-artisan-400 to-creative-500 rounded-full flex items-center justify-center text-white font-medium">
                      {chat.type === 'group' ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        chat.name?.[0] || 'U'
                      )}
                    </div>
                    {chat.type === 'private' && (
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.name || 'چت بدون نام'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(chat.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage?.content || 'هنوز پیامی ارسال نشده'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-br from-artisan-400 to-creative-500 rounded-full flex items-center justify-center text-white font-medium">
                    {activeChat.type === 'group' ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      activeChat.name?.[0] || 'U'
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {activeChat.name || 'چت بدون نام'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {typingUsers.length > 0 
                        ? `${typingUsers[0].username} در حال تایپ...`
                        : activeChat.type === 'group' 
                          ? `${activeChat.participants?.length || 0} عضو`
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
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>شروع مکالمه</p>
                  <p className="text-sm">اولین پیام خود را ارسال کنید</p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender._id === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender._id === user._id
                        ? 'bg-artisan-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border'
                    }`}>
                      {message.sender._id !== user._id && (
                        <p className="text-xs text-gray-500 mb-1">
                          {message.sender.fullName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${
                          message.sender._id === user._id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatRelativeTime(message.createdAt)}
                        </span>
                        {message.sender._id === user._id && (
                          <div className="flex items-center space-x-1">
                            <div className={`w-1 h-1 rounded-full ${
                              message.seenBy?.length > 1 ? 'bg-white' : 'bg-white/50'
                            }`}></div>
                            <div className={`w-1 h-1 rounded-full ${
                              message.seenBy?.length > 1 ? 'bg-white' : 'bg-white/50'
                            }`}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 space-x-reverse">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleFileUpload}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="پیام خود را بنویسید..."
                    className="pl-10"
                    disabled={isSending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  size="sm"
                  variant="artisan"
                  disabled={!newMessage.trim() || isSending}
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-artisan-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                به ArtisanChat خوش آمدید
              </h2>
              <p className="text-gray-600">
                یک چت انتخاب کنید تا شروع به گفت‌وگو کنید
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}