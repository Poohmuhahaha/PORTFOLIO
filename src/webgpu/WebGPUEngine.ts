import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { PROJECTS, type ProjectItem } from '../data/projects';
import { RenaissanceLibrary } from './RenaissanceLibrary';
import { RenaissanceBook } from './RenaissanceBook';

export interface EngineCallbacks {
  onSelectProject?: (project: ProjectItem) => void;
  onActiveIndexChange?: (index: number) => void;
  onBackendReady?: (backend: string) => void;
  onBookOpenChange?: (isOpen: boolean) => void;
  onHoverBookChange?: (index: number | null) => void;
}

export class WebGPUEngine {
  private container: HTMLElement;
  private renderer!: WebGPURenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private books: {
    book: RenaissanceBook;
  }[] = [];

  private particles!: THREE.Points;
  private particleVelocities: Float32Array = new Float32Array(0);
  private library!: RenaissanceLibrary;

  // Interaction State: Selecting from the Bookshelf vs Reading on the Lectern
  private activeFolioIndex = 0;
  private isReadingMode = false;
  private hoveredIndex: number | null = null;

  // Mouse & Physics
  private mouse = new THREE.Vector2(0, 0);
  private targetMouse = new THREE.Vector2(0, 0);
  private raycaster = new THREE.Raycaster();

  // Optimization & Idle State
  private isIdle = false;
  private idleCounter = 0;
  private maxIdleFrames = 120;
  private rafId: number | null = null;
  private callbacks: EngineCallbacks;

  public get isEngineIdle(): boolean {
    return this.isIdle;
  }

  public get isCurrentBookOpen(): boolean {
    return this.isReadingMode;
  }

