<template>
  <div class="interactive-canvas-wrapper">
    <!-- 3D Floating Spring Cards Canvas Container -->
    <div
      ref="containerRef"
      id="webgpu-canvas-container"
      @click="handleClick"
      @pointermove="handlePointerMove"
      @wheel.passive="handleWheel"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { DragGesture } from '@use-gesture/vanilla';
import { WebGPUEngine } from '../webgpu/WebGPUEngine';
import type { ProjectItem } from '../data/projects';

const props = defineProps<{
  projects?: ProjectItem[];
}>();

const emit = defineEmits<{
  (e: 'select-project', project: ProjectItem): void;
  (e: 'active-index-change', index: number): void;
  (e: 'wheel-delta', dir: number): void;
  (e: 'hover-book-change', index: number | null): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
let engine: WebGPUEngine | null = null;
let dragGesture: DragGesture | null = null;
let lastWheelTime = 0;

onMounted(async () => {
  if (containerRef.value) {
    engine = new WebGPUEngine(
      containerRef.value,
      {
        onSelectProject: (project) => emit('select-project', project),
        onActiveIndexChange: (index) => emit('active-index-change', index),
        onHoverBookChange: (index) => emit('hover-book-change', index)
      },
      props.projects
    );

    await engine.init();

    // Attach Touch / Pointer Drag gestures with direct spring momentum
    dragGesture = new DragGesture(
      containerRef.value,
      ({ delta: [dx], xy: [x, y], dragging, last }) => {
        if (!engine || !containerRef.value) return;
        const rect = containerRef.value.getBoundingClientRect();
        const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((y - rect.top) / rect.height) * 2 + 1;
        engine.updatePointer(ndcX, ndcY, dragging);

        if (dragging && Math.abs(dx) > 0) {
          engine.applyDragDelta(dx);
        }
        if (last) {
          engine.endDrag();
        }
      },
      { eventOptions: { passive: false } }
    );
  }
});

const handlePointerMove = (e: PointerEvent) => {
  if (engine && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    engine.updatePointer(ndcX, ndcY);
  }
};

const handleWheel = (e: WheelEvent) => {
  const now = performance.now();
  if (now - lastWheelTime < 240) return;
  if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
    const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
    lastWheelTime = now;
    if (engine) {
      engine.applyWheelDelta(dir);
    }
    emit('wheel-delta', dir);
  }
};

const handleClick = (e: MouseEvent) => {
  if (engine) {
    engine.handleClick(e);
  }
};

const wakeUp = () => {
  if (engine) {
    engine.wakeUp();
  }
};

const selectProject = (index: number) => {
  if (engine) {
    engine.selectProject(index);
  }
};

const resetCarousel = () => {
  selectProject(0);
};

defineExpose({
  wakeUp,
  selectProject,
  resetCarousel
});

onBeforeUnmount(() => {
  if (dragGesture) {
    dragGesture.destroy();
    dragGesture = null;
  }
  if (engine) {
    engine.dispose();
    engine = null;
  }
});
</script>

<style scoped>
.interactive-canvas-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
}

#webgpu-canvas-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: auto;
}
</style>
