<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="project" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div
          class="case-card selectable-text"
          :style="{
            '--accent': project.accentColor || '#e56b55',
            '--secondary': project.secondaryColor || '#736c60'
          }"
        >
          <!-- Close button -->
          <button class="close-btn" @click="$emit('close')" aria-label="Close">✕</button>

          <!-- Header -->
          <div class="modal-header">
            <div class="header-meta">
              <span class="category-pill">{{ project.category.toUpperCase() }}</span>
              <span class="year-pill">{{ project.year }}</span>
            </div>

            <h2 class="project-title">{{ project.title }}</h2>
            <p class="project-subtitle">{{ project.subtitle }}</p>

            <!-- Signature Justine Soulié thunder / stroke SVG divider -->
            <div class="thunder-bar">
              <svg width="240" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div class="section-block">
              <h3 class="section-label">OVERVIEW</h3>
              <p class="description-text">{{ project.description }}</p>
            </div>

            <!-- Architectural Highlights -->
            <div v-if="project.highlights && project.highlights.length" class="section-block">
              <h3 class="section-label">TECHNICAL HIGHLIGHTS</h3>
              <ul class="highlights-list">
                <li v-for="(h, idx) in project.highlights" :key="idx" class="highlight-item">
                  <span class="highlight-bullet">✦</span>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>

            <!-- Meta Details -->
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">ROLE</span>
                <span class="meta-value">{{ project.role }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">KEY STAT</span>
                <span class="meta-value">{{ project.stats }}</span>
              </div>
            </div>

            <!-- Color Palette Chips -->
            <div v-if="project.paletteColors && project.paletteColors.length" class="section-block">
              <span class="section-label">ART DIRECTION PALETTE</span>
              <div class="palette-chips">
                <div
                  v-for="(color, cIdx) in project.paletteColors"
                  :key="cIdx"
                  class="color-chip"
                  :style="{ backgroundColor: color }"
                  :title="color"
                >
                  <span class="chip-hex">{{ color }}</span>
                </div>
              </div>
            </div>

            <!-- Technologies -->
            <div class="section-block">
              <span class="section-label">TECH STACK</span>
              <div class="tags-list">
                <span v-for="tag in project.tags" :key="tag" class="tag-badge">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <div class="action-links">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-btn primary-cta"
              >
                <span>Visit Live Archive</span>
                <span class="cta-arrow">↗</span>
              </a>
              <a
                v-if="project.githubUrl"
                :href="project.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-btn secondary-cta"
              >
                <span>Source Code</span>
                <span class="cta-arrow">↗</span>
              </a>
            </div>

            <button class="return-btn" @click="$emit('close')">
              Return to Showcase
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ProjectItem } from '../data/projects';

defineProps<{
  project: ProjectItem | null;
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

.case-card {
  position: relative;
  width: 100%;
  max-width: 680px;
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
  margin-bottom: 28px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-pill {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.year-pill {
  font-size: 12px;
  color: #8c8080;
  font-weight: 400;
}

.project-title {
  font-size: clamp(32px, 4.5vw, 46px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #252422;
  margin-bottom: 8px;
  line-height: 1.1;
}

.project-subtitle {
  font-size: 15px;
  color: #8c8080;
  line-height: 1.5;
  margin-bottom: 18px;
}

.thunder-bar {
  color: var(--accent);
  opacity: 0.75;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-block {
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

.description-text {
  font-size: 15px;
  line-height: 1.65;
  color: #383531;
}

.highlights-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.55;
  color: #383531;
}

.highlight-bullet {
  color: var(--accent);
  font-size: 12px;
  margin-top: 2px;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid rgba(37, 36, 34, 0.08);
  border-bottom: 1px solid rgba(37, 36, 34, 0.08);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #8c8080;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: #252422;
}

.palette-chips {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.color-chip {
  width: 38px;
  height: 28px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chip-hex {
  display: none;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(37, 36, 34, 0.05);
  border: 1px solid rgba(37, 36, 34, 0.08);
  font-size: 12px;
  font-weight: 500;
  color: #383531;
}

.modal-footer {
  margin-top: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid rgba(37, 36, 34, 0.08);
}

.action-links {
  display: flex;
  gap: 12px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
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
  background: var(--accent);
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

.return-btn {
  background: none;
  border: none;
  color: #8c8080;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
}

.return-btn:hover {
  color: #252422;
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

.fade-scale-enter-from .case-card,
.fade-scale-leave-to .case-card {
  transform: scale(0.96) translateY(12px);
}

@media (max-width: 640px) {
  .case-card {
    padding: 32px 24px;
  }
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  .action-links {
    flex-direction: column;
  }
  .cta-btn {
    justify-content: center;
  }
  .return-btn {
    text-align: center;
  }
}
</style>
