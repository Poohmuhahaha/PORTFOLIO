<template>
  <div
    ref="containerRef"
    id="webgpu-canvas-container"
    @click="handleClick"
    @pointermove="handlePointerMove"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { DragGesture } from '@use-gesture/vanilla';
import { WebGPUEngine } from '../webgpu/WebGPUEngine';
import type { ProjectItem } from '../data/projects';

const emit = defineEmits<{
  (e: 'select-project', project: ProjectItem): void;
  (e: 'active-index-change', index: number): void;
  (e: 'scroll-delta', delta: number): void;
  (e: 'backend-ready', backend: string): void;
  (e: 'book-open-change', isOpen: boolean): void;
  (e: 'hover-book-change', index: number | null): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
let engine: WebGPUEngine | null = null;
let dragGesture: DragGesture | null = null;

onMounted(async () => {
  if (!containerRef.value) return;

  engine = new WebGPUEngine(containerRef.value, {
    onSelectProject: (project) => emit('select-project', project),
    onActiveIndexChange: (index) => emit('active-index-change', index),
    onBackendReady: (backend) => emit('backend-ready', backend),
    onBookOpenChange: (isOpen) => emit('book-open-change', isOpen),
    onHoverBookChange: (index) => emit('hover-book-change', index)
  });

  await engine.init();

  // Attach Touch / Pointer Drag gestures with soft inertia
  dragGesture = new DragGesture(
    containerRef.value,
    ({ velocity: [, vy], direction: [, dy], dragging }) => {
      if (!engine) return;

      if (dragging) {
        // Drag translates to smooth scroll offset
        const dragFactor = -dy * vy * 0.04;
        emit('scroll-delta', dragFactor);
        engine.updatePointer(0, 0, true);
      }
    },
    { eventOptions: { passive: false } }
  );
});

const handlePointerMove = (e: PointerEvent) => {
  if (!engine || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  engine.updatePointer(ndcX, ndcY);
};

const handleClick = (e: MouseEvent) => {
  if (engine) {
    engine.handleClick(e);
  }
};

const updateScroll = (progress: number, velocity: number) => {
  if (engine) {
    engine.updateScroll(progress, velocity);
  }
};

const wakeUp = () => {
  if (engine) {
    engine.wakeUp();
  }
};

const selectBookFromShelf = (index: number) => {
  if (engine) {
    engine.selectBookFromShelf(index);
  }
};

const returnBookToShelf = () => {
  if (engine) {
    engine.returnBookToShelf();
  }
};

const toggleBookRead = () => {
  if (engine) {
    engine.toggleBookRead();
  }
};

defineExpose({
  updateScroll,
  wakeUp,
  selectBookFromShelf,
  returnBookToShelf,
  toggleBookRead
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
#webgpu-canvas-container {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
  overflow: hidden;
}
</style>
