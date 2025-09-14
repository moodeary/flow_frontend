import { describe, it, expect, vi } from 'vitest'
import { authAPI } from '@/api/auth'

// API client 모킹
vi.mock('@/api/client.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

describe('Auth API', () => {
  it('should have login method', () => {
    expect(typeof authAPI.login).toBe('function')
  })

  it('should have signup method', () => {
    expect(typeof authAPI.signup).toBe('function')
  })

  it('should have getCurrentUser method', () => {
    expect(typeof authAPI.getCurrentUser).toBe('function')
  })
})