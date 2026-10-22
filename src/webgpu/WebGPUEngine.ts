import * as THREE from 'three';
import gsap from 'gsap';
import { PROJECTS, type ProjectItem } from '../data/projects';

export interface EngineCallbacks {
  onSelectProject?: (project: ProjectItem) => void;
  onActiveIndexChange?: (index: number) => void;
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
 * Patrick Heng's authentic 3D Spring Card Carousel for Justine Soulié
 * - 8 Floating Paper Cloth Project Posters
 * - Authentic paper-normals.jpg normal map with tactile creases & folds
 * - Parabolic 3D carousel arching with velocity-driven tilt & drag momentum
 * - Subdivided cloth mesh vertex deformation
 */
export class WebGPUEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cards: CardItem[] = [];

  private paperNormalTexture: THREE.Texture | null = null;
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
  private readonly cardSpacing = 3.65;

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

    // 2. Camera Setup (Calibrated for Justine Soulié's poster aspect ratio)
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    this.camera.position.set(0, 0, 7.5);
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

    // 4. Load authentic Patrick Heng paper normal map
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

    // 5. Studio museum lighting
    this.setupLighting();

    // 6. Shadow-receiving transparent backdrop
    this.buildBackdrop();

    // 7. Build floating paper posters
    this.buildCards();

    // 8. Event listeners & animation loop
    this.setupEvents();
    this.startLoop();
  }

  private setupLighting(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8e2dc, 1.25);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff9f2, 1.7);
    sunLight.position.set(-6, 9, 8);
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

    const fillLight = new THREE.DirectionalLight(0xf5ebe0, 0.6);
    fillLight.position.set(7, -3, 6);
    this.scene.add(fillLight);
  }

  private buildBackdrop(): void {
    const wallGeo = new THREE.PlaneGeometry(42, 28);
    this.geometries.push(wallGeo);

    const wallMat = new THREE.ShadowMaterial({ opacity: 0.14 });
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

    ctx.shadowColor = 'rgba(24, 18, 14, 0.38)';
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
    const shadowTex = this.generatePaperShadowTexture();
    const texLoader = new THREE.TextureLoader();

    PROJECTS.forEach((project, index) => {
      const cardGroup = new THREE.Group();

      // 1. Load actual project artwork poster
      const posterTex = texLoader.load(project.posterImage, () => this.wakeUp());
      posterTex.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(posterTex);

      // 2. High-performance PBR material with authentic paper normals
      const paperMat = new THREE.MeshStandardMaterial({
        map: posterTex,
        normalMap: this.paperNormalTexture,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.84,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
      this.materials.push(paperMat);

      // 3. Subdivided paper mesh (32x32) for tactile cloth ripple & parabolic curve
      const frontPlaneGeo = new THREE.PlaneGeometry(cardW, cardH, 32, 32);
      this.geometries.push(frontPlaneGeo);
      const originalPositions = new Float32Array(frontPlaneGeo.attributes.position.array);

      const frontMesh = new THREE.Mesh(frontPlaneGeo, paperMat);
      frontMesh.position.set(0, 0, 0.02);
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;
      frontMesh.userData = { project, index };
      cardGroup.add(frontMesh);

      // 4. Soft floating paper drop shadow
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
    const targetIdx = Math.max(0, Math.min(PROJECTS.length - 1, Math.round(this.scrollCurrent)));

    gsap.to(this, {
      scrollTarget: targetIdx,
      duration: 0.65,
      ease: 'power3.out',
      onUpdate: () => this.wakeUp()
    });

    this.wakeUp();
  }

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
          card.localHit.set(
            intersects[0].point.x - card.group.position.x,
            intersects[0].point.y - card.group.position.y
          );
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
    const time = performance.now() * 0.001;

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

    const nearestIndex = Math.max(0, Math.min(PROJECTS.length - 1, Math.round(this.scrollCurrent)));
    if (nearestIndex !== this.activeIndex && Math.abs(this.scrollCurrent - nearestIndex) < 0.4) {
      this.activeIndex = nearestIndex;
      if (this.callbacks.onActiveIndexChange) {
        this.callbacks.onActiveIndexChange(nearestIndex);
      }
    }

    // 3. Signature Velocity Tilt
    const tiltZ = -this.scrollVelocity * 0.045;
    const tiltY = -this.scrollVelocity * 0.065;

    // 4. Update each card's 3D position, depth, tilt & cloth mesh deformation
    this.cards.forEach((item) => {
      const card = item.group;
      const offset = item.index - this.scrollCurrent;
      const distFromCenter = Math.abs(offset);

      const targetX = offset * this.cardSpacing;
      const isHovered = this.hoveredIndex === item.index;
      const targetZ = (isHovered ? 0.32 : 0.0) - Math.min(distFromCenter * 0.42, 0.85);
      const targetScale = Math.max(0.86, 1.0 - distFromCenter * 0.12);

      const mouseTiltX = distFromCenter < 0.6 ? this.mouse.y * 0.06 : 0;
      const mouseTiltY = distFromCenter < 0.6 ? this.mouse.x * 0.08 : 0;

      card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, 0.14);
      card.position.y = THREE.MathUtils.lerp(card.position.y, isHovered ? 0.12 : 0.0, 0.12);
      card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.12);

      card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, tiltZ, 0.1);
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, tiltY + mouseTiltY, 0.1);
      card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, mouseTiltX, 0.1);

      card.scale.setScalar(THREE.MathUtils.lerp(card.scale.x, targetScale, 0.12));

      // 5. Tactile 3D cloth paper wave deformation
      const posAttr = item.geometry.attributes.position;
      const orig = item.originalPositions;
      const vel = this.scrollVelocity;
      const hover = item.hoverProgress.value;

      const ndcX = card.position.x / 4.5;
      const clampedX = Math.max(-1.0, Math.min(1.0, ndcX));
      const normX = (clampedX + 1.0) * 0.5;
      const parabola = 4.0 * normX * (1.0 - normX);
      const archZ = parabola * 0.32;

      for (let v = 0; v < posAttr.count; v++) {
        const ox = orig[v * 3];
        const oy = orig[v * 3 + 1];

        const dragWave = Math.sin(oy * 1.8 + time * 2.8) * vel * 0.3;
        const paperCurl = -Math.sin(oy * 8.0 + item.index) * 0.012;
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
