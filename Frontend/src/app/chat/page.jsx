'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { chatsAPI, usersAPI, groupsAPI } from '@/lib/api'
import { socketManager } from '@/lib/socket'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Check,
  Pin,
  PinOff,
  Trash2,
  LogOut,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Copy,
  Forward,
  Reply,
  Edit,
  Download
} from 'lucide-react'

export default function ChatPage() {
  const { user, isLoading: authLoading, logout } = useAuth()
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
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    sounds: true,
    theme: 'light'
  })
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    type: 'group',
    members: []
  })
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const sidebarItems = [
    { icon: MessageCircle, label: 'همه چت‌ها', key: 'all', active: selectedCategory === 'all' },
    { icon: Users, label: 'شخصی', key: 'personal', count: 1 },
    { icon: Hash, label: 'دانشگاه', key: 'university', count: 4 },
    { icon: Archive, label: 'ترکی', key: 'turkish', count: 4 },
    { icon: Edit3, label: 'مدرسه', key: 'school', count: 1 },
    { icon: Bot, label: 'وب‌سایت', key: 'website', count: 3 },
    { icon: Settings2, label: 'برنامه‌نویسی', key: 'programming', count: 2 },
    { icon: Archive, label: 'ورزش', key: 'sports', count: 1 },
    { icon: Bot, label: 'ربات', key: 'bot' },
    { icon: Settings, label: 'ویرایش', key: 'edit' }
  ]

  useEffect(() => {
    if (user) {
      loadChats()
      setupSocketListeners()
      loadUserSettings()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (searchQuery) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChats = async () => {
    try {
      const response = await chatsAPI.getChats()
      setChats(response.data.chats || [])
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری چت‌ها",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserSettings = async () => {
    try {
      const settings = localStorage.getItem('userSettings')
      if (settings) {
        setUserSettings(JSON.parse(settings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveUserSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...userSettings, ...newSettings }
      setUserSettings(updatedSettings)
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings))
      
      await usersAPI.updateSettings(updatedSettings)
      toast({
        title: "تنظیمات ذخیره شد",
        description: "تنظیمات با موفقیت به‌روزرسانی شد",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      })
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await usersAPI.search({ query: searchQuery })
      setSearchResults(response.data.users || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const setupSocketListeners = () => {
    if (!user) return

    socketManager.connect(localStorage.getItem('token'))

    socketManager.on('new_message', (data) => {
      if (data.chatId === activeChat?._id) {
        setMessages(prev => [...prev, data.message])
      }
      
      setChats(prev => prev.map(chat => 
        chat._id === data.chatId 
          ? { ...chat, lastMessage: data.message, updatedAt: new Date() }
          : chat
      ))

      if (userSettings.notifications) {
        toast({
          title: "پیام جدید",
          description: `${data.message.sender.fullName}: ${data.message.content}`,
        })
      }
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
            ? { ...msg, seenBy: [...(msg.seenBy || []), data.seenBy] }
            : msg
        ))
      }
    })
  }

  const handleChatSelect = async (chat) => {
    setActiveChat(chat)
    setMessages([])
    
    try {
      const response = await chatsAPI.getMessages(chat._id)
      setMessages(response.data.messages || [])
      socketManager.joinChat(chat._id)
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری پیام‌ها",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || isSending) return

    setIsSending(true)
    try {
      const tempMessage = {
        _id: Date.now(),
        content: newMessage.trim(),
        sender: user,
        createdAt: new Date(),
        type: 'text',
        seenBy: [{ user: user._id }]
      }
      
      setMessages(prev => [...prev, tempMessage])
      setNewMessage('')
      
      await chatsAPI.sendMessage(activeChat._id, { 
        content: newMessage.trim(),
        type: 'text'
      })
      
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

  const handleTyping = () => {
    if (activeChat) {
      socketManager.startTyping(activeChat._id)
      
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socketManager.stopTyping(activeChat._id)
      }, 3000)
    }
  }

  const handleCreateGroup = async () => {
    try {
      if (!newGroupData.name.trim()) {
        toast({
          title: "خطا",
          description: "نام گروه الزامی است",
          variant: "destructive",
        })
        return
      }

      const response = await groupsAPI.create(newGroupData)
      
      toast({
        title: "گروه ایجاد شد",
        description: "گروه با موفقیت ایجاد شد",
      })
      
      setShowCreateGroup(false)
      setNewGroupData({ name: '', description: '', type: 'group', members: [] })
      loadChats()
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ایجاد گروه",
        variant: "destructive",
      })
    }
  }

  const handlePinChat = async (chatId) => {
    try {
      // API call to pin/unpin chat
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { ...chat, isPinned: !chat.isPinned }
          : chat
      ))
      
      toast({
        title: "چت پین شد",
        description: "چت در بالای لیست قرار گرفت",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در پین کردن چت",
        variant: "destructive",
      })
    }
  }

  const startPrivateChat = async (userId) => {
    try {
      const response = await chatsAPI.createChat({
        type: 'private',
        participants: [userId]
      })
      
      const newChat = response.data.chat
      setChats(prev => [newChat, ...prev])
      setActiveChat(newChat)
      setSearchQuery('')
      setSearchResults([])
      
      toast({
        title: "چت جدید",
        description: "چت خصوصی ایجاد شد",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ایجاد چت",
        variant: "destructive",
      })
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

  const filteredChats = chats.filter(chat => {
    if (selectedCategory === 'all') return true
    return chat.category === selectedCategory
  })

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
              onClick={() => setSelectedCategory(item.key)}
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
        
        <div className="mt-auto space-y-2">
          {/* Settings */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-lg">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تنظیمات</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">اعلان‌ها</Label>
                  <Switch
                    id="notifications"
                    checked={userSettings.notifications}
                    onCheckedChange={(checked) => saveUserSettings({ notifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sounds">صداها</Label>
                  <Switch
                    id="sounds"
                    checked={userSettings.sounds}
                    onCheckedChange={(checked) => saveUserSettings({ sounds: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">حالت تیره</Label>
                  <Switch
                    id="theme"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    خروج از حساب
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
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
            
            {/* Create Group/Channel */}
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-right">ایجاد گروه جدید</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">نام گروه</Label>
                    <Input
                      id="groupName"
                      value={newGroupData.name}
                      onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="نام گروه را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="groupDesc">توضیحات</Label>
                    <Textarea
                      id="groupDesc"
                      value={newGroupData.description}
                      onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="توضیحات گروه (اختیاری)"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" onClick={() => setShowCreateGroup(false)} className="flex-1">
                      لغو
                    </Button>
                    <Button onClick={handleCreateGroup} className="flex-1">
                      ایجاد گروه
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="جست‌وجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-background/50"
            />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser._id}
                    onClick={() => startPrivateChat(searchUser._id)}
                    className="flex items-center p-3 hover:bg-accent cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 ml-3">
                      <AvatarImage src={searchUser.profilePicture} />
                      <AvatarFallback>{searchUser.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{searchUser.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{searchUser.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                  activeChat?._id === chat._id ? 'bg-accent' : ''
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
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h3 className="font-medium text-card-foreground truncate text-sm">
                        {chat.name}
                      </h3>
                      {chat.isPinned && <Pin className="w-3 h-3 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.content || 'هنوز پیامی ارسال نشده'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {chat.unreadCount > 999 ? '999+' : chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chat Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePinChat(chat._id)}>
                      {chat.isPinned ? (
                        <>
                          <PinOff className="w-4 h-4 ml-2" />
                          حذف پین
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 ml-2" />
                          پین کردن
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 ml-2" />
                      آرشیو
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف چت
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                                  ? `${activeChat.participants?.length || 0} عضو`
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
                                 activeChat.type === 'bot' ? 'ربات' : 'چت خصوصی'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="text-lg font-bold text-card-foreground">{activeChat.participants?.length || 0}</div>
                              <div className="text-xs text-muted-foreground">عضو</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="text-lg font-bold text-card-foreground">{messages.length}</div>
                              <div className="text-xs text-muted-foreground">پیام</div>
                            </div>
                          </div>

                          {activeChat.type === 'group' && (
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
                          )}
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Search className="w-4 h-4 ml-2" />
                        جست‌وجو در چت
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePinChat(activeChat._id)}>
                        {activeChat.isPinned ? (
                          <>
                            <PinOff className="w-4 h-4 ml-2" />
                            حذف پین
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 ml-2" />
                            پین کردن
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف چت
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user?._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl group relative ${
                        message.sender._id === user?._id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-card-foreground rounded-bl-md border'
                      }`}>
                        {message.sender._id !== user?._id && activeChat.type === 'group' && (
                          <p className="text-xs font-medium mb-1 text-primary">
                            {message.sender.fullName}
                          </p>
                        )}
                        
                        <p className="text-sm">{message.content}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.sender._id === user?._id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.sender._id === user?._id && (
                            <div className="mr-2">
                              {getStatusIcon(message.status || 'sent')}
                            </div>
                          )}
                        </div>

                        {/* Message Options */}
                        <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Reply className="w-4 h-4 ml-2" />
                                پاسخ
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="w-4 h-4 ml-2" />
                                فوروارد
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 ml-2" />
                                کپی
                              </DropdownMenuItem>
                              {message.sender._id === user?._id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 ml-2" />
                                    ویرایش
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-card-foreground px-4 py-2 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
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