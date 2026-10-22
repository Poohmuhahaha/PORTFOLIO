<template>
  <Teleport to="body">
    <Transition name="case-slide">
      <div v-if="project" class="case-study-root" @keydown.esc="$emit('close')">
        <!-- Persistent Top Header -->
        <header class="case-header">
          <button class="brand-link" @click="$emit('close')">
            <span>PHUWADON THONTRA</span>
          </button>

          <div class="header-actions">
            <button class="header-btn" @click="$emit('open-about')">
              <span>ABOUT</span>
              <div class="nav-svg-c">
                <svg width="48" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2.2" />
                </svg>
              </div>
            </button>
            <button class="close-icon-btn" @click="$emit('close')" aria-label="Close Case Study">
              <span>✕</span>
            </button>
          </div>
        </header>

        <!-- Main Horizontal Scroll Showcase Track -->
        <div class="case-track" ref="trackRef" @wheel.passive="handleTrackWheel">
          <!-- 1. Left Hero Panel: Floating Paper Poster on Tinted Background -->
          <section
            class="case-panel panel-hero"
            :style="{ backgroundColor: project.color || '#cbdde4' }"
          >
            <div class="hero-poster-wrapper">
              <img
                :src="project.posterImage"
                :alt="project.title"
                class="hero-poster-img"
              />
            </div>
          </section>

          <!-- 2. Dark Editorial Column: Title, Narrative & Credits (Black Background) -->
          <section class="case-panel panel-info">
            <div class="info-content">
              <h1 class="info-title">{{ project.shortTitle || project.title }}</h1>
              <h2 class="info-subtitle">{{ (project.subtitle || project.category).toUpperCase() }}</h2>

              <p class="info-description">{{ project.description }}</p>

              <!-- Signature Justine Soulié Thunder / Lightning Stroke -->
              <div class="info-thunder">
                <svg width="240" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>

              <!-- Structured Credits Block -->
              <dl class="info-credits">
                <div v-for="(credit, idx) in project.credits" :key="idx" class="credit-row">
                  <dt class="credit-label">{{ credit.type }}</dt>
                  <dd class="credit-val">
                    <a
                      v-if="credit.url"
                      :href="credit.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="credit-link"
                    >
                      {{ credit.name }}
                    </a>
                    <span v-else>{{ credit.name }}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Scroll indicator -->
            <div class="scroll-cue">
              <span>SCROLL TO SEE MORE &gt;&gt;&gt;</span>
            </div>
          </section>

          <!-- 3. Technical Specifications & Highlights Panel (Editorial Ivory Background) -->
          <section class="case-panel panel-highlights">
            <div class="highlights-content">
              <div class="highlights-header">
                <span class="highlights-badge">{{ project.category.toUpperCase() }}</span>
                <h3 class="highlights-title">TECHNICAL HIGHLIGHTS</h3>
                <p class="highlights-stat" v-if="project.stats">{{ project.stats }}</p>
              </div>

              <!-- Interactive Fluid Canvas for Hydro Core -->
              <div v-if="project.id === 'hydro-core'" class="fluid-demo-box">
                <div class="fluid-demo-header">
                  <span>LIVE GPU FLUID DYNAMICS (CLICK & DRAG TO SWIRL)</span>
                </div>
                <canvas ref="modalFluidCanvas" class="modal-fluid-canvas"></canvas>
              </div>

              <!-- Bullet Points -->
              <div class="highlights-list" v-if="project.highlights && project.highlights.length">
                <div
                  v-for="(point, idx) in project.highlights"
                  :key="idx"
                  class="highlight-item"
                >
                  <span class="highlight-bullet">✦</span>
                  <p class="highlight-text">{{ point }}</p>
                </div>
              </div>

              <!-- Live Links -->
              <div class="action-buttons-row">
                <a
                  v-if="project.githubUrl"
                  :href="project.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="case-action-btn primary"
                >
                  <span>GITHUB REPO ↗</span>
                </a>
                <a
                  v-if="project.liveUrl && project.liveUrl !== project.githubUrl"
                  :href="project.liveUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="case-action-btn secondary"
                >
                  <span>LIVE PLATFORM ↗</span>
                </a>
              </div>
            </div>
          </section>

          <!-- 4. Next Project Transition Column -->
          <section class="case-panel panel-next" @click="goToNext">
            <div class="next-content">
              <span class="next-label">next</span>
              <div class="next-card">
                <img :src="nextProject.posterImage" :alt="nextProject.title" class="next-img" />
              </div>
              <div class="next-meta">
                <h3 class="next-title">{{ nextProject.title.toLowerCase() }}</h3>
                <!-- Thunder stroke -->
                <div class="next-thunder">
                  <svg width="180" height="6" viewBox="0 0 311 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 1H155.026L144.122 5H311" stroke="currentColor" stroke-width="2" />
                  </svg>
                </div>
                <p class="next-sub">{{ nextProject.subtitle.toLowerCase() }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { PROJECTS, type ProjectItem } from '../data/projects';
import { FluidSimulation } from '../webgpu/FluidSimulation';

const props = defineProps<{
  project: ProjectItem | null;
  projects?: ProjectItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-project', project: ProjectItem): void;
  (e: 'open-about'): void;
}>();

const trackRef = ref<HTMLElement | null>(null);
const modalFluidCanvas = ref<HTMLCanvasElement | null>(null);
let modalFluidSim: FluidSimulation | null = null;

const allProjects = computed(() => (props.projects && props.projects.length > 0 ? props.projects : PROJECTS));

const currentIndex = computed(() => {
  if (!props.project) return 0;
  return allProjects.value.findIndex((p) => p.id === props.project!.id);
});

const nextProject = computed(() => {
  const list = allProjects.value;
  const nextIdx = (currentIndex.value + 1) % list.length;
  return list[nextIdx] || list[0];
});

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    e.preventDefault();
    emit('close');
  }
};

watch(
  () => props.project,
  async (newProj) => {
    if (newProj) {
      window.addEventListener('keydown', onKeyDown);
    } else {
      window.removeEventListener('keydown', onKeyDown);
    }

    if (modalFluidSim) {
      modalFluidSim.dispose();
      modalFluidSim = null;
    }

    if (newProj && newProj.id === 'hydro-core') {
      await nextTick();
      if (modalFluidCanvas.value) {
        try {
          modalFluidSim = new FluidSimulation(modalFluidCanvas.value);
          // Splat introductory dye burst
          setTimeout(() => {
            if (modalFluidSim) {
              modalFluidSim.splat(0.5, 0.5, 300, 300);
            }
          }, 300);
        } catch (err) {
          console.warn('Modal fluid sim init error:', err);
        }
      }
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (modalFluidSim) {
    modalFluidSim.dispose();
    modalFluidSim = null;
  }
});

const handleTrackWheel = (e: WheelEvent) => {
  if (trackRef.value) {
    trackRef.value.scrollLeft += e.deltaY * 1.5 || e.deltaX * 1.5;
  }
};

const goToNext = () => {
  emit('select-project', nextProject.value);
  if (trackRef.value) {
    trackRef.value.scrollTo({ left: 0, behavior: 'smooth' });
  }
};
</script>

<style scoped>
.case-study-root {
  position: fixed;
  inset: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-body);
}

/* Header */
.case-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 48px;
  pointer-events: none;
}

.brand-link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #252422;
  cursor: pointer;
  pointer-events: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 28px;
  pointer-events: auto;
}

.header-btn {
  position: relative;
  background: none;
  border: none;
  padding: 4px 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #ffffff;
  cursor: pointer;
}

.close-icon-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 20px;
  font-weight: 300;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.close-icon-btn:hover {
  transform: rotate(90deg);
}

.nav-svg-c {
  position: absolute;
  bottom: -4px;
  left: 0;
  opacity: 0;
  transform: translateY(2px);
  transition: all 0.24s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.header-btn:hover .nav-svg-c {
  opacity: 1;
  transform: translateY(0);
}

/* Horizontal Track */
.case-track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: none;
  scrollbar-width: none;
}

.case-track::-webkit-scrollbar {
  display: none;
}

.case-panel {
  flex-shrink: 0;
  height: 100%;
}

/* Panel 1: Hero Poster */
.panel-hero {
  width: 42vw;
  min-width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.hero-poster-wrapper {
  position: relative;
  width: min(72%, 460px);
  aspect-ratio: 1 / 1.36;
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.22));
}

.hero-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

/* Panel 2: Dark Editorial Column */
.panel-info {
  width: 42vw;
  min-width: 460px;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 60px;
  position: relative;
  text-align: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 440px;
}

.info-title {
  font-family: var(--font-body);
  font-size: clamp(48px, 6vw, 76px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1;
  color: #ffffff;
}

.info-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: #ffffff;
  margin: 16px 0 28px;
}

.info-description {
  font-size: 14px;
  line-height: 1.7;
  color: #a8a098;
  margin: 0 0 28px;
  text-align: center;
}

.info-thunder {
  color: #ffffff;
  opacity: 0.75;
  margin-bottom: 32px;
}

.info-thunder svg {
  display: block;
  width: 180px;
  height: auto;
}

.info-credits {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.credit-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.credit-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffffff;
}

.credit-val {
  font-size: 13px;
  color: #a8a098;
}

.credit-link {
  color: #a8a098;
  text-decoration: none;
  transition: color 0.2s ease;
}

.credit-link:hover {
  color: #e56b55;
}

.scroll-cue {
  position: absolute;
  bottom: 24px;
  right: 28px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.4);
}

/* Panel 3: Technical Highlights & Specs */
.panel-highlights {
  min-width: 540px;
  max-width: 680px;
  background-color: #f4f0ed;
  color: #252422;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 60px;
  overflow-y: auto;
}

.highlights-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  gap: 28px;
}

.highlights-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlights-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #8c8080;
}

.highlights-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0;
  color: #252422;
}

.highlights-stat {
  font-size: 13px;
  font-weight: 600;
  color: #635f59;
  letter-spacing: 0.04em;
  margin: 0;
}

/* Fluid Live Demo Box inside Case Study */
.fluid-demo-box {
  width: 100%;
  background: #0b1626;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.fluid-demo-header {
  padding: 10px 16px;
  background: #070e18;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #38bdf8;
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.modal-fluid-canvas {
  width: 100%;
  height: 220px;
  display: block;
  cursor: crosshair;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.highlight-bullet {
  color: #c6b18f;
  font-size: 14px;
  line-height: 1.4;
}

.highlight-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #4a453f;
}

.action-buttons-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.case-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.case-action-btn.primary {
  background: #252422;
  color: #ffffff;
}

.case-action-btn.primary:hover {
  background: #000000;
  transform: translateY(-2px);
}

.case-action-btn.secondary {
  background: transparent;
  color: #252422;
  border: 1px solid #252422;
}

.case-action-btn.secondary:hover {
  background: #252422;
  color: #ffffff;
  transform: translateY(-2px);
}

/* Panel 4: Next Project */
.panel-next {
  width: 38vw;
  min-width: 440px;
  background-color: #f4f0ed;
  color: #252422;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.panel-next:hover {
  background-color: #ede7e1;
}

.next-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.next-label {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #8c8080;
  margin-bottom: 28px;
}

.next-card {
  width: min(68%, 320px);
  aspect-ratio: 1 / 1.36;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.panel-next:hover .next-card {
  transform: translateY(-8px) scale(1.02);
}

.next-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.next-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.next-title {
  font-size: 20px;
  font-weight: 700;
  color: #252422;
  margin: 0;
}

.next-thunder {
  color: #252422;
  margin: 10px 0 8px;
  opacity: 0.8;
}

.next-thunder svg {
  display: block;
}

.next-sub {
  font-size: 13px;
  color: #8c8080;
  margin: 0;
}

/* Transitions */
.case-slide-enter-active,
.case-slide-leave-active {
  transition: all 0.45s cubic-bezier(0.2, 0.8, 0.3, 1);
}

.case-slide-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.case-slide-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

@media (max-width: 900px) {
  .case-track {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .panel-hero,
  .panel-info,
  .panel-gallery,
  .panel-next {
    width: 100%;
    min-width: 100%;
    height: auto;
  }
}
</style>
