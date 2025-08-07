'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Shield, Users, Image, Calendar, Zap, Globe, Palette, Moon, Sun, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function FeaturesPage() {
  const { theme, toggleTheme } = useTheme()

  const features = [
    {
      icon: MessageCircle,
      title: 'چت امن و رمزنگاری‌شده',
      description: 'پیام‌رسانی امن با رمزنگاری end-to-end، نمایش وضعیت تایپ و لست سین',
      details: [
        'رمزنگاری end-to-end برای تمام پیام‌ها',
        'نمایش وضعیت آنلاین/آفلاین کاربران',
        'اعلان تایپ و خواندن پیام‌ها',
        'پشتیبانی از پیام‌های صوتی و تصویری'
      ]
    },
    {
      icon: Image,
      title: 'گالری نمونه‌کار',
      description: 'نمایش و اشتراک‌گذاری نمونه‌کارها با امکان لایک، کامنت و حاشیه‌نویسی',
      details: [
        'آپلود فایل‌های تصویری و ویدیویی',
        'سیستم لایک و کامنت',
        'دسته‌بندی نمونه‌کارها',
        'آمار بازدید و تعامل'
      ]
    },
    {
      icon: Calendar,
      title: 'مدیریت پروژه',
      description: 'ساخت و مدیریت تسک‌ها، تقویم پروژه و اعلان‌های ددلاین',
      details: [
        'ایجاد و تخصیص تسک‌ها',
        'تقویم پروژه و ددلاین‌ها',
        'ردیابی پیشرفت کار',
        'اعلان‌های هوشمند'
      ]
    },
    {
      icon: Users,
      title: 'گروه‌های حرفه‌ای',
      description: 'ساخت گروه‌های کاری با مدیریت اعضا و ابزارهای همکاری',
      details: [
        'ایجاد گروه‌های عمومی و خصوصی',
        'مدیریت نقش‌های کاربران',
        'چت گروهی با ویژگی‌های پیشرفته',
        'اشتراک‌گذاری فایل و منابع'
      ]
    },
    {
      icon: Shield,
      title: 'امنیت بالا',
      description: 'احراز هویت دو مرحله‌ای، رمزنگاری پیام‌ها و حفاظت از داده‌ها',
      details: [
        'احراز هویت دو مرحله‌ای',
        'رمزنگاری کامل داده‌ها',
        'کنترل دسترسی پیشرفته',
        'پشتیبان‌گیری امن'
      ]
    },
    {
      icon: Globe,
      title: 'چند زبانه',
      description: 'پشتیبانی کامل از فارسی و انگلیسی با رابط کاربری RTL',
      details: [
        'پشتیبانی کامل از زبان فارسی',
        'رابط کاربری RTL',
        'فونت‌های بهینه شده',
        'ترجمه کامل رابط کاربری'
      ]
    },
    {
      icon: Zap,
      title: 'سرعت بالا',
      description: 'پیام‌رسانی real-time با Socket.io و بهینه‌سازی کامل',
      details: [
        'ارسال فوری پیام‌ها',
        'بهینه‌سازی برای سرعت',
        'کش هوشمند',
        'عملکرد بالا در همه دستگاه‌ها'
      ]
    },
    {
      icon: Palette,
      title: 'طراحی زیبا',
      description: 'رابط کاربری الهام‌گرفته از ابزارهای خلاقانه مثل Figma',
      details: [
        'طراحی مدرن و زیبا',
        'تم‌های تیره و روشن',
        'انیمیشن‌های نرم',
        'تجربه کاربری بهینه'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-artisan-50 via-white to-creative-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-artisan-gradient rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ArtisanChat</span>
          </Link>
          
          <div className="flex items-center space-x-4 space-x-reverse">
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
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ویژگی‌های <span className="bg-gradient-to-r from-artisan-600 to-creative-600 bg-clip-text text-transparent">منحصر به فرد</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            همه چیزی که یک خلاق حرفه‌ای برای همکاری، اشتراک‌گذاری و مدیریت پروژه‌ها نیاز دارد
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start space-x-4 space-x-reverse mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-artisan-500 to-creative-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
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
              آماده تجربه این ویژگی‌ها هستید؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              همین الان ثبت‌نام کنید و از تمام امکانات ArtisanChat استفاده کنید
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  شروع رایگان
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-artisan-600">
                  مشاهده دمو
                </Button>
              </Link>
            </div>
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
            <p>&copy; 2024 ArtisanChat. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}