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
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTheme } from '@/contexts/ThemeContext'
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
  Settings2,
  Moon,
  Sun,
  UserPlus,
  Crown,
  Shield,
  User,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react'

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Sample data matching the screenshot
  const sampleChats = [
    {
      id: '1',
      name: 'لوازم خانگی نیشت بانه',
      lastMessage: 'تجاری الیت شرکت اصیل اورجینال',
      time: '11:00 AM',
      unread: 105,
      avatar: null,
      type: 'channel',
      members: 1250,
      isOnline: true
    },
    {
      id: '2', 
      name: 'Proxy MTProto | پروکسی',
      lastMessage: 'New MTProto Proxy! Server: U...',
      time: '11:00 AM',
      unread: 254,
      avatar: null,
      type: 'channel',
      members: 890,
      isOnline: true
    },
    {
      id: '3',
      name: 'Скачать видео из Инст...',
      lastMessage: 'Kako Band – Dance In Fire, https://...',
      time: '7/29/2025',
      unread: 0,
      avatar: null,
      type: 'channel',
      members: 567,
      isOnline: false
    },
    {
      id: '4',
      name: 'Saved Messages',
      lastMessage: '@Timand_Music – Amadi (Raibod) ...',
      time: 'Sat',
      unread: 0,
      avatar: null,
      type: 'saved',
      members: 1,
      isOnline: true
    },
    {
      id: '5',
      name: 'Appsooner',
      lastMessage: 'V2RAYNG vless://.... تشکر برای',
      time: 'Fri',
      unread: 1,
      avatar: null,
      type: 'channel',
      members: 234,
      isOnline: true
    },
    {
      id: '6',
      name: 'Sabz | FrontEnd - VIP',
      lastMessage: '6 files',
      time: '3/17/2025',
      unread: 0,
      avatar: null,
      type: 'group',
      members: 45,
      isOnline: true
    }
  ]

  const sidebarItems = [
    { icon: MessageCircle, label: 'All chats', count: null, active: true },
    { icon: Users, label: 'Personal', count: 1 },
    { icon: Hash, label: 'University', count: 4 },
    { icon: Archive, label: 'Turkish', count: 4 },
    { icon: Edit3, label: 'School', count: 1 },
    { icon: Bot, label: 'Website G', count: 3 },
    { icon: Settings2, label: 'Programmer', count: 2 },
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
    setMessages([])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || isSending) return

    setIsSending(true)
    try {
      const tempMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        sender: user,
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      }
      
      setMessages(prev => [...prev, tempMessage])
      setNewMessage('')
      
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
        return <MessageCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Categories */}
      <div className="w-16 bg-muted/30 border-l flex flex-col items-center py-4 space-y-2">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative group">
            <Button
              variant={item.active ? "default" : "ghost"}
              size="icon"
              className={`w-10 h-10 rounded-lg ${item.active ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <item.icon className="w-5 h-5" />
            </Button>
            {item.count && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {item.count}
              </Badge>
            )}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border shadow-md">
              {item.label}
            </div>
          </div>
        ))}
        
        <div className="mt-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="w-80 bg-card border-l flex flex-col">
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-card-foreground">چت‌ها</h1>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="جست‌وجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-background/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {sampleChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                  activeChat?.id === chat.id ? 'bg-accent' : ''
                }`}
              >
                <div className="relative ml-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                      {getChannelIcon(chat.type)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === 'channel' && (
                    <div className="absolute -bottom-1 -left-1 bg-blue-500 rounded-full p-1">
                      <Hash className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {chat.isOnline && chat.type === 'private' && (
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-card-foreground truncate text-sm">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {chat.unread > 999 ? '999+' : chat.unread}
                      </Badge>
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
            <div className="bg-card/50 backdrop-blur-sm border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                      {getChannelIcon(activeChat.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Dialog open={showGroupInfo} onOpenChange={setShowGroupInfo}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto text-right">
                          <div>
                            <h2 className="font-medium text-card-foreground text-right">
                              {activeChat.name}
                            </h2>
                            <p className="text-sm text-muted-foreground text-right">
                              {typingUsers.length > 0 
                                ? 'در حال تایپ...'
                                : activeChat.type === 'group' || activeChat.type === 'channel'
                                  ? `${activeChat.members} عضو`
                                  : activeChat.isOnline ? 'آنلاین' : 'آفلاین'
                              }
                            </p>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-right">{activeChat.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={activeChat.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-xl">
                                {getChannelIcon(activeChat.type)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-card-foreground">{activeChat.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {activeChat.type === 'channel' ? 'کانال' : 
                                 activeChat.type === 'group' ? 'گروه' : 
                                 activeChat.type === 'bot' ? 'ربات' : 'پیام‌های ذخیره‌شده'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="text-lg font-bold text-card-foreground">{activeChat.members}</div>
                              <div className="text-xs text-muted-foreground">عضو</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="text-lg font-bold text-card-foreground">1.2K</div>
                              <div className="text-xs text-muted-foreground">پیام</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                              <UserPlus className="w-4 h-4 ml-2" />
                              افزودن عضو
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Settings className="w-4 h-4 ml-2" />
                              تنظیمات گروه
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">شروع مکالمه</h3>
                    <p className="text-sm text-muted-foreground">اولین پیام خود را ارسال کنید</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender.id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-card-foreground rounded-bl-md border'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.sender.id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.sender.id === user?.id && (
                            <div className="mr-2">
                              {getStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-card/50 backdrop-blur-sm border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 space-x-reverse">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="pl-10 bg-background/50"
                    disabled={isSending}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 bg-primary hover:bg-primary/90"
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
                  console.log('Files selected:', e.target.files)
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                یک چت انتخاب کنید
              </h2>
              <p className="text-muted-foreground">
                برای شروع گفت‌وگو یک چت انتخاب کنید
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}