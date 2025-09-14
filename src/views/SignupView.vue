<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-header">
        <h1>회원가입</h1>
        <p>새로운 계정을 만들어 인벤토리 관리를 시작하세요</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="email">이메일 *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="이메일 주소를 입력하세요"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="nickname">닉네임 *</label>
          <input
            id="nickname"
            v-model="form.nickname"
            type="text"
            placeholder="닉네임 (2-10자)"
            required
            :disabled="isLoading"
            maxlength="10"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">비밀번호 *</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="비밀번호"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인 *</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              required
              :disabled="isLoading"
            />
          </div>
        </div>


        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="form.agreeToTerms"
              type="checkbox"
              required
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              <router-link to="/terms" target="_blank">이용약관</router-link> 및
              <router-link to="/privacy" target="_blank">개인정보처리방침</router-link>에 동의합니다 *
            </span>
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="form.agreeToMarketing"
              type="checkbox"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">마케팅 정보 수신에 동의합니다 (선택)</span>
          </label>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          class="signup-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading">계정 생성 중...</span>
          <span v-else>계정 만들기</span>
        </button>
      </form>

      <div class="login-link">
        <p>이미 계정이 있으신가요? <router-link to="/login">로그인</router-link></p>
      </div>

      <div class="divider">
        <span>또는</span>
      </div>

      <div class="social-signup">
        <button type="button" class="social-button google" @click="handleGoogleSignup">
          <span class="social-icon">🔍</span>
          Google로 계속하기
        </button>

        <button type="button" class="social-button apple" @click="handleAppleSignup">
          <span class="social-icon">🍎</span>
          Apple로 계속하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  agreeToMarketing: false
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isFormValid = computed(() => {
  return form.email.trim() &&
         form.nickname.trim() &&
         form.password &&
         form.confirmPassword &&
         form.password === form.confirmPassword &&
         form.agreeToTerms
})

const handleSignup = async () => {
  if (!isFormValid.value) return

  if (form.password !== form.confirmPassword) {
    errorMessage.value = '비밀번호가 일치하지 않습니다'
    return
  }

  if (form.password.length < 8 || form.password.length > 20) {
    errorMessage.value = '비밀번호는 8-20자 사이여야 합니다'
    return
  }

  if (form.nickname.trim().length < 2 || form.nickname.trim().length > 10) {
    errorMessage.value = '닉네임은 2-10자 사이여야 합니다'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const signupData = {
      email: form.email.trim().toLowerCase(),
      nickname: form.nickname.trim(),
      password: form.password
    }

    const response = await authStore.signup(signupData)

    if (response.success) {
      successMessage.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = response.message || '회원가입에 실패했습니다'
    }
  } catch (error) {
    errorMessage.value = error.message || '회원가입에 실패했습니다'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSignup = () => {
  // Google OAuth 연동 구현 예정
  console.log('Google signup clicked')
}

const handleAppleSignup = () => {
  // Apple OAuth 연동 구현 예정
  console.log('Apple signup clicked')
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.signup-container {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.signup-header p {
  color: #666;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
  letter-spacing: -0.2px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"] {
  padding: 14px 16px;
  border: 1.5px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #fafbfc;
}

.form-group input:focus {
  outline: none;
  border-color: #000;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
  gap: 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  width: 100%;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #000;
  border-color: #000;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #fecaca;
}

.success-message {
  background-color: #f0fdf4;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #bbf7d0;
}

.signup-button {
  background-color: #000;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: -0.2px;
}

.signup-button:hover:not(:disabled) {
  background-color: #333;
  transform: translateY(-1px);
}

.signup-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 24px;
}

.login-link p {
  color: #666;
  margin: 0;
  font-size: 15px;
}

.login-link a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.divider {
  text-align: center;
  margin: 32px 0 24px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  color: #9ca3af;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
}

.social-signup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.social-button:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.social-button.google:hover {
  border-color: #ea4335;
}

.social-button.apple:hover {
  border-color: #000;
}

.social-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .signup-page {
    padding: 16px;
  }

  .signup-container {
    padding: 32px 24px;
  }

  .signup-header h1 {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .checkbox-label {
    font-size: 13px;
  }

  .social-signup {
    gap: 10px;
  }

  .social-button {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>