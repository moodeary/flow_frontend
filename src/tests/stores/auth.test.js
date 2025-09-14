import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const authStore = useAuthStore()

    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeFalsy() // localStorage에서 null을 반환하면 undefined가 될 수 있음
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.isLoading).toBe(false)
  })

  it('should set authenticated state when token exists', () => {
    const authStore = useAuthStore()

    authStore.token = 'test-token'

    expect(authStore.token).toBe('test-token')
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('should clear user and token on logout', () => {
    const authStore = useAuthStore()

    authStore.user = { id: 1, username: 'test' }
    authStore.token = 'test-token'

    authStore.logout()

    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })
})