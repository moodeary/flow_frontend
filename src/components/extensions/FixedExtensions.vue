<template>
  <div class="section">
    <h2 class="section-title">고정 확장자</h2>
    <p class="section-desc">자주 차단하는 확장자 목록입니다. 최대 9개까지 추가할 수 있습니다. (현재: {{ fixedExtensions.length }}/9)</p>

    <div class="fixed-input-group">
      <InputField
        v-model="newFixedExtension"
        placeholder="고정 확장자 입력 (예: exe, bat)"
        :maxlength="20"
        :show-counter="true"
        :error-message="fixedInputError"
        @enter="addFixedExtension"
      />
      <button
        class="add-btn"
        :disabled="!newFixedExtension.trim() || fixedExtensions.length >= 9 || loading"
        @click="addFixedExtension"
      >
        추가
      </button>
    </div>

    <div v-if="loading" class="loading">고정 확장자를 불러오는 중...</div>
    <div v-else-if="fixedExtensions.length === 0" class="empty">고정 확장자가 없습니다.</div>
    <div v-else class="fixed-extensions">
      <div
        v-for="extension in fixedExtensions"
        :key="extension.id"
        class="fixed-extension-item"
      >
        <div class="extension-content">
          <ToggleButton
            :model-value="extension.isBlocked"
            :label="extension.extension"
            @update:model-value="updateFixedExtension(extension.extension, $event)"
          />
          <button
            class="remove-fixed-btn"
            @click="removeFixedExtension(extension.id)"
            :disabled="loading"
            title="고정 확장자 삭제"
          >
            ×
          </button>
        </div>
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
import ToggleButton from '@/components/common/ToggleButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ApiAxios from '@/api/ApiAxios'

const fixedExtensions = ref([])
const newFixedExtension = ref('')
const fixedInputError = ref('')
const loading = ref(false)

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  variant: 'default',
  onConfirm: () => {}
})

/**
 * 고정 확장자 목록을 서버에서 조회하는 함수
 * - 서버의 /api/extensions/fixed GET 엔드포인트 호출
 * - blocked 값을 isBlocked로 매핑
 * - 로딩 상태 관리 및 에러 처리 포함
 */
const fetchFixedExtensions = async () => {
  loading.value = true
  try {
    const response = await ApiAxios.get('/api/extensions/fixed')
    console.log('🔍 [API] 고정확장자 조회 응답:', response)
    if (response.data.success) {
      console.log('고정확장자 원본 데이터:', response.data.data)
      // 서버에서 blocked 필드로 받아서 isBlocked로 매핑
      fixedExtensions.value = response.data.data.map(ext => {
        console.log('확장자:', ext.extension, 'blocked:', ext.blocked)
        return {
          ...ext,
          isBlocked: ext.blocked ?? false // blocked 필드를 isBlocked로 매핑
        }
      })
      console.log('처리된 고정확장자 데이터:', fixedExtensions.value)
    }
  } catch (error) {
    console.error('고정 확장자 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 고정 확장자의 차단 상태를 토글하는 함수
 * - 서버의 /api/extensions/fixed/{extension} PUT 엔드포인트 호출 (isBlocked 파라미터)
 * - 토글 버튼 클릭 시 호출되어 차단/허용 상태 변경
 * - 실패 시 데이터를 다시 불러와 동기화 보장
 */
const updateFixedExtension = async (extension, isBlocked) => {
  try {
    const response = await ApiAxios.put(`/api/extensions/fixed/${extension}`, null, {
      params: { isBlocked }
    })
    console.log('🔄 [API] 고정확장자 토글 응답:', response)
    if (response.data.success) {
      // 로컬 상태 업데이트
      const index = fixedExtensions.value.findIndex(ext => ext.extension === extension)
      if (index !== -1) {
        fixedExtensions.value[index].isBlocked = isBlocked
      }
    }
  } catch (error) {
    console.error('고정 확장자 업데이트 실패:', error)
    // 실패 시 서버 데이터로 다시 동기화
    fetchFixedExtensions()
  }
}

/**
 * 고정 확장자 입력값의 유효성을 검증하는 함수
 * - 빈 값, 길이 제한, 중복 확인 등의 검증 수행
 * - 에러 메시지 반환 또는 빈 문자열(유효함) 반환
 */
const validateFixedExtension = (extension) => {
  if (!extension.trim()) {
    return '확장자를 입력해주세요.'
  }

  if (extension.length > 20) {
    return '확장자는 최대 20자까지 입력 가능합니다.'
  }

  // 고정 확장자 중복 확인
  if (fixedExtensions.value.some(ext => ext.extension === extension.trim())) {
    return '고정 확장자에 이미 있는 확장자입니다.'
  }

  return '' // 유효함
}

/**
 * 새로운 고정 확장자를 추가하는 함수
 * - 입력값 유효성 검증 후 서버에 POST 요청
 * - 최대 10개 제한 확인
 * - 성공 시 로컬 목록에 추가 및 입력 폼 초기화
 */
const addFixedExtension = async () => {
  const extension = newFixedExtension.value.trim()
  const error = validateFixedExtension(extension)

  if (error) {
    fixedInputError.value = error
    return
  }

  // 최대 개수 제한 확인
  if (fixedExtensions.value.length >= 9) {
    fixedInputError.value = '최대 9개까지만 추가할 수 있습니다.'
    return
  }

  try {
    const response = await ApiAxios.post('/api/extensions/fixed', { extension })
    console.log('➕ [API] 고정확장자 추가 응답:', response)

    if (response.data.success) {
      // 서버에서 반환된 데이터를 로컬 목록에 추가 (서버는 isBlocked 필드로 응답)
      const newExtension = {
        ...response.data.data,
        isBlocked: response.data.data.isBlocked ?? false // POST 응답은 isBlocked 필드
      }
      fixedExtensions.value.push(newExtension)
      newFixedExtension.value = '' // 입력 폼 초기화
      fixedInputError.value = ''
    } else {
      fixedInputError.value = response.data.message || '추가에 실패했습니다.'
    }
  } catch (error) {
    console.error('고정 확장자 추가 실패:', error)
    fixedInputError.value = '추가에 실패했습니다.'
  }
}

/**
 * 고정 확장자를 삭제하는 함수
 * - 확인 모달을 표시하여 사용자에게 삭제 의사 확인
 * - 확인 시 서버에 DELETE 요청 후 로컬 목록에서 제거
 */
const removeFixedExtension = (id) => {
  const extension = fixedExtensions.value.find(ext => ext.id === id)
  if (!extension) return

  // 삭제 확인 모달 표시
  confirmModal.value = {
    show: true,
    title: '고정 확장자 삭제',
    message: `"${extension.extension}" 고정 확장자를 삭제하시겠습니까?`,
    variant: 'danger',
    onConfirm: async () => {
      try {
        const response = await ApiAxios.delete(`/api/extensions/fixed/${id}`)
        console.log('🗑️ [API] 고정확장자 삭제 응답:', response)

        if (response.data.success) {
          // 서버 삭제 성공 시 로컬 목록에서 제거
          fixedExtensions.value = fixedExtensions.value.filter(ext => ext.id !== id)
        }
      } catch (error) {
        console.error('고정 확장자 삭제 실패:', error)
      } finally {
        confirmModal.value.show = false
      }
    }
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  fetchFixedExtensions() // 고정 확장자 목록 조회
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

.fixed-input-group {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.add-btn {
  height: 32px;
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

.fixed-extensions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 6px;
}

.fixed-extensions::-webkit-scrollbar {
  width: 6px;
}

.fixed-extensions::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
  border-radius: 3px;
}

.fixed-extensions::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.fixed-extensions::-webkit-scrollbar-thumb:hover {
  background: var(--color-foreground-tertiary);
}

.fixed-extension-item {
  padding: 8px;
  background: var(--color-background);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.extension-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remove-fixed-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  margin-left: 6px;
  flex-shrink: 0;
}

.remove-fixed-btn:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

.remove-fixed-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .fixed-input-group {
    flex-direction: column;
  }

  .fixed-extensions {
    grid-template-columns: repeat(3, 1fr);
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .fixed-extensions {
    grid-template-columns: 1fr;
  }
}
</style>
