# 🏛️ Renaissance Digital Archive — WebGPU Portfolio

Highly Optimized WebGPU + Three.js + Vue 3 Portfolio for **Phuwadon Thontra**, inspired by the tactile, illustration-driven interaction philosophy of **Justine Soulié & Patrick Heng**.

## ✨ Key Features & Technical Highlights

1. **"The Canvas is the UI"**
   - Every project is a 3D archival manuscript tablet with procedural Renaissance engravings, architectural arches, Roman numerals, and tailored palettes.
   - **Soft Gel / Elastic Inertia**: Uses Three.js TSL (Three Shading Language) vertex node displacement (`sin(uv.x * PI) * sin(uv.y * PI) * uVelocity`) to bend the plates dynamically like soft rubber when scrolling or dragging.
   - **3D Parallax & Cursor Tilt**: Plates tilt towards the mouse in real-time with smooth spring damping.

2. **WebGPU Core with Auto WebGL2 Fallback**
   - Built on `three/webgpu` `WebGPURenderer`.
   - Automatically detects whether the user's browser/GPU supports WebGPU; if not, falls back to WebGL2 seamlessly with zero configuration.

3. **Renaissance Atmosphere & Golden Dust Simulation**
   - 7,000 floating golden ambient particles simulating candlelit and sunlit dust motes inside an ancient library.
   - Particles have gentle convective upward drift and gravitational attraction towards the cursor.

4. **Extreme Optimization (60–120 FPS)**
   - **Adaptive DPR Clamping**: Clamped to `Math.min(window.devicePixelRatio, 1.5)` to protect mobile GPUs and Retina displays from overheating.
   - **Idle Render Throttling**: Automatically detects when velocity settles and cursor is stationary (< 0.0005 delta for 100 frames). It puts the RAF loop to sleep, dropping GPU consumption to 0% when idle! Wakes up instantly on interaction.
   - **Frustum Culling**: Off-screen tablets have `mesh.visible = false`, cutting draw calls and vertex computations.
   - **Full Disposal Lifecycle**: Cleans up textures, geometries, materials, and renderer on unmount to eliminate memory leaks.

5. **Art Direction & Aesthetics**
   - **Main Font**: `Metamorphous` (Classical Romanesque/Renaissance stone-carved serif)
   - **Secondary Font**: `Inter` (Crisp modern grotesque)
   - **Color Palettes**: 5 Renaissance themes (*Landscape*, *Classical Bust*, *Portrait*, *Baroque Fresco*, *Classical Ruins*) anchored by `#927A5F` background.

---

## 🚀 How to Run

```bash
# Navigate to project
cd /home/aslpooht/PROJECT/WEBSITE/portfolio-webgpu

# Start Vite Dev Server
bun run dev

# Or build for production
bun run build
bun run preview
```
