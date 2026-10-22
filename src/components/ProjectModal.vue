<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="project" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div
          class="manuscript-card selectable-text"
          :style="{
            '--accent': project.accentColor,
            '--secondary': project.secondaryColor,
            '--accent-glow': project.accentColor + '38'
          }"
        >
          <!-- Top Ornament -->
          <div class="card-ornament top">
            <span class="ornament-line"></span>
            <span class="ornament-symbol">❦</span>
            <span class="ornament-line"></span>
          </div>

          <button class="close-btn" @click="$emit('close')" aria-label="Close">✕</button>

          <div class="modal-header">
            <span class="category-pill">{{ project.category }} • {{ project.year }}</span>
            <h2 class="project-title">{{ project.title }}</h2>
            <p class="project-subtitle">{{ project.subtitle }}</p>
          </div>

          <div class="modal-body">
            <div class="description-section">
              <h3 class="section-label">CHRONICLE</h3>
              <p class="description-text">{{ project.description }}</p>
            </div>

            <!-- Architectural Highlights -->
            <div v-if="project.highlights && project.highlights.length" class="highlights-section">
              <h3 class="section-label">ARCHITECTURAL HIGHLIGHTS</h3>
              <ul class="highlights-list">
                <li v-for="(h, idx) in project.highlights" :key="idx" class="highlight-item">
                  <span class="highlight-bullet">✦</span>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">ROLE</span>
                <span class="meta-value">{{ project.role }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">ACHIEVEMENT</span>
                <span class="meta-value">{{ project.stats }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">PALETTE THEME</span>
                <span class="meta-value">{{ project.paletteTheme }}</span>
              </div>
            </div>

            <!-- Color Palette Chips -->
            <div v-if="project.paletteColors && project.paletteColors.length" class="palette-section">
              <span class="meta-label">RENAISSANCE PIGMENT PALETTE</span>
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

            <div class="tags-section">
              <span class="meta-label">TECHNOLOGIES & CRAFT</span>
              <div class="tags-list">
                <span v-for="tag in project.tags" :key="tag" class="tag-badge">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="action-links">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-btn primary-cta"
              >
                Visit Live Archive ↗
              </a>
              <a
                v-if="project.githubUrl"
                :href="project.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-btn secondary-cta"
              >
                Source Code ↗
              </a>
            </div>
            <button class="close-action-btn" @click="$emit('close')">
              Return to Gallery
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
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px var(--accent-glow);
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
  color: var(--accent);
}

.ornament-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.6;
}

.ornament-symbol {
  font-size: 16px;
}

.category-pill {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}

.project-title {
  font-family: var(--font-display);
  font-size: 34px;
  color: #fff9ee;
  margin-bottom: 6px;
  line-height: 1.18;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.project-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  color: #cbb494;
  font-weight: 400;
  margin-bottom: 22px;
  line-height: 1.45;
}

.section-label,
.meta-label {
  display: block;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--accent);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.description-text {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.7;
  color: #dfd5c4;
  margin-bottom: 20px;
}

/* Highlights */
.highlights-section {
  margin-bottom: 20px;
}

.highlights-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.55;
  color: #e5d9c6;
}

.highlight-bullet {
  color: var(--accent);
  font-size: 11px;
  margin-top: 3px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  background: rgba(36, 22, 12, 0.65);
  border: 1px solid rgba(212, 175, 55, 0.2);
  padding: 16px 20px;
  border-radius: 8px;
  border-left: 3px solid var(--accent);
  margin-bottom: 22px;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #fff8eb;
}

/* Pigment Palette Chips */
.palette-section {
  margin-bottom: 20px;
}

.palette-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-chip {
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.chip-hex {
  font-family: monospace;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.05em;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  background: rgba(38, 24, 13, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #f0e4cf;
  font-size: 11px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.03em;
}

.modal-footer {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid rgba(212, 175, 55, 0.18);
  padding-top: 20px;
}

.action-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-btn {
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 9px 20px;
  border-radius: 6px;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.primary-cta {
  background: var(--accent);
  color: #1a0f07;
  box-shadow: 0 4px 16px var(--accent-glow);
}

.primary-cta:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

.secondary-cta {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #fff9ee;
}

.secondary-cta:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  transform: translateY(-2px);
}

.close-action-btn {
  background: none;
  border: none;
  color: #a8947b;
  font-family: var(--font-body);
  font-size: 12px;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 8px 12px;
  transition: color 0.2s ease;
}

.close-action-btn:hover {
  color: #fff9ee;
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
