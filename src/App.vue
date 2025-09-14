<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1 class="app-title">Inventory</h1>
        </div>

        <nav v-if="authStore.isAuthenticated" class="nav">
          <RouterLink to="/dashboard" class="nav-link">대시보드</RouterLink>
          <RouterLink to="/inventory" class="nav-link">인벤토리</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
          <RouterLink to="/demo" class="nav-link">Demo</RouterLink>
        </nav>

        <div class="header-actions">
          <div v-if="authStore.isAuthenticated" class="user-info">
            <span class="user-email">{{ authStore.user?.email }}</span>
            <button @click="authStore.logout" class="logout-btn">로그아웃</button>
          </div>
          <div v-else class="auth-actions">
            <RouterLink to="/login" class="login-btn">로그인</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(8px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
}

.logo .app-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-foreground);
  margin: 0;
}

.nav {
  display: flex;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--color-foreground-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-foreground);
  background-color: var(--color-background-tertiary);
}

.nav-link.router-link-active {
  color: var(--color-accent);
  background-color: rgba(0, 122, 255, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--color-foreground-secondary);
}

.logout-btn,
.login-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 36px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover,
.login-btn:hover {
  background-color: #0056b3;
}

.app-main {
  flex: 1;
  background-color: var(--color-background);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .nav {
    display: none;
  }

  .logo .app-title {
    font-size: var(--font-size-xl);
  }

  .header-actions {
    gap: var(--spacing-sm);
  }

  .user-email {
    display: none;
  }
}
</style>
