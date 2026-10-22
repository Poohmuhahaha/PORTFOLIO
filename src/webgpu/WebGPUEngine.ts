import * as THREE from 'three';
import gsap from 'gsap';
import { PROJECTS, type ProjectItem } from '../data/projects';

export interface EngineCallbacks {
  onSelectProject?: (project: ProjectItem) => void;
  onActiveIndexChange?: (index: number) => void;
  onHoverBookChange?: (index: number | null) => void;
}

interface BookCardItem {
  project: ProjectItem;
  index: number;
  group: THREE.Group;
  coverHinge: THREE.Group;
  frontCoverMesh: THREE.Mesh;
  hoverProgress: { value: number };
  openProgress: { value: number };
}

/**
 * Patrick Heng 3D Spring Physics Carousel with Authentic Tactile PBR Books
 * - Realistic 3D Hardcover Codex anatomy: Front Cover, Rounded Spine, Gilded Ribs, Page Block Edges, Leather Back Cover
 * - 2K PBR Textures: Leather Grain, Embossed Gold Borders, Roughness Maps, High-Res Normal Maps
 * - Interactive Cover Opening: Hovering or selecting a book gently eases the cover open to reveal the illuminated manuscript leaf
 * - Parabolic 3D Arching with velocity tilt and momentum drag physics
 */
