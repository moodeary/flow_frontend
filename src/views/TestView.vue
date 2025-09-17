<template>
  <div class="test-container">
    <div class="header">
      <h1 class="title">확장자 차단 테스트</h1>
      <p class="description">파일 확장자가 차단되는지 테스트할 수 있습니다.</p>
    </div>

    <div class="test-section">
      <h2 class="section-title">확장자 테스트</h2>
      <p class="section-desc">확장자를 입력하여 현재 차단 상태를 확인하세요.</p>

      <div class="test-input-group">
        <InputField
          v-model="testExtension"
          placeholder="확장자 입력 (예: exe, sh, pdf)"
          :maxlength="20"
          :error-message="testInputError"
          @enter="checkExtension"
        />
        <button
          class="test-btn"
          :disabled="!testExtension.trim() || isChecking"
          @click="checkExtension"
        >
          {{ isChecking ? '확인 중...' : '테스트' }}
        </button>
      </div>

      <div v-if="testResult" class="test-result" :class="{ 'blocked': testResult.isBlocked, 'allowed': !testResult.isBlocked }">
        <div class="result-icon">
          {{ testResult.isBlocked ? '🚫' : '✅' }}
        </div>
        <div class="result-content">
          <h3 class="result-title">
            {{ testResult.isBlocked ? '차단됨' : '허용됨' }}
          </h3>
          <p class="result-message">{{ testResult.message }}</p>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h2 class="section-title">테스트 이력</h2>
      <p class="section-desc">최근 테스트한 확장자들의 결과입니다.</p>

      <div v-if="testHistory.length === 0" class="empty">테스트 이력이 없습니다.</div>
      <div v-else class="history-list">
        <div
          v-for="(item, index) in testHistory"
          :key="index"
          class="history-item"
          :class="{ 'blocked': item.isBlocked, 'allowed': !item.isBlocked }"
        >
          <div class="history-extension">{{ item.extension }}</div>
          <div class="history-status">
            <span class="status-icon">{{ item.isBlocked ? '🚫' : '✅' }}</span>
            <span class="status-text">{{ item.isBlocked ? '차단됨' : '허용됨' }}</span>
          </div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
      </div>

      <button
        v-if="testHistory.length > 0"
        class="clear-btn"
        @click="clearHistory"
      >
        이력 지우기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputField from '@/components/common/InputField.vue'
import ApiAxios from '@/api/ApiAxios.js'

const testExtension = ref('')
const testInputError = ref('')
const isChecking = ref(false)
const testResult = ref(null)
const testHistory = ref([])

const checkExtension = async () => {
  const extension = testExtension.value.trim()

  if (!extension) {
    testInputError.value = '확장자를 입력해주세요.'
    return
  }

  if (extension.length > 20) {
    testInputError.value = '확장자는 최대 20자까지 입력 가능합니다.'
    return
  }

  testInputError.value = ''
  isChecking.value = true
  testResult.value = null

  try {
    const response = await ApiAxios.get(`/api/extensions/check/${extension}`)

    if (response.data.success) {
      const result = {
        extension,
        isBlocked: response.data.data,
        message: response.data.message,
        timestamp: new Date()
      }

      testResult.value = result

      const existingIndex = testHistory.value.findIndex(item => item.extension === extension)
      if (existingIndex !== -1) {
        testHistory.value.splice(existingIndex, 1)
      }

      testHistory.value.unshift(result)

      if (testHistory.value.length > 10) {
        testHistory.value = testHistory.value.slice(0, 10)
      }
    } else {
      testInputError.value = response.data.message || '테스트에 실패했습니다.'
    }
  } catch (error) {
    console.error('확장자 테스트 실패:', error)
    testInputError.value = '테스트에 실패했습니다. 서버를 확인해주세요.'
  } finally {
    isChecking.value = false
  }
}

const clearHistory = () => {
  testHistory.value = []
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(timestamp)
}
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #374151, #6b7280, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.description {
  font-size: 18px;
  color: var(--color-foreground-secondary);
  margin: 0;
}

.test-section, .history-section {
  background: var(--color-background-secondary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-foreground);
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 14px;
  color: var(--color-foreground-secondary);
  margin: 0 0 24px 0;
}

.test-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.test-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6b7280, #9ca3af, #4b5563);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 100px;
}

.test-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4b5563, #6b7280, #374151);
  transform: translateY(-1px);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.test-result.blocked {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
}

.test-result.allowed {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
}

.result-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.test-result.blocked .result-title {
  color: #dc2626;
}

.test-result.allowed .result-title {
  color: #16a34a;
}

.result-message {
  font-size: 16px;
  margin: 0;
  color: var(--color-foreground-secondary);
}

.empty {
  text-align: center;
  color: var(--color-foreground-secondary);
  padding: 24px;
  font-style: italic;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.history-item.blocked {
  border-left: 4px solid #dc2626;
}

.history-item.allowed {
  border-left: 4px solid #16a34a;
}

.history-extension {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-foreground);
}

.history-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 16px;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.history-item.blocked .status-text {
  color: #dc2626;
}

.history-item.allowed .status-text {
  color: #16a34a;
}

.history-time {
  font-size: 12px;
  color: var(--color-foreground-tertiary);
}

.clear-btn {
  padding: 8px 16px;
  background: var(--color-background);
  color: var(--color-foreground-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--color-background-tertiary);
  color: var(--color-foreground);
}

@media (max-width: 768px) {
  .test-container {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .test-section, .history-section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .test-input-group {
    flex-direction: column;
  }

  .test-result {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .history-status {
    order: -1;
    align-self: flex-end;
  }
}
</style>