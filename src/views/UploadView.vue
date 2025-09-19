<template>
  <div class="test-container">


    <div class="test-section">
      <h2 class="section-title">파일 업로드 테스트</h2>
      <p class="section-desc">실제 파일을 업로드하여 확장자 차단 기능을 테스트하세요.</p>

      <!-- 파일 업로드 영역 -->
      <div class="upload-area"
           :class="{ 'drag-over': isDragOver }"
           @drop="handleDrop"
           @dragover.prevent
           @dragenter="isDragOver = true"
           @dragleave="isDragOver = false"
           @click="triggerFileInput">
        <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileSelect">
        <div class="upload-content">
          <div class="upload-icon">📁</div>
          <p class="upload-text">파일을 드래그하거나 클릭하여 선택하세요</p>
          <p class="upload-hint">여러 파일 동시 선택 가능 (최대 10MB)</p>
        </div>
      </div>

      <!-- 업로드 진행 상황 -->
      <div v-if="uploadingFiles.length > 0" class="upload-progress">
        <h3>업로드 진행 상황</h3>
        <div v-for="file in uploadingFiles" :key="file.id" class="upload-item">
          <span class="upload-filename">{{ file.name }}</span>
          <div class="upload-status" :class="file.status">
            {{ file.statusText }}
          </div>
        </div>
      </div>
    </div>


    <div class="files-section">
      <h2 class="section-title">업로드된 파일 목록</h2>
      <p class="section-desc">업로드된 파일들을 관리할 수 있습니다.</p>

      <div v-if="isLoadingFiles" class="loading">파일 목록을 불러오는 중...</div>
      <div v-else-if="files.length === 0" class="empty">업로드된 파일이 없습니다.</div>
      <div v-else class="files-table">
        <div class="table-header">
          <span>파일명</span>
          <span>크기</span>
          <span>업로드일</span>
          <span>작업</span>
        </div>
        <div v-for="file in files" :key="file.id" class="table-row">
          <div class="file-info">
            <div class="file-name">{{ file.originalFilename }}</div>
            <div class="file-extension">{{ getFileExtension(file.originalFilename) }}</div>
          </div>
          <div class="file-size">{{ formatFileSize(file.fileSize) }}</div>
          <div class="file-date">{{ formatDate(file.createdAt) }}</div>
          <div class="file-actions">
            <button class="action-btn download" @click="downloadFile(file)" title="다운로드">
              📥
            </button>
            <button class="action-btn delete" @click="deleteFile(file)" title="삭제">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <button v-if="files.length > 0" class="refresh-btn" @click="loadFiles">
        새로고침
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ApiAxios from '@/api/ApiAxios.js'

// 파일 업로드 관련
const fileInput = ref(null)
const isDragOver = ref(false)
const uploadingFiles = ref([])
const files = ref([])
const isLoadingFiles = ref(false)


// 파일 업로드/다운로드 관련 함수들

/**
 * 파일 입력 창을 트리거하는 함수
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * 드래그 앤 드롭으로 파일이 떨어졌을 때 처리
 */
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const droppedFiles = Array.from(event.dataTransfer.files)
  processFiles(droppedFiles)
}

/**
 * 파일 선택으로 파일이 선택되었을 때 처리
 */
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  processFiles(selectedFiles)
  // 파일 입력 초기화
  event.target.value = ''
}

/**
 * 선택된 파일들을 처리하는 함수
 */
const processFiles = async (fileList) => {
  for (const file of fileList) {
    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert(`${file.name}은 10MB를 초과합니다.`)
      continue
    }

    // 확장자 체크
    const extension = getFileExtension(file.name)
    const isBlocked = await checkFileExtension(extension)

    if (isBlocked) {
      alert(`${file.name}의 확장자(${extension})는 차단된 확장자입니다.`)
      continue
    }

    // 업로드 진행
    await uploadFile(file)
  }
}

/**
 * 파일 확장자 체크
 */
const checkFileExtension = async (extension) => {
  try {
    const response = await ApiAxios.get(`/api/extensions/check/${extension}`)
    return response.data.data // 차단 여부
  } catch (error) {
    console.error('확장자 체크 실패:', error)
    return false
  }
}

/**
 * 파일 업로드
 */
const uploadFile = async (file) => {
  const uploadItem = {
    id: Date.now() + Math.random(),
    name: file.name,
    status: 'uploading',
    statusText: '업로드 중...'
  }

  uploadingFiles.value.push(uploadItem)

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await ApiAxios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      uploadItem.status = 'success'
      uploadItem.statusText = '업로드 완료'

      // 파일 목록 새로고침
      await loadFiles()
    } else {
      uploadItem.status = 'error'
      uploadItem.statusText = '업로드 실패'
    }
  } catch (error) {
    console.error('파일 업로드 실패:', error)
    uploadItem.status = 'error'
    uploadItem.statusText = '업로드 실패'
  }

  // 3초 후 업로드 진행 목록에서 제거
  setTimeout(() => {
    const index = uploadingFiles.value.findIndex(item => item.id === uploadItem.id)
    if (index !== -1) {
      uploadingFiles.value.splice(index, 1)
    }
  }, 3000)
}

/**
 * 파일 목록 조회
 */
const loadFiles = async () => {
  isLoadingFiles.value = true
  try {
    const response = await ApiAxios.get('/api/files')
    if (response.data.success) {
      files.value = response.data.data
    }
  } catch (error) {
    console.error('파일 목록 조회 실패:', error)
  } finally {
    isLoadingFiles.value = false
  }
}

/**
 * 파일 다운로드
 */
const downloadFile = async (file) => {
  try {
    const response = await ApiAxios.get(`/api/files/${file.id}/download`, {
      responseType: 'blob'
    })

    // Blob URL 생성 및 다운로드
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.originalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('파일 다운로드 실패:', error)
    alert('파일 다운로드에 실패했습니다.')
  }
}

/**
 * 파일 삭제
 */
const deleteFile = async (file) => {
  if (!confirm(`${file.originalFilename}을 삭제하시겠습니까?`)) {
    return
  }

  try {
    const response = await ApiAxios.delete(`/api/files/${file.id}`)
    if (response.data.success) {
      await loadFiles() // 목록 새로고침
    } else {
      alert('파일 삭제에 실패했습니다.')
    }
  } catch (error) {
    console.error('파일 삭제 실패:', error)
    alert('파일 삭제에 실패했습니다.')
  }
}

/**
 * 파일 확장자 추출
 */
const getFileExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 파일 크기 포맷팅
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 날짜 포맷팅
 */
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// 컴포넌트 마운트 시 파일 목록 로드
onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  overflow-y: auto;
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

.test-section, .history-section {
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

.empty {
  text-align: center;
  color: var(--color-foreground-secondary);
  padding: 24px;
  font-style: italic;
}

/* 파일 업로드/다운로드 관련 스타일 */
.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.upload-area:hover, .upload-area.drag-over {
  border-color: #6b7280;
  background: var(--color-background);
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-foreground);
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 14px;
  color: var(--color-foreground-secondary);
  margin: 0;
}

.upload-progress {
  background: var(--color-background);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.upload-progress h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  color: var(--color-foreground);
}

.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.upload-item:last-child {
  border-bottom: none;
}

.upload-filename {
  font-weight: 500;
  color: var(--color-foreground);
}

.upload-status {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
}

.upload-status.uploading {
  background: #fef3c7;
  color: #92400e;
}

.upload-status.success {
  background: #dcfce7;
  color: #166534;
}

.upload-status.error {
  background: #fee2e2;
  color: #dc2626;
}

.files-section {
  background: var(--color-background-secondary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid var(--color-border);
}

.files-table {
  background: var(--color-background);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 100px 150px 80px;
  gap: 16px;
  padding: 16px;
  background: var(--color-background-tertiary);
  font-weight: 600;
  font-size: 14px;
  color: var(--color-foreground);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 100px 150px 80px;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: var(--color-background-secondary);
}

.table-row:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: var(--color-foreground);
  font-size: 14px;
}

.file-extension {
  font-size: 12px;
  color: var(--color-foreground-secondary);
  font-family: monospace;
}

.file-size {
  font-size: 14px;
  color: var(--color-foreground-secondary);
  text-align: right;
}

.file-date {
  font-size: 12px;
  color: var(--color-foreground-secondary);
}

.file-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-background-secondary);
  transform: scale(1.1);
}

.action-btn.download:hover {
  background: #dcfce7;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.refresh-btn {
  padding: 8px 16px;
  background: var(--color-background);
  color: var(--color-foreground-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.refresh-btn:hover {
  background: var(--color-background-tertiary);
  color: var(--color-foreground);
}

.loading {
  text-align: center;
  color: var(--color-foreground-secondary);
  padding: 24px;
  font-style: italic;
}

@media (max-width: 768px) {
  .test-container {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .test-section, .files-section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .upload-area {
    padding: 32px 16px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .upload-text {
    font-size: 16px;
  }

  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .table-header {
    display: none;
  }

  .table-row {
    padding: 16px;
    display: block;
  }

  .file-info {
    margin-bottom: 8px;
  }

  .file-size, .file-date {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .file-actions {
    justify-content: flex-start;
    margin-top: 8px;
  }

  .upload-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
