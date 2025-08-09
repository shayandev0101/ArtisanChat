'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, Image, Calendar, Zap, Shield, Globe, Palette, Moon, Sun, ArrowRight, Star, Play, CheckCircle } from 'lucide-react'
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
      description: 'پیام‌رسانی امن با رمزنگاری end-to-end، نمایش وضعیت تایپ و لست سین',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Image,
      title: 'گالری نمونه‌کار',
      description: 'نمایش و اشتراک‌گذاری نمونه‌کارها با امکان لایک، کامنت و حاشیه‌نویسی',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Calendar,
      title: 'مدیریت پروژه',
      description: 'ساخت و مدیریت تسک‌ها، تقویم پروژه و اعلان‌های ددلاین',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'گروه‌های حرفه‌ای',
      description: 'ساخت گروه‌های کاری با مدیریت اعضا و ابزارهای همکاری',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'امنیت بالا',
      description: 'احراز هویت دو مرحله‌ای، رمزنگاری پیام‌ها و حفاظت از داده‌ها',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'چند زبانه',
      description: 'پشتیبانی کامل از فارسی و انگلیسی با رابط کاربری RTL',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'سرعت بالا',
      description: 'پیام‌رسانی real-time با Socket.io و بهینه‌سازی کامل',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Palette,
      title: 'طراحی زیبا',
      description: 'رابط کاربری الهام‌گرفته از ابزارهای خلاقانه مثل Figma',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const testimonials = [
    {
      name: 'سارا احمدی',
      role: 'طراح گرافیک',
      content: 'ArtisanChat کاملاً کار من رو تغییر داده. حالا می‌تونم راحت با تیمم همکاری کنم و نمونه‌کارهام رو به اشتراک بذارم.',
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5
    },
    {
      name: 'علی رضایی',
      role: 'عکاس',
      content: 'بهترین پلتفرم برای عکاس‌ها! گالری نمونه‌کار و سیستم فیدبک عالی هست.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5
    },
    {
      name: 'مریم کریمی',
      role: 'نویسنده',
      content: 'عاشق مدیریت پروژه‌هاش هستم. همه کارهام رو تو یه جا مدیریت می‌کنم.',
      avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5
    }
  ]

  const stats = [
    { number: '10K+', label: 'خلاق فعال' },
    { number: '50K+', label: 'نمونه‌کار' },
    { number: '1M+', label: 'پیام ارسالی' },
    { number: '500+', label: 'پروژه تکمیل شده' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ArtisanChat</h1>
                <p className="text-xs text-muted-foreground">جایی که هنر به خلاقیت تبدیل میشه</p>
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
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                  ثبت‌نام رایگان
                </Button>
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Star className="w-4 h-4 ml-2" />
            پیام‌رسان حرفه‌ای خلاق‌ها
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ArtisanChat
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
            جایی که هنر به خلاقیت و گفت‌وگو تبدیل میشه!
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            پیام‌رسان حرفه‌ای برای طراحان گرافیک، عکاس‌ها، نویسندگان و فریلنسرها
            با امکانات منحصر به فرد برای همکاری و اشتراک‌گذاری نمونه‌کارها
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse mb-12"
          >
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                شروع رایگان
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 group">
              <Play className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              مشاهده دمو
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ویژگی‌های منحصر به فرد
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              className="group relative bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            نظرات کاربران
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ببینید خلاق‌های دیگر چه می‌گویند
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-card-foreground mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full ml-3"
                />
                <div>
                  <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              همین الان عضو جامعه خلاق‌های ArtisanChat شوید و تجربه جدیدی از همکاری را آغاز کنید
            </p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
              <span className="text-primary-foreground">رایگان برای همیشه</span>
            </div>
            <div className="mt-6">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                  ثبت‌نام رایگان
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">ArtisanChat</span>
              </div>
              <p className="text-muted-foreground text-sm">
                پیام‌رسان حرفه‌ای برای خلاق‌ها
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">محصول</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">ویژگی‌ها</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">قیمت‌گذاری</Link></li>
                <li><Link href="/demo" className="hover:text-foreground transition-colors">دمو</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">پشتیبانی</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">راهنما</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">تماس با ما</Link></li>
                <li><Link href="/faq" className="hover:text-foreground transition-colors">سوالات متداول</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">شرکت</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">درباره ما</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">بلاگ</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">فرصت‌های شغلی</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ArtisanChat. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}