import apiClient from './client.js'

export const authAPI = {
  async login(credentials) {
    return await apiClient.post('/api/auth/login', credentials)
  },

  async signup(userData) {
    return await apiClient.post('/api/auth/signup', userData)
  },

  async getCurrentUser() {
    return await apiClient.get('/api/auth/me')
  }
}