<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">파일 확장자 차단 관리</h1>
      <p class="description">파일 확장자를 관리하고 테스트할 수 있습니다.</p>
    </div>

    <!-- 고정/커스텀 확장자 섹션 (좌우 배치) -->
    <div class="extensions-row">
      <!-- 고정 확장자 섹션 -->
      <div class="extension-column">
        <FixedExtensions />
      </div>

      <!-- 커스텀 확장자 섹션 -->
      <div class="extension-column">
        <CustomExtensions />
      </div>
    </div>

    <!-- 확장자 테스트 섹션 (전체 폭) -->
    <ExtensionTest />
  </div>
</template>

<script setup>
import FixedExtensions from '@/components/extensions/FixedExtensions.vue'
import CustomExtensions from '@/components/extensions/CustomExtensions.vue'
import ExtensionTest from '@/components/extensions/ExtensionTest.vue'
</script>

<style scoped>
.home-container {
  max-width: 1800px;
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
  letter-spacing: -1px;
}

.description {
  font-size: 18px;
  color: var(--color-foreground-secondary);
  margin: 0;
}

.extensions-row {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.extension-column {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .home-container {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .extensions-row {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
}
</style>
