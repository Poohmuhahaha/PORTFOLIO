<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="show" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div class="about-card selectable-text">
          <button class="close-btn" @click="$emit('close')" aria-label="Close">✕</button>

          <div class="modal-header">
            <span class="category-pill">ABOUT & CRAFT</span>
            <h2 class="about-title">Phuwadon Thontra</h2>
            <p class="about-subtitle">
              Creative Developer & Full-Stack Engineer • Bangkok, Thailand
            </p>

            <!-- Signature thunder bar -->
            <div class="thunder-bar">
              <svg width="240" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
          </div>

          <div class="modal-body">
            <p class="intro-quote">
              "Building high-performance creative coding experiences, fluid WebGL/WebGPU physics, and resilient digital architectures where the canvas is the interface."
            </p>

            <div class="info-block">
              <h3 class="section-label">EDUCATION & RECOGNITION</h3>
              <p class="info-content">
                <strong>Harbour.Space @ UTCC Institute</strong><br />
                Bachelor of Business Administration in Digital Marketing & Interaction Design<br />
                <span class="scholar-badge">✦ Full Scholarship Recipient (Upgrading Thailand Project) • Class of 2027</span>
              </p>
            </div>

            <div class="info-block">
              <h3 class="section-label">TECHNICAL CRAFT</h3>
              <div class="skills-grid">
                <div class="skill-row">
                  <span class="skill-category">Frontend & WebGL:</span>
                  <p class="skill-list">Three.js, WebGPU, TypeScript, Vue 3, Next.js, Shaders, Tailwind CSS</p>
                </div>
                <div class="skill-row">
                  <span class="skill-category">Backend & Systems:</span>
                  <p class="skill-list">Rust (Axum), PostgreSQL, Prisma, Bun, Turborepo, RESTful APIs</p>
                </div>
                <div class="skill-row">
                  <span class="skill-category">Performance & Growth:</span>
                  <p class="skill-list">60fps Animation Physics, Technical SEO, Core Web Vitals, CRO Analytics</p>
                </div>
              </div>
            </div>

            <div class="contact-links">
              <a href="mailto:thontrapoowadol@gmail.com" class="cta-btn primary-cta">Get in Touch ✉</a>
              <a href="https://github.com/Poohmuhahaha" target="_blank" rel="noopener noreferrer" class="cta-btn secondary-cta">GitHub Profile ↗</a>
              <a href="https://linkedin.com/in/phuwadon-thontra" target="_blank" rel="noopener noreferrer" class="cta-btn secondary-cta">LinkedIn ↗</a>
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
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(37, 36, 34, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.about-card {
  position: relative;
  width: 100%;
  max-width: 660px;
  background: #fdfcf9;
  border: 1px solid rgba(37, 36, 34, 0.12);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.16);
  border-radius: 16px;
  padding: 44px 48px;
  color: #252422;
  max-height: 88vh;
  overflow-y: auto;
  font-family: var(--font-body);
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 26px;
  background: none;
  border: none;
  font-size: 18px;
  color: #8c8080;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #252422;
  transform: rotate(90deg);
}

.modal-header {
  margin-bottom: 24px;
}

.category-pill {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #e56b55;
  display: block;
  margin-bottom: 8px;
}

.about-title {
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #252422;
  margin-bottom: 8px;
  line-height: 1.1;
}

.about-subtitle {
  font-size: 15px;
  color: #8c8080;
  line-height: 1.5;
  margin-bottom: 16px;
}

.thunder-bar {
  color: #e56b55;
  opacity: 0.75;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro-quote {
  font-size: 16px;
  line-height: 1.6;
  color: #252422;
  font-style: italic;
  padding: 16px 20px;
  background: rgba(37, 36, 34, 0.03);
  border-left: 3px solid #e56b55;
  border-radius: 4px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #8c8080;
  text-transform: uppercase;
}

.info-content {
  font-size: 14px;
  line-height: 1.6;
  color: #383531;
}

.scholar-badge {
  color: #e56b55;
  font-size: 13px;
  font-weight: 500;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.skill-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-category {
  font-size: 12px;
  font-weight: 600;
  color: #252422;
}

.skill-list {
  font-size: 13px;
  color: #66605a;
  line-height: 1.45;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(37, 36, 34, 0.08);
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: all 0.25s ease;
}

.primary-cta {
  background: #252422;
  color: #ffffff;
}

.primary-cta:hover {
  background: #e56b55;
  transform: translateY(-1px);
}

.secondary-cta {
  background: transparent;
  color: #252422;
  border: 1px solid rgba(37, 36, 34, 0.2);
}

.secondary-cta:hover {
  border-color: #252422;
  background: rgba(37, 36, 34, 0.04);
}

/* Modal Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.28s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

.fade-scale-enter-from .about-card,
.fade-scale-leave-to .about-card {
  transform: scale(0.96) translateY(12px);
}

@media (max-width: 640px) {
  .about-card {
    padding: 32px 24px;
  }
  .contact-links {
    flex-direction: column;
  }
  .cta-btn {
    justify-content: center;
  }
}
</style>
