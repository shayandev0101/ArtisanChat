'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Users, Heart, Award, Target, Lightbulb, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function AboutPage() {
  const { theme, toggleTheme } = useTheme()

  const team = [
    {
      name: 'علی احمدی',
      role: 'بنیان‌گذار و مدیرعامل',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'طراح گرافیک با بیش از 10 سال تجربه در صنعت خلاقیت'
    },
    {
      name: 'سارا محمدی',
      role: 'مدیر فنی',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'توسعه‌دهنده فول‌استک با تخصص در پیام‌رسان‌های real-time'
    },
    {
      name: 'محمد رضایی',
      role: 'مدیر محصول',
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'متخصص UX/UI با تمرکز روی تجربه کاربری خلاق‌ها'
    }
  ]

  const values = [
    {
      icon: Heart,
      title: 'عشق به خلاقیت',
      description: 'ما به قدرت خلاقیت و هنر ایمان داریم و تلاش می‌کنیم بهترین ابزارها را برای خلاق‌ها فراهم کنیم.'
    },
    {
      icon: Users,
      title: 'جامعه‌محوری',
      description: 'هدف ما ایجاد جامعه‌ای قوی از خلاق‌ها است که در آن همه بتوانند رشد کنند و موفق شوند.'
    },
    {
      icon: Lightbulb,
      title: 'نوآوری',
      description: 'همیشه به دنبال راه‌های جدید و بهتر برای بهبود تجربه کاربری و ارائه ویژگی‌های منحصر به فرد هستیم.'
    },
    {
      icon: Award,
      title: 'کیفیت',
      description: 'کیفیت در تمام جنبه‌های کارمان، از کد نویسی تا پشتیبانی، اولویت اصلی ماست.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ArtisanChat</span>
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
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                  ثبت‌نام رایگان
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            درباره <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ArtisanChat</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            ما تیمی از خلاق‌ها و توسعه‌دهندگان هستیم که با هدف ایجاد بهترین پلتفرم ارتباطی 
            برای جامعه خلاق‌های ایران، ArtisanChat را طراحی کرده‌ایم.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">داستان ما</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                ArtisanChat از یک نیاز واقعی متولد شد. ما خودمان طراحان، عکاس‌ها و فریلنسرهایی بودیم 
                که با چالش‌های ارتباطی در پروژه‌هایمان دست و پنجه نرم می‌کردیم.
              </p>
              <p>
                پیام‌رسان‌های موجود برای کسب‌وکارهای عمومی طراحی شده بودند، نه برای نیازهای خاص 
                خلاق‌ها. ما به ابزاری نیاز داشتیم که بتواند نمونه‌کارها را به راحتی به اشتراک بگذارد، 
                فیدبک بصری دریافت کند و پروژه‌ها را مدیریت کند.
              </p>
              <p>
                پس تصمیم گرفتیم خودمان این ابزار را بسازیم. ArtisanChat نتیجه ماه‌ها تحقیق، 
                طراحی و توسعه است که با همکاری صدها خلاق ایرانی شکل گرفته.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-muted-foreground">خلاق فعال</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
                  <div className="text-muted-foreground">نمونه‌کار</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-muted-foreground">پیام ارسالی</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                  <div className="text-muted-foreground">پروژه تکمیل شده</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">ارزش‌های ما</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            این ارزش‌ها راهنمای ما در تصمیم‌گیری‌ها و توسعه محصول هستند
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">تیم ما</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            افرادی که با عشق و تخصص ArtisanChat را می‌سازند
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-primary font-medium mb-3">
                {member.role}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-r from-primary to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Target className="w-16 h-16 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">ماموریت ما</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              ما می‌خواهیم بزرگ‌ترین و فعال‌ترین جامعه خلاق‌های ایران را بسازیم. 
              جایی که هر خلاق بتواند استعدادش را نشان دهد، با همکاران ارتباط برقرار کند 
              و پروژه‌های بزرگ را به سرانجام برساند.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                همین حالا عضو شوید
              </Button>
            </Link>
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