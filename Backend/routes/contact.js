const express = require('express')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator')
const rateLimit = require('express-rate-limit')

const router = express.Router()

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many contact form submissions, please try again later.'
})

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Contact form validation
const contactValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .trim(),
  body('message')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim()
]

// @route   POST /api/contact
// @desc    Send contact form message
// @access  Public
router.post('/', contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, subject, message } = req.body

    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `ArtisanChat Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">پیام جدید از فرم تماس</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>نام:</strong> ${name}</p>
              <p><strong>ایمیل:</strong> ${email}</p>
              <p><strong>موضوع:</strong> ${subject}</p>
            </div>
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3>پیام:</h3>
              <p style="line-height: 1.6;">${message}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              ارسال شده از وب‌سایت ArtisanChat در ${new Date().toLocaleString('fa-IR')}
            </p>
          </div>
        `
      })

      // Send confirmation email to user
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'تایید دریافت پیام - ArtisanChat',
        html: `
          <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">پیام شما دریافت شد</h2>
            <p>سلام ${name}،</p>
            <p>پیام شما با موضوع "<strong>${subject}</strong>" با موفقیت دریافت شد.</p>
            <p>تیم پشتیبانی ما در اسرع وقت با شما تماس خواهد گرفت.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>پیام شما:</strong></p>
              <p style="font-style: italic;">"${message}"</p>
            </div>
            <p>با تشکر،<br>تیم ArtisanChat</p>
          </div>
        `
      })

    } catch (emailError) {
      console.error('Email send error:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send email'
      })
    }

    res.json({
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router