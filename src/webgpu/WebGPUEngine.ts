import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import gsap from 'gsap';
import { PROJECTS, type ProjectItem } from '../data/projects';

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
  geometry: THREE.PlaneGeometry;
  originalPositions: Float32Array;
  material: THREE.MeshStandardMaterial;
  hoverProgress: { value: number };
  localHit: THREE.Vector2;
}

/**
 * Patrick Heng & Justine Soulié inspired WebGL/WebGPU Spring Card Engine
 * - Floating paper cloth posters with authentic paper normal map (paper-normals.jpg)
 * - PBR lighting with soft drop shadows and tactile paper curls
 * - Parabolic arching carousel with spring inertia & velocity tilt
 * - Bulletproof rendering with WebGPU and WebGL 2.0 automatic fallback
 */
export class WebGPUEngine {
  private container: HTMLElement;
  private renderer!: WebGPURenderer | THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cards: CardItem[] = [];

  // Textures & Paper Normal Map
  private paperNormalTexture: THREE.Texture | null = null;

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
  private readonly cardSpacing = 3.75;

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

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup (Optimal FOV for vertical editorial posters)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    this.camera.position.set(0, 0, 7.6);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with robust WebGPU -> WebGL fallback
    try {
      const gpuRenderer = new WebGPURenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      await gpuRenderer.init();
      this.renderer = gpuRenderer;
      if (this.callbacks.onBackendReady) {
        this.callbacks.onBackendReady('WebGPU (Next-Gen Graphics)');
      }
    } catch {
      // Fallback to WebGLRenderer for 100% universal browser compatibility
      const glRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer = glRenderer;
      if (this.callbacks.onBackendReady) {
        this.callbacks.onBackendReady('WebGL 2.0 (High Performance)');
      }
    }

    this.renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Mount to DOM
    this.container.appendChild(this.renderer.domElement);

    // 4. Load authentic Patrick Heng crumpled paper normal map
    const texLoader = new THREE.TextureLoader();
    this.paperNormalTexture = texLoader.load('/textures/paper-normals.jpg', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.cards.forEach((c) => {
        c.material.normalMap = tex;
        c.material.needsUpdate = true;
      });
      this.wakeUp();
    });
    this.textures.push(this.paperNormalTexture);

    // 5. Studio Museum Lighting
    this.setupLighting();

    // 6. Shadow-Receiving Paper Backdrop
    this.buildBackdrop();

    // 7. Build Floating Project Cards
    this.buildCards();

    // 8. Event listeners & Render Loop
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    // Ambient light with soft warm tint
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8e2dc, 1.2);
    this.scene.add(hemiLight);

    // Key directional light creating soft, tactile card drop shadows
    const sunLight = new THREE.DirectionalLight(0xfff9f2, 1.6);
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
    const fillLight = new THREE.DirectionalLight(0xf5ebe0, 0.55);
    fillLight.position.set(7, -3, 6);
    this.scene.add(fillLight);
  }

  private buildBackdrop(): void {
    // Large seamless transparent shadow catcher behind cards
    const wallGeo = new THREE.PlaneGeometry(38, 26);
    this.geometries.push(wallGeo);

    const wallMat = new THREE.ShadowMaterial({
      opacity: 0.14
    });
    this.materials.push(wallMat);

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0, -0.45);
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  private generatePaperShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 340;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 340);

    ctx.shadowColor = 'rgba(28, 20, 15, 0.35)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 14;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(24, 24, 208, 292, 16);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    this.textures.push(tex);
    return tex;
  }

  private buildCards(): void {
    const cardW = 3.05;
    const cardH = 4.15;

    // Shared soft paper shadow texture
    const shadowTex = this.generatePaperShadowTexture();

    PROJECTS.forEach((project, index) => {
      const cardGroup = new THREE.Group();

      // 1. Front Poster Artwork Texture
      const posterTex = this.generateProjectPosterTexture(project, index);

      // 2. High-performance PBR Material with Patrick Heng Paper Normals
      const paperMat = new THREE.MeshStandardMaterial({
        map: posterTex,
        normalMap: this.paperNormalTexture,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.82,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
      this.materials.push(paperMat);

      // 3. Subdivided paper plane (32x32 grid) for dynamic cloth curvature and wave ripples
      const frontPlaneGeo = new THREE.PlaneGeometry(cardW, cardH, 32, 32);
      this.geometries.push(frontPlaneGeo);
      const originalPositions = new Float32Array(frontPlaneGeo.attributes.position.array);

      const frontMesh = new THREE.Mesh(frontPlaneGeo, paperMat);
      frontMesh.position.set(0, 0, 0.02);
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;
      frontMesh.userData = { project, index };
      cardGroup.add(frontMesh);

      // 4. Soft floating paper drop shadow plane directly behind the sheet
      const shadowGeo = new THREE.PlaneGeometry(cardW * 1.1, cardH * 1.08);
      this.geometries.push(shadowGeo);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.24,
        depthWrite: false
      });
      this.materials.push(shadowMat);
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, -0.05, -0.02);
      cardGroup.add(shadowMesh);

      cardGroup.position.set(index * this.cardSpacing, 0, 0);

      this.scene.add(cardGroup);
      this.cards.push({
        project,
        index,
        mesh: frontMesh,
        group: cardGroup,
        geometry: frontPlaneGeo,
        originalPositions,
        material: paperMat,
        hoverProgress: { value: 0 },
        localHit: new THREE.Vector2(0, 0)
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

    // 2. Subtle Tactile Frame Border
    ctx.strokeStyle = isLightCard ? 'rgba(40, 30, 20, 0.12)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 928, 1304);

    // 3. Elegant Minimalist Header: Index & Year
    const subColor = isLightCard ? 'rgba(40, 30, 20, 0.55)' : 'rgba(245, 235, 224, 0.6)';
    const accentColor = project.accentColor || '#e56b55';

    ctx.fillStyle = subColor;
    ctx.font = '500 22px Inter, sans-serif';
    ctx.letterSpacing = '0.14em';
    ctx.fillText(`NO. 0${index + 1}`, 72, 98);
    ctx.textAlign = 'right';
    ctx.fillText(project.year.toUpperCase(), 952, 98);
    ctx.textAlign = 'left';

    // Thin subtle header rule
    ctx.strokeStyle = isLightCard ? 'rgba(40, 30, 20, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 122);
    ctx.lineTo(952, 122);
    ctx.stroke();

    // 4. Bespoke Graphic Artwork per Project
    ctx.save();
    this.renderPosterArt(ctx, project.id, accentColor, isLightCard);
    ctx.restore();

    // 5. Subtle Bottom Monogram / Category watermark
    ctx.fillStyle = subColor;
    ctx.font = '500 18px Inter, sans-serif';
    ctx.letterSpacing = '0.12em';
    ctx.fillText(project.category.toUpperCase(), 72, 1310);

    ctx.textAlign = 'right';
    ctx.fillText('PT ARCHIVE', 952, 1310);
    ctx.textAlign = 'left';

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
    const cy = 680;

    switch (id) {
      case 'hydro-core': {
        // Swirling Navier-Stokes fluid vortices and luminous streamlines
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;

        // Dynamic vortex spirals
        for (let s = 0; s < 6; s++) {
          ctx.beginPath();
          const startAngle = (s * Math.PI * 2) / 6;
          for (let a = 0; a < Math.PI * 4; a += 0.08) {
            const r = 24 + a * 26;
            const px = cx + Math.cos(startAngle + a) * r;
            const py = cy + Math.sin(startAngle + a) * (r * 0.78);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = s % 2 === 0 ? accent : '#818cf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Luminous fluid core glow
        const fGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
        fGrad.addColorStop(0, '#ffffff');
        fGrad.addColorStop(0.25, '#38bdf8');
        fGrad.addColorStop(0.65, '#6366f1');
        fGrad.addColorStop(1, 'rgba(7, 18, 36, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 220, 0, Math.PI * 2);
        ctx.fill();

        // Curl noise particle dots
        for (let p = 0; p < 36; p++) {
          const ang = p * 0.24;
          const dist = 50 + p * 8.5;
          const dotX = cx + Math.cos(ang) * dist;
          const dotY = cy + Math.sin(ang) * (dist * 0.8);
          ctx.fillStyle = p % 3 === 0 ? '#ffffff' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'artibition': {
        // Classical Roman Arch with Perspective Wireframe & Gilded Orb
        ctx.strokeStyle = accent;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 240, Math.PI, 0, false);
        ctx.lineTo(cx + 240, cy + 320);
        ctx.lineTo(cx - 240, cy + 320);
        ctx.closePath();
        ctx.stroke();

        // Inner glowing sphere
        const orbGrad = ctx.createRadialGradient(cx - 50, cy - 130, 10, cx, cy - 80, 180);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.4, accent);
        orbGrad.addColorStop(1, 'rgba(18, 15, 12, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 160, 0, Math.PI * 2);
        ctx.fill();

        // Architectural horizontal lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 2;
        for (let y = cy - 20; y < cy + 300; y += 40) {
          ctx.beginPath();
          ctx.moveTo(cx - 200, y);
          ctx.lineTo(cx + 200, y);
          ctx.stroke();
        }
        break;
      }

      case 'huuk': {
        // Multi-layered editorial publishing cards
        const cardColors = ['#cd8db0', '#a5896f', '#736c60'];
        [-60, 0, 60].forEach((ox, i) => {
          ctx.save();
          ctx.translate(cx + ox, cy + (i - 1) * 40);
          ctx.rotate((i - 1) * 0.14);
          ctx.fillStyle = cardColors[i];
          ctx.beginPath();
          ctx.roundRect(-170, -220, 340, 420, 24);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        });
        break;
      }

      case 'pugu': {
        // Playful concentric soundwave rings and neon harmonics
        ctx.strokeStyle = accent;
        ctx.lineWidth = 6;
        for (let r = 70; r <= 310; r += 55) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vibrant center companion glyph
        const pGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 130);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.5, '#4f5b6b');
        pGrad.addColorStop(1, '#cd8db0');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'teenueng-studio': {
        // Precision architectural blueprint grid & glowing wireframe
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        const gridStep = 45;
        for (let x = cx - 240; x <= cx + 240; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, cy - 240);
          ctx.lineTo(x, cy + 240);
          ctx.stroke();
        }
        for (let y = cy - 240; y <= cy + 240; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(cx - 240, y);
          ctx.lineTo(cx + 240, y);
          ctx.stroke();
        }

        // Diamond reticle & Roman entablature elevation
        ctx.strokeStyle = '#f5ebe0';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 200);
        ctx.lineTo(cx + 200, cy);
        ctx.lineTo(cx, cy + 200);
        ctx.lineTo(cx - 200, cy);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      default: {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.strokeRect(cx - 180, cy - 180, 360, 360);
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

    // Raycast to detect card hover
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
        if (intersects[0].point) {
          const card = this.cards[newHovered];
          card.localHit.set(intersects[0].point.x - card.group.position.x, intersects[0].point.y - card.group.position.y);
        }
      }
    }

    if (newHovered !== this.hoveredIndex) {
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
          // Clicked active center card -> Open case study modal!
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

    // 4. Update each floating card position, scale, tilt & 3D cloth paper physics
    this.cards.forEach((item) => {
      const card = item.group;
      const offset = item.index - this.scrollCurrent;
      const distFromCenter = Math.abs(offset);

      // Target X: centered along track
      const targetX = offset * this.cardSpacing;

      // Parallax depth: active card stays forward at z = 0, sides recede to z = -0.55
      const isHovered = this.hoveredIndex === item.index;
      const targetZ = (isHovered ? 0.32 : 0.0) - Math.min(distFromCenter * 0.42, 0.85);

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

      // 5. Tactile 3D cloth paper wave deformation on geometry vertices
      const posAttr = item.geometry.attributes.position;
      const orig = item.originalPositions;
      const vel = this.scrollVelocity;
      const hover = item.hoverProgress.value;

      // Parabolic arch across screen
      const ndcX = card.position.x / 4.5;
      const clampedX = Math.max(-1.0, Math.min(1.0, ndcX));
      const normX = (clampedX + 1.0) * 0.5;
      const parabola = 4.0 * normX * (1.0 - normX);
      const archZ = parabola * 0.32;

      for (let v = 0; v < posAttr.count; v++) {
        const ox = orig[v * 3];
        const oy = orig[v * 3 + 1];

        // Organic cloth wave along scroll direction
        const dragWave = Math.sin(oy * 1.8 + time * 2.8) * vel * 0.3;

        // Subtle tactile paper curl
        const paperCurl = -Math.sin(oy * 8.0 + item.index) * 0.012;

        // Cursor depression press
        const hDist = Math.hypot(ox - item.localHit.x, oy - item.localHit.y);
        const hoverPress = Math.max(0, 1.0 - hDist / 1.5) * hover * -0.055;

        posAttr.setZ(v, archZ + dragWave + paperCurl + hoverPress);
      }
      posAttr.needsUpdate = true;
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
