import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';
import { PROJECTS, type ProjectItem } from '../data/projects';
import { createLiquidWaveMaterial } from './LiquidWaveShader';

export interface EngineCallbacks {
  onSelectProject?: (project: ProjectItem) => void;
  onActiveIndexChange?: (index: number) => void;
  onBackendReady?: (backend: string) => void;
  onBookOpenChange?: (isOpen: boolean) => void;
  onHoverBookChange?: (index: number | null) => void;
}

interface CardItem {
  project: ProjectItem;
  index: number;
  mesh: THREE.Mesh;
  group: THREE.Group;
  liquidMaterial: THREE.ShaderMaterial;
  hoverProgress: { value: number };
}

/**
 * Patrick Heng & Justine Soulié inspired WebGL/WebGPU Spring Card Engine
 * - Custom GLSL Liquid Wave & Mouse Ripple Distortion Shader
 * - GSAP-driven fluid dampening, inertia & chromatic aberration (RGB Shift)
 * - Dynamic 3D Floating Project Posters with Tactile Drop Shadows
 * - Direct Drag & Flick Momentum with Spring Physics
 */
export class WebGPUEngine {
  private container: HTMLElement;
  private renderer!: WebGPURenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cards: CardItem[] = [];

  // Interaction & Physics
  private callbacks: EngineCallbacks;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private targetMouse = new THREE.Vector2();
  private hoveredIndex: number | null = null;
  private activeIndex = 0;

  // Spring & Drag Physics
  public scrollCurrent = 0;
  public scrollTarget = 0;
  public scrollVelocity = 0;
  public isDragging = false;
  private readonly cardSpacing = 3.85;

  // Animation & Idle Loop
  private rafId: number | null = null;
  public isIdle = false;
  private idleCounter = 0;
  private readonly maxIdleFrames = 90;

  // Cleanup references
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];
  private textures: THREE.Texture[] = [];

  constructor(container: HTMLElement, callbacks: EngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async init(): Promise<void> {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene with transparent background to allow Fluid Dynamics simulation to swirl underneath
    this.scene = new THREE.Scene();

    // 2. Camera Setup (Optimal FOV for vertical editorial posters)
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    this.camera.position.set(0, 0, 7.8);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGPU Renderer initialization with transparent background
    this.renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.container.appendChild(this.renderer.domElement);

    try {
      await this.renderer.init();
      if (this.callbacks.onBackendReady) {
        this.callbacks.onBackendReady('WebGPU (Next-Gen Graphics)');
      }
    } catch {
      if (this.callbacks.onBackendReady) {
        this.callbacks.onBackendReady('WebGL 2.0 (High Performance)');
      }
    }

    // 4. Studio Museum Lighting
    this.setupLighting();

    // 5. Shadow-Receiving Paper Backdrop
    this.buildBackdrop();

    // 6. Build Floating Project Cards with Liquid Wave Shaders
    this.buildCards();

    // 7. Event listeners & Render Loop
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    // Ambient light with soft warm tint
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8e2dc, 1.15);
    this.scene.add(hemiLight);

    // Key directional light creating soft, tactile card drop shadows
    const sunLight = new THREE.DirectionalLight(0xfff9f2, 1.8);
    sunLight.position.set(-6, 9, 8);
    sunLight.target.position.set(0, 0, 0);
    this.scene.add(sunLight.target);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.00015;
    this.scene.add(sunLight);

    // Soft fill light from the lower-right
    const fillLight = new THREE.DirectionalLight(0xf5ebe0, 0.65);
    fillLight.position.set(7, -3, 6);
    this.scene.add(fillLight);
  }

  private buildBackdrop(): void {
    // Large seamless transparent shadow catcher behind cards to let fluid dynamics flow visibly
    const wallGeo = new THREE.PlaneGeometry(38, 26);
    this.geometries.push(wallGeo);

    const wallMat = new THREE.ShadowMaterial({
      opacity: 0.12
    });
    this.materials.push(wallMat);

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0, -0.45);
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  private buildCards(): void {
    const cardW = 3.05;
    const cardH = 4.15;
    const cardD = 0.04;

    PROJECTS.forEach((project, index) => {
      const cardGroup = new THREE.Group();

      // 1. Front Poster Artwork Texture
      const posterTex = this.generateProjectPosterTexture(project, index);

      // 2. Patrick Heng GLSL Liquid Wave Shader Material
      const liquidMat = createLiquidWaveMaterial(posterTex);
      this.materials.push(liquidMat);

      // Subdivided plane mesh for real-time 3D fluid ripple deformation
      const frontPlaneGeo = new THREE.PlaneGeometry(cardW, cardH, 48, 48);
      this.geometries.push(frontPlaneGeo);
      const frontMesh = new THREE.Mesh(frontPlaneGeo, liquidMat);
      frontMesh.position.set(0, 0, 0.01);
      frontMesh.userData = { project, index };
      cardGroup.add(frontMesh);

      // 3. Tactile Backing Plate & Shadow Caster
      const backGeo = new THREE.BoxGeometry(cardW, cardH, cardD);
      this.geometries.push(backGeo);
      const backMat = new THREE.MeshStandardMaterial({
        color: 0xded8d0,
        roughness: 0.85,
        metalness: 0.02
      });
      this.materials.push(backMat);
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.position.set(0, 0, -cardD / 2);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;
      cardGroup.add(backMesh);

      cardGroup.position.set(index * this.cardSpacing, 0, 0);

      this.scene.add(cardGroup);
      this.cards.push({
        project,
        index,
        mesh: frontMesh,
        group: cardGroup,
        liquidMaterial: liquidMat,
        hoverProgress: { value: 0 }
      });
    });
  }

  /**
   * Generates bespoke, high-resolution graphic poster textures for each project
   * in Justine Soulié's award-winning artistic style
   */
  private generateProjectPosterTexture(project: ProjectItem, index: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d')!;

    // 1. Curated Project Base Tone
    const bgGradients: Record<string, [string, string]> = {
      'hydro-core': ['#091426', '#030712'],
      artibition: ['#28221b', '#17130f'],
      huuk: ['#f8f5f0', '#ece4d8'],
      pugu: ['#1e2530', '#10141a'],
      'teenueng-studio': ['#231c19', '#140f0d']
    };

    const isLightCard = project.id === 'huuk';
    const [c1, c2] = bgGradients[project.id] || ['#25201b', '#14110e'];

    const grad = ctx.createLinearGradient(0, 0, 1024, 1400);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1400);

    // 2. Tactile Frame Border
    ctx.strokeStyle = isLightCard ? 'rgba(40, 30, 20, 0.12)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 944, 1320);

    // 3. Top Header Bar: Roman Numeral & Year
    const textColor = isLightCard ? '#252422' : '#f5ebe0';
    const subColor = isLightCard ? '#8c8080' : 'rgba(245, 235, 224, 0.65)';
    const accentColor = project.accentColor || '#e56b55';

    ctx.fillStyle = subColor;
    ctx.font = '500 24px Inter, sans-serif';
    ctx.letterSpacing = '0.12em';
    ctx.fillText(`NO. 0${index + 1}`, 72, 95);
    ctx.textAlign = 'right';
    ctx.fillText(project.year.toUpperCase(), 952, 95);
    ctx.textAlign = 'left';

    // Thin header divider line
    ctx.strokeStyle = isLightCard ? 'rgba(40, 30, 20, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, 120);
    ctx.lineTo(952, 120);
    ctx.stroke();

    // 4. Unique Abstract Creative Artwork per Project
    ctx.save();
    this.renderPosterArt(ctx, project.id, accentColor, isLightCard);
    ctx.restore();

    // 5. Project Category & Tag Pill
    ctx.fillStyle = accentColor;
    ctx.fillRect(72, 1140, 14, 14);

    ctx.fillStyle = subColor;
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText(project.category.toUpperCase(), 102, 1152);

    // 6. Bold Project Title
    ctx.fillStyle = textColor;
    ctx.font = '700 68px Inter, sans-serif';
    ctx.fillText(project.title.toUpperCase(), 72, 1235);

    // 7. Subtitle / One-line craft narrative
    ctx.fillStyle = subColor;
    ctx.font = '400 26px Inter, sans-serif';
    const subText = project.subtitle.length > 42 ? project.subtitle.slice(0, 40) + '...' : project.subtitle;
    ctx.fillText(subText, 72, 1285);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    return texture;
  }

  /**
   * Draws distinct, Patrick Heng / Justine Soulié geometric illustrations per project
   */
  private renderPosterArt(ctx: CanvasRenderingContext2D, id: string, accent: string, _isLight: boolean): void {
    const cx = 512;
    const cy = 620;

    switch (id) {
      case 'hydro-core': {
        // Swirling Navier-Stokes fluid vortices and luminous streamlines
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;

        // Dynamic vortex spirals
        for (let s = 0; s < 5; s++) {
          ctx.beginPath();
          const startAngle = (s * Math.PI * 2) / 5;
          for (let a = 0; a < Math.PI * 4; a += 0.1) {
            const r = 20 + a * 22;
            const px = cx + Math.cos(startAngle + a) * r;
            const py = cy + Math.sin(startAngle + a) * (r * 0.75);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = s % 2 === 0 ? accent : '#6366f1';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Luminous fluid core glow
        const fGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
        fGrad.addColorStop(0, '#ffffff');
        fGrad.addColorStop(0.3, '#38bdf8');
        fGrad.addColorStop(0.7, '#6366f1');
        fGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.fill();

        // Curl noise particle dots
        for (let p = 0; p < 24; p++) {
          const ang = p * 0.28;
          const dist = 60 + p * 8;
          const dotX = cx + Math.cos(ang) * dist;
          const dotY = cy + Math.sin(ang) * (dist * 0.8);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'artibition': {
        // Classical Roman Arch with Perspective Wireframe & Gilded Orb
        ctx.strokeStyle = accent;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 220, Math.PI, 0, false);
        ctx.lineTo(cx + 220, cy + 280);
        ctx.lineTo(cx - 220, cy + 280);
        ctx.closePath();
        ctx.stroke();

        // Inner glowing sphere
        const orbGrad = ctx.createRadialGradient(cx - 40, cy - 120, 10, cx, cy - 80, 160);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.4, accent);
        orbGrad.addColorStop(1, 'rgba(23, 19, 15, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 150, 0, Math.PI * 2);
        ctx.fill();

        // Architectural horizontal lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        for (let y = cy - 20; y < cy + 260; y += 40) {
          ctx.beginPath();
          ctx.moveTo(cx - 180, y);
          ctx.lineTo(cx + 180, y);
          ctx.stroke();
        }
        break;
      }

      case 'huuk': {
        // Multi-layered editorial publishing cards
        const cardColors = ['#cd8db0', '#a5896f', '#736c60'];
        [-50, 0, 50].forEach((ox, i) => {
          ctx.save();
          ctx.translate(cx + ox, cy + (i - 1) * 35);
          ctx.rotate((i - 1) * 0.14);
          ctx.fillStyle = cardColors[i];
          ctx.beginPath();
          ctx.roundRect(-160, -200, 320, 380, 24);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        });
        break;
      }

      case 'pugu': {
        // Playful gamified concentric rings and isometric clockwork
        ctx.strokeStyle = accent;
        ctx.lineWidth = 8;
        for (let r = 80; r <= 280; r += 55) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vibrant center companion glyph
        const pGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.5, '#4f5b6b');
        pGrad.addColorStop(1, '#cd8db0');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 95, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'pos': {
        // Precision engineering grid & glowing touch nexus
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        const gridStep = 45;
        for (let x = cx - 220; x <= cx + 220; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, cy - 220);
          ctx.lineTo(x, cy + 220);
          ctx.stroke();
        }
        for (let y = cy - 220; y <= cy + 220; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(cx - 220, y);
          ctx.lineTo(cx + 220, y);
          ctx.stroke();
        }

        // Diamond reticle
        ctx.strokeStyle = '#6ce08b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx + 130, cy);
        ctx.lineTo(cx, cy + 130);
        ctx.lineTo(cx - 130, cy);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      default: {
        // Cloud Engine: Cosmic distributed node topology
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        const nodes: [number, number][] = [
          [cx, cy - 160],
          [cx + 180, cy - 60],
          [cx + 140, cy + 140],
          [cx - 140, cy + 140],
          [cx - 180, cy - 60],
          [cx, cy + 30]
        ];

        nodes.forEach(([nx, ny]) => {
          nodes.forEach(([mx, my]) => {
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(mx, my);
            ctx.stroke();
          });
        });

        nodes.forEach(([nx, ny]) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(nx, ny, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = accent;
          ctx.stroke();
        });
        break;
      }
    }
  }

  private setupEvents(): void {
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.wakeUp();
  };

  /**
   * Applies tactile drag delta from pointer/finger directly into the carousel
   */
  public applyDragDelta(dx: number): void {
    this.isDragging = true;
    const factor = -dx * 0.0034;
    this.scrollCurrent += factor;
    this.scrollVelocity = factor;
    this.scrollTarget = Math.round(this.scrollCurrent);
    this.wakeUp();
  }

  /**
   * Finishes drag gesture and engages spring snapping to nearest project with GSAP inertia
   */
  public endDrag(): void {
    this.isDragging = false;
    const targetIdx = Math.max(0, Math.min(PROJECTS.length - 1, Math.round(this.scrollCurrent)));
    
    // GSAP smooth inertia snap
    gsap.to(this, {
      scrollTarget: targetIdx,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });

    this.wakeUp();
  }

  /**
   * Smooth mouse wheel scrolling with momentum
   */
  public applyWheelDelta(dir: number): void {
    const nextIndex = Math.max(0, Math.min(PROJECTS.length - 1, this.scrollTarget + dir));
    this.selectProject(nextIndex);
  }

  public updatePointer(ndcX: number, ndcY: number, isDragging: boolean = false): void {
    this.targetMouse.set(ndcX, ndcY);

    if (isDragging !== this.isDragging) {
      this.isDragging = isDragging;
      if (!isDragging) {
        this.endDrag();
      }
    }

    // Raycast to detect card hover and exact UV coordinates for liquid ripples
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.cards.map((c) => c.mesh),
      true
    );

    let newHovered: number | null = null;
    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && obj.userData?.index === undefined && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.index !== undefined) {
        newHovered = obj.userData.index as number;

        // Set liquid ripple epicenter to exact mouse intersection point!
        if (intersects[0].uv) {
          const uv = intersects[0].uv;
          const card = this.cards[newHovered];
          card.liquidMaterial.uniforms.uMouse.value.set(uv.x, uv.y);
        }
      }
    }

    if (newHovered !== this.hoveredIndex) {
      // Trigger GSAP wave easing for hover transitions
      if (newHovered !== null) {
        const targetCard = this.cards[newHovered];
        gsap.to(targetCard.hoverProgress, {
          value: 1.0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (this.hoveredIndex !== null && this.hoveredIndex !== newHovered) {
        const prevCard = this.cards[this.hoveredIndex];
        gsap.to(prevCard.hoverProgress, {
          value: 0.0,
          duration: 0.65,
          ease: 'power2.inOut',
          overwrite: 'auto'
        });
      }

      this.hoveredIndex = newHovered;
      this.container.style.cursor = newHovered !== null ? 'pointer' : 'default';
      if (this.callbacks.onHoverBookChange) {
        this.callbacks.onHoverBookChange(newHovered);
      }
      this.wakeUp();
    }

    this.wakeUp();
  }

  public handleClick(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.cards.map((c) => c.mesh),
      true
    );

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && obj.userData?.index === undefined && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.index !== undefined) {
        const clickedIndex = obj.userData.index as number;

        if (clickedIndex === this.activeIndex) {
          // Clicked active center card -> Trigger fluid ripple surge and open case study modal!
          const activeCard = this.cards[clickedIndex];
          gsap.fromTo(
            activeCard.liquidMaterial.uniforms.uRGBShift,
            { value: 1.8 },
            { value: 0.0, duration: 0.75, ease: 'power2.out' }
          );

          if (this.callbacks.onSelectProject) {
            this.callbacks.onSelectProject(PROJECTS[clickedIndex]);
          }
        } else {
          // Clicked neighboring card -> Smooth spring to that card!
          this.selectProject(clickedIndex);
        }
      }
    }
  }

  /**
   * Smoothly springs to the target project index with GSAP easing
   */
  public selectProject(index: number): void {
    const clamped = Math.max(0, Math.min(PROJECTS.length - 1, index));
    this.activeIndex = clamped;

    gsap.to(this, {
      scrollTarget: clamped,
      duration: 0.75,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });

    if (this.callbacks.onActiveIndexChange) {
      this.callbacks.onActiveIndexChange(clamped);
    }
    this.wakeUp();
  }

  // Compatibility aliases for App.vue
  public selectBookFromShelf(index: number): void {
    this.selectProject(index);
  }
  public returnBookToShelf(): void {
    // No-op in carousel mode
  }
  public toggleBookRead(): void {
    if (this.callbacks.onSelectProject) {
      this.callbacks.onSelectProject(PROJECTS[this.activeIndex]);
    }
  }

  public wakeUp(): void {
    this.isIdle = false;
    this.idleCounter = 0;
    if (this.rafId === null) {
      this.startLoop();
    }
  }

  private startLoop(): void {
    if (this.rafId !== null) return;

    const tick = () => {
      this.updatePhysics();
      this.renderer.render(this.scene, this.camera);

      if (this.checkIdleState()) {
        this.idleCounter++;
        if (this.idleCounter > this.maxIdleFrames) {
          this.isIdle = true;
          this.rafId = null;
          return;
        }
      } else {
        this.idleCounter = 0;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private checkIdleState(): boolean {
    const mouseSettled = this.mouse.distanceTo(this.targetMouse) < 0.001;
    const physicsSettled = Math.abs(this.scrollVelocity) < 0.0001 && Math.abs(this.scrollTarget - this.scrollCurrent) < 0.001;
    return mouseSettled && physicsSettled && !this.isDragging;
  }

  private updatePhysics(): void {
    const time = performance.now() * 0.001;

    // 1. Mouse coordinates lerping
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 2. Patrick Heng Spring Physics for Horizontal Scroll
    if (!this.isDragging) {
      const springDiff = this.scrollTarget - this.scrollCurrent;
      this.scrollVelocity += springDiff * 0.082; // Spring stiffness
      this.scrollVelocity *= 0.78; // Spring damping
    } else {
      this.scrollVelocity *= 0.88;
    }

    this.scrollCurrent += this.scrollVelocity;

    // Detect active project index transition
    const nearestIndex = Math.max(0, Math.min(PROJECTS.length - 1, Math.round(this.scrollCurrent)));
    if (nearestIndex !== this.activeIndex && Math.abs(this.scrollCurrent - nearestIndex) < 0.4) {
      this.activeIndex = nearestIndex;
      if (this.callbacks.onActiveIndexChange) {
        this.callbacks.onActiveIndexChange(nearestIndex);
      }
    }

    // 3. Signature Velocity Tilt (Patrick Heng style)
    const tiltZ = -this.scrollVelocity * 0.045;
    const tiltY = -this.scrollVelocity * 0.065;

    // 4. Update each floating card position, scale, tilt & GLSL Liquid Wave Uniforms
    this.cards.forEach((item) => {
      const card = item.group;
      const offset = item.index - this.scrollCurrent;
      const distFromCenter = Math.abs(offset);

      // Target X: centered along track
      const targetX = offset * this.cardSpacing;

      // Parallax depth: active card stays forward at z = 0, sides recede to z = -0.6
      const isHovered = this.hoveredIndex === item.index;
      const targetZ = (isHovered ? 0.35 : 0.0) - Math.min(distFromCenter * 0.45, 0.9);

      // Scale: center card is 1.0, neighbors taper to 0.86
      const targetScale = Math.max(0.86, 1.0 - distFromCenter * 0.12);

      // Subtle mouse tilt for active/hovered cards
      const mouseTiltX = distFromCenter < 0.6 ? this.mouse.y * 0.06 : 0;
      const mouseTiltY = distFromCenter < 0.6 ? this.mouse.x * 0.08 : 0;

      card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.14);
      card.position.y = THREE.MathUtils.lerp(card.position.y, isHovered ? 0.12 : 0.0, 0.12);
      card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.12);

      card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, tiltZ, 0.1);
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, tiltY + mouseTiltY, 0.1);
      card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, mouseTiltX, 0.1);

      card.scale.setScalar(THREE.MathUtils.lerp(card.scale.x, targetScale, 0.12));

      // 5. Feed real-time uniforms to Patrick Heng GLSL Liquid Wave Shader
      const mat = item.liquidMaterial;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVelocity.value.set(this.scrollVelocity, 0);
      mat.uniforms.uHover.value = item.hoverProgress.value;
      mat.uniforms.uDrag.value = this.isDragging ? 1.0 : 0.0;
    });
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.onResize);

    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.cards = [];

    this.renderer.dispose();
  }
}
