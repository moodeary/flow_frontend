<template>
  <div class="section">
    <h2 class="section-title">파일 확장자 테스트</h2>
    <p class="section-desc">파일명 또는 확장자를 입력하여 차단 상태를 확인하세요. (.이 없으면 전체를 확장자로 검사)</p>

    <div class="test-input-group">
      <InputField
        v-model="testExtension"
        placeholder="파일명 또는 확장자 입력 (예: document.pdf, exe, script.sh)"
        :maxlength="100"
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
        <p class="result-filename">입력값: {{ testResult.filename }}</p>
        <p class="result-extension">검사한 확장자: {{ testResult.filename.includes('.') ? '.' + testResult.extension : testResult.extension }}</p>
        <p class="result-message">{{ testResult.message }}</p>
      </div>
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

/**
 * 파일명에서 확장자를 추출하는 함수
 * - 마지막 '.' 이후의 문자열을 확장자로 추출
 * - '.'이 없으면 전체 파일명을 확장자로 처리
 * - 빈 문자열이면 빈 문자열 반환
 */
const extractExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  const trimmed = filename.trim()
  if (!trimmed) {
    return ''
  }

  const lastDotIndex = trimmed.lastIndexOf('.')

  // '.'이 없으면 전체 파일명을 확장자로 처리
  if (lastDotIndex === -1) {
    return trimmed.toLowerCase()
  }

  // 마지막이 '.'인 경우 빈 문자열 반환
  if (lastDotIndex === trimmed.length - 1) {
    return ''
  }

  return trimmed.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 입력된 파일명에서 확장자를 추출하여 차단 상태를 확인하는 함수
 * - 입력값 유효성 검증 후 서버에 확장자 체크 요청
 * - 테스트 결과를 화면에 표시하고 이력에 추가
 * - 고정/커스텀 확장자 여부와 차단 상태를 종합적으로 확인
 */
const checkExtension = async () => {
  const input = testExtension.value.trim()

  // 입력값 유효성 검증
  if (!input) {
    testInputError.value = '파일명을 입력해주세요.'
    return
  }

  // 파일명에서 확장자 추출
  const extension = extractExtension(input)

  if (!extension) {
    testInputError.value = '올바른 파일명을 입력해주세요.'
    return
  }

  if (extension.length > 20) {
    testInputError.value = '확장자는 최대 20자까지 가능합니다.'
    return
  }

  // 검사 시작 - 상태 초기화
  testInputError.value = ''
  isChecking.value = true
  testResult.value = null

  try {
    // 서버에 확장자 차단 상태 확인 요청
    const response = await ApiAxios.get(`/api/extensions/check/${extension}`)
    console.log('🔍 [API] 확장자 체크 응답:', response)

    if (response.data.success) {
      // 테스트 결과 객체 생성
      const result = {
        filename: input, // 원본 파일명
        extension,       // 추출된 확장자
        isBlocked: response.data.data, // 차단 여부 (boolean)
        message: response.data.message, // 서버에서 제공하는 메시지
        timestamp: new Date() // 테스트 실행 시간
      }

      testResult.value = result
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

</script>

<style scoped>
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

.result-filename {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: var(--color-foreground);
  font-weight: 500;
}

.result-extension {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: var(--color-foreground-secondary);
  font-family: monospace;
}

.result-message {
  font-size: 16px;
  margin: 0;
  color: var(--color-foreground-secondary);
}


@media (max-width: 768px) {
  .section {
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

}
</style>