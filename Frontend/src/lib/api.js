import axios from 'axios'
import { Toaster } from '@/components/ui/toaster'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    
    const message = error.response?.data?.message || 'خطایی رخ داده است'
    Toaster.error(message)
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
}

// Users API
export const usersAPI = {
  search: (params) => api.get('/users/search', { params }),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  getFollowers: (userId, params) => api.get(`/users/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/users/${userId}/following`, { params }),
  updateSettings: (settings) => api.put('/users/settings', settings),
  getSuggestions: (params) => api.get('/users/suggestions', { params }),
}

// Chats API
export const chatsAPI = {
  getChats: () => api.get('/chats'),
  createChat: (data) => api.post('/chats', data),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
  markSeen: (chatId, messageId) => api.put(`/chats/${chatId}/messages/${messageId}/seen`),
}

// Groups API
export const groupsAPI = {
  create: (data) => api.post('/groups', data),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId, data) => api.put(`/groups/${groupId}`, data),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  updateMemberRole: (groupId, userId, role) => api.put(`/groups/${groupId}/members/${userId}`, { role }),
}

// Portfolios API
export const portfoliosAPI = {
  create: (data) => api.post('/portfolios', data),
  getPortfolios: (userId, params) => api.get(`/portfolios/${userId}`, { params }),
  getPortfolio: (portfolioId) => api.get(`/portfolios/single/${portfolioId}`),
  updatePortfolio: (portfolioId, data) => api.put(`/portfolios/${portfolioId}`, data),
  deletePortfolio: (portfolioId) => api.delete(`/portfolios/${portfolioId}`),
  likePortfolio: (portfolioId) => api.post(`/portfolios/${portfolioId}/like`),
  addComment: (portfolioId, content) => api.post(`/portfolios/${portfolioId}/comment`, { content }),
  getPopular: (params) => api.get('/portfolios/popular', { params }),
  getTrending: (params) => api.get('/portfolios/trending', { params }),
}

// Tasks API
export const tasksAPI = {
  create: (data) => api.post('/tasks', data),
  getTasks: (groupId, params) => api.get(`/tasks/group/${groupId}`, { params }),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comment`, { content }),
  updateStatus: (taskId, status) => api.put(`/tasks/${taskId}/status`, { status }),
}

// File upload API
export const uploadAPI = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadMultiple: (files, type = 'general') => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('type', type)
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default api