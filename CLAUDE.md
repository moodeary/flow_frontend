# Inventory Frontend Template 2

Vue.js 기반 인벤토리 관리 시스템 프론트엔드

## 🏗️ 프로젝트 구조

```
frontend-template2/
├── src/
│   ├── api/                    # API 호출 모듈
│   │   ├── client.js          # API 클라이언트 (axios 기반)
│   │   ├── auth.js            # 인증 관련 API
│   │   └── inventory.js       # 인벤토리 관련 API
│   ├── assets/                # 정적 자산
│   ├── components/            # Vue 컴포넌트
│   │   └── common/            # 공통 컴포넌트
│   │       ├── ConfirmModal.vue  # 전역 확인 모달
│   │       ├── InputField.vue    # 입력 필드 컴포넌트
│   │       └── ToggleButton.vue  # 토글 버튼 컴포넌트
│   ├── composables/           # Vue 3 Composition API
│   │   └── useModal.js        # 모달 관련 유틸리티
│   ├── router/                # Vue Router 설정
│   ├── stores/                # Pinia 상태 관리
│   │   ├── auth.js           # 인증 상태
│   │   ├── inventory.js      # 인벤토리 상태
│   │   └── modal.js          # 모달 상태
│   ├── styles/                # 스타일 파일
│   └── views/                 # 페이지 컴포넌트
│       ├── LoginView.vue     # 로그인 페이지
│       ├── SignupView.vue    # 회원가입 페이지
│       ├── DashboardView.vue # 대시보드
│       └── InventoryView.vue # 인벤토리 관리
└── CLAUDE.md                  # 이 파일
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **메인 그라데이션**: `linear-gradient(135deg, #374151, #4b5563, #6b7280)`
- **배경**: 흰색 베이스 (`#ffffff`)
- **텍스트**: 다크 그레이 (`#1f2937`, `#6b7280`)
- **액센트**: 블루 (`#3b82f6`)
- **에러**: 레드 (`#ef4444`)
- **성공**: 그린 (`#10b981`)

### 디자인 원칙
- 모든 주요 컴포넌트는 헤더/푸터와 동일한 그라데이션 스타일 적용
- 심플하고 깔끔한 인터페이스
- 일관된 버튼 스타일과 호버 효과
- 모바일 반응형 디자인

## 🔧 기술 스택

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Styling**: CSS3 (Scoped Styles)
- **Package Manager**: pnpm

## 📁 Import 경로 규칙

**항상 절대 경로 사용:**
```javascript
// ✅ 올바름
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useModal } from '@/composables/useModal'

// ❌ 피하기
import { useAuthStore } from '../stores/auth'
import ConfirmModal from './components/common/ConfirmModal.vue'
```

## 🔄 상태 관리 (Pinia)

### 스토어 구조
- **authStore**: 사용자 인증, 로그인/로그아웃 상태
- **inventoryStore**: 아이템 CRUD, 페이징, 필터링
- **modalStore**: 전역 모달 상태 및 확인/취소 처리

### API 호출 패턴
```javascript
// 스토어에서 API 호출
async function createItem(itemData) {
  isLoading.value = true
  try {
    const response = await inventoryAPI.createItem(itemData)
    if (response.success) {
      await fetchItems() // 목록 새로고침
    }
    return response
  } catch (error) {
    console.error('Create item error:', error)
    throw error
  } finally {
    isLoading.value = false
  }
}

// 컴포넌트에서 사용
const { handleApiSuccess, handleApiError } = useModal()
try {
  await inventoryStore.createItem(itemData)
  await handleApiSuccess('아이템이 성공적으로 추가되었습니다!')
} catch (error) {
  await handleApiError(error)
}
```

## 🎯 모달 시스템

### 전역 모달 (ConfirmModal)
```javascript
import { useModal } from '@/composables/useModal'

const { confirm, success, error, deleteConfirm } = useModal()

// 기본 확인
const result = await confirm({
  title: '확인',
  message: '정말로 진행하시겠습니까?'
})

// 삭제 확인 (빨간색 위험 스타일)
const willDelete = await deleteConfirm('아이템명')

// 성공/에러 메시지
await success('작업이 완료되었습니다!')
await error('오류가 발생했습니다.')
```

## 🏃‍♂️ 실행 방법

### 개발 서버 실행
```bash
pnpm run dev
```

### 빌드
```bash
pnpm run build
```

### 린트 검사
```bash
pnpm run lint
```

### 타입 체크
```bash
pnpm run typecheck
```

## 📋 개발 가이드라인

### 1. 컴포넌트 개발
- 모든 새 컴포넌트는 Composition API 사용
- Props validation 필수
- Scoped styles 적용
- 헤더/푸터 디자인과 일관성 유지

### 2. API 호출
- 모든 API 호출은 Pinia 스토어를 통해 수행
- 로딩 상태 관리 (`isLoading`)
- 에러 핸들링 및 사용자 피드백

### 3. 사용자 경험
- 중요한 액션에는 확인 모달 적용
- 성공/실패 피드백 제공
- 로딩 상태 표시

### 4. 코드 품질
- ESLint 규칙 준수
- 일관된 네이밍 컨벤션
- 주석은 필요시에만 추가

## 🔒 보안 고려사항

- API 토큰은 localStorage에 저장 (추후 httpOnly 쿠키 고려)
- XSS 방지를 위한 입력값 검증
- HTTPS 사용 (프로덕션)

## 🚀 배포

### Docker 빌드
```bash
docker build -t inventory-frontend .
```

### 프로덕션 배포
- infra-template의 docker-compose.yml을 통해 배포
- nginx 설정은 infra-template에서 관리
- 이 프로젝트는 정적 파일만 빌드하여 제공

## 📝 추가 작업 사항

### 우선순위 높음
- [x] 전체 디자인 통일 (헤더/푸터 스타일 적용)
- [x] Docker 배포 설정 완료
- [ ] 에러 바운더리 추가

### 우선순위 보통
- [ ] PWA 지원 추가
- [ ] 다크모드 지원
- [ ] 국제화 (i18n)

### 우선순위 낮음
- [ ] 단위 테스트 추가
- [ ] E2E 테스트
- [ ] 성능 최적화