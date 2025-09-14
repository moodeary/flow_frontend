<template>
  <Teleport to="body">
    <Transition name="modal-backdrop" appear>
      <div
        v-if="modelValue"
        class="modal-backdrop"
        @click="handleBackdropClick"
      >
        <Transition name="modal" appear>
          <div
            v-if="modelValue"
            class="modal-container"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="messageId"
          >
            <div class="modal-content">
              <h3 :id="titleId" class="modal-title">
                {{ title }}
              </h3>

              <p :id="messageId" class="modal-message">
                {{ message }}
              </p>

              <div class="modal-actions">
                <button
                  v-if="!hideCancel"
                  type="button"
                  class="btn btn-cancel"
                  @click="handleCancel"
                  :disabled="isLoading"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  class="btn btn-confirm"
                  :class="{ 'btn-danger': variant === 'danger' }"
                  @click="handleConfirm"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="loading-spinner"></span>
                  <span v-else>{{ confirmText }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '확인'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  hideCancel: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger', 'success'].includes(value)
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`)
const messageId = ref(`modal-message-${Math.random().toString(36).substr(2, 9)}`)


const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleCancel()
  }
}

// Close modal on Escape key
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }
})
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Modal Container - 메인 타이틀과 같은 그라데이션 스타일 */
.modal-container {
  background: linear-gradient(
    135deg,
    rgba(55, 65, 81, 0.95) 0%,
    rgba(75, 85, 99, 0.95) 50%,
    rgba(31, 41, 55, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

/* Content */
.modal-content {
  padding: 32px 32px 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.modal-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
  white-space: pre-line;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

/* Cancel Button - 투명한 회색 */
.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Confirm Button - 메인과 같은 그라데이션 */
.btn-confirm {
  background: linear-gradient(135deg, #6b7280, #9ca3af, #4b5563);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #4b5563, #6b7280, #374151);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Danger Button - 빨간색 그라데이션 */
.btn-danger {
  background: linear-gradient(135deg, #dc2626, #ef4444, #b91c1c) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3) !important;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c, #dc2626, #991b1b) !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.modal-backdrop-enter-active {
  transition: all 0.2s ease;
}

.modal-backdrop-leave-active {
  transition: all 0.15s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all 0.2s ease;
}

.modal-leave-active {
  transition: all 0.15s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .modal-container {
    max-width: 90%;
    margin: 0 20px;
  }

  .modal-content {
    padding: 24px 24px 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-message {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .modal-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>