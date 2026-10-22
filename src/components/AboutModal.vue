<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="show" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div class="manuscript-card">
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
                <em>• Full Scholarship Recipient (Upgrading Thailand Project) • Class of 2027</em>
              </p>
            </div>

            <div class="info-block">
              <h3 class="section-label">TECHNICAL MASTERY</h3>
              <div class="skills-grid">
                <div>
                  <span class="skill-category">Frontend & 3D:</span>
                  <p class="skill-list">Vue 3, Three.js (WebGPU/TSL), TypeScript, Next.js, SvelteKit, Tailwind CSS</p>
                </div>
                <div>
                  <span class="skill-category">Backend & Systems:</span>
                  <p class="skill-list">Rust (Axum), Django, PostgreSQL, Prisma, REST APIs, Bun, Turborepo</p>
                </div>
                <div>
                  <span class="skill-category">Growth & Analytics:</span>
                  <p class="skill-list">Technical SEO, Core Web Vitals, CRO Funnel Analysis, GA4, GTM</p>
                </div>
              </div>
            </div>

            <div class="contact-links">
              <a href="mailto:thontrapoowadol@gmail.com" class="contact-btn">Email Scholar ✉</a>
              <a href="https://github.com/Poohmuhahaha" target="_blank" class="contact-btn">GitHub Profile ↗</a>
              <a href="https://linkedin.com/in/phuwadon-thontra" target="_blank" class="contact-btn">LinkedIn ↗</a>
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
  background: rgba(38, 33, 26, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.manuscript-card {
  position: relative;
  width: 100%;
  max-width: 660px;
  background: #e5c69f;
  background-image: radial-gradient(circle at 50% 0%, #ede0cb 0%, #e5c69f 80%);
  border: 2px solid #564222;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 8px rgba(46, 35, 17, 0.2);
  border-radius: 4px;
  padding: 36px 40px;
  color: #26211a;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 22px;
  background: none;
  border: none;
  font-size: 20px;
  color: #564222;
  cursor: pointer;
}

.card-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #92743e;
}

.ornament-line {
  flex: 1;
  height: 1px;
  background: #92743e;
}

.ornament-symbol {
  font-size: 18px;
}

.category-pill {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #7a3f34;
}

.project-title {
  font-family: var(--font-display);
  font-size: 34px;
  color: #2e2311;
  margin: 6px 0;
}

.project-subtitle {
  font-size: 14px;
  color: #564222;
  font-weight: 500;
  margin-bottom: 20px;
}

.intro-quote {
  font-style: italic;
  font-size: 15px;
  line-height: 1.6;
  color: #443220;
  background: rgba(46, 35, 17, 0.05);
  padding: 14px 18px;
  border-left: 3px solid #92743e;
  margin-bottom: 22px;
}

.info-block {
  margin-bottom: 20px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #736c60;
  margin-bottom: 8px;
}

.info-content {
  font-size: 14px;
  line-height: 1.6;
  color: #2e2311;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}

.skill-category {
  font-weight: 600;
  color: #564222;
}

.skill-list {
  color: #26211a;
  margin-top: 2px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid rgba(86, 66, 34, 0.2);
}

.contact-btn {
  background: #2e2311;
  color: #e5c69f;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.contact-btn:hover {
  background: #564222;
  transform: translateY(-1px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
