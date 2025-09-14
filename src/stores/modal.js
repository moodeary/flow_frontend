import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const config = ref({
    title: '확인',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    variant: 'default',
    hideCancel: false,
    isLoading: false,
    closeOnBackdrop: true
  })

  let resolvePromise = null
  let rejectPromise = null

  // 기본 확인 모달
  function confirm(options) {
    return new Promise((resolve, reject) => {
      config.value = {
        title: '확인',
        message: '',
        confirmText: '확인',
        cancelText: '취소',
        variant: 'default',
        hideCancel: false,
        isLoading: false,
        closeOnBackdrop: true,
        ...options
      }

      isOpen.value = true
      resolvePromise = resolve
      rejectPromise = reject
    })
  }

  // 성공 모달
  function success(message, options = {}) {
    return confirm({
      title: '성공',
      message,
      variant: 'success',
      hideCancel: true,
      ...options
    })
  }

  // 에러 모달
  function error(message, options = {}) {
    return confirm({
      title: '오류',
      message,
      variant: 'danger',
      hideCancel: true,
      ...options
    })
  }

  // 삭제 확인 모달
  function deleteConfirm(message = '정말로 삭제하시겠습니까?') {
    return confirm({
      title: '삭제 확인',
      message,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger'
    })
  }

  // 확인 버튼 클릭
  function handleConfirm() {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
      rejectPromise = null
    }
    close()
  }

  // 취소 버튼 클릭
  function handleCancel() {
    if (rejectPromise) {
      rejectPromise(false)
      resolvePromise = null
      rejectPromise = null
    }
    close()
  }

  // 모달 닫기
  function close() {
    isOpen.value = false
    config.value.isLoading = false
  }

  // 로딩 상태 설정
  function setLoading(loading) {
    config.value.isLoading = loading
  }

  return {
    isOpen,
    config,
    confirm,
    success,
    error,
    deleteConfirm,
    handleConfirm,
    handleCancel,
    close,
    setLoading
  }
})