'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { authAPI } from '@/lib/api'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!email) {
      router.push('/auth/register')
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [email, router])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast({
        title: "خطا",
        description: "لطفاً کد 6 رقمی را کامل وارد کنید",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await authAPI.verifyOtp({ email, otp: otpCode })
      
      if (response.data.success) {
        toast({
          title: "تایید موفق",
          description: "حساب کاربری شما با موفقیت تایید شد",
        })
        router.push('/auth/complete-profile')
      }
    } catch (error) {
      toast({
        title: "خطا در تایید",
        description: error.response?.data?.message || "کد وارد شده صحیح نیست",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setIsResending(true)
    try {
      await authAPI.resendOtp({ email })
      toast({
        title: "کد ارسال شد",
        description: "کد تایید جدید به ایمیل شما ارسال شد",
      })
      setCountdown(60)
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ارسال مجدد کد",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
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
          <h1 className="text-2xl font-bold text-foreground mb-2">تایید ایمیل</h1>
          <p className="text-muted-foreground">کد 6 رقمی ارسال شده به ایمیل خود را وارد کنید</p>
        </div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              کد تایید به ایمیل <span className="font-medium text-foreground">{email}</span> ارسال شد
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center space-x-2 space-x-reverse mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-bold"
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 mb-4"
            disabled={isVerifying || otp.join('').length !== 6}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                در حال تایید...
              </div>
            ) : (
              <>
                تایید
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              کد را دریافت نکردید؟
            </p>
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending ? (
                'در حال ارسال...'
              ) : countdown > 0 ? (
                `ارسال مجدد (${countdown}s)`
              ) : (
                'ارسال مجدد کد'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}