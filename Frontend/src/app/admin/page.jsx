'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  Activity,
  UserCheck,
  MessageSquare,
  Calendar,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    activeUsers: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentMessages, setRecentMessages] = useState([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/chat')
      return
    }

    if (user && user.role === 'admin') {
      loadDashboardData()
    }
  }, [user, isLoading, router])

  const loadDashboardData = async () => {
    try {
      // Load dashboard statistics
      setStats({
        totalUsers: 1250,
        totalChats: 890,
        totalMessages: 45670,
        activeUsers: 234
      })

      // Load recent users
      setRecentUsers([
        {
          id: '1',
          name: 'علی احمدی',
          email: 'ali@example.com',
          skills: ['طراحی گرافیک', 'لوگو'],
          joinedAt: new Date(),
          isOnline: true
        },
        {
          id: '2',
          name: 'سارا محمدی',
          email: 'sara@example.com',
          skills: ['عکاسی', 'ویرایش'],
          joinedAt: new Date(Date.now() - 86400000),
          isOnline: false
        }
      ])

      // Load recent messages
      setRecentMessages([
        {
          id: '1',
          sender: 'علی احمدی',
          content: 'سلام، نمونه‌کار جدیدم رو چک کنید',
          chatName: 'گروه طراحان',
          timestamp: new Date()
        },
        {
          id: '2',
          sender: 'سارا محمدی',
          content: 'عکس‌های جلسه امروز رو آپلود کردم',
          chatName: 'پروژه عکاسی',
          timestamp: new Date(Date.now() - 300000)
        }
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">پنل مدیریت</h1>
                <p className="text-sm text-muted-foreground">داشبورد ادمین ArtisanChat</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" onClick={() => router.push('/chat')}>
                بازگشت به چت
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% نسبت به ماه قبل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کاربران فعال</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                در حال حاضر آنلاین
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل چت‌ها</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% نسبت به هفته قبل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل پیام‌ها</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +25% نسبت به ماه قبل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="users">کاربران</TabsTrigger>
            <TabsTrigger value="messages">پیام‌ها</TabsTrigger>
            <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>کاربران جدید</CardTitle>
                  <CardDescription>آخرین کاربران عضو شده</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 space-x-reverse">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.name}
                              </p>
                              {user.isOnline && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  آنلاین
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.skills.slice(0, 2).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>پیام‌های اخیر</CardTitle>
                  <CardDescription>آخرین فعالیت‌های چت</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {recentMessages.map((message) => (
                        <div key={message.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {message.sender}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString('fa-IR')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {message.content}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {message.chatName}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت کاربران</CardTitle>
                <CardDescription>لیست تمام کاربران سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>بخش مدیریت کاربران در حال توسعه است</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت پیام‌ها</CardTitle>
                <CardDescription>نظارت بر پیام‌های سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>بخش مدیریت پیام‌ها در حال توسعه است</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات سیستم</CardTitle>
                <CardDescription>پیکربندی عمومی سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4" />
                  <p>بخش تنظیمات در حال توسعه است</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}