export class WebGPUEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private books: BookCardItem[] = [];

  // PBR Shared Textures
  private roughnessTexture!: THREE.Texture;
  private normalTexture!: THREE.Texture;
  private backCoverTexture!: THREE.Texture;
  private pageEdgeTexture!: THREE.Texture;

  private callbacks: EngineCallbacks;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private targetMouse = new THREE.Vector2();
  private hoveredIndex: number | null = null;
  public activeIndex = 0;

  // Spring & Drag Physics
  public scrollCurrent = 0;
  public scrollTarget = 0;
  public scrollVelocity = 0;
  public isDragging = false;
  private readonly bookSpacing = 3.85;

  // Book Dimensions
  private readonly bookW = 2.75;
  private readonly bookH = 3.85;
  private readonly bookD = 0.22;

  // Animation loop & idle state
  private rafId: number | null = null;
  public isIdle = false;
  private idleCounter = 0;
  private readonly maxIdleFrames = 90;

  // Memory management
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

    // 1. Scene Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup (Perspective tuned for museum book showcase)
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    this.camera.position.set(0, 0, 7.6);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with transparent background
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Load PBR Textures
    const texLoader = new THREE.TextureLoader();

    this.roughnessTexture = texLoader.load('/textures/book-cover-roughness.jpg', () => this.wakeUp());
    this.textures.push(this.roughnessTexture);

    this.normalTexture = texLoader.load('/textures/book-normal-hd.jpg', () => this.wakeUp());
    this.textures.push(this.normalTexture);

    this.backCoverTexture = texLoader.load('/textures/book-back.jpg', () => this.wakeUp());
    this.backCoverTexture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(this.backCoverTexture);

    this.pageEdgeTexture = texLoader.load('/textures/page-edge.jpg', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 1);
      this.wakeUp();
    });
    this.textures.push(this.pageEdgeTexture);

    // 5. Studio museum lighting
    this.setupLighting();

    // 6. Shadow-receiving transparent backdrop
    this.buildBackdrop();

    // 7. Build 3D Tactile Books
    this.buildBooks();

    // 8. Event listeners & animation loop
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdcd6cd, 1.35);
    this.scene.add(hemiLight);

    // Key Museum Directional Spotlight
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.0);
    sunLight.position.set(-6, 8, 9);
    sunLight.target.position.set(0, 0, 0);
    this.scene.add(sunLight.target);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.00015;
    this.scene.add(sunLight);

    // Warm Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xf5ebe0, 0.7);
    fillLight.position.set(7, -3, 6);
    this.scene.add(fillLight);
  }

  private buildBackdrop(): void {
    const wallGeo = new THREE.PlaneGeometry(48, 30);
    this.geometries.push(wallGeo);

    const wallMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    this.materials.push(wallMat);

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0, -0.6);
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  private generateBookShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 420;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 300, 420);

    ctx.shadowColor = 'rgba(16, 12, 8, 0.45)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 18;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(28, 28, 244, 364, 18);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    this.textures.push(tex);
    return tex;
  }

  private buildBooks(): void {
    const texLoader = new THREE.TextureLoader();
    const shadowTex = this.generateBookShadowTexture();

    // Shared Page Block Edge Material
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: this.pageEdgeTexture,
      roughness: 0.85,
      metalness: 0.08
    });
    this.materials.push(pageEdgeMat);

    PROJECTS.forEach((project, index) => {
      const bookGroup = new THREE.Group();

      // 1. Textures for this project
      const coverTex = texLoader.load(project.posterImage || `/textures/projects/${project.id}-cover.jpg`, () =>
        this.wakeUp()
      );
      coverTex.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(coverTex);

      const innerTex = texLoader.load(`/textures/projects/${project.id}-inner.jpg`, () => this.wakeUp());
      innerTex.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(innerTex);

      // 2. Front Cover PBR Material (Leather grain + Embossed Gold Leaf + Normal map)
      const frontCoverMat = new THREE.MeshStandardMaterial({
        map: coverTex,
        roughnessMap: this.roughnessTexture,
        normalMap: this.normalTexture,
        normalScale: new THREE.Vector2(0.9, 0.9),
        roughness: 0.62,
        metalness: 0.18
      });
      this.materials.push(frontCoverMat);

      // Inner Verso leaf material
      const innerLeafMat = new THREE.MeshStandardMaterial({
        map: innerTex,
        roughness: 0.84,
        metalness: 0.02
      });
      this.materials.push(innerLeafMat);

      // Leather Spine & Back Cover Material
      const backCoverMat = new THREE.MeshStandardMaterial({
        map: this.backCoverTexture,
        roughnessMap: this.roughnessTexture,
        normalMap: this.normalTexture,
        normalScale: new THREE.Vector2(0.8, 0.8),
        roughness: 0.65,
        metalness: 0.1
      });
      this.materials.push(backCoverMat);

      // 3. Central Spine at x = -this.bookW / 2
      const spineRadius = this.bookD / 2;
      const spineGeo = new THREE.CylinderGeometry(
        spineRadius,
        spineRadius,
        this.bookH,
        24,
        1,
        false,
        -Math.PI / 2,
        Math.PI
      );
      this.geometries.push(spineGeo);
      const spineMesh = new THREE.Mesh(spineGeo, backCoverMat);
      spineMesh.position.set(-this.bookW / 2, 0, -this.bookD / 2);
      spineMesh.castShadow = true;
      bookGroup.add(spineMesh);

      // Decorative Gilded Spine Ribs (4 bands)
      for (let r = 0; r < 4; r++) {
        const ribGeo = new THREE.TorusGeometry(spineRadius + 0.015, 0.024, 8, 20, Math.PI);
        this.geometries.push(ribGeo);
        const rib = new THREE.Mesh(ribGeo, frontCoverMat);
        rib.rotation.y = Math.PI / 2;
        rib.position.set(-this.bookW / 2, -this.bookH * 0.36 + r * (this.bookH * 0.24), -this.bookD / 2);
        bookGroup.add(rib);
      }

      // 4. Back Cover (Rigid bottom plate)
      const backCoverGeo = new THREE.BoxGeometry(this.bookW, this.bookH, 0.04);
      this.geometries.push(backCoverGeo);
      const backCoverMesh = new THREE.Mesh(backCoverGeo, backCoverMat);
      backCoverMesh.position.set(0, 0, -this.bookD);
      backCoverMesh.castShadow = true;
      bookGroup.add(backCoverMesh);

      // 5. Page Block (Inner paper leaves stack)
      // Front face displays illuminated recto overview, sides display striated page edges
      const pageMaterials = [
        pageEdgeMat, // right (+x)
        pageEdgeMat, // left (-x)
        pageEdgeMat, // top (+y)
        pageEdgeMat, // bottom (-y)
        innerLeafMat, // front (+z): illuminated recto page
        pageEdgeMat // back (-z)
      ];
      const pageBlockGeo = new THREE.BoxGeometry(this.bookW - 0.08, this.bookH - 0.1, this.bookD - 0.05);
      this.geometries.push(pageBlockGeo);
      const pageBlockMesh = new THREE.Mesh(pageBlockGeo, pageMaterials);
      pageBlockMesh.position.set(0.03, 0, -this.bookD / 2 - 0.01);
      pageBlockMesh.castShadow = true;
      pageBlockMesh.receiveShadow = true;
      bookGroup.add(pageBlockMesh);

      // 6. Front Cover Hinge (Pivoted at spine edge: x = -this.bookW / 2)
      const coverHinge = new THREE.Group();
      coverHinge.position.set(-this.bookW / 2, 0, 0);

      // Front Cover Board materials:
      // [+x, -x, +y, -y, +z (Front cover art), -z (Inner leaf)]
      const coverBoxMaterials = [
        backCoverMat, // right
        backCoverMat, // left
        backCoverMat, // top
        backCoverMat, // bottom
        frontCoverMat, // front cover
        innerLeafMat // inside verso leaf
      ];
      const coverBoxGeo = new THREE.BoxGeometry(this.bookW, this.bookH, 0.04);
      this.geometries.push(coverBoxGeo);
      const frontCoverMesh = new THREE.Mesh(coverBoxGeo, coverBoxMaterials);
      frontCoverMesh.position.set(this.bookW / 2, 0, 0);
      frontCoverMesh.castShadow = true;
      frontCoverMesh.receiveShadow = true;
      frontCoverMesh.userData = { project, index };
      coverHinge.add(frontCoverMesh);
      bookGroup.add(coverHinge);

      // 7. Floating Drop Shadow
      const shadowGeo = new THREE.PlaneGeometry(this.bookW * 1.15, this.bookH * 1.1);
      this.geometries.push(shadowGeo);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });
      this.materials.push(shadowMat);
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, -0.06, -this.bookD - 0.04);
      bookGroup.add(shadowMesh);

      bookGroup.position.set(index * this.bookSpacing, 0, 0);
      this.scene.add(bookGroup);

      this.books.push({
        project,
        index,
        group: bookGroup,
        coverHinge,
        frontCoverMesh,
        hoverProgress: { value: 0 },
        openProgress: { value: 0 }
      });
    });
  }

  private setupEvents(): void {
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.wakeUp();
  };

  public applyDragDelta(dx: number): void {
    this.isDragging = true;
    const factor = -dx * 0.0034;
    this.scrollCurrent += factor;
    this.scrollVelocity = factor;
    this.scrollTarget = Math.round(this.scrollCurrent);
    this.wakeUp();
  }

  public endDrag(): void {
    this.isDragging = false;
    // Infinite loop: snap to nearest integer without clamping bounds
    const targetIdx = Math.round(this.scrollCurrent);

    gsap.to(this, {
      scrollTarget: targetIdx,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });

    this.wakeUp();
  }

  public applyWheelDelta(dir: number): void {
    // Infinite loop: step target continuously
    this.scrollTarget = Math.round(this.scrollCurrent) + dir;
    gsap.to(this, {
      scrollTarget: this.scrollTarget,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });
  }

  public updatePointer(ndcX: number, ndcY: number, isDragging: boolean = false): void {
    this.targetMouse.set(ndcX, ndcY);

    if (isDragging !== this.isDragging) {
      this.isDragging = isDragging;
      if (!isDragging) {
        this.endDrag();
      }
    }

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.books.map((b) => b.frontCoverMesh),
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
      }
    }

    if (newHovered !== this.hoveredIndex) {
      if (newHovered !== null) {
        const targetBook = this.books[newHovered];
        gsap.to(targetBook.hoverProgress, {
          value: 1.0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        gsap.to(targetBook.openProgress, {
          value: 0.22, // Crack cover open 22% on hover
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (this.hoveredIndex !== null && this.hoveredIndex !== newHovered) {
        const prevBook = this.books[this.hoveredIndex];
        gsap.to(prevBook.hoverProgress, {
          value: 0.0,
          duration: 0.55,
          ease: 'power2.inOut',
          overwrite: 'auto'
        });
        gsap.to(prevBook.openProgress, {
          value: 0.0, // Close cover
          duration: 0.45,
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
      this.books.map((b) => b.frontCoverMesh),
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
          if (this.callbacks.onSelectProject) {
            this.callbacks.onSelectProject(PROJECTS[clickedIndex]);
          }
        } else {
          this.selectProject(clickedIndex);
        }
      }
    }
  }

  public selectProject(index: number): void {
    const N = PROJECTS.length;
    const currentNormalized = ((Math.round(this.scrollCurrent) % N) + N) % N;

    // Shortest modular path
    let diff = (index - currentNormalized) % N;
    while (diff > N / 2) diff -= N;
    while (diff < -N / 2) diff += N;

    const target = Math.round(this.scrollCurrent) + diff;
    this.scrollTarget = target;

    gsap.to(this, {
      scrollTarget: target,
      duration: 0.75,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });

    const norm = ((index % N) + N) % N;
    this.activeIndex = norm;
    if (this.callbacks.onActiveIndexChange) {
      this.callbacks.onActiveIndexChange(norm);
    }
    this.wakeUp();
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
    const physicsSettled =
      Math.abs(this.scrollVelocity) < 0.0001 && Math.abs(this.scrollTarget - this.scrollCurrent) < 0.001;
    return mouseSettled && physicsSettled && !this.isDragging;
  }

  private updatePhysics(): void {
    const N = PROJECTS.length;

    // 1. Mouse coordinates lerping
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 2. Patrick Heng Spring Physics for Horizontal Carousel
    if (!this.isDragging) {
      const springDiff = this.scrollTarget - this.scrollCurrent;
      this.scrollVelocity += springDiff * 0.082;
      this.scrollVelocity *= 0.78;
    } else {
      this.scrollVelocity *= 0.88;
    }

    this.scrollCurrent += this.scrollVelocity;

    // Active project index tracking in infinite loop
    const normalizedActive = ((Math.round(this.scrollCurrent) % N) + N) % N;
    if (normalizedActive !== this.activeIndex && Math.abs(this.scrollCurrent - Math.round(this.scrollCurrent)) < 0.4) {
      this.activeIndex = normalizedActive;
      if (this.callbacks.onActiveIndexChange) {
        this.callbacks.onActiveIndexChange(normalizedActive);
      }
    }

    // Gentle precision re-normalization when idle to avoid coordinate overflow
    if (!this.isDragging && Math.abs(this.scrollVelocity) < 0.0001 && Math.abs(this.scrollTarget - this.scrollCurrent) < 0.001) {
      const normalizedCurrent = ((this.scrollCurrent % N) + N) % N;
      const shift = this.scrollCurrent - normalizedCurrent;
      if (Math.abs(shift) > 0.01) {
        this.scrollCurrent = normalizedCurrent;
        this.scrollTarget = normalizedCurrent;
      }
    }

    // 3. Signature Velocity Tilt & Drag Lean
    const tiltZ = -this.scrollVelocity * 0.045;
    const tiltY = -this.scrollVelocity * 0.065;

    // 4. Update each 3D book's position with seamless infinite modulo wrapping
    this.books.forEach((item) => {
      const book = item.group;

      // Infinite loop modular offset centered around zero [-N/2, N/2]
      let offset = (item.index - this.scrollCurrent) % N;
      while (offset > N / 2) offset -= N;
      while (offset < -N / 2) offset += N;

      const targetX = offset * this.bookSpacing;
      const distFromCenter = Math.abs(offset);
      const isHovered = this.hoveredIndex === item.index;

      // Parabolic 3D Arching
      const targetZ = (isHovered ? 0.35 : 0.0) - Math.min(distFromCenter * 0.45, 1.1);
      const targetScale = Math.max(0.85, 1.0 - distFromCenter * 0.08);

      const mouseTiltX = distFromCenter < 0.6 ? this.mouse.y * 0.05 : 0;
      const mouseTiltY = distFromCenter < 0.6 ? this.mouse.x * 0.08 : 0;

      // Prevent book from flying across the screen when wrapping boundaries
      if (Math.abs(book.position.x - targetX) > this.bookSpacing * 1.8) {
        book.position.x = targetX;
      } else {
        book.position.x = THREE.MathUtils.lerp(book.position.x, targetX, 0.16);
      }

      book.position.y = THREE.MathUtils.lerp(book.position.y, isHovered ? 0.14 : 0.0, 0.12);
      book.position.z = THREE.MathUtils.lerp(book.position.z, targetZ, 0.12);

      // Book overall rotation (Perspective tilt showing thickness and spine)
      book.rotation.z = THREE.MathUtils.lerp(book.rotation.z, tiltZ, 0.1);
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, tiltY + mouseTiltY, 0.1);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, mouseTiltX, 0.1);

      book.scale.setScalar(THREE.MathUtils.lerp(book.scale.x, targetScale, 0.12));

      // 5. Cover hinge rotation (Cracks open smoothly on hover)
      const targetCoverAngle = -item.openProgress.value * (Math.PI * 0.45);
      item.coverHinge.rotation.y = THREE.MathUtils.lerp(item.coverHinge.rotation.y, targetCoverAngle, 0.14);
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
    this.books = [];

    this.renderer.dispose();
  }
}
