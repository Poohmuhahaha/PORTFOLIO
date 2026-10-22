<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="project" class="modal-backdrop interactive" @click.self="$emit('close')">
        <div class="manuscript-card">
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
                <span class="meta-label">AESTHETIC THEME</span>
                <span class="meta-value">{{ project.paletteTheme }}</span>
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
            <button class="action-btn" @click="$emit('close')">
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
  max-width: 640px;
  background: #e5c69f;
  background-image: radial-gradient(circle at 50% 0%, #ede0cb 0%, #e5c69f 80%);
  border: 2px solid #564222;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 8px rgba(46, 35, 17, 0.2);
  border-radius: 4px;
  padding: 36px 40px;
  color: #26211a;
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
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
  color: #2e2311;
}

.card-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
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
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a3f34;
  margin-bottom: 8px;
}

.project-title {
  font-family: var(--font-display);
  font-size: 38px;
  color: #2e2311;
  margin-bottom: 6px;
  line-height: 1.15;
}

.project-subtitle {
  font-size: 15px;
  color: #564222;
  font-weight: 500;
  margin-bottom: 24px;
}

.section-label,
.meta-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #736c60;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.description-text {
  font-size: 15px;
  line-height: 1.65;
  color: #312822;
  margin-bottom: 24px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  background: rgba(46, 35, 17, 0.06);
  padding: 16px;
  border-radius: 4px;
  border-left: 3px solid #92743e;
  margin-bottom: 24px;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #26211a;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-badge {
  background: #2e2311;
  color: #e5c69f;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 2px;
  letter-spacing: 0.04em;
}

.modal-footer {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  background: #564222;
  color: #e5c69f;
  border: 1px solid #92743e;
  padding: 10px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #2e2311;
  transform: translateY(-1px);
}

/* Animations */
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
