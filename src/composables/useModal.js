import { useModalStore } from '@/stores/modal'

export function useModal() {
  const modalStore = useModalStore()

  // API 성공/실패 처리를 위한 헬퍼 함수들
  const handleApiSuccess = async (message, callback = null) => {
    try {
      await modalStore.success(message)
      if (callback) callback()
    } catch {
      // 사용자가 모달을 취소한 경우
    }
  }

  const handleApiError = async (error, callback = null) => {
    const message = error?.message || error?.response?.data?.message || '오류가 발생했습니다.'
    try {
      await modalStore.error(message)
      if (callback) callback()
    } catch {
      // 사용자가 모달을 취소한 경우
    }
  }

  const confirmAction = async (message, title = '확인') => {
    try {
      await modalStore.confirm({ title, message })
      return true
    } catch {
      return false
    }
  }

  const confirmDelete = async (itemName = '항목') => {
    try {
      await modalStore.deleteConfirm(`"${itemName}"을(를) 삭제하시겠습니까?`)
      return true
    } catch {
      return false
    }
  }

  return {
    // Store 직접 접근
    modal: modalStore,

    // 헬퍼 함수들
    handleApiSuccess,
    handleApiError,
    confirmAction,
    confirmDelete,

    // 직접 모달 호출
    success: modalStore.success,
    error: modalStore.error,
    confirm: modalStore.confirm,
    deleteConfirm: modalStore.deleteConfirm
  }
}