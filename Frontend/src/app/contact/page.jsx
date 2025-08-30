'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Phone, MapPin, Send, Clock, Users, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function ContactPage() {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send to backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "پیام ارسال شد",
          description: "پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.",
        })
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast({
        title: "خطا در ارسال",
        description: "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'ایمیل',
      value: 'info@artisanchat.com',
      description: 'برای سوالات عمومی و پشتیبانی'
    },
    {
      icon: Phone,
      title: 'تلفن',
      value: '+98 21 1234 5678',
      description: 'پاسخگویی در ساعات اداری'
    },
    {
      icon: MapPin,
      title: 'آدرس',
      value: 'تهران، ایران',
      description: 'دفتر مرکزی ArtisanChat'
    },
    {
      icon: Clock,
      title: 'ساعات کاری',
      value: 'شنبه تا چهارشنبه، 9 تا 18',
      description: 'پشتیبانی آنلاین 24/7'
    }
  ]

  const faqs = [
    {
      question: 'آیا ArtisanChat رایگان است؟',
      answer: 'بله، نسخه پایه ArtisanChat کاملاً رایگان است. نسخه پریمیوم با ویژگی‌های اضافی نیز در دسترس است.'
    },
    {
      question: 'چگونه می‌توانم گروه ایجاد کنم؟',
      answer: 'پس از ورود به حساب کاربری، از منوی چت گزینه "گروه جدید" را انتخاب کنید و اعضای مورد نظر را اضافه کنید.'
    },
    {
      question: 'آیا پیام‌ها امن هستند؟',
      answer: 'بله، تمام پیام‌ها با رمزنگاری end-to-end محافظت می‌شوند و هیچ‌کس غیر از شما و گیرنده نمی‌تواند آن‌ها را بخواند.'
    },
    {
      question: 'چگونه نمونه‌کار آپلود کنم؟',
      answer: 'از بخش پروفایل خود، روی "افزودن نمونه‌کار" کلیک کنید و فایل مورد نظر را انتخاب کنید.'
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
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            تماس با <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ما</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            سوال دارید؟ نیاز به راهنمایی دارید؟ تیم ما آماده کمک به شماست.
          </p>
        </motion.div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {info.title}
              </h3>
              <p className="text-primary font-medium mb-2">
                {info.value}
              </p>
              <p className="text-muted-foreground text-sm">
                {info.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">پیام بفرستید</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    نام و نام خانوادگی
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="نام خود را وارد کنید"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ایمیل
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  موضوع
                </label>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="موضوع پیام خود را وارد کنید"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  پیام
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="پیام خود را بنویسید..."
                  rows={6}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    در حال ارسال...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    ارسال پیام
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">سوالات متداول</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-card-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-primary-foreground">
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">نیاز به کمک فوری دارید؟</h3>
              <p className="text-sm mb-4 text-primary-foreground/90">
                تیم پشتیبانی ما 24/7 آماده پاسخگویی به سوالات شماست.
              </p>
              <Button variant="secondary" size="sm">
                چت آنلاین
              </Button>
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