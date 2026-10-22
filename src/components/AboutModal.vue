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
            <h2 class="about-name">JUSTINE SOULIÉ</h2>
            <p class="about-tag">Art Director & Illustrator based in Paris</p>
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
              I'm Justine Soulié, a French multidisciplinary designer and art director passionate about people's stories and ideas. I strive to translate narratives into meaningful, bold, and playful visual worlds across branding, motion, digital illustration, and physical packaging.
            </p>
            <p>
              Curious and eager to explore new mediums, I collaborate closely with creative technologists, studios, and cultural artists worldwide.
            </p>
          </div>

          <!-- Selected Clients -->
          <div class="about-section">
            <h3 class="section-title">SELECTED CLIENTS</h3>
            <p class="clients-list">
              Hermès • Renault France • Matthieu Chedid (-M-) • Labo-M • 3ème Bureau • 17Mars • Machine Molle • Prismic • Studio Vandal
            </p>
          </div>

          <!-- Contact & Credits -->
          <div class="about-footer">
            <div class="footer-col">
              <span class="col-label">CONTACT</span>
              <a href="mailto:contact@justinesoulie.fr" class="footer-link">contact@justinesoulie.fr</a>
            </div>
            <div class="footer-col">
              <span class="col-label">FOLLOW</span>
              <div class="links-row">
                <a href="https://instagram.com/justinesoulie" target="_blank" rel="noopener noreferrer" class="footer-link">Instagram ↗</a>
                <a href="https://behance.net/justinesoulie" target="_blank" rel="noopener noreferrer" class="footer-link">Behance ↗</a>
              </div>
            </div>
            <div class="footer-col">
              <span class="col-label">CREDITS</span>
              <span class="col-text">Creative Development by <a href="https://patrickheng.com" target="_blank" rel="noopener noreferrer" class="footer-link">Patrick Heng</a></span>
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
