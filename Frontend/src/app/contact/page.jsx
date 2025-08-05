'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Phone, MapPin, Send, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/components/ui/toast'
import Link from 'next/link'

export default function ContactPage() {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showToast.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      showToast.error('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.')
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
    <div className="min-h-screen bg-gradient-to-br from-artisan-50 via-white to-creative-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-artisan-gradient rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ArtisanChat</span>
          </Link>
          
          <div className="flex items-center space-x-4 space-x-reverse">
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            تماس با <span className="bg-gradient-to-r from-artisan-600 to-creative-600 bg-clip-text text-transparent">ما</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
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
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-artisan-500 to-creative-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {info.title}
              </h3>
              <p className="text-artisan-600 font-medium mb-2">
                {info.value}
              </p>
              <p className="text-gray-600 text-sm">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">پیام بفرستید</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                variant="artisan"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">سوالات متداول</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-artisan-500 to-creative-500 rounded-xl text-white">
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">نیاز به کمک فوری دارید؟</h3>
              <p className="text-sm mb-4">
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
      <footer className="bg-gray-900 text-white py-12">
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