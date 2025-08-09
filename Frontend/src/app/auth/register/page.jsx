'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, MessageCircle, Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { authAPI } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    bio: '',
    location: '',
    skills: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const skillOptions = [
    'طراحی گرافیک',
    'عکاسی',
    'نویسندگی',
    'طراحی وب',
    'انیمیشن',
    'ویدیوگرافی',
    'طراحی UI/UX',
    'تصویرسازی',
    'طراحی لوگو',
    'بازاریابی دیجیتال'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.username) {
      newErrors.username = 'نام کاربری الزامی است'
    } else if (formData.username.length < 3) {
      newErrors.username = 'نام کاربری باید حداقل 3 کاراکتر باشد'
    }

    if (!formData.email) {
      newErrors.email = 'ایمیل الزامی است'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست'
    }

    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور الزامی است'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.fullName) {
      newErrors.fullName = 'نام کامل الزامی است'
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'حداقل یک مهارت انتخاب کنید'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setIsLoading(true)
    try {
      const response = await authAPI.register(formData)
      
      if (response.data.success) {
        toast({
          title: "ثبت‌نام موفق",
          description: "کد تایید به ایمیل شما ارسال شد",
        })
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در ثبت‌نام'
      toast({
        title: "خطا در ثبت‌نام",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">عضویت در ArtisanChat</h1>
          <p className="text-muted-foreground">به جامعه خلاق‌ها بپیوندید</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border rounded-2xl shadow-lg p-8"
        >
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-card-foreground">اطلاعات حساب کاربری</h2>
                <p className="text-sm text-muted-foreground">اطلاعات اولیه خود را وارد کنید</p>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام کاربری
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="نام کاربری منحصر به فرد"
                    className={`pr-10 ${errors.username ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`pr-10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="حداقل 8 کاراکتر"
                    className={`pr-10 pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    className={`pr-10 pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                مرحله بعد
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-card-foreground">اطلاعات پروفایل</h2>
                <p className="text-sm text-muted-foreground">پروفایل حرفه‌ای خود را تکمیل کنید</p>
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام کامل *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="نام و نام خانوادگی"
                    className={`pr-10 ${errors.fullName ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  بیوگرافی
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="توضیح کوتاهی درباره خودتان و کارتان..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/200 کاراکتر
                </p>
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  موقعیت مکانی
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="شهر، کشور"
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  مهارت‌ها *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2 hover:bg-primary/10 transition-colors"
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {errors.skills && (
                  <p className="text-destructive text-sm mt-1">{errors.skills}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  مرحله قبل
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      در حال ثبت‌نام...
                    </div>
                  ) : (
                    <>
                      ثبت‌نام
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              قبلاً عضو شده‌اید؟{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                وارد شوید
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}