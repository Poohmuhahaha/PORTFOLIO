<template>
  <header class="app-header">
    <div class="header-brand">
      <span class="brand-name">phuwadon thontra</span>
      <span class="brand-dot" :class="{ 'is-active': isWebGPU }" :title="backendName"></span>
    </div>

    <nav class="header-nav">
      <button class="nav-link" @click="$emit('open-about')">
        <span>about</span>
        <div class="nav-svg-c">
          <svg width="48" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
          </svg>
        </div>
      </button>

      <a
        href="https://github.com/Poohmuhahaha"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
        title="GitHub Profile"
      >
        <span>github</span>
        <div class="nav-svg-c">
          <svg width="52" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
          </svg>
        </div>
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  backendName: string;
  isWebGPU: boolean;
}>();

defineEmits<{
  (e: 'open-about'): void;
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
  padding: 36px 48px;
  pointer-events: none;
  font-family: var(--font-body);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: #252422;
  letter-spacing: -0.01em;
  text-transform: lowercase;
}

.brand-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.6);
  opacity: 0.85;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 28px;
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
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #e56b55;
}

/* Signature Justine Soulié lightning stroke SVG underline */
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
