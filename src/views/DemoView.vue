<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1 class="demo-title">Component Demo</h1>
      <p class="demo-description">
        애플 스타일의 공통 컴포넌트 데모입니다.
      </p>
    </div>

    <div class="demo-content">
      <section class="demo-section">
        <h2 class="section-title">Input Field</h2>
        <div class="component-grid">
          <div class="component-item">
            <h3>기본 입력</h3>
            <InputField
              v-model="inputValue"
              label="이름"
              placeholder="이름을 입력하세요"
              hint="실명을 입력해주세요"
            />
          </div>

          <div class="component-item">
            <h3>비밀번호</h3>
            <InputField
              v-model="passwordValue"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div class="component-item">
            <h3>검색 입력</h3>
            <InputField
              v-model="searchValue"
              type="search"
              placeholder="검색어를 입력하세요"
              clearable
              size="lg"
            />
          </div>

          <div class="component-item">
            <h3>텍스트 영역</h3>
            <InputField
              v-model="textareaValue"
              type="textarea"
              label="설명"
              placeholder="설명을 입력하세요"
              :maxlength="200"
              show-counter
            />
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Toggle Button</h2>
        <div class="component-grid">
          <div class="component-item">
            <h3>기본 토글</h3>
            <ToggleButton
              v-model="toggleValue1"
              label="알림 받기"
              description="새로운 메시지가 올 때 알림을 받습니다"
            />
          </div>

          <div class="component-item">
            <h3>성공 컬러</h3>
            <ToggleButton
              v-model="toggleValue2"
              color="success"
              label="자동 저장"
              show-icons
            />
          </div>

          <div class="component-item">
            <h3>경고 컬러</h3>
            <ToggleButton
              v-model="toggleValue3"
              color="warning"
              size="lg"
              label="위험한 작업 허용"
            />
          </div>

          <div class="component-item">
            <h3>로딩 상태</h3>
            <ToggleButton
              v-model="toggleValue4"
              :loading="isLoading"
              label="로딩 테스트"
              @change="handleToggleChange"
            />
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Confirm Modal</h2>
        <div class="component-grid">
          <div class="component-item">
            <h3>기본 확인 모달</h3>
            <button @click="showBasicModal = true" class="demo-button">
              기본 모달 열기
            </button>
          </div>

          <div class="component-item">
            <h3>위험한 작업 모달</h3>
            <button @click="showDangerModal = true" class="demo-button danger">
              삭제 모달 열기
            </button>
          </div>

          <div class="component-item">
            <h3>성공 모달</h3>
            <button @click="showSuccessModal = true" class="demo-button success">
              성공 모달 열기
            </button>
          </div>

          <div class="component-item">
            <h3>로딩 모달</h3>
            <button @click="showLoadingModal = true" class="demo-button">
              로딩 모달 열기
            </button>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">API Integration Demo</h2>
        <div class="component-grid">
          <div class="component-item">
            <h3>사용자 정보</h3>
            <div class="api-demo">
              <p><strong>로그인 상태:</strong> {{ authStore.isAuthenticated ? '로그인됨' : '로그아웃됨' }}</p>
              <p v-if="authStore.user"><strong>사용자:</strong> {{ authStore.user.email }}</p>
              <button @click="handleAuthTest" class="demo-button" :disabled="authStore.isLoading">
                {{ authStore.isLoading ? '처리중...' : '인증 테스트' }}
              </button>
            </div>
          </div>

          <div class="component-item">
            <h3>인벤토리 데이터</h3>
            <div class="api-demo">
              <p><strong>아이템 수:</strong> {{ inventoryStore.totalItems }}</p>
              <p><strong>로딩 상태:</strong> {{ inventoryStore.isLoading ? '로딩중' : '완료' }}</p>
              <button @click="handleInventoryTest" class="demo-button" :disabled="inventoryStore.isLoading">
                {{ inventoryStore.isLoading ? '처리중...' : '인벤토리 조회' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <ConfirmModal
      v-model="showBasicModal"
      title="확인"
      message="정말로 이 작업을 계속하시겠습니까?"
      @confirm="handleBasicConfirm"
    />

    <ConfirmModal
      v-model="showDangerModal"
      title="삭제 확인"
      message="이 항목을 삭제하면 복구할 수 없습니다. 정말로 삭제하시겠습니까?"
      variant="danger"
      confirm-text="삭제"
      @confirm="handleDangerConfirm"
    />

    <ConfirmModal
      v-model="showSuccessModal"
      title="성공!"
      message="작업이 성공적으로 완료되었습니다."
      variant="success"
      confirm-text="확인"
      hide-cancel
      @confirm="showSuccessModal = false"
    />

    <ConfirmModal
      v-model="showLoadingModal"
      title="처리중"
      message="작업을 처리하고 있습니다. 잠시만 기다려주세요."
      confirm-text="확인"
      :is-loading="modalLoading"
      @confirm="handleLoadingConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { InputField, ToggleButton, ConfirmModal } from '@/components/common'

const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

// Input field values
const inputValue = ref('')
const passwordValue = ref('')
const searchValue = ref('')
const textareaValue = ref('')

// Toggle values
const toggleValue1 = ref(false)
const toggleValue2 = ref(true)
const toggleValue3 = ref(false)
const toggleValue4 = ref(false)
const isLoading = ref(false)

// Modal states
const showBasicModal = ref(false)
const showDangerModal = ref(false)
const showSuccessModal = ref(false)
const showLoadingModal = ref(false)
const modalLoading = ref(false)

const handleToggleChange = (value) => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    console.log('Toggle changed to:', value)
  }, 2000)
}

const handleBasicConfirm = () => {
  console.log('Basic modal confirmed')
  showBasicModal.value = false
}

const handleDangerConfirm = () => {
  console.log('Danger modal confirmed - Item deleted')
  showDangerModal.value = false
}

const handleLoadingConfirm = () => {
  modalLoading.value = true
  setTimeout(() => {
    modalLoading.value = false
    showLoadingModal.value = false
    console.log('Loading modal completed')
  }, 3000)
}

const handleAuthTest = async () => {
  try {
    if (authStore.isAuthenticated) {
      await authStore.fetchCurrentUser()
    } else {
      // Demo login
      await authStore.login({
        email: 'demo@example.com',
        password: 'password'
      })
    }
  } catch (error) {
    console.error('Auth test error:', error)
  }
}

const handleInventoryTest = async () => {
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Inventory test error:', error)
  }
}

onMounted(async () => {
  await authStore.initialize()
})
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.demo-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-foreground);
  margin: 0 0 var(--spacing-md) 0;
}

.demo-description {
  font-size: var(--font-size-lg);
  color: var(--color-foreground-secondary);
  margin: 0;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.demo-section {
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-foreground);
  margin: 0 0 var(--spacing-lg) 0;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.component-item {
  background-color: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
}

.component-item h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-foreground);
  margin: 0 0 var(--spacing-md) 0;
}

.demo-button {
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.demo-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.demo-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-button.danger {
  background-color: var(--color-error);
}

.demo-button.danger:hover:not(:disabled) {
  background-color: #e63946;
}

.demo-button.success {
  background-color: var(--color-success);
}

.demo-button.success:hover:not(:disabled) {
  background-color: #28a745;
}

.api-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.api-demo p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-foreground-secondary);
}
</style>