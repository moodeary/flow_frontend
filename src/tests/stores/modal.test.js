import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useModalStore } from '@/stores/modal'

describe('Modal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with closed modal', () => {
    const modalStore = useModalStore()

    expect(modalStore.isOpen).toBe(false)
    expect(modalStore.config.title).toBe('확인')
    expect(modalStore.config.message).toBe('')
  })

  it('should open success modal', async () => {
    const modalStore = useModalStore()

    modalStore.success('성공했습니다!')

    expect(modalStore.isOpen).toBe(true)
    expect(modalStore.config.title).toBe('성공')
    expect(modalStore.config.message).toBe('성공했습니다!')
    expect(modalStore.config.variant).toBe('success')
  })

  it('should open error modal', async () => {
    const modalStore = useModalStore()

    modalStore.error('오류가 발생했습니다!')

    expect(modalStore.isOpen).toBe(true)
    expect(modalStore.config.title).toBe('오류')
    expect(modalStore.config.message).toBe('오류가 발생했습니다!')
    expect(modalStore.config.variant).toBe('danger')
  })

  it('should close modal', () => {
    const modalStore = useModalStore()

    modalStore.success('테스트')
    expect(modalStore.isOpen).toBe(true)

    modalStore.close()
    expect(modalStore.isOpen).toBe(false)
  })
})