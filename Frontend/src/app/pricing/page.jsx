'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Check, X, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme()

  const plans = [
    {
      name: 'رایگان',
      price: '0',
      period: 'ماهانه',
      description: 'برای شروع و آشنایی با ArtisanChat',
      features: [
        'چت با حداکثر 10 نفر',
        'آپلود 5 نمونه‌کار',
        'فضای ذخیره‌سازی 100 مگابایت',
        'پشتیبانی ایمیلی',
        'دسترسی به ویژگی‌های پایه'
      ],
      limitations: [
        'بدون چت گروهی',
        'بدون مدیریت پروژه',
        'محدودیت در اندازه فایل'
      ],
      popular: false,
      buttonText: 'شروع رایگان',
      buttonVariant: 'outline'
    },
    {
      name: 'حرفه‌ای',
      price: '49,000',
      period: 'ماهانه',
      description: 'برای خلاق‌های حرفه‌ای و فریلنسرها',
      features: [
        'چت نامحدود',
        'آپلود نامحدود نمونه‌کار',
        'فضای ذخیره‌سازی 10 گیگابایت',
        'گروه‌های کاری تا 50 نفر',
        'مدیریت پروژه پیشرفته',
        'آمار و گزارش‌گیری',
        'پشتیبانی اولویت‌دار',
        'تم‌های اختصاصی'
      ],
      limitations: [],
      popular: true,
      buttonText: 'انتخاب پلن حرفه‌ای',
      buttonVariant: 'artisan'
    },
    {
      name: 'تیمی',
      price: '99,000',
      period: 'ماهانه',
      description: 'برای تیم‌ها و آژانس‌های خلاق',
      features: [
        'همه ویژگی‌های پلن حرفه‌ای',
        'گروه‌های نامحدود',
        'فضای ذخیره‌سازی 100 گیگابایت',
        'مدیریت تیم پیشرفته',
        'گزارش‌گیری تفصیلی',
        'API دسترسی',
        'پشتیبانی 24/7',
        'آموزش اختصاصی',
        'سفارشی‌سازی کامل'
      ],
      limitations: [],
      popular: false,
      buttonText: 'انتخاب پلن تیمی',
      buttonVariant: 'creative'
    }
  ]

  const faqs = [
    {
      question: 'آیا می‌توانم پلن خود را تغییر دهم؟',
      answer: 'بله، می‌توانید در هر زمان پلن خود را ارتقا یا کاهش دهید. تغییرات از ماه بعد اعمال خواهد شد.'
    },
    {
      question: 'آیا پرداخت امن است؟',
      answer: 'بله، ما از درگاه‌های پرداخت معتبر و امن استفاده می‌کنیم و اطلاعات شما محفوظ است.'
    },
    {
      question: 'آیا تخفیف سالانه وجود دارد؟',
      answer: 'بله، با پرداخت سالانه 20% تخفیف دریافت خواهید کرد.'
    },
    {
      question: 'چگونه می‌توانم اشتراک را لغو کنم؟',
      answer: 'می‌توانید در هر زمان از پنل کاربری خود اشتراک را لغو کنید. دسترسی تا پایان دوره فعلی ادامه خواهد داشت.'
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
            قیمت‌گذاری <span className="bg-gradient-to-r from-artisan-600 to-creative-600 bg-clip-text text-transparent">شفاف</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            پلن مناسب خود را انتخاب کنید و از تمام امکانات ArtisanChat بهره‌مند شوید
          </p>
        </motion.div>
      </section>

      {/* Pricing Plans */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-artisan-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-artisan-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    محبوب‌ترین
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== '0' && (
                    <span className="text-gray-600 dark:text-gray-400 mr-2">تومان</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {plan.period}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-center space-x-3 space-x-reverse opacity-60">
                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/auth/register">
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full"
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">سوالات متداول</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            پاسخ سوالات رایج درباره قیمت‌گذاری و اشتراک
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {faq.answer}
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
              همین الان ثبت‌نام کنید و 14 روز رایگان از تمام ویژگی‌ها استفاده کنید
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                شروع آزمایشی رایگان
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
            <p>&copy; 2024 ArtisanChat. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}