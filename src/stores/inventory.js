import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { inventoryAPI } from '@/api/inventory.js'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref([])
  const currentItem = ref(null)
  const isLoading = ref(false)
  const pagination = ref({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })

  const totalItems = computed(() => pagination.value.totalElements)

  async function fetchItems(searchParams = {}) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.getItems(searchParams)

      if (response.success) {
        items.value = response.data.content || []
        pagination.value = {
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0
        }
      }
      return response
    } catch (error) {
      console.error('Fetch items error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItem(itemId) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.getItem(itemId)

      if (response.success) {
        currentItem.value = response.data
      }
      return response
    } catch (error) {
      console.error('Fetch item error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(itemData) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.createItem(itemData)

      if (response.success) {
        await fetchItems()
      }
      return response
    } catch (error) {
      console.error('Create item error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(itemId, itemData) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.updateItem(itemId, itemData)

      if (response.success) {
        await fetchItems()
        if (currentItem.value && currentItem.value.id === itemId) {
          currentItem.value = response.data
        }
      }
      return response
    } catch (error) {
      console.error('Update item error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(itemId) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.deleteItem(itemId)

      if (response.success) {
        await fetchItems()
        if (currentItem.value && currentItem.value.id === itemId) {
          currentItem.value = null
        }
      }
      return response
    } catch (error) {
      console.error('Delete item error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItemsByCategory(category) {
    isLoading.value = true
    try {
      const response = await inventoryAPI.getItemsByCategory(category)

      if (response.success) {
        items.value = response.data
      }
      return response
    } catch (error) {
      console.error('Fetch items by category error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    currentItem,
    isLoading,
    pagination,
    totalItems,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    fetchItemsByCategory
  }
})