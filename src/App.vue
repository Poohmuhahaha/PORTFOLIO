<template>
  <div class="app-root">
    <!-- WebGPU Canvas Layer (Interactive 3D Renaissance Library & Bookshelf) -->
    <WebGPUCanvas
      ref="webgpuCanvasRef"
      @select-project="onSelectProject"
      @active-index-change="onActiveIndexChange"
      @scroll-delta="onScrollDelta"
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

    <!-- Shelf Hover Card (Patrick Heng editorial typography when hovering 3D books) -->
    <transition name="fade">
      <div v-if="!isBookOpen && hoveredProject" class="shelf-hover-card">
        <span class="hover-roman">FOLIO {{ romanNumerals[hoveredIndex ?? 0] }}</span>
        <h2 class="hover-title">{{ hoveredProject.title }}</h2>
        <p class="hover-sub">{{ hoveredProject.subtitle }}</p>
        <span class="hover-action">✦ Click to pull folio from shelf & read ✦</span>
      </div>
    </transition>

    <!-- Initial Instruction Guide when viewing the shelf (High contrast frosted pill over desk) -->
    <transition name="fade">
      <div v-if="!isBookOpen && hoveredIndex === null" class="shelf-guide">
        <span class="guide-gem">⚜</span>
        <span class="guide-text">Select a folio from the shelf • เลือกหนังสือที่ชั้นเพื่อเปิดอ่าน</span>
      </div>
    </transition>

    <!-- Bottom Controls (Shelf Mode vs Reading Mode) -->
    <footer class="bottom-bar interactive">
      <!-- SHELF MODE: Minimalist Patrick Heng Folio Indicator (Canvas is the UI!) -->
      <div v-if="!isBookOpen" class="shelf-indicator-bar">
        <span class="indicator-label">FOLIOS</span>
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

        <button class="return-shelf-btn" @click="returnToShelf">
          <span>✕ Return to Shelf (เก็บเข้าชั้น)</span>
        </button>
      </div>
    </footer>

    <!-- Modals -->
    <ProjectModal :project="selectedProject" @close="selectedProject = null" />
    <AboutModal :show="showAboutModal" @close="showAboutModal = false" />

    <!-- Virtual scroll container for Lenis -->
    <div class="scroll-track" ref="scrollTrackRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Lenis from 'lenis';
import WebGPUCanvas from './components/WebGPUCanvas.vue';
import Navigation from './components/Navigation.vue';
import ProjectModal from './components/ProjectModal.vue';
import AboutModal from './components/AboutModal.vue';
import { PROJECTS, type ProjectItem } from './data/projects';

const webgpuCanvasRef = ref<InstanceType<typeof WebGPUCanvas> | null>(null);
const scrollTrackRef = ref<HTMLElement | null>(null);

const activeIndex = ref<number>(0);
const hoveredIndex = ref<number | null>(null);
const selectedProject = ref<ProjectItem | null>(null);
const showAboutModal = ref<boolean>(false);
const backendName = ref<string>('Initializing...');
const isWebGPU = ref<boolean>(false);
const isBookOpen = ref<boolean>(false);

let lenis: Lenis | null = null;
let rafId: number | null = null;

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

onMounted(() => {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5
  });

  lenis.on('scroll', (e: any) => {
    if (webgpuCanvasRef.value) {
      webgpuCanvasRef.value.updateScroll(e.progress, e.velocity);
    }
  });

  const update = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(update);
  };
  rafId = requestAnimationFrame(update);
});

const onSelectProject = (project: ProjectItem) => {
  selectedProject.value = project;
};

const onActiveIndexChange = (index: number) => {
  const clamped = Math.max(0, Math.min(PROJECTS.length - 1, index));
  activeIndex.value = clamped;
};

const onScrollDelta = (delta: number) => {
  if (lenis) {
    lenis.scrollTo(window.scrollY + delta * 250, { immediate: false });
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

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
});
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.scroll-track {
  height: 480vh;
  pointer-events: none;
}

/* Shelf Hover Card (Luxury Chiaroscuro Editorial Card) */
.shelf-hover-card {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 45;
  background: rgba(18, 11, 7, 0.86);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 12px;
  padding: 18px 38px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(212, 175, 55, 0.2);
  pointer-events: none;
  min-width: 320px;
}

.hover-roman {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #d4af37;
  text-transform: uppercase;
}

.hover-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
  color: #fff9ee;
  margin: 6px 0 3px 0;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.hover-sub {
  font-family: var(--font-body);
  font-size: 13px;
  color: #d2bc9e;
  margin: 0 0 12px 0;
  letter-spacing: 0.04em;
}

.hover-action {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: #f7eedd;
  background: rgba(212, 175, 55, 0.22);
  border: 1px solid rgba(212, 175, 55, 0.45);
  padding: 4px 14px;
  border-radius: 999px;
  text-transform: uppercase;
}

/* Shelf Guide Banner (High-contrast frosted pill resting above desk blotter) */
.shelf-guide {
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f5ecd8;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  background: rgba(18, 12, 7, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999px;
  padding: 10px 24px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.12);
  pointer-events: none;
  white-space: nowrap;
}

.guide-gem {
  color: #d4af37;
  font-size: 15px;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 28px;
  left: 40px;
  right: 40px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Minimalist Patrick Heng Folio Indicator */
.shelf-indicator-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(18, 12, 7, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  padding: 6px 18px;
  pointer-events: auto;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55), 0 0 14px rgba(212, 175, 55, 0.1);
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
}

.reading-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-arrow {
  background: rgba(36, 20, 10, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(198, 162, 88, 0.3);
  border-radius: 4px;
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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.info-roman {
  font-size: 16px;
  font-weight: 600;
  color: #d4af37;
}

.info-sep {
  opacity: 0.5;
  font-size: 12px;
}

.info-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.return-shelf-btn {
  background: rgba(45, 26, 14, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid #c6a258;
  border-radius: 20px;
  padding: 8px 22px;
  color: #fff4db;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.return-shelf-btn:hover {
  background: #d4af37;
  color: #1a0e05;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.6);
  transform: translateY(-1px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@media (max-width: 900px) {
  .shelf-tag {
    display: none;
  }
  .btn-title {
    display: none;
  }
}

@media (max-width: 640px) {
  .bottom-bar {
    bottom: 16px;
    left: 16px;
    right: 16px;
  }
  .shelf-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  .reading-controls {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
