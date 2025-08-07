'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, Image, Calendar, Zap, Shield, Globe, Palette, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: MessageCircle,
      title: 'چت امن و رمزنگاری‌شده',
      description: 'پیام‌رسانی امن با رمزنگاری end-to-end، نمایش وضعیت تایپ و لست سین'
    },
    {
      icon: Image,
      title: 'گالری نمونه‌کار',
      description: 'نمایش و اشتراک‌گذاری نمونه‌کارها با امکان لایک، کامنت و حاشیه‌نویسی'
    },
    {
      icon: Calendar,
      title: 'مدیریت پروژه',
      description: 'ساخت و مدیریت تسک‌ها، تقویم پروژه و اعلان‌های ددلاین'
    },
    {
      icon: Users,
      title: 'گروه‌های حرفه‌ای',
      description: 'ساخت گروه‌های کاری با مدیریت اعضا و ابزارهای همکاری'
    },
    {
      icon: Shield,
      title: 'امنیت بالا',
      description: 'احراز هویت دو مرحله‌ای، رمزنگاری پیام‌ها و حفاظت از داده‌ها'
    },
    {
      icon: Globe,
      title: 'چند زبانه',
      description: 'پشتیبانی کامل از فارسی و انگلیسی با رابط کاربری RTL'
    },
    {
      icon: Zap,
      title: 'سرعت بالا',
      description: 'پیام‌رسانی real-time با Socket.io و بهینه‌سازی کامل'
    },
    {
      icon: Palette,
      title: 'طراحی زیبا',
      description: 'رابط کاربری الهام‌گرفته از ابزارهای خلاقانه مثل Figma'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-artisan-50 via-white to-creative-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <div className="w-10 h-10 bg-artisan-gradient rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ArtisanChat</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">جایی که هنر به خلاقیت تبدیل میشه</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 space-x-reverse"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Link href="/auth/login">
              <Button variant="ghost">ورود</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="artisan">ثبت‌نام رایگان</Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-artisan-600 to-creative-600 bg-clip-text text-transparent">
              ArtisanChat
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            جایی که هنر به خلاقیت و گفت وگو تبدیل میشه!
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            پیام‌رسان حرفه‌ای برای طراحان گرافیک، عکاس‌ها، نویسندگان و فریلنسرها
            با امکانات منحصر به فرد برای همکاری و اشتراک‌گذاری نمونه‌کارها
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse"
          >
            <Link href="/auth/register">
              <Button size="lg" variant="artisan" className="text-lg px-8 py-4">
                شروع رایگان
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                مشاهده دمو
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ویژگی‌های منحصر به فرد
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            همه چیزی که یک خلاق حرفه‌ای برای همکاری و اشتراک‌گذاری نیاز دارد
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-artisan-gradient rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-artisan-600 to-creative-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              همین الان عضو جامعه خلاق‌های ArtisanChat شوید و تجربه جدیدی از همکاری را آغاز کنید
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                ثبت‌نام رایگان
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-artisan-gradient rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">ArtisanChat</span>
              </div>
              <p className="text-gray-400 text-sm">
                پیام‌رسان حرفه‌ای برای خلاق‌ها
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">محصول</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features" className="hover:text-white">ویژگی‌ها</Link></li>
                <li><Link href="/pricing" className="hover:text-white">قیمت‌گذاری</Link></li>
                <li><Link href="/demo" className="hover:text-white">دمو</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">پشتیبانی</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">راهنما</Link></li>
                <li><Link href="/contact" className="hover:text-white">تماس با ما</Link></li>
                <li><Link href="/faq" className="hover:text-white">سوالات متداول</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">شرکت</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">درباره ما</Link></li>
                <li><Link href="/blog" className="hover:text-white">بلاگ</Link></li>
                <li><Link href="/careers" className="hover:text-white">فرصت‌های شغلی</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 ArtisanChat. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}