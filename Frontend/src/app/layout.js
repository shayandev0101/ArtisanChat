import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ArtisanChat - جایی که هنر به خلاقیت و گفت وگو تبدیل میشه!',
  description: 'پیام‌رسان حرفه‌ای برای خلاق‌ها - طراحان گرافیک، عکاس‌ها، نویسندگان و فریلنسرها. با امکانات چت امن، گالری نمونه‌کار، مدیریت پروژه و ابزارهای همکاری.',
  keywords: 'پیام‌رسان, خلاق‌ها, طراحی گرافیک, عکاسی, فریلنسر, نمونه‌کار, چت, همکاری, پروژه',
  authors: [{ name: 'ArtisanChat Team' }],
  creator: 'ArtisanChat',
  publisher: 'ArtisanChat',
  robots: 'index, follow',
  openGraph: {
    title: 'ArtisanChat - پیام‌رسان حرفه‌ای خلاق‌ها',
    description: 'جایی که هنر به خلاقیت و گفت وگو تبدیل میشه! پیام‌رسان ویژه طراحان، عکاس‌ها و فریلنسرها',
    url: 'https://artisanchat.com',
    siteName: 'ArtisanChat',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ArtisanChat - پیام‌رسان حرفه‌ای خلاق‌ها',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtisanChat - پیام‌رسان حرفه‌ای خلاق‌ها',
    description: 'جایی که هنر به خلاقیت و گفت وگو تبدیل میشه!',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://artisanchat.com',
    languages: {
      'fa-IR': 'https://artisanchat.com/fa',
      'en-US': 'https://artisanchat.com/en',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ArtisanChat",
              "description": "پیام‌رسان حرفه‌ای برای خلاق‌ها",
              "url": "https://artisanchat.com",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div id="root">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}