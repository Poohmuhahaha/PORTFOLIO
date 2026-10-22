<template>
  <div class="app-root">
    <!-- WebGPU Canvas Layer (Interactive 3D Renaissance Library & Bookshelf) -->
    <WebGPUCanvas
      ref="webgpuCanvasRef"
      @select-project="onSelectProject"
      @active-index-change="onActiveIndexChange"
      @wheel-delta="onWheelDelta"
      @backend-ready="onBackendReady"
      @book-open-change="onBookOpenChange"
      @hover-book-change="onHoverBookChange"
    />

    <!-- Minimal Museum Header -->
    <Navigation
      :backend-name="backendName"
      :is-web-g-p-u="isWebGPU"
      @open-about="showAboutModal = true"
    />

    <!-- Unified Renaissance Console at Bottom Center (No Eye-Jumping!) -->
    <footer class="bottom-bar interactive">
      <!-- SHELF MODE: Unified Editorial Status & Folio Indicator -->
      <div v-if="!isBookOpen" class="shelf-console">
        <!-- Unified Editorial Status Banner (Always at the exact same location!) -->
        <div class="console-status">
          <transition name="status-fade" mode="out-in">
            <div v-if="hoveredProject" :key="'hover-' + hoveredIndex" class="status-hover">
              <span class="status-roman">FOLIO {{ romanNumerals[hoveredIndex ?? 0] }}</span>
              <span class="status-title">{{ hoveredProject.title }}</span>
              <span class="status-sep">•</span>
              <span class="status-sub">{{ hoveredProject.subtitle }}</span>
              <span class="status-hint">✦ Click to pull & read</span>
            </div>
            <div v-else key="idle" class="status-idle">
              <span class="status-gem">⚜</span>
              <span class="status-text">Select a folio from the shelf to explore • เลือกหนังสือที่ชั้นเพื่อเปิดอ่าน</span>
              <span class="status-gem">⚜</span>
            </div>
          </transition>
        </div>

        <!-- Sleek Roman Numeral Folio Indicator -->
        <div class="console-nav">
          <span class="indicator-label">MANUSCRIPTS</span>
          <div class="indicator-pills">
            <button
              v-for="(p, idx) in PROJECTS"
              :key="p.id"
              class="indicator-dot"
              :class="{ 'is-hovered': hoveredIndex === idx, 'is-active': activeIndex === idx }"
              @click="selectBook(idx)"
              :title="p.title"
            >
              <span class="dot-num">{{ romanNumerals[idx] }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- READING MODE CONTROLS -->
      <div v-else class="reading-controls">
        <div class="reading-nav">
          <button class="nav-arrow" @click="prevBook" title="Previous Folio">← PREV</button>
          <div class="reading-info">
            <span class="info-roman">FOLIO {{ currentRoman }}</span>
            <span class="info-sep">/</span>
            <span class="info-title">{{ currentProject.title }}</span>
          </div>
          <button class="nav-arrow" @click="nextBook" title="Next Folio">NEXT →</button>
        </div>

        <div class="reading-actions">
          <button class="chronicle-btn" @click="selectedProject = currentProject" title="View Full Architectural Chronicle">
            <span>📜 Chronicle & Craft</span>
          </button>
          <button class="return-shelf-btn" @click="returnToShelf" title="Return to Shelf">
            <span>✕ Return to Shelf</span>
          </button>
        </div>
      </div>
    </footer>

    <!-- Modals -->
    <ProjectModal :project="selectedProject" @close="selectedProject = null" />
    <AboutModal :show="showAboutModal" @close="showAboutModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import WebGPUCanvas from './components/WebGPUCanvas.vue';
import Navigation from './components/Navigation.vue';
import ProjectModal from './components/ProjectModal.vue';
import AboutModal from './components/AboutModal.vue';
import { PROJECTS, type ProjectItem } from './data/projects';

const webgpuCanvasRef = ref<InstanceType<typeof WebGPUCanvas> | null>(null);

const activeIndex = ref<number>(0);
const hoveredIndex = ref<number | null>(null);
const selectedProject = ref<ProjectItem | null>(null);
const showAboutModal = ref<boolean>(false);
const backendName = ref<string>('Initializing...');
const isWebGPU = ref<boolean>(false);
const isBookOpen = ref<boolean>(false);

const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
const currentRoman = computed(() => romanNumerals[activeIndex.value] || 'I');
const currentProject = computed(() => PROJECTS[activeIndex.value] || PROJECTS[0]);
const hoveredProject = computed(() => (hoveredIndex.value !== null ? PROJECTS[hoveredIndex.value] : null));

const onBackendReady = (backend: string) => {
  backendName.value = backend;
  isWebGPU.value = backend.includes('WebGPU');
};

const onBookOpenChange = (isOpen: boolean) => {
  isBookOpen.value = isOpen;
};

const onHoverBookChange = (index: number | null) => {
  hoveredIndex.value = index;
};

const onSelectProject = (project: ProjectItem) => {
  selectedProject.value = project;
};

const onActiveIndexChange = (index: number) => {
  const clamped = Math.max(0, Math.min(PROJECTS.length - 1, index));
  activeIndex.value = clamped;
};

const onWheelDelta = (dir: number) => {
  if (isBookOpen.value) {
    if (dir > 0) nextBook();
    else prevBook();
  } else {
    // In shelf mode: cycle active book
    const nextIdx = (activeIndex.value + dir + PROJECTS.length) % PROJECTS.length;
    activeIndex.value = nextIdx;
  }
};

const selectBook = (index: number) => {
  activeIndex.value = index;
  if (webgpuCanvasRef.value) {
    webgpuCanvasRef.value.selectBookFromShelf(index);
  }
};

const returnToShelf = () => {
  if (webgpuCanvasRef.value) {
    webgpuCanvasRef.value.returnBookToShelf();
  }
};

const prevBook = () => {
  const nextIdx = (activeIndex.value - 1 + PROJECTS.length) % PROJECTS.length;
  selectBook(nextIdx);
};

const nextBook = () => {
  const nextIdx = (activeIndex.value + 1) % PROJECTS.length;
  selectBook(nextIdx);
};
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Bottom Bar Dock */
.bottom-bar {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  max-width: 90vw;
}

/* Unified Renaissance Console (Eliminates eye-jumping between top and bottom) */
.shelf-console {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.console-status {
  background: rgba(18, 12, 7, 0.86);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999px;
  padding: 8px 24px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(212, 175, 55, 0.12);
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-idle {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ebdcc6;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.status-gem {
  color: #d4af37;
  font-size: 14px;
}

.status-hover {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.status-roman {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #d4af37;
}

.status-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 500;
  color: #fff9ee;
  letter-spacing: 0.08em;
}

.status-sep {
  color: rgba(212, 175, 55, 0.4);
  font-size: 12px;
}

.status-sub {
  font-family: var(--font-body);
  font-size: 12px;
  color: #cfbeaa;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-hint {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #1a0e05;
  background: #d4af37;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
}

/* Console Nav - Minimalist Folio Indicator */
.console-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(18, 12, 7, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 999px;
  padding: 5px 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

.indicator-label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #c7b08f;
}

.indicator-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #e5d7c3;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.05em;
}

.indicator-dot:hover,
.indicator-dot.is-hovered {
  border-color: #d4af37;
  color: #1a0f07;
  background: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.7);
}

.indicator-dot.is-active {
  border-color: #d4af37;
  color: #fff8eb;
  background: rgba(212, 175, 55, 0.28);
}

/* Reading Mode Controls */
.reading-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: min(840px, 92vw);
  background: rgba(18, 12, 7, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999px;
  padding: 8px 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.12);
  pointer-events: auto;
}

.reading-nav {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-arrow {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  padding: 6px 14px;
  color: #e5d8c3;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  transition: all 0.25s ease;
}

.nav-arrow:hover {
  background: #d4af37;
  color: #1a0e05;
}

.reading-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: var(--font-display);
  color: #fff4e0;
}

.info-roman {
  font-size: 14px;
  font-weight: 600;
  color: #d4af37;
}

.info-sep {
  opacity: 0.5;
  font-size: 12px;
}

.info-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.reading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chronicle-btn {
  background: rgba(212, 175, 55, 0.18);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 999px;
  padding: 6px 16px;
  color: #fff8ee;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: all 0.25s ease;
}

.chronicle-btn:hover {
  background: #d4af37;
  color: #1a0e05;
}

.return-shelf-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  padding: 6px 16px;
  color: #e5d8c3;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition: all 0.25s ease;
}

.return-shelf-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* Animations */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .status-sub {
    display: none;
  }
  .status-sep {
    display: none;
  }
  .reading-controls {
    flex-direction: column;
    gap: 10px;
    padding: 12px 18px;
    border-radius: 16px;
  }
}
</style>
