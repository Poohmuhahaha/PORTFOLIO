<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="show" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div class="manuscript-card selectable-text">
          <button class="close-btn" @click="$emit('close')" aria-label="Close">✕</button>

          <div class="card-ornament top">
            <span class="ornament-line"></span>
            <span class="ornament-symbol">⚜</span>
            <span class="ornament-line"></span>
          </div>

          <div class="modal-header">
            <span class="category-pill">CURRICULUM VITAE & PHILOSOPHY</span>
            <h2 class="project-title">Phuwadon Thontra</h2>
            <p class="project-subtitle">
              Full-Stack Web Developer & Interaction Designer • Bangkok, Thailand
            </p>
          </div>

          <div class="modal-body">
            <p class="intro-quote">
              "Crafting resilient web architectures, digital marketing ecosystems, and tactile 3D experiences where the canvas is the interface."
            </p>

            <div class="info-block">
              <h3 class="section-label">ACADEMIC FOUNDATION</h3>
              <p class="info-content">
                <strong>Harbour.Space @UTCC Institute</strong><br />
                Bachelor of Business Administration in Digital Marketing — Minor in Interaction Design<br />
                <span class="scholar-badge">• Full Scholarship Recipient (Upgrading Thailand Project) • Class of 2027</span>
              </p>
            </div>

            <div class="info-block">
              <h3 class="section-label">TECHNICAL MASTERY</h3>
              <div class="skills-grid">
                <div class="skill-row">
                  <span class="skill-category">Frontend & 3D:</span>
                  <p class="skill-list">Vue 3, Three.js (WebGPU/TSL), TypeScript, Next.js, SvelteKit, Tailwind CSS</p>
                </div>
                <div class="skill-row">
                  <span class="skill-category">Backend & Systems:</span>
                  <p class="skill-list">Rust (Axum), Django, PostgreSQL, Prisma, REST APIs, Bun, Turborepo</p>
                </div>
                <div class="skill-row">
                  <span class="skill-category">Growth & Analytics:</span>
                  <p class="skill-list">Technical SEO, Core Web Vitals, CRO Funnel Analysis, GA4, GTM</p>
                </div>
              </div>
            </div>

            <div class="contact-links">
              <a href="mailto:thontrapoowadol@gmail.com" class="contact-btn primary-btn">Email Scholar ✉</a>
              <a href="https://github.com/Poohmuhahaha" target="_blank" rel="noopener noreferrer" class="contact-btn">GitHub Profile ↗</a>
              <a href="https://linkedin.com/in/phuwadon-thontra" target="_blank" rel="noopener noreferrer" class="contact-btn">LinkedIn ↗</a>
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
  background: rgba(12, 8, 4, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.manuscript-card {
  position: relative;
  width: 100%;
  max-width: 660px;
  background: rgba(20, 13, 8, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(212, 175, 55, 0.35);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 36px 42px;
  color: #f7eedd;
  max-height: 90vh;
  overflow-y: auto;
  user-select: text;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 22px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  color: #d4af37;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.close-btn:hover {
  background: #d4af37;
  color: #1a0e05;
  transform: rotate(90deg);
}

.card-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 18px;
  color: #d4af37;
}

.ornament-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
}

.ornament-symbol {
  font-size: 16px;
}

.category-pill {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #d4af37;
}

.project-title {
  font-family: var(--font-display);
  font-size: 34px;
  color: #fff9ee;
  margin: 6px 0 4px 0;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.project-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  color: #cbb494;
  font-weight: 400;
  margin-bottom: 20px;
  line-height: 1.45;
}

.intro-quote {
  font-style: italic;
  font-size: 14px;
  line-height: 1.65;
  color: #e8dcc8;
  background: rgba(36, 22, 12, 0.65);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-left: 3px solid #d4af37;
  padding: 14px 20px;
  border-radius: 6px;
  margin-bottom: 22px;
}

.info-block {
  margin-bottom: 22px;
}

.section-label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #d4af37;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.info-content {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.65;
  color: #dfd5c4;
}

.scholar-badge {
  color: #e5b364;
  font-size: 12px;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-row {
  background: rgba(36, 22, 12, 0.45);
  border: 1px solid rgba(212, 175, 55, 0.15);
  padding: 10px 14px;
  border-radius: 6px;
}

.skill-category {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #d4af37;
  display: block;
  margin-bottom: 4px;
}

.skill-list {
  font-family: var(--font-body);
  font-size: 13px;
  color: #ede3d2;
  line-height: 1.5;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.contact-btn {
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 9px 18px;
  border-radius: 6px;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #fff9ee;
}

.contact-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  transform: translateY(-2px);
}

.primary-btn {
  background: #d4af37;
  color: #1a0e05;
  border-color: #d4af37;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
}

.primary-btn:hover {
  background: #e5c158;
  color: #1a0e05;
  box-shadow: 0 6px 18px rgba(212, 175, 55, 0.45);
}

/* Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
</style>
