<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="about-backdrop" @click.self="$emit('close')">
        <div class="about-panel" @keydown.esc="$emit('close')">
          <!-- Close button -->
          <button class="about-close" @click="$emit('close')" aria-label="Close About">
            ✕
          </button>

          <!-- Header -->
          <div class="about-brand">
            <h2 class="about-name">PHUWADON THONTRA</h2>
            <p class="about-tag">Lead Creative Physics & WebGPU Shader Developer</p>
          </div>

          <!-- Divider -->
          <div class="about-thunder">
            <svg width="240" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>

          <!-- Bio -->
          <div class="about-bio">
            <p>
              I am Phuwadon Thontra (Pooh), a Lead Creative Physics and WebGPU Shader Developer dedicated to engineering real-time Eulerian Navier-Stokes fluid dynamics, tactile PBR graphics, and resilient digital architectures.
            </p>
            <p>
              My work converges computational fluid dynamics, custom GLSL shaders, and tactile 3D interactions. From Hydro Core's real-time GPU fluid physics to architectural museum archives, I build immersive web experiences engineered for 60–120 FPS performance.
            </p>
          </div>

          <!-- Core Innovations & Areas -->
          <div class="about-section">
            <h3 class="section-title">CORE SPECIALIZATIONS</h3>
            <p class="clients-list">
              Eulerian Navier-Stokes Fluid Dynamics • WebGPU / WebGL Custom Shaders • GPGPU Double-FBO Architecture • Procedural PBR Lighting • Patrick Heng Spring Physics • Rust & Axum Microservices • Vue 3 & Next.js 16
            </p>
          </div>

          <!-- Contact & Credits -->
          <div class="about-footer">
            <div class="footer-col">
              <span class="col-label">GITHUB & ARCHIVE</span>
              <a href="https://github.com/Poohmuhahaha" target="_blank" rel="noopener noreferrer" class="footer-link">github.com/Poohmuhahaha ↗</a>
            </div>
            <div class="footer-col">
              <span class="col-label">FLAGSHIP PROJECTS</span>
              <div class="links-row">
                <span class="footer-link">Hydro Core</span>
                <span class="footer-link">Artibition</span>
                <span class="footer-link">Huuk</span>
                <span class="footer-link">Pugu</span>
              </div>
            </div>
            <div class="footer-col">
              <span class="col-label">DESIGN INSPIRATION</span>
              <span class="col-text">Patrick Heng 3D Physics & Justine Soulié Editorial Aesthetic</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.about-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(18, 14, 11, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.about-panel {
  position: relative;
  width: 100%;
  max-width: 680px;
  background: #f4f0ed;
  color: #252422;
  border-radius: 6px;
  padding: 48px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
  font-family: var(--font-body);
}

.about-close {
  position: absolute;
  top: 24px;
  right: 28px;
  background: none;
  border: none;
  font-size: 20px;
  color: #252422;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.2s ease;
}

.about-close:hover {
  transform: rotate(90deg);
}

.about-brand {
  margin-bottom: 20px;
}

.about-name {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0;
}

.about-tag {
  font-size: 14px;
  color: #8c8080;
  margin: 6px 0 0;
}

.about-thunder {
  margin: 16px 0 24px;
  color: #252422;
  opacity: 0.85;
}

.about-thunder svg {
  display: block;
}

.about-bio {
  font-size: 14px;
  line-height: 1.75;
  color: #4a4540;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
}

.about-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #252422;
  margin-bottom: 8px;
}

.clients-list {
  font-size: 13px;
  line-height: 1.6;
  color: #6d6660;
  margin: 0;
}

.about-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(37, 36, 34, 0.12);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.col-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #8c8080;
}

.footer-link {
  font-size: 13px;
  color: #252422;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #e56b55;
}

.links-row {
  display: flex;
  gap: 12px;
}

.col-text {
  font-size: 13px;
  color: #6d6660;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .about-panel {
    padding: 32px 24px;
  }
}
</style>