  constructor(container: HTMLElement, callbacks: EngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async init(): Promise<void> {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#1c3347');

    // 2. Camera (Framed eye-level facing the Renaissance Showcase Shelf)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    this.camera.position.set(0, 0.65, 6.4);
    this.camera.lookAt(0, -0.15, 0);

    // 3. WebGPU Renderer with automatic WebGL2 Fallback
    this.renderer = new WebGPURenderer({
      antialias: true,
      alpha: false,
      forceWebGL: false
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    await this.renderer.init();

    const isWebGPU = (this.renderer.backend as any)?.isWebGPUBackend;
    const backendName = isWebGPU ? 'WebGPU' : 'WebGL2 (Fallback)';
    if (this.callbacks.onBackendReady) {
      this.callbacks.onBackendReady(backendName);
    }

    // 4. Physically Accurate Lighting & Soft Shadows
    this.setupLighting();

    // 5. Build 3D Renaissance Library with Showcase Shelf & Arched Window
    this.library = new RenaissanceLibrary();
    this.scene.add(this.library.group);

    // 6. Build the 5 Antique Leather Tomes on the Shelf
    this.buildBooks();

    // 7. Golden Dust Atmosphere
    this.buildGoldenDust();

    // 8. Event listeners
    this.setupEvents();

    // 9. Start Render Loop
    this.startLoop();
  }

  private setupLighting(): void {
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient Hemisphere Dome Light (Rich Chiaroscuro: Warm Tuscan sunset zenith & deep shadowed floor)
    const hemiLight = new THREE.HemisphereLight(0xe2be88, 0x3a2414, 0.34);
    this.scene.add(hemiLight);

    // Directional Sunlight Streaming from Top-Left through the Arch Window
    const sunLight = new THREE.DirectionalLight(0xfff0d6, 3.5);
    sunLight.position.set(-11, 15, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.00012;
    this.scene.add(sunLight);

    // Warm Amber Fill Light (Soft warm bounce from the right side)
    const fillLight = new THREE.DirectionalLight(0xf0c598, 0.28);
    fillLight.position.set(10, 4, 8);
    this.scene.add(fillLight);
  }

  /**
   * Dedicated slot position on the showcase shelf for each book
   */
  public getShelfSlotPos(index: number): THREE.Vector3 {
    return new THREE.Vector3(-2.7 + index * 1.35, -0.85, -0.65);
  }

  private buildBooks(): void {
    PROJECTS.forEach((project, index) => {
      const book = new RenaissanceBook(project, index);
      const slot = this.getShelfSlotPos(index);

      // Start docked in its slot on the shelf
      book.group.position.copy(slot);
      book.group.scale.set(0.58, 0.58, 0.58);
      book.group.rotation.set(-0.04, 0, 0);
      book.group.userData = { project, index, book };

      this.scene.add(book.group);
      this.books.push({ book });
    });
  }

  private buildGoldenDust(): void {
    const particleCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    this.particleVelocities = new Float32Array(particleCount * 3);

    const paletteColors = [
      new THREE.Color('#e5c69f'),
      new THREE.Color('#c6b18f'),
      new THREE.Color('#b19c73'),
      new THREE.Color('#f0e9dc'),
      new THREE.Color('#92743e')
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 14;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;

      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.002;
      this.particleVelocities[i3 + 1] = Math.random() * 0.003 + 0.001;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

      const col = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const radGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGrad.addColorStop(0, 'rgba(255, 245, 220, 1.0)');
    radGrad.addColorStop(0.3, 'rgba(229, 198, 159, 0.65)');
    radGrad.addColorStop(1, 'rgba(146, 116, 62, 0.0)');
    pCtx.fillStyle = radGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTex = new THREE.CanvasTexture(pCanvas);

    const pMaterial = new THREE.PointsMaterial({
      size: 0.14,
      map: pTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, pMaterial);
    this.scene.add(this.particles);
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

  public updateScroll(scrollFraction: number, _velocity: number): void {
    // Scrolling scrolls through the 5 folios
    const index = Math.round(scrollFraction * (PROJECTS.length - 1));
    if (this.isReadingMode && index !== this.activeFolioIndex) {
      this.selectBookFromShelf(index);
    }
    this.wakeUp();
  }

  public updatePointer(ndcX: number, ndcY: number, isDragging: boolean = false): void {
    this.targetMouse.set(ndcX, ndcY);

    // Raycast to detect book hover on the shelf
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.books.map((b) => b.book.group),
      true
    );

    let newHovered: number | null = null;
    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.book && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.book) {
        const book = obj.userData.book as RenaissanceBook;
        newHovered = book.index;
      }
    }

    if (newHovered !== this.hoveredIndex) {
      this.hoveredIndex = newHovered;
      this.container.style.cursor = newHovered !== null ? 'pointer' : 'default';
      if (this.callbacks.onHoverBookChange) {
        this.callbacks.onHoverBookChange(newHovered);
      }
      this.wakeUp();
    }

    if (isDragging) {
      this.wakeUp();
    }
  }

  public handleClick(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.books.map((b) => b.book.group),
      true
    );

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.book && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.book) {
        const book = obj.userData.book as RenaissanceBook;

        if (!this.isReadingMode) {
          // Pull book from shelf onto the reading lectern!
          this.selectBookFromShelf(book.index);
        } else {
          if (book.index === this.activeFolioIndex) {
            // Clicked active reading book -> toggle return to shelf
            this.returnBookToShelf();
          } else {
            // Clicked another book on shelf -> switch directly to it
            this.selectBookFromShelf(book.index);
          }
        }
      }
    } else {
      // Clicked outside while in reading mode: Return book to shelf
      if (this.isReadingMode) {
        this.returnBookToShelf();
      }
    }
  }

  /**
   * Pulls chosen book from the shelf onto the reading desk
   */
  public selectBookFromShelf(index: number): void {
    const clamped = Math.max(0, Math.min(PROJECTS.length - 1, index));
    this.activeFolioIndex = clamped;
    this.isReadingMode = true;

    if (this.callbacks.onActiveIndexChange) {
      this.callbacks.onActiveIndexChange(clamped);
    }
    if (this.callbacks.onBookOpenChange) {
      this.callbacks.onBookOpenChange(true);
    }
    this.wakeUp();
  }

  /**
   * Closes the active tome and returns it back into its slot on the bookshelf
   */
  public returnBookToShelf(): void {
    this.isReadingMode = false;

    if (this.callbacks.onBookOpenChange) {
      this.callbacks.onBookOpenChange(false);
    }
    this.wakeUp();
  }

  public toggleBookRead(): void {
    if (this.isReadingMode) {
      this.returnBookToShelf();
    } else {
      this.selectBookFromShelf(this.activeFolioIndex);
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

      if (this.library) {
        this.library.updateCandleFlicker(performance.now() * 0.001);
      }

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
    const isMouseIdle = this.mouse.distanceTo(this.targetMouse) < 0.001;
    return isMouseIdle;
  }

  private updatePhysics(): void {
    const time = performance.now() * 0.001;

    // 1. Mouse coordinates lerping
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 2. Camera transition between Shelf Mode and Reading Mode
    const targetCameraPos = this.isReadingMode
      ? new THREE.Vector3(0, 0.42, 5.3)
      : new THREE.Vector3(0, 0.58, 6.2);

    this.camera.position.lerp(targetCameraPos, 0.06);
    this.camera.lookAt(0, this.isReadingMode ? -0.32 : -0.22, 0);

    // 3. Subtle room parallax
    if (this.library) {
      this.library.group.position.y = -this.mouse.y * 0.1;
      this.library.group.position.x = -this.mouse.x * 0.12;
      this.library.group.rotation.y = this.mouse.x * 0.012;
    }

    // 4. Animate each of the 5 books (Shelf Slots vs Reading Blotter)
    let anyBookAnimating = false;

    this.books.forEach((item) => {
      const book = item.book;
      const slotPos = this.getShelfSlotPos(book.index);

      let targetPos: THREE.Vector3;
      let targetScale: number;
      let targetRotX: number;
      let targetRotY: number;
      let targetRotZ: number;

      if (this.isReadingMode && book.index === this.activeFolioIndex) {
        // ACTIVE TOME: Resting on the leather desk blotter (Zero sinking!)
        targetPos = new THREE.Vector3(0.0, -0.37, 0.55);
        targetScale = 1.0;
        targetRotX = -0.15;
        targetRotY = this.mouse.x * 0.02;
        targetRotZ = 0.0;

        // Open front cover once it lands on the desk blotter
        const distToDesk = book.group.position.distanceTo(targetPos);
        if (distToDesk < 0.35) {
          book.setOpen(1.0);
        } else {
          book.setOpen(0.0);
        }
      } else {
        // BOOK RESTING ON THE OPEN SHELF (Low cradle stand, completely clear!)
        book.setOpen(0.0);
        const isHovered = !this.isReadingMode && this.hoveredIndex === book.index;

        // Subtle living organic breathing for each folio on the shelf
        const breath = Math.sin(time * 1.5 + book.index * 0.85) * 0.012;
        // Subtle mouse parallax response
        const mouseParallaxX = (this.mouse.x * 0.9 - slotPos.x * 0.12) * 0.025;
        const mouseParallaxY = this.mouse.y * 0.015;

        if (isHovered) {
          // Pulled forward smoothly out of its shelf slot towards viewer when hovered
          targetPos = new THREE.Vector3(slotPos.x, slotPos.y + 0.16 + breath, slotPos.z + 0.45);
          targetScale = 0.65;
          targetRotX = -0.09 + mouseParallaxY;
          targetRotY = (this.mouse.x * 2.2 - slotPos.x) * 0.06;
          targetRotZ = (slotPos.x - this.mouse.x) * 0.015;
        } else {
          // Resting securely on the low walnut & brass cradle
          targetPos = new THREE.Vector3(slotPos.x, slotPos.y + breath, slotPos.z);
          targetScale = 0.58;
          targetRotX = -0.04 + mouseParallaxY;
          targetRotY = mouseParallaxX;
          targetRotZ = 0.0;
        }
      }

      // Smooth physics lerping for position, scale & rotation
      book.group.position.lerp(targetPos, 0.08);

      const curScale = book.group.scale.x;
      const newScale = THREE.MathUtils.lerp(curScale, targetScale, 0.08);
      book.group.scale.set(newScale, newScale, newScale);

      book.group.rotation.x = THREE.MathUtils.lerp(book.group.rotation.x, targetRotX, 0.08);
      book.group.rotation.y = THREE.MathUtils.lerp(book.group.rotation.y, targetRotY, 0.08);
      book.group.rotation.z = THREE.MathUtils.lerp(book.group.rotation.z, targetRotZ, 0.08);

      const isStillAnimating = book.update();
      if (isStillAnimating || book.group.position.distanceTo(targetPos) > 0.005) {
        anyBookAnimating = true;
      }
    });

    if (anyBookAnimating || this.camera.position.distanceTo(targetCameraPos) > 0.01) {
      this.wakeUp();
    }

    // 5. Update Golden Dust Particles (Organic convective draft + gentle attraction to active book)
    if (this.particles) {
      const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const count = positions.length / 3;

      // Focal point for golden dust: hovered shelf folio or active reading lectern
      let focalX = this.mouse.x * 5;
      let focalY = this.mouse.y * 4;
      let focalZ = 0;
      if (!this.isReadingMode && this.hoveredIndex !== null) {
        const hSlot = this.getShelfSlotPos(this.hoveredIndex);
        focalX = hSlot.x;
        focalY = hSlot.y + 0.2;
        focalZ = hSlot.z + 0.3;
      } else if (this.isReadingMode) {
        focalX = 0;
        focalY = -0.35;
        focalZ = 0.6;
      }

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        positions[i3 + 1] += this.particleVelocities[i3 + 1];
        positions[i3] += this.particleVelocities[i3];

        const dx = focalX - positions[i3];
        const dy = focalY - positions[i3 + 1];
        const dz = focalZ - positions[i3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 20) {
          const force = (20 - distSq) * 0.00012;
          positions[i3] += dx * force;
          positions[i3 + 1] += dy * force;
          positions[i3 + 2] += dz * force;
        }

        if (positions[i3 + 1] > 11) {
          positions[i3 + 1] = -11;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.onResize);

    this.books.forEach((b) => b.book.dispose());
    this.books = [];

    if (this.library) {
      this.library.dispose();
      this.scene.remove(this.library.group);
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
      this.scene.remove(this.particles);
    }

    this.renderer.dispose();
  }
}
