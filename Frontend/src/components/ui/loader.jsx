import { motion } from 'framer-motion'

export function Spinner({ size = 'md', color = 'artisan' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    artisan: 'border-artisan-500',
    creative: 'border-creative-500',
    white: 'border-white',
    gray: 'border-gray-500'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-artisan-gradient rounded-2xl flex items-center justify-center mb-4 mx-auto"
        >
          <Spinner size="lg" color="white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 font-medium"
        >
          در حال بارگذاری...
        </motion.p>
      </div>
    </div>
  )
}

export function ChatLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex space-x-2 space-x-reverse">
        <motion.div
          className="w-2 h-2 bg-artisan-500 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-artisan-500 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
        />
        <motion.div
          className="w-2 h-2 bg-artisan-500 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export function SkeletonLoader({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  )
}