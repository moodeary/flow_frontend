import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth.js'
import apiClient from '@/api/client.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('accessToken'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    isLoading.value = true
    try {
      const response = await authAPI.login(credentials)

      if (response.success) {
        token.value = response.data.accessToken
        apiClient.setToken(response.data.accessToken)
        await fetchCurrentUser()
        return response
      } else {
        throw new Error(response.message || '로그인 실패')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function signup(userData) {
    isLoading.value = true
    try {
      const response = await authAPI.signup(userData)
      return response
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return

    try {
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        user.value = response.data
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    apiClient.setToken(null)
  }

  async function initialize() {
    if (token.value) {
      apiClient.setToken(token.value)
      await fetchCurrentUser()
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    fetchCurrentUser,
    logout,
    initialize
  }
})