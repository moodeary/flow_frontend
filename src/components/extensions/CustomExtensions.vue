<template>
  <div class="section">
    <h2 class="section-title">커스텀 확장자</h2>
    <p class="section-desc">최대 200개까지 추가할 수 있습니다. (현재: {{ customExtensions.length }}/200)</p>

    <div class="custom-input-group">
      <InputField
        v-model="newCustomExtension"
        placeholder="확장자 입력 (예: sh, php)"
        :maxlength="20"
        :show-counter="true"
        :error-message="customInputError"
        @enter="addCustomExtension"
      />
      <button
        class="add-btn"
        :disabled="!newCustomExtension.trim() || customExtensions.length >= 200 || loading"
        @click="addCustomExtension"
      >
        추가
      </button>
    </div>

    <div v-if="loading" class="loading">커스텀 확장자를 불러오는 중...</div>
    <div v-else-if="customExtensions.length === 0" class="empty">추가된 커스텀 확장자가 없습니다.</div>
    <div v-else class="custom-extensions">
      <div
        v-for="extension in customExtensions"
        :key="extension.id"
        class="custom-extension-tag"
      >
        <span class="tag-text">{{ extension.extension }}</span>
        <button
          class="remove-btn"
          @click="removeCustomExtension(extension.id)"
          :disabled="loading"
        >
          ×
        </button>
      </div>
    </div>

    <ConfirmModal
      v-model="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :variant="confirmModal.variant"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import InputField from '@/components/common/InputField.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ApiAxios from '@/api/ApiAxios'

const customExtensions = ref([])
const newCustomExtension = ref('')
const customInputError = ref('')
const loading = ref(false)

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  variant: 'default',
  onConfirm: () => {}
})

/**
 * 커스텀 확장자 목록을 서버에서 조회하는 함수
 * - 서버의 /api/extensions/custom GET 엔드포인트 호출
 * - 사용자가 직접 추가한 확장자들의 목록 조회
 */
const fetchCustomExtensions = async () => {
  loading.value = true
  try {
    const response = await ApiAxios.get('/api/extensions/custom')
    console.log('🔍 [API] 커스텀확장자 조회 응답:', response)
    if (response.data.success) {
      customExtensions.value = response.data.data
    }
  } catch (error) {
    console.error('커스텀 확장자 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 커스텀 확장자 입력값의 유효성을 검증하는 함수
 * - 빈 값, 길이 제한, 중복 확인 등의 검증 수행
 * - 에러 메시지 반환 또는 빈 문자열(유효함) 반환
 */
const validateCustomExtension = (extension) => {
  if (!extension.trim()) {
    return '확장자를 입력해주세요.'
  }

  if (extension.length > 20) {
    return '확장자는 최대 20자까지 입력 가능합니다.'
  }

  // 커스텀 확장자 중복 확인
  if (customExtensions.value.some(ext => ext.extension === extension.trim())) {
    return '커스텀 확장자에 이미 있는 확장자입니다.'
  }

  return '' // 유효함
}

/**
 * 새로운 커스텀 확장자를 추가하는 함수
 * - 입력값 유효성 검증 후 서버에 POST 요청
 * - 최대 200개 제한 확인
 * - 성공 시 로컬 목록에 추가 및 입력 폼 초기화
 */
const addCustomExtension = async () => {
  const extension = newCustomExtension.value.trim()
  const error = validateCustomExtension(extension)

  if (error) {
    customInputError.value = error
    return
  }

  // 최대 개수 제한 확인
  if (customExtensions.value.length >= 200) {
    customInputError.value = '최대 200개까지만 추가할 수 있습니다.'
    return
  }

  try {
    const response = await ApiAxios.post('/api/extensions/custom', { extension })
    console.log('➕ [API] 커스텀확장자 추가 응답:', response)

    if (response.data.success) {
      // 서버에서 반환된 데이터를 로컬 목록에 추가
      customExtensions.value.push(response.data.data)
      newCustomExtension.value = '' // 입력 폼 초기화
      customInputError.value = ''
    } else {
      customInputError.value = response.data.message || '추가에 실패했습니다.'
    }
  } catch (error) {
    console.error('커스텀 확장자 추가 실패:', error)
    customInputError.value = '추가에 실패했습니다.'
  }
}

/**
 * 커스텀 확장자를 삭제하는 함수
 * - 확인 모달을 표시하여 사용자에게 삭제 의사 확인
 * - 확인 시 서버에 DELETE 요청 후 로컬 목록에서 제거
 */
const removeCustomExtension = (id) => {
  const extension = customExtensions.value.find(ext => ext.id === id)
  if (!extension) return

  // 삭제 확인 모달 표시
  confirmModal.value = {
    show: true,
    title: '확장자 삭제',
    message: `"${extension.extension}" 확장자를 삭제하시겠습니까?`,
    variant: 'danger',
    onConfirm: async () => {
      try {
        const response = await ApiAxios.delete(`/api/extensions/custom/${id}`)
        console.log('🗑️ [API] 커스텀확장자 삭제 응답:', response)

        if (response.data.success) {
          // 서버 삭제 성공 시 로컬 목록에서 제거
          customExtensions.value = customExtensions.value.filter(ext => ext.id !== id)
        }
      } catch (error) {
        console.error('커스텀 확장자 삭제 실패:', error)
      } finally {
        confirmModal.value.show = false
      }
    }
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  fetchCustomExtensions() // 커스텀 확장자 목록 조회
})
</script>

<style scoped>
.section {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-foreground);
  margin: 0 0 4px 0;
}

.section-desc {
  font-size: 10px;
  color: var(--color-foreground-secondary);
  margin: 0 0 12px 0;
}

.loading, .empty {
  text-align: center;
  color: var(--color-foreground-secondary);
  padding: 24px;
  font-style: italic;
}

.custom-input-group {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.add-btn {
  padding: 6px 12px;
  background: linear-gradient(135deg, #6b7280, #9ca3af, #4b5563);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 50px;
  height: 32px;
}

.add-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4b5563, #6b7280, #374151);
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.custom-extensions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 100px;
  overflow-y: auto;
  padding-right: 6px;
}

.custom-extensions::-webkit-scrollbar {
  width: 6px;
}

.custom-extensions::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
  border-radius: 3px;
}

.custom-extensions::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.custom-extensions::-webkit-scrollbar-thumb:hover {
  background: var(--color-foreground-tertiary);
}

.custom-extension-tag {
  display: inline-flex;
  align-items: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 10px;
  color: var(--color-foreground);
}

.tag-text {
  margin-right: 4px;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .custom-input-group {
    flex-direction: column;
  }

  .custom-extensions {
    max-height: 250px;
  }
}
</style>
