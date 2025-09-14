<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>대시보드</h1>
      <p>인벤토리 현황을 한눈에 확인하세요</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>전체 아이템</h3>
          <p class="stat-number">{{ stats.totalItems || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>사용 가능</h3>
          <p class="stat-number">{{ stats.availableItems || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <h3>부족한 아이템</h3>
          <p class="stat-number">{{ stats.lowStockItems || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>카테고리</h3>
          <p class="stat-number">{{ stats.categories || 0 }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-items">
        <div class="section-header">
          <h2>최근 추가된 아이템</h2>
          <router-link to="/inventory" class="view-all-link">전체 보기</router-link>
        </div>

        <div v-if="inventoryStore.isLoading" class="loading">
          데이터를 불러오는 중...
        </div>

        <div v-else-if="recentItems.length === 0" class="empty-state">
          <p>아직 등록된 아이템이 없습니다.</p>
          <router-link to="/inventory" class="add-item-btn">첫 아이템 추가하기</router-link>
        </div>

        <div v-else class="items-list">
          <div v-for="item in recentItems" :key="item.id" class="item-card">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-description">{{ item.description || '설명 없음' }}</p>
              <div class="item-meta">
                <span class="item-category">{{ getCategoryName(item.category) }}</span>
                <span class="item-quantity">수량: {{ item.quantity }}</span>
                <span class="item-status" :class="getStatusClass(item.status)">
                  {{ getStatusName(item.status) }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="viewItem(item.id)" class="btn-secondary">보기</button>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>빠른 작업</h2>
        <div class="actions-grid">
          <router-link to="/inventory" class="action-card">
            <div class="action-icon">📋</div>
            <h3>인벤토리 관리</h3>
            <p>아이템 검색, 추가, 수정</p>
          </router-link>

          <button @click="showAddItemModal" class="action-card">
            <div class="action-icon">➕</div>
            <h3>아이템 추가</h3>
            <p>새로운 아이템 등록</p>
          </button>

          <button @click="exportData" class="action-card">
            <div class="action-icon">💾</div>
            <h3>데이터 내보내기</h3>
            <p>CSV 파일로 내보내기</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'

const router = useRouter()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const stats = ref({
  totalItems: 0,
  availableItems: 0,
  lowStockItems: 0,
  categories: 0
})

const recentItems = computed(() => {
  return inventoryStore.items.slice(0, 5)
})

const getCategoryName = (category) => {
  const categoryMap = {
    ELECTRONICS: '전자제품',
    CLOTHING: '의류',
    FURNITURE: '가구',
    BOOKS: '도서',
    SPORTS: '스포츠',
    OTHER: '기타'
  }
  return categoryMap[category] || category
}

const getStatusName = (status) => {
  const statusMap = {
    AVAILABLE: '사용가능',
    OUT_OF_STOCK: '품절',
    RESERVED: '예약됨',
    DAMAGED: '손상'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return {
    'status-available': status === 'AVAILABLE',
    'status-out-of-stock': status === 'OUT_OF_STOCK',
    'status-reserved': status === 'RESERVED',
    'status-damaged': status === 'DAMAGED'
  }
}

const calculateStats = () => {
  const items = inventoryStore.items
  stats.value.totalItems = items.length
  stats.value.availableItems = items.filter(item => item.status === 'AVAILABLE').length
  stats.value.lowStockItems = items.filter(item => item.quantity < 10).length
  stats.value.categories = new Set(items.map(item => item.category)).size
}

const viewItem = (itemId) => {
  router.push(`/inventory/${itemId}`)
}

const showAddItemModal = () => {
  router.push('/inventory?action=add')
}

const exportData = () => {
  const csvContent = generateCSV(inventoryStore.items)
  downloadCSV(csvContent, 'inventory.csv')
}

const generateCSV = (items) => {
  const headers = ['이름', '설명', '카테고리', '수량', '상태', '생성일']
  const rows = items.map(item => [
    item.name,
    item.description || '',
    getCategoryName(item.category),
    item.quantity,
    getStatusName(item.status),
    new Date(item.createdAt).toLocaleDateString('ko-KR')
  ])

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  try {
    await inventoryStore.fetchItems()
    calculateStats()
  } catch (error) {
    console.error('Dashboard data loading error:', error)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #333;
}

.dashboard-header p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 50%;
}

.stat-content h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.recent-items,
.quick-actions {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  margin: 0;
  color: #333;
}

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state p {
  color: #666;
  margin: 0 0 16px 0;
}

.add-item-btn {
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  transition: background-color 0.2s;
}

.add-item-btn:hover {
  background-color: #0056b3;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}

.item-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.item-category {
  background-color: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
  color: #495057;
}

.item-quantity {
  color: #666;
}

.item-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-available {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-out-of-stock {
  background-color: #f8d7da;
  color: #721c24;
}

.status-reserved {
  background-color: #fff3cd;
  color: #856404;
}

.status-damaged {
  background-color: #f5c6cb;
  color: #721c24;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.quick-actions h2 {
  font-size: 20px;
  margin: 0 0 20px 0;
  color: #333;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all 0.2s;
  background: none;
  text-align: left;
  cursor: pointer;
}

.action-card:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}

.action-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .item-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>