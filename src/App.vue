<template>
  <div class="app-root">
    <!-- Subtle Film Noise Texture Overlay (Justine Soulié Aesthetic) -->
    <div class="noise-overlay" aria-hidden="true"></div>

    <!-- WebGPU Canvas Layer (Patrick Heng Style 3D Spring Card Carousel) -->
    <WebGPUCanvas
      ref="webgpuCanvasRef"
      @select-project="onSelectProject"
      @active-index-change="onActiveIndexChange"
      @wheel-delta="onWheelDelta"
      @backend-ready="onBackendReady"
      @hover-book-change="onHoverBookChange"
    />

    <!-- Minimal Header (Navigation) -->
    <Navigation
      :backend-name="backendName"
      :is-web-g-p-u="isWebGPU"
      @open-about="showAboutModal = true"
    />

    <!-- Signature Justine Soulié Bottom Showcase Bar (.work-names) -->
    <footer class="work-names interactive">
      <div class="work-names__content">
        <!-- Interactive Project Title with Click Action -->
        <button class="work-names__title-btn" @click="openActiveProject" title="View Project Case Study">
          <transition name="title-slide" mode="out-in">
            <h1 :key="currentProject.id" class="work-names__title">
              {{ currentProject.title }}
            </h1>
          </transition>
        </button>

        <!-- Signature Justine Soulié Thunder / Lightning SVG Stroke -->
        <div class="work-names__bar">
          <svg width="311" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <!-- Project Meta / Type / Year -->
        <div class="work-names__type">
          <span class="type-category">{{ currentProject.category }}</span>
          <span class="type-sep">•</span>
          <span class="type-stats">{{ currentProject.stats }}</span>
          <span class="type-sep">•</span>
          <span class="type-year">{{ currentProject.year }}</span>
        </div>

        <!-- Action & Navigation Controls -->
        <div class="work-names__controls">
          <!-- Quick Index Pagination Pills -->
          <div class="index-pills">
            <button
              v-for="(p, idx) in PROJECTS"
              :key="p.id"
              class="pill-btn"
              :class="{ 'is-active': activeIndex === idx }"
              @click="selectProjectIndex(idx)"
              :title="p.title"
            >
              <span class="pill-num">0{{ idx + 1 }}</span>
            </button>
          </div>

          <!-- Open Case Study CTA -->
          <button class="case-cta-btn" @click="openActiveProject">
            <span>Open Case Study</span>
            <span class="cta-arrow">↗</span>
          </button>
        </div>
      </div>

      <!-- Interactive Fluid & Navigation Guide -->
      <div class="drag-hint">
        <span>← INTERACTIVE FLUID DYNAMICS ARCHIVE • DRAG OR MOVE MOUSE TO SWIRL LIQUID →</span>
      </div>
    </footer>

    <!-- Case Study & About Modals -->
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
const backendName = ref<string>('Initializing WebGPU...');
const isWebGPU = ref<boolean>(false);

const currentProject = computed<ProjectItem>(() => {
  return PROJECTS[activeIndex.value] || PROJECTS[0];
});

const onSelectProject = (project: ProjectItem) => {
  selectedProject.value = project;
};

const onActiveIndexChange = (index: number) => {
  activeIndex.value = index;
};

const onHoverBookChange = (index: number | null) => {
  hoveredIndex.value = index;
};

const onWheelDelta = (_dir: number) => {
  // Wheel physics handled inside engine
};

const onBackendReady = (backend: string) => {
  backendName.value = backend;
  isWebGPU.value = backend.includes('WebGPU');
};

const selectProjectIndex = (index: number) => {
  activeIndex.value = index;
  if (webgpuCanvasRef.value) {
    webgpuCanvasRef.value.selectBookFromShelf(index);
  }
};

const openActiveProject = () => {
  selectedProject.value = currentProject.value;
};
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f4f0ed;
}

/* Subtle Film Noise Texture Overlay (Pure CSS/SVG) */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.042;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Signature Justine Soulié Bottom Bar (.work-names) */
.work-names {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 48px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.work-names__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: auto;
}

.work-names__title-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.work-names__title {
  font-family: var(--font-display);
  font-size: clamp(34px, 5.2vw, 68px);
  font-weight: 700;
  color: #252422;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1), color 0.25s ease;
}

.work-names__title-btn:hover .work-names__title {
  color: #e56b55;
  transform: translateY(-2px);
}

/* Signature Lightning SVG Divider */
.work-names__bar {
  margin: 12px 0 10px;
  color: #252422;
  opacity: 0.85;
}

.work-names__bar svg {
  display: block;
  width: clamp(200px, 24vw, 311px);
  height: auto;
}

.work-names__type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8c8080;
  margin-bottom: 16px;
}

.type-sep {
  opacity: 0.4;
}

.work-names__controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Index Pagination Pills */
.index-pills {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #8c8080;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  color: #252422;
}

.pill-btn.is-active {
  color: #252422;
}

.pill-btn.is-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #252422;
  border-radius: 1px;
}

/* Open Case Study CTA Button */
.case-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  background: #252422;
  border: 1px solid #252422;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.case-cta-btn:hover {
  background: #e56b55;
  border-color: #e56b55;
  transform: translateY(-1px);
}

.cta-arrow {
  font-size: 13px;
  transition: transform 0.2s ease;
}

.case-cta-btn:hover .cta-arrow {
  transform: translate(2px, -2px);
}

/* Subtle Bottom Drag Hint */
.drag-hint {
  margin-top: 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: #b0a8a0;
  text-transform: uppercase;
}

/* Title Transition */
.title-slide-enter-active,
.title-slide-leave-active {
  transition: all 0.24s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.title-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.title-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .work-names {
    padding: 0 20px 24px;
  }
  .work-names__type {
    font-size: 11px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .type-stats {
    display: none;
  }
  .drag-hint {
    display: none;
  }
}
</style>
