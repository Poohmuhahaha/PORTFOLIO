<template>
  <header class="app-header">
    <div class="header-brand">
      <button class="brand-link" @click="$emit('reset-carousel')">
        <span>PHUWADON THONTRA</span>
      </button>
    </div>

    <nav class="header-nav">
      <button class="nav-link" @click="$emit('open-about')">
        <span>ABOUT</span>
        <div class="nav-svg-c">
          <svg width="48" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
          </svg>
        </div>
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'open-about'): void;
  (e: 'reset-carousel'): void;
}>();
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34px 48px;
  pointer-events: none;
  font-family: var(--font-body);
}

.header-brand {
  pointer-events: auto;
}

.brand-link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #252422;
  cursor: pointer;
  text-decoration: none;
}

.header-nav {
  display: flex;
  align-items: center;
  pointer-events: auto;
}

.nav-link {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  background: none;
  border: none;
  padding: 4px 0;
  color: #252422;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #e56b55;
}

.nav-svg-c {
  position: absolute;
  bottom: -4px;
  left: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateY(2px);
  transition: all 0.24s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.nav-svg-c svg {
  display: block;
}

.nav-link:hover .nav-svg-c {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .app-header {
    padding: 24px 20px;
  }
}
</style>
