import { describe, it, expect, vi } from 'vitest'
import { inventoryAPI } from '@/api/inventory'

// API client 모킹
vi.mock('@/api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Inventory API', () => {
  it('should have getItems method', () => {
    expect(typeof inventoryAPI.getItems).toBe('function')
  })

  it('should have getItem method', () => {
    expect(typeof inventoryAPI.getItem).toBe('function')
  })

  it('should have createItem method', () => {
    expect(typeof inventoryAPI.createItem).toBe('function')
  })

  it('should have updateItem method', () => {
    expect(typeof inventoryAPI.updateItem).toBe('function')
  })

  it('should have deleteItem method', () => {
    expect(typeof inventoryAPI.deleteItem).toBe('function')
  })
})