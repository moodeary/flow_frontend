<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">파일 확장자 차단 관리</h1>
      <p class="description">차단할 파일 확장자를 관리할 수 있습니다.</p>
    </div>

    <div class="section">
      <h2 class="section-title">고정 확장자</h2>
      <p class="section-desc">자주 차단하는 확장자 목록입니다. 기본값은 체크해제 상태입니다.</p>

      <div v-if="loading.fixed" class="loading">고정 확장자를 불러오는 중...</div>
      <div v-else-if="fixedExtensions.length === 0" class="empty">고정 확장자가 없습니다.</div>
      <div v-else class="fixed-extensions">
        <div
          v-for="extension in fixedExtensions"
          :key="extension.id"
          class="fixed-extension-item"
        >
          <ToggleButton
            :model-value="extension.isBlocked"
            :label="extension.extension"
            :description="extension.description"
            @update:model-value="updateFixedExtension(extension.extension, $event)"
          />
        </div>
      </div>
    </div>

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
          :disabled="!newCustomExtension.trim() || customExtensions.length >= 200 || loading.custom"
          @click="addCustomExtension"
        >
          추가
        </button>
      </div>

      <div v-if="loading.custom" class="loading">커스텀 확장자를 불러오는 중...</div>
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
            :disabled="loading.custom"
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
const customExtensions = ref([])
const newCustomExtension = ref('')
const customInputError = ref('')

const loading = ref({
  fixed: false,
  custom: false
})

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  variant: 'default',
  onConfirm: () => {}
})

const fetchFixedExtensions = async () => {
  loading.value.fixed = true
  try {
    const response = await ApiAxios.get('/api/extensions/fixed')
    if (response.data.success) {
      fixedExtensions.value = response.data.data
    }
  } catch (error) {
    console.error('고정 확장자 조회 실패:', error)
  } finally {
    loading.value.fixed = false
  }
}

const fetchCustomExtensions = async () => {
  loading.value.custom = true
  try {
    const response = await ApiAxios.get('/api/extensions/custom')
    if (response.data.success) {
      customExtensions.value = response.data.data
    }
  } catch (error) {
    console.error('커스텀 확장자 조회 실패:', error)
  } finally {
    loading.value.custom = false
  }
}

const updateFixedExtension = async (extension, isBlocked) => {
  try {
    const response = await ApiAxios.put(`/api/extensions/fixed/${extension}`, null, {
      params: { isBlocked }
    })
    if (response.data.success) {
      const index = fixedExtensions.value.findIndex(ext => ext.extension === extension)
      if (index !== -1) {
        fixedExtensions.value[index].isBlocked = isBlocked
      }
    }
  } catch (error) {
    console.error('고정 확장자 업데이트 실패:', error)
    fetchFixedExtensions()
  }
}

const validateCustomExtension = (extension) => {
  if (!extension.trim()) {
    return '확장자를 입력해주세요.'
  }

  if (extension.length > 20) {
    return '확장자는 최대 20자까지 입력 가능합니다.'
  }

  if (customExtensions.value.some(ext => ext.extension === extension.trim())) {
    return '이미 추가된 확장자입니다.'
  }

  if (fixedExtensions.value.some(ext => ext.extension === extension.trim())) {
    return '고정 확장자에 이미 있는 확장자입니다.'
  }

  return ''
}

const addCustomExtension = async () => {
  const extension = newCustomExtension.value.trim()
  const error = validateCustomExtension(extension)

  if (error) {
    customInputError.value = error
    return
  }

  if (customExtensions.value.length >= 200) {
    customInputError.value = '최대 200개까지만 추가할 수 있습니다.'
    return
  }

  try {
    const response = await ApiAxios.post('/api/extensions/custom', { extension })

    if (response.data.success) {
      customExtensions.value.push(response.data.data)
      newCustomExtension.value = ''
      customInputError.value = ''
    } else {
      customInputError.value = response.data.message || '추가에 실패했습니다.'
    }
  } catch (error) {
    console.error('커스텀 확장자 추가 실패:', error)
    customInputError.value = '추가에 실패했습니다.'
  }
}

const removeCustomExtension = (id) => {
  const extension = customExtensions.value.find(ext => ext.id === id)
  if (!extension) return

  confirmModal.value = {
    show: true,
    title: '확장자 삭제',
    message: `"${extension.extension}" 확장자를 삭제하시겠습니까?`,
    variant: 'danger',
    onConfirm: async () => {
      try {
        const response = await ApiAxios.delete(`/api/extensions/custom/${id}`)

        if (response.data.success) {
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

onMounted(() => {
  fetchFixedExtensions()
  fetchCustomExtensions()
})
</script>

<style scoped>
.home-container {
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

.section {
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

.loading, .empty {
  text-align: center;
  color: var(--color-foreground-secondary);
  padding: 24px;
  font-style: italic;
}

.fixed-extensions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.fixed-extension-item {
  padding: 16px;
  background: var(--color-background);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.custom-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6b7280, #9ca3af, #4b5563);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 80px;
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
  gap: 12px;
}

.custom-extension-tag {
  display: inline-flex;
  align-items: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-foreground);
}

.tag-text {
  margin-right: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  width: 20px;
  height: 20px;
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
  .home-container {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .custom-input-group {
    flex-direction: column;
  }

  .fixed-extensions {
    grid-template-columns: 1fr;
  }
}
</style>
