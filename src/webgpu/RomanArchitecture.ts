import * as THREE from 'three';

/**
 * Procedural PBR Roman Architecture Generator (Refined Composition)
 *
 * Implements Giovanni Paolo Panini's spatial depth:
 * - Left: Majestic Corinthian Colonnade framing the view (pushed to the side)
 * - Right: Trajan's Column & Classical Arch framing the right periphery
 * - Far Center: Colosseum & distant Roman ruins receded deep in atmospheric haze
 * - Foreground: Classical Marble Lectern Plinth under the portfolio book
 */
export class RomanArchitecture {
  public group: THREE.Group;
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private stoneTexture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.stoneTexture = this.generateWeatheredStoneTexture();
    this.buildScene();
  }

  /**
   * Generates weathered ancient Roman travertine texture with organic stone grain,
   * subtle fissures, and chiaroscuro tonal depth.
   */
  private generateWeatheredStoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Warm Roman travertine base
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#d6c4ad');
    grad.addColorStop(0.5, '#c7b39b');
    grad.addColorStop(1, '#b59f85');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Weathered fissures and ancient limestone streaks
    ctx.fillStyle = 'rgba(74, 55, 36, 0.08)';
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * 1024;
      const h = Math.random() * 8 + 2;
      ctx.fillRect(0, y, 1024, h);
    }

    // Porous grain specks
    ctx.fillStyle = 'rgba(46, 33, 19, 0.05)';
    for (let i = 0; i < 1200; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 6 + 2, Math.random() * 4 + 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  private createStoneMaterial(color: number, roughness = 0.85): THREE.MeshStandardMaterial {
    const mat = new THREE.MeshStandardMaterial({
      color,
      map: this.stoneTexture,
      roughness,
      metalness: 0.05
    });
    this.materials.push(mat);
    return mat;
  }

  private buildScene(): void {
    const columnStoneMat = this.createStoneMaterial(0xd8c8b4, 0.82);
    const archStoneMat = this.createStoneMaterial(0xc6b198, 0.86);
    const distantMat = this.createStoneMaterial(0xa89680, 0.92); // Receded in atmospheric depth
    const marbleMat = this.createStoneMaterial(0xede6dc, 0.65);

    // 1. Vast Forum Ground Pavement
    this.buildGround(archStoneMat);

    // 2. Majestic Corinthian Colonnade (Framing Left Side, far from center)
    this.buildLeftFramingColonnade(columnStoneMat);

    // 3. Trajan's Monumental Column & Ruins (Framing Right Side)
    this.buildRightFramingColonnade(columnStoneMat);

    // 4. Distant Grand Colosseum Amphitheater (Deep in background z = -24)
    this.buildDistantColosseum(distantMat);

    // 5. Classical Marble Lectern Plinth under the central reading area
    this.buildCentralLectern(marbleMat, columnStoneMat);
  }

  private buildGround(material: THREE.Material): void {
    const groundGeo = new THREE.PlaneGeometry(80, 60);
    this.geometries.push(groundGeo);

    const ground = new THREE.Mesh(groundGeo, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -5.6, -15);
    ground.receiveShadow = true;
    this.group.add(ground);

    // Stepped forum terrace
    for (let s = 0; s < 3; s++) {
      const stepGeo = new THREE.BoxGeometry(40, 0.35, 14 - s * 3);
      this.geometries.push(stepGeo);
      const step = new THREE.Mesh(stepGeo, material);
      step.position.set(0, -5.6 + s * 0.35, -12 - s * 2);
      step.receiveShadow = true;
      step.castShadow = true;
      this.group.add(step);
    }
  }

  /**
   * Builds tall Corinthian columns properly pushed to the LEFT periphery (x = -9 to -13)
   */
  private buildLeftFramingColonnade(material: THREE.Material): void {
    const colonnade = new THREE.Group();
    colonnade.position.set(-9.5, -4.5, -9.0);

    const positions: [number, number, number][] = [
      [0, 0, 0],
      [-1.8, 0, -2.4],
      [-3.6, 0, -4.8]
    ];

    positions.forEach(([x, y, z]) => {
      const col = this.createCorinthianColumn(material, 12.0, 0.55);
      col.position.set(x, y, z);
      colonnade.add(col);
    });

    // Massive stone entablature spanning across the columns
    const entGeo = new THREE.BoxGeometry(5.8, 1.4, 1.6);
    this.geometries.push(entGeo);
    const ent = new THREE.Mesh(entGeo, material);
    ent.position.set(-1.8, 12.2, -2.4);
    ent.rotation.y = -0.68;
    ent.castShadow = true;
    ent.receiveShadow = true;
    colonnade.add(ent);

    // Classical Sculpted Urn / Classical Finial on pedestal
    const urnBaseGeo = new THREE.BoxGeometry(1.6, 2.4, 1.6);
    this.geometries.push(urnBaseGeo);
    const urnBase = new THREE.Mesh(urnBaseGeo, material);
    urnBase.position.set(1.4, 1.2, 1.8);
    urnBase.castShadow = true;
    urnBase.receiveShadow = true;
    colonnade.add(urnBase);

    const urnGeo = new THREE.CylinderGeometry(0.65, 0.35, 1.8, 16);
    this.geometries.push(urnGeo);
    const urn = new THREE.Mesh(urnGeo, material);
    urn.position.set(1.4, 3.2, 1.8);
    urn.castShadow = true;
    colonnade.add(urn);

    this.group.add(colonnade);
  }

  /**
   * Builds Trajan's Column and Triumphal Arch framing the RIGHT periphery (x = 8.5 to 13)
   */
  private buildRightFramingColonnade(material: THREE.Material): void {
    const rightGroup = new THREE.Group();
    rightGroup.position.set(9.5, -4.5, -10.0);

    // Trajan's Column
    const colBaseGeo = new THREE.BoxGeometry(2.4, 2.8, 2.4);
    this.geometries.push(colBaseGeo);
    const colBase = new THREE.Mesh(colBaseGeo, material);
    colBase.position.set(0, 1.4, 0);
    colBase.castShadow = true;
    colBase.receiveShadow = true;
    rightGroup.add(colBase);

    const shaftGeo = new THREE.CylinderGeometry(0.85, 0.95, 14.0, 24);
    this.geometries.push(shaftGeo);
    const shaft = new THREE.Mesh(shaftGeo, material);
    shaft.position.set(0, 9.8, 0);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    rightGroup.add(shaft);

    const capGeo = new THREE.CylinderGeometry(1.3, 0.95, 0.9, 16);
    this.geometries.push(capGeo);
    const cap = new THREE.Mesh(capGeo, material);
    cap.position.set(0, 17.2, 0);
    cap.castShadow = true;
    rightGroup.add(cap);

    // Archway Pier in middle distance
    const pierGeo = new THREE.BoxGeometry(1.8, 8.0, 1.8);
    this.geometries.push(pierGeo);
    const pier = new THREE.Mesh(pierGeo, material);
    pier.position.set(-2.8, 4.0, -3.5);
    pier.castShadow = true;
    pier.receiveShadow = true;
    rightGroup.add(pier);

    this.group.add(rightGroup);
  }

  /**
   * Distant Colosseum positioned deep in the background (z = -25), creating vast panoramic scale
   * without awkward horizontal beams obstructing the central view.
   */
  private buildDistantColosseum(material: THREE.Material): void {
    const colosseum = new THREE.Group();
    // Positioned deep on the earth horizon, slightly to the left like in Panini's painting
    colosseum.position.set(-2.0, -5.6, -26.0);

    const radius = 24.0;
    const segments = 28;
    const arcAngle = Math.PI * 0.52;
    const startAngle = -arcAngle / 2 - 0.15;

    // 3 Tiers of classical Roman arches
    const tierHeights = [3.6, 3.2, 2.8];
    let currentY = 0;

    tierHeights.forEach((h) => {
      // Slender cornice trim
      const ringGeo = new THREE.CylinderGeometry(
        radius + 0.1,
        radius + 0.1,
        0.2,
        segments,
        1,
        true,
        startAngle,
        arcAngle
      );
      this.geometries.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, material);
      ring.position.y = currentY;
      ring.castShadow = true;
      ring.receiveShadow = true;
      colosseum.add(ring);

      // Arc wall with vertical arched piers (Sky shines through arches!)
      for (let s = 0; s < segments; s++) {
        const theta = startAngle + (s / segments) * arcAngle;
        const px = Math.sin(theta) * radius;
        const pz = Math.cos(theta) * radius - radius;

        // Slender stone pier between arches
        const pierGeo = new THREE.BoxGeometry(0.75, h, 1.2);
        this.geometries.push(pierGeo);
        const pier = new THREE.Mesh(pierGeo, material);
        pier.position.set(px, currentY + h / 2, pz);
        pier.rotation.y = theta;
        pier.castShadow = true;
        pier.receiveShadow = true;
        colosseum.add(pier);

        // Rounded arch crown over each bay
        const archTopGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8, 1, false, 0, Math.PI);
        this.geometries.push(archTopGeo);
        const archTop = new THREE.Mesh(archTopGeo, material);
        archTop.rotation.z = Math.PI / 2;
        archTop.rotation.y = theta;
        archTop.position.set(px, currentY + h * 0.78, pz);
        archTop.castShadow = true;
        colosseum.add(archTop);
      }

      currentY += h;
    });

    // Solid top attic wall
    const atticGeo = new THREE.CylinderGeometry(
      radius,
      radius,
      2.0,
      segments,
      1,
      true,
      startAngle,
      arcAngle
    );
    this.geometries.push(atticGeo);
    const attic = new THREE.Mesh(atticGeo, material);
    attic.position.y = currentY + 1.0;
    attic.castShadow = true;
    attic.receiveShadow = true;
    colosseum.add(attic);

    this.group.add(colosseum);
  }

  /**
   * Classical Marble Lectern Plinth under the central reading area
   */
  private buildCentralLectern(marbleMat: THREE.Material, stoneMat: THREE.Material): void {
    const lecternGroup = new THREE.Group();
    // Grounded naturally on the forum floor under the floating tome
    lecternGroup.position.set(0, -5.6, -1.8);

    // Stepped stone pedestal
    const baseGeo = new THREE.BoxGeometry(8.4, 0.45, 3.6);
    this.geometries.push(baseGeo);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.225;
    base.castShadow = true;
    base.receiveShadow = true;
    lecternGroup.add(base);

    const pedestalGeo = new THREE.BoxGeometry(7.6, 1.5, 2.8);
    this.geometries.push(pedestalGeo);
    const pedestal = new THREE.Mesh(pedestalGeo, marbleMat);
    pedestal.position.y = 1.2;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    lecternGroup.add(pedestal);

    // Molded top cornice
    const topGeo = new THREE.BoxGeometry(8.0, 0.35, 3.2);
    this.geometries.push(topGeo);
    const top = new THREE.Mesh(topGeo, marbleMat);
    top.position.y = 2.1;
    top.castShadow = true;
    top.receiveShadow = true;
    lecternGroup.add(top);

    this.group.add(lecternGroup);
  }

  private createCorinthianColumn(material: THREE.Material, height: number, radius: number): THREE.Group {
    const col = new THREE.Group();

    // Plinth base
    const plinthGeo = new THREE.BoxGeometry(radius * 2.8, 0.5, radius * 2.8);
    this.geometries.push(plinthGeo);
    const plinth = new THREE.Mesh(plinthGeo, material);
    plinth.position.y = 0.25;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    col.add(plinth);

    // Torus base ring
    const torusGeo = new THREE.CylinderGeometry(radius * 1.35, radius * 1.4, 0.4, 24);
    this.geometries.push(torusGeo);
    const torus = new THREE.Mesh(torusGeo, material);
    torus.position.y = 0.65;
    torus.castShadow = true;
    torus.receiveShadow = true;
    col.add(torus);

    // Fluted shaft
    const shaftGeo = new THREE.CylinderGeometry(radius * 0.88, radius, height - 1.8, 24);
    this.geometries.push(shaftGeo);
    const shaft = new THREE.Mesh(shaftGeo, material);
    shaft.position.y = (height - 1.8) / 2 + 0.85;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    col.add(shaft);

    // Capital
    const capGeo = new THREE.CylinderGeometry(radius * 1.5, radius * 0.95, 0.9, 16);
    this.geometries.push(capGeo);
    const cap = new THREE.Mesh(capGeo, material);
    cap.position.y = height - 0.5;
    cap.castShadow = true;
    col.add(cap);

    const abacusGeo = new THREE.BoxGeometry(radius * 2.6, 0.3, radius * 2.6);
    this.geometries.push(abacusGeo);
    const abacus = new THREE.Mesh(abacusGeo, material);
    abacus.position.y = height - 0.05;
    abacus.castShadow = true;
    abacus.receiveShadow = true;
    col.add(abacus);

    return col;
  }

  public dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    if (this.stoneTexture) {
      this.stoneTexture.dispose();
    }
  }
}

