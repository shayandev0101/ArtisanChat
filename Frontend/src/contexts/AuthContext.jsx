'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '@/lib/api'
import { socketManager } from '@/lib/socket'
import { toast } from '@/hooks/use-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        const user = JSON.parse(userData)
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
        
        // Connect socket
        socketManager.connect(token)
        
        // Verify token with server
        try {
          const response = await authAPI.getMe()
          dispatch({ type: 'UPDATE_USER', payload: response.data.user })
        } catch (error) {
          // Token is invalid, logout
          logout()
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.login(credentials)
      const { user, token } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      
      // Connect socket
      socketManager.connect(token)
      
      toast({
        title: "ورود موفق",
        description: "با موفقیت وارد شدید",
      })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      const message = error.response?.data?.message || 'خطا در ورود'
      
      toast({
        title: "خطا در ورود",
        description: message,
        variant: "destructive",
      })
      
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.register(userData)
      
      if (response.data.requiresVerification) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: true, requiresVerification: true }
      }

      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      
      // Connect socket
      socketManager.connect(token)
      
      toast({
        title: "ثبت‌نام موفق",
        description: "حساب کاربری با موفقیت ایجاد شد",
      })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      const message = error.response?.data?.message || 'خطا در ثبت‌نام'
      
      toast({
        title: "خطا در ثبت‌نام",
        description: message,
        variant: "destructive",
      })
      
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Disconnect socket
      socketManager.disconnect()
      
      dispatch({ type: 'LOGOUT' })
      
      toast({
        title: "خروج موفق",
        description: "با موفقیت خارج شدید",
      })
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}