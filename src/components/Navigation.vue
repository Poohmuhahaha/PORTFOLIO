<template>
  <header class="navigation interactive">
    <div class="brand">
      <h1 class="brand-name">PHUWADON THONTRA</h1>
      <span class="status-dot" :class="{ 'is-webgpu': isWebGPU }" :title="backendName"></span>
    </div>

    <nav class="nav-links">
      <button class="nav-btn" @click="$emit('open-about')">About</button>
      <a href="mailto:thontrapoowadol@gmail.com" class="nav-btn">Contact</a>
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
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36px 56px;
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  color: #f7f2e8;
  letter-spacing: 0.14em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #cd8db0;
  box-shadow: 0 0 6px #cd8db0;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.status-dot.is-webgpu {
  background-color: #6ce08b;
  box-shadow: 0 0 8px #6ce08b;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  pointer-events: auto;
}

.nav-btn {
  background: none;
  border: none;
  color: #d8c8b0;
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 6px 0;
  position: relative;
  transition: color 0.25s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: #d8c8b0;
  transition: width 0.25s ease;
}

.nav-btn:hover {
  color: #ffffff;
}

.nav-btn:hover::after {
  width: 100%;
}

@media (max-width: 768px) {
  .navigation {
    padding: 20px 24px;
  }
}
</style>
