<template>
  <div class="app-root">
    <!-- Subtle Film Noise Texture Overlay (Justine Soulié Aesthetic) -->
    <div class="noise-overlay" aria-hidden="true"></div>

    <!-- WebGPU Canvas Layer (Patrick Heng Style 3D Spring Card Carousel + Navier-Stokes Fluid) -->
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

    <!-- Signature Justine Soulié Minimalist Bottom Bar (.work-names) -->
    <footer class="work-names">
      <button
        class="work-names__content"
        @click="openActiveProject"
        title="View Project Case Study"
      >
        <transition name="meta-fade" mode="out-in">
          <div :key="currentProject.id" class="work-names__meta">
            <h1 class="work-names__title">{{ currentProject.title.toLowerCase() }}</h1>
            <p class="work-names__subtitle">{{ currentProject.subtitle.toLowerCase() }}</p>
          </div>
        </transition>
      </button>
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
  opacity: 0.038;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Signature Justine Soulié Bottom Bar (.work-names) */
.work-names {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 24px 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.work-names__content {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: auto;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.work-names__content:hover {
  transform: translateY(-2px);
}

.work-names__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.work-names__title {
  font-family: var(--font-body);
  font-size: clamp(18px, 1.7vw, 23px);
  font-weight: 700;
  color: #252422;
  letter-spacing: -0.015em;
  line-height: 1.2;
  margin: 0;
  transition: color 0.2s ease;
}

.work-names__content:hover .work-names__title {
  color: #e56b55;
}

.work-names__subtitle {
  font-family: var(--font-body);
  font-size: clamp(12px, 1.1vw, 14px);
  font-weight: 400;
  color: #8c8080;
  letter-spacing: 0.01em;
  margin: 0;
}

/* Smooth Fade/Slide for Active Project Transitions */
.meta-fade-enter-active,
.meta-fade-leave-active {
  transition: all 0.22s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.meta-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.meta-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  .work-names {
    padding: 0 16px 24px;
  }
}
</style>
