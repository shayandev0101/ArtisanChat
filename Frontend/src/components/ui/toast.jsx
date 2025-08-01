import { toast } from 'react-hot-toast'

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '14px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: 'white',
        secondary: 'rgba(16, 185, 129, 0.9)',
      },
    })
  },
  
  error: (message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'rgba(239, 68, 68, 0.9)',
        color: 'white',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '14px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: 'white',
        secondary: 'rgba(239, 68, 68, 0.9)',
      },
    })
  },
  
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-center',
      style: {
        background: 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '14px',
        padding: '12px 16px',
      },
    })
  },
  
  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },
  
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      position: 'top-center',
      style: {
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '14px',
        padding: '12px 16px',
      },
    })
  }
}