import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInventoryStore } from '@/stores/inventory'

describe('Inventory Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const inventoryStore = useInventoryStore()

    expect(inventoryStore.items).toEqual([])
    expect(inventoryStore.currentItem).toBeNull()
    expect(inventoryStore.isLoading).toBe(false)
    expect(inventoryStore.pagination.page).toBe(0)
    expect(inventoryStore.totalItems).toBe(0)
  })

  it('should set items directly', () => {
    const inventoryStore = useInventoryStore()
    const testItems = [
      { id: 1, name: 'Item 1', quantity: 10, price: 5.99 },
      { id: 2, name: 'Item 2', quantity: 5, price: 10.99 }
    ]

    inventoryStore.items = testItems

    expect(inventoryStore.items).toEqual(testItems)
    expect(inventoryStore.items.length).toBe(2)
  })

  it('should set loading state', () => {
    const inventoryStore = useInventoryStore()

    inventoryStore.isLoading = true
    expect(inventoryStore.isLoading).toBe(true)

    inventoryStore.isLoading = false
    expect(inventoryStore.isLoading).toBe(false)
  })

  it('should set current item', () => {
    const inventoryStore = useInventoryStore()
    const testItem = { id: 1, name: 'Test Item', quantity: 5, price: 9.99 }

    inventoryStore.currentItem = testItem

    expect(inventoryStore.currentItem).toEqual(testItem)
  })
})