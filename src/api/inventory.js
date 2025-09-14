import apiClient from '@/api/client.js'

export const inventoryAPI = {
  async getItems(searchParams = {}) {
    const params = new URLSearchParams(searchParams).toString()
    const endpoint = params ? `/api/inventory?${params}` : '/api/inventory'
    return await apiClient.get(endpoint)
  },

  async getItem(itemId) {
    return await apiClient.get(`/api/inventory/${itemId}`)
  },

  async createItem(itemData) {
    return await apiClient.post('/api/inventory', itemData)
  },

  async updateItem(itemId, itemData) {
    return await apiClient.put(`/api/inventory/${itemId}`, itemData)
  },

  async deleteItem(itemId) {
    return await apiClient.delete(`/api/inventory/${itemId}`)
  },

  async getItemsByCategory(category) {
    return await apiClient.get(`/api/inventory/category/${category}`)
  },

  async getItemCount() {
    return await apiClient.get('/api/inventory/count')
  }
}