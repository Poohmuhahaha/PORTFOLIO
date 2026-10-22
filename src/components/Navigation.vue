<template>
  <header class="app-header">
    <div class="header-brand">
      <span class="brand-name">Phuwadon Thontra</span>
      <span class="brand-role">Creative Developer</span>
      <span class="webgpu-pill" :class="{ 'is-active': isWebGPU }" :title="backendName">
        <span class="pill-dot"></span>
        <span class="pill-text">{{ isWebGPU ? 'WebGPU' : 'WebGL 2' }}</span>
      </span>
    </div>

    <nav class="header-nav">
      <button class="nav-link" @click="$emit('open-about')">
        <span>ABOUT</span>
        <div class="nav-svg-c">
          <svg width="52" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
          </svg>
        </div>
      </button>

      <a href="https://github.com/Poohmuhahaha" target="_blank" rel="noopener noreferrer" class="nav-link">
        <span>GITHUB ↗</span>
        <div class="nav-svg-c">
          <svg width="68" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
          </svg>
        </div>
      </a>

      <a href="mailto:thontrapoowadol@gmail.com" class="nav-link">
        <span>CONTACT</span>
        <div class="nav-svg-c">
          <svg width="64" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  padding: 32px 48px;
  pointer-events: none;
  font-family: var(--font-body);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  pointer-events: auto;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #252422;
  letter-spacing: -0.01em;
}

.brand-role {
  font-size: 13px;
  font-weight: 400;
  color: #8c8080;
  letter-spacing: 0.02em;
}

.webgpu-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(37, 36, 34, 0.05);
  border: 1px solid rgba(37, 36, 34, 0.08);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8c8080;
}

.webgpu-pill.is-active .pill-dot {
  background: #34c759;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.6);
}

.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff9500;
  transition: all 0.3s ease;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
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
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #e56b55;
}

/* Signature Justine Soulié thunder / stroke SVG underline */
.nav-svg-c {
  position: absolute;
  bottom: -4px;
  left: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateY(2px);
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.3, 1);
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
  .brand-role {
    display: none;
  }
  .header-nav {
    gap: 18px;
  }
  .nav-link {
    font-size: 11px;
  }
}
</style>
