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
            <div class="modal-header">
              <h3 :id="titleId" class="modal-title">
                {{ title }}
              </h3>
            </div>

            <div class="modal-body">
              <p :id="messageId" class="modal-message">
                {{ message }}
              </p>
            </div>

            <div class="modal-actions">
              <button
                v-if="!hideCancel"
                type="button"
                class="btn btn-secondary"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="btn"
                :class="confirmButtonClass"
                @click="handleConfirm"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading-spinner"></span>
                {{ confirmText }}
              </button>
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

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'btn-danger'
    case 'success':
      return 'btn-success'
    default:
      return 'btn-primary'
  }
})

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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 400px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.modal-header {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-foreground);
  margin: 0;
  text-align: center;
}

.modal-body {
  padding: var(--spacing-md) var(--spacing-lg);
}

.modal-message {
  font-size: var(--font-size-base);
  color: var(--color-foreground-secondary);
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-background-tertiary);
  color: var(--color-foreground-secondary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-border);
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--color-accent-pressed);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #e63946;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #28a745;
}

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
  transition: opacity var(--transition-base);
}

.modal-backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all var(--transition-base);
}

.modal-leave-active {
  transition: all var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}
</style>