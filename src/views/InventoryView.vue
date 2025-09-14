<template>
  <div class="inventory">
    <div class="inventory-header">
      <h1>인벤토리 관리</h1>
      <button @click="showAddModal = true" class="add-btn">
        ➕ 아이템 추가
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="아이템 이름 또는 설명으로 검색..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
      </div>

      <div class="filters">
        <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
          <option value="">모든 카테고리</option>
          <option value="ELECTRONICS">전자제품</option>
          <option value="CLOTHING">의류</option>
          <option value="FURNITURE">가구</option>
          <option value="BOOKS">도서</option>
          <option value="SPORTS">스포츠</option>
          <option value="OTHER">기타</option>
        </select>

        <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
          <option value="">모든 상태</option>
          <option value="EXCELLENT">최상</option>
          <option value="GOOD">양호</option>
          <option value="FAIR">보통</option>
          <option value="POOR">불량</option>
          <option value="BROKEN">고장</option>
        </select>

        <button @click="resetFilters" class="reset-filters-btn">필터 초기화</button>
      </div>
    </div>

    <!-- Results Info -->
    <div class="results-info">
      <p>총 {{ filteredItems.length }}개 아이템 {{ searchQuery ? `(검색: "${searchQuery}")` : '' }}</p>
      <div class="sort-options">
        <select v-model="sortBy" @change="applySorting" class="sort-select">
          <option value="name">이름순</option>
          <option value="createdAt">생성일순</option>
          <option value="quantity">수량순</option>
          <option value="category">카테고리순</option>
        </select>
        <button @click="toggleSortOrder" class="sort-order-btn">
          {{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="inventoryStore.isLoading" class="loading">
      데이터를 불러오는 중...
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0 && !inventoryStore.isLoading" class="empty-state">
      <div v-if="searchQuery || selectedCategory || selectedStatus">
        <h3>검색 결과가 없습니다</h3>
        <p>다른 검색어나 필터를 사용해보세요</p>
        <button @click="resetFilters" class="reset-btn">필터 초기화</button>
      </div>
      <div v-else>
        <h3>아직 등록된 아이템이 없습니다</h3>
        <p>첫 번째 아이템을 추가해보세요</p>
        <button @click="showAddModal = true" class="add-first-item-btn">아이템 추가하기</button>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-else class="items-grid">
      <div
        v-for="item in paginatedItems"
        :key="item.id"
        class="item-card"
        @click="viewItem(item)"
      >
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <div class="item-actions">
            <button @click.stop="editItem(item)" class="btn-edit">✏️</button>
            <button @click.stop="deleteItem(item)" class="btn-delete">🗑️</button>
          </div>
        </div>

        <p class="item-description">{{ item.description || '설명 없음' }}</p>

        <div class="item-meta">
          <span class="item-category">{{ getCategoryName(item.category) }}</span>
          <span class="item-quantity">수량: {{ item.quantity }}</span>
          <span v-if="item.location" class="item-location">📍 {{ item.location }}</span>
        </div>

        <div v-if="item.purchasePrice || item.currentValue" class="item-price">
          <span v-if="item.purchasePrice" class="purchase-price">구매: ₩{{ item.purchasePrice.toLocaleString() }}</span>
          <span v-if="item.currentValue" class="current-value">현재: ₩{{ item.currentValue.toLocaleString() }}</span>
        </div>

        <div class="item-footer">
          <span class="item-status" :class="getStatusClass(item.status)">
            {{ getStatusName(item.status) }}
          </span>
          <span class="item-date">{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage = 1"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        처음
      </button>
      <button
        @click="currentPage -= 1"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        이전
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="['page-number', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="currentPage += 1"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        다음
      </button>
      <button
        @click="currentPage = totalPages"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        마지막
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? '아이템 추가' : '아이템 수정' }}</h2>
          <button @click="closeModals" class="modal-close">✕</button>
        </div>

        <form @submit.prevent="saveItem" class="modal-form">
          <div class="form-group">
            <label for="name">아이템 이름 *</label>
            <input
              id="name"
              v-model="itemForm.name"
              type="text"
              required
              maxlength="100"
              placeholder="아이템 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label for="description">설명</label>
            <textarea
              id="description"
              v-model="itemForm.description"
              rows="3"
              maxlength="500"
              placeholder="아이템 설명을 입력하세요"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">카테고리 *</label>
              <select id="category" v-model="itemForm.category" required>
                <option value="">카테고리 선택</option>
                <option value="ELECTRONICS">전자제품</option>
                <option value="CLOTHING">의류</option>
                <option value="FURNITURE">가구</option>
                <option value="BOOKS">도서</option>
                <option value="SPORTS">스포츠</option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div class="form-group">
              <label for="quantity">수량 *</label>
              <input
                id="quantity"
                v-model.number="itemForm.quantity"
                type="number"
                min="1"
                required
                placeholder="수량"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="status">상태 *</label>
            <select id="status" v-model="itemForm.status" required>
              <option value="">상태 선택</option>
              <option value="EXCELLENT">최상</option>
              <option value="GOOD">양호</option>
              <option value="FAIR">보통</option>
              <option value="POOR">불량</option>
              <option value="BROKEN">고장</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="purchasePrice">구매가격</label>
              <input
                id="purchasePrice"
                v-model.number="itemForm.purchasePrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="구매가격"
              />
            </div>

            <div class="form-group">
              <label for="currentValue">현재가치</label>
              <input
                id="currentValue"
                v-model.number="itemForm.currentValue"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="현재가치"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="location">위치</label>
            <input
              id="location"
              v-model="itemForm.location"
              type="text"
              maxlength="100"
              placeholder="보관 위치"
            />
          </div>

          <div class="form-group">
            <label for="imageUrl">이미지 URL</label>
            <input
              id="imageUrl"
              v-model="itemForm.imageUrl"
              type="url"
              maxlength="255"
              placeholder="이미지 URL (선택사항)"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-cancel">취소</button>
            <button type="submit" :disabled="isSubmitting" class="btn-save">
              {{ isSubmitting ? '저장 중...' : (showAddModal ? '추가' : '수정') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal small" @click.stop>
        <div class="modal-header">
          <h2>삭제 확인</h2>
        </div>
        <div class="modal-body">
          <p>"{{ itemToDelete?.name }}" 아이템을 삭제하시겠습니까?</p>
          <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">취소</button>
          <button @click="confirmDelete" :disabled="isSubmitting" class="btn-delete-confirm">
            {{ isSubmitting ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useModal } from '@/composables/useModal'

const inventoryStore = useInventoryStore()
const { confirm, handleApiSuccess, handleApiError, deleteConfirm } = useModal()

// State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const isSubmitting = ref(false)

// Form
const itemForm = reactive({
  id: null,
  name: '',
  description: '',
  category: '',
  quantity: 1,
  status: '',
  purchasePrice: null,
  currentValue: null,
  location: '',
  imageUrl: ''
})

// Computed
const filteredItems = computed(() => {
  let items = inventoryStore.items

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  // Status filter
  if (selectedStatus.value) {
    items = items.filter(item => item.status === selectedStatus.value)
  }

  // Sort items
  items.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (sortBy.value === 'createdAt') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return items
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }

  return pages
})

// Methods
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
    EXCELLENT: '최상',
    GOOD: '양호',
    FAIR: '보통',
    POOR: '불량',
    BROKEN: '고장'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return {
    'status-excellent': status === 'EXCELLENT',
    'status-good': status === 'GOOD',
    'status-fair': status === 'FAIR',
    'status-poor': status === 'POOR',
    'status-broken': status === 'BROKEN'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  currentPage.value = 1
}

const viewItem = (item) => {
  console.log('View item:', item)
}

const editItem = (item) => {
  itemForm.id = item.id
  itemForm.name = item.name
  itemForm.description = item.description || ''
  itemForm.category = item.category
  itemForm.quantity = item.quantity
  itemForm.status = item.status
  itemForm.purchasePrice = item.purchasePrice || null
  itemForm.currentValue = item.currentValue || null
  itemForm.location = item.location || ''
  itemForm.imageUrl = item.imageUrl || ''
  showEditModal.value = true
}

const deleteItem = async (item) => {
  try {
    await deleteConfirm(item.name)
  } catch {
    return // 사용자가 취소한 경우
  }

  // 삭제 실행
  try {
    await inventoryStore.deleteItem(item.id)
    await handleApiSuccess('아이템이 성공적으로 삭제되었습니다!')
  } catch (error) {
    console.error('Delete item error:', error)
    await handleApiError(error)
  }
}

const resetForm = () => {
  itemForm.id = null
  itemForm.name = ''
  itemForm.description = ''
  itemForm.category = ''
  itemForm.quantity = 1
  itemForm.status = ''
  itemForm.purchasePrice = null
  itemForm.currentValue = null
  itemForm.location = ''
  itemForm.imageUrl = ''
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const saveItem = async () => {
  // 저장 전 확인
  const action = showAddModal.value ? '추가' : '수정'
  try {
    await confirm({
      title: `아이템 ${action} 확인`,
      message: `아이템명: ${itemForm.name}\n카테고리: ${getCategoryName(itemForm.category)}\n\n아이템을 ${action}하시겠습니까?`,
      confirmText: action,
      cancelText: '취소'
    })
  } catch {
    return // 사용자가 취소한 경우
  }

  isSubmitting.value = true
  try {
    const itemData = {
      name: itemForm.name,
      description: itemForm.description || null,
      category: itemForm.category,
      quantity: itemForm.quantity,
      status: itemForm.status,
      purchasePrice: itemForm.purchasePrice || null,
      currentValue: itemForm.currentValue || null,
      location: itemForm.location || null,
      imageUrl: itemForm.imageUrl || null
    }

    if (showAddModal.value) {
      await inventoryStore.createItem(itemData)
      await handleApiSuccess('아이템이 성공적으로 추가되었습니다!')
    } else {
      await inventoryStore.updateItem(itemForm.id, itemData)
      await handleApiSuccess('아이템이 성공적으로 수정되었습니다!')
    }
    closeModals()
  } catch (error) {
    console.error('Save item error:', error)
    await handleApiError(error)
  } finally {
    isSubmitting.value = false
  }
}


// Watch for page changes
watch(filteredItems, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

onMounted(async () => {
  await inventoryStore.fetchItems()
})
</script>

<style scoped>
.inventory {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.inventory-header h1 {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #218838;
}

.search-filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.reset-filters-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-filters-btn:hover {
  background-color: #545b62;
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.sort-order-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px;
}

.empty-state h3 {
  color: #333;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 20px 0;
}

.reset-btn,
.add-first-item-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover,
.add-first-item-btn:hover {
  background-color: #0056b3;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.item-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.item-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  line-height: 1.3;
  flex: 1;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #e9ecef;
}

.btn-delete:hover {
  background-color: #f8d7da;
}

.item-description {
  color: #666;
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
}

.item-category {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  color: #495057;
  font-weight: 500;
}

.item-quantity {
  color: #666;
  font-weight: 500;
}

.item-location {
  color: #666;
  font-size: 11px;
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
}

.item-price {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
}

.purchase-price {
  color: #dc3545;
  font-weight: 500;
}

.current-value {
  color: #28a745;
  font-weight: 500;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-excellent {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-good {
  background-color: #d4edda;
  color: #155724;
}

.status-fair {
  background-color: #fff3cd;
  color: #856404;
}

.status-poor {
  background-color: #f8d7da;
  color: #721c24;
}

.status-broken {
  background-color: #f5c6cb;
  color: #721c24;
}

.item-date {
  color: #999;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
}

.page-btn,
.page-number {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
}

.modal-form {
  padding: 20px;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.warning {
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #545b62;
}

.btn-save {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-confirm {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete-confirm:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .inventory {
    padding: 16px;
  }

  .inventory-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .results-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>