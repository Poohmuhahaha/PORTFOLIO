import * as THREE from 'three';
import { createRomeBackgroundTexture } from './RomeBackground';

/**
 * Procedural 3D Renaissance Library (Biblioteca Antiqua)
 *
 * Implements physical architecture & lighting inspired by Michelangelo's Laurentian Library:
 * 1. Solid Tuscan walnut scholar desk with inlaid Florentine leather writing blotter (No floating planks!)
 * 2. Dedicated Renaissance Folio Showcase Rack: An open, unobstructed classical bookstand with ornate carved volute bookends
 * 3. Authentic turned brass 3-candle candelabra with realistic beeswax candles, glowing wick, and animated flame physics
 * 4. Classical Serliana arched window with fluted travertine columns and painterly Roman sky
 * 5. Tuscan terracotta & Carrara marble checkerboard parquet floor
 * 6. Coffered cassone ceiling overhead
 */
export class RenaissanceLibrary {
  public group: THREE.Group;
  public candleLight!: THREE.PointLight;
  private flameMeshes: THREE.Mesh[] = [];
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private textures: THREE.Texture[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildLibrary();
  }

  private buildLibrary(): void {
    const woodTexture = this.generateWalnutWoodTexture();
    const floorTexture = this.generateCheckerboardFloorTexture();
    const booksTexture = this.generateRichBookshelfTexture();
    const stoneTexture = this.generateTravertineStoneTexture();
    const leatherTexture = this.generateLeatherBlotterTexture();
    const windowViewTexture = createRomeBackgroundTexture();

    // 1. Physically Based Materials
    const walnutMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.45,
      metalness: 0.05
    });
    this.materials.push(walnutMat);

    const darkWalnutMat = new THREE.MeshStandardMaterial({
      color: 0x1f1007,
      roughness: 0.52,
      metalness: 0.04
    });
    this.materials.push(darkWalnutMat);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.28,
      metalness: 0.12
    });
    this.materials.push(floorMat);

    const bookshelfMat = new THREE.MeshStandardMaterial({
      map: booksTexture,
      roughness: 0.65,
      metalness: 0.16
    });
    this.materials.push(bookshelfMat);

    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 0.78,
      metalness: 0.02
    });
    this.materials.push(stoneMat);

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Rich antique brass
      roughness: 0.22,
      metalness: 0.92
    });
    this.materials.push(brassMat);

    const deskBlotterMat = new THREE.MeshStandardMaterial({
      map: leatherTexture,
      roughness: 0.42,
      metalness: 0.08
    });
    this.materials.push(deskBlotterMat);

    const beeswaxMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebd6, // Real translucent beeswax
      roughness: 0.35,
      metalness: 0.0
    });
    this.materials.push(beeswaxMat);

    const parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xdfcca6,
      roughness: 0.85,
      metalness: 0.02
    });
    this.materials.push(parchmentMat);

    // 2. Build Library Components
    this.buildFloor(floorMat);
    this.buildSideBookcases(walnutMat, bookshelfMat, darkWalnutMat);
    this.buildBackWallAndWindow(stoneMat, walnutMat, bookshelfMat, windowViewTexture);
    this.buildCofferedCeiling(darkWalnutMat, brassMat);
    this.buildScholarDesk(walnutMat, brassMat, deskBlotterMat, beeswaxMat, parchmentMat);
    this.buildOpenBookRack(walnutMat, darkWalnutMat, brassMat);
  }

  /**
   * Generates high-resolution checkerboard Tuscan terracotta & Carrara marble parquet
   */
  private generateCheckerboardFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const tiles = 8;
    const size = 1024 / tiles;

    for (let x = 0; x < tiles; x++) {
      for (let y = 0; y < tiles; y++) {
        const isWhite = (x + y) % 2 === 0;
        if (isWhite) {
          ctx.fillStyle = '#eddcc5';
          ctx.fillRect(x * size, y * size, size, size);

          ctx.strokeStyle = 'rgba(150, 130, 105, 0.22)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x * size + 10, y * size + 20);
          ctx.bezierCurveTo(
            x * size + 40,
            y * size + 60,
            x * size + 80,
            y * size + 40,
            x * size + 110,
            y * size + 100
          );
          ctx.stroke();
        } else {
          ctx.fillStyle = '#32180c';
          ctx.fillRect(x * size, y * size, size, size);

          ctx.fillStyle = 'rgba(198, 140, 80, 0.07)';
          ctx.fillRect(x * size + 4, y * size + 4, size - 8, size - 8);
        }

        ctx.strokeStyle = '#140803';
        ctx.lineWidth = 3;
        ctx.strokeRect(x * size, y * size, size, size);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 5);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Rich polished Renaissance walnut grain texture
   */
  private generateWalnutWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3d2213';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(18, 9, 4, 0.32)';
    for (let y = 0; y < 512; y += 3) {
      ctx.fillRect(0, y, 512, 1.5);
    }

    ctx.fillStyle = 'rgba(110, 68, 35, 0.2)';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(0, Math.random() * 512, 512, Math.random() * 5 + 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Florentine dark green/brown embossed leather desk blotter
   */
  private generateLeatherBlotterTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Deep antique dark green/brown leather
    ctx.fillStyle = '#1c281e';
    ctx.fillRect(0, 0, 1024, 512);

    // Leather fine grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let i = 0; i < 1200; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, 3, 3);
    }

    // Gold Leaf Embossed Florentine Tooling along the perimeter
    ctx.strokeStyle = '#c6a258';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 1024 - 48, 512 - 48);

    ctx.strokeStyle = '#8d7036';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 1024 - 72, 512 - 72);

    // Corner fleur-de-lis
    const drawFleur = (x: number, y: number) => {
      ctx.fillStyle = '#d4af37';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚜', x, y);
    };
    drawFleur(44, 44);
    drawFleur(1024 - 44, 44);
    drawFleur(1024 - 44, 512 - 44);
    drawFleur(44, 512 - 44);

    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Dense antique bookshelves with gilded spine foil
   */
  private generateRichBookshelfTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#110703';
    ctx.fillRect(0, 0, 1024, 1024);

    const rows = 4;
    const rowH = 1024 / rows;
    const bookColors = [
      '#621814', '#183020', '#142236', '#422814', '#643412', '#24140a', '#641e2a'
    ];

    for (let r = 0; r < rows; r++) {
      const rowY = r * rowH;

      ctx.fillStyle = '#3a2010';
      ctx.fillRect(0, rowY + rowH - 16, 1024, 16);
      ctx.fillStyle = '#160a04';
      ctx.fillRect(0, rowY + rowH - 2, 1024, 2);

      let currentX = 8;
      while (currentX < 1016) {
        const bookW = Math.random() * 20 + 16;
        const bookH = rowH - 22 - Math.random() * 26;
        const bookY = rowY + rowH - 16 - bookH;
        const color = bookColors[Math.floor(Math.random() * bookColors.length)];

        ctx.fillStyle = color;
        ctx.fillRect(currentX, bookY, bookW, bookH);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(currentX, bookY, 2, bookH);
        ctx.fillRect(currentX + bookW - 2, bookY, 2, bookH);

        ctx.fillStyle = '#d4af37';
        for (let rib = 1; rib <= 4; rib++) {
          const ribY = bookY + (bookH * rib) / 5;
          ctx.fillRect(currentX + 3, ribY - 2, bookW - 6, 3);
        }

        if (bookH > 140) {
          ctx.fillStyle = '#c8a245';
          ctx.fillRect(currentX + 4, bookY + bookH * 0.28, bookW - 8, 16);
          ctx.fillStyle = '#120803';
          ctx.fillRect(currentX + 6, bookY + bookH * 0.28 + 4, bookW - 12, 2);
          ctx.fillRect(currentX + 6, bookY + bookH * 0.28 + 9, bookW - 12, 2);
        }

        currentX += bookW + 1;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Warm Roman Travertine limestone wall texture
   */
  private generateTravertineStoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#c7b79e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(64, 45, 28, 0.08)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 24 + 4, Math.random() * 8 + 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  /**
   * 1. Ground floor with checkerboard parquet
   */
  private buildFloor(material: THREE.Material): void {
    const floorGeo = new THREE.PlaneGeometry(30, 24);
    this.geometries.push(floorGeo);
    const floor = new THREE.Mesh(floorGeo, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.2, -2.0);
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  /**
   * 2. Side Bookcases: Placed safely against walls so they NEVER intersect camera view
   */
  private buildSideBookcases(woodMat: THREE.Material, booksMat: THREE.Material, darkWoodMat: THREE.Material): void {
    const leftBookcase = this.createWallBookcaseUnit(woodMat, booksMat, darkWoodMat, 5.0, 7.8, 0.85);
    leftBookcase.position.set(-6.2, -3.2, -1.2);
    leftBookcase.rotation.y = 0.1;
    this.group.add(leftBookcase);

    const rightBookcase = this.createWallBookcaseUnit(woodMat, booksMat, darkWoodMat, 5.0, 7.8, 0.85);
    rightBookcase.position.set(6.2, -3.2, -1.2);
    rightBookcase.rotation.y = -0.1;
    this.group.add(rightBookcase);
  }

  private createWallBookcaseUnit(
    woodMat: THREE.Material,
    booksMat: THREE.Material,
    darkWoodMat: THREE.Material,
    width: number,
    height: number,
    depth: number
  ): THREE.Group {
    const unit = new THREE.Group();

    const backGeo = new THREE.BoxGeometry(width, height, 0.12);
    this.geometries.push(backGeo);
    const back = new THREE.Mesh(backGeo, darkWoodMat);
    back.position.set(0, height / 2, -depth / 2);
    back.receiveShadow = true;
    unit.add(back);

    const booksGeo = new THREE.PlaneGeometry(width * 0.92, height * 0.88);
    this.geometries.push(booksGeo);
    const books = new THREE.Mesh(booksGeo, booksMat);
    books.position.set(0, height / 2, -depth / 2 + 0.1);
    books.castShadow = true;
    books.receiveShadow = true;
    unit.add(books);

    const bays = 3;
    for (let b = 0; b <= bays; b++) {
      const px = -width / 2 + b * (width / bays);
      const pilasterGeo = new THREE.BoxGeometry(0.24, height, depth);
      this.geometries.push(pilasterGeo);
      const pilaster = new THREE.Mesh(pilasterGeo, woodMat);
      pilaster.position.set(px, height / 2, 0);
      pilaster.castShadow = true;
      pilaster.receiveShadow = true;
      unit.add(pilaster);
    }

    const shelves = 4;
    for (let s = 1; s < shelves; s++) {
      const sy = (s * height) / shelves;
      const shelfGeo = new THREE.BoxGeometry(width, 0.16, depth);
      this.geometries.push(shelfGeo);
      const shelf = new THREE.Mesh(shelfGeo, woodMat);
      shelf.position.set(0, sy, 0);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      unit.add(shelf);
    }

    const corniceGeo = new THREE.BoxGeometry(width + 0.3, 0.36, depth + 0.2);
    this.geometries.push(corniceGeo);
    const cornice = new THREE.Mesh(corniceGeo, woodMat);
    cornice.position.set(0, height + 0.18, 0);
    cornice.castShadow = true;
    unit.add(cornice);

    return unit;
  }

  /**
   * 3. Back Wall with Grand Serliana Arched Window
   */
  private buildBackWallAndWindow(
    stoneMat: THREE.Material,
    woodMat: THREE.Material,
    booksMat: THREE.Material,
    windowViewTexture: THREE.Texture
  ): void {
    const backGroup = new THREE.Group();
    backGroup.position.set(0, -3.2, -5.8);

    const wallW = 18.0;
    const wallH = 9.0;

    const pierW = 5.2;
    [-wallW / 2 + pierW / 2, wallW / 2 - pierW / 2].forEach((px) => {
      const pierGeo = new THREE.BoxGeometry(pierW, wallH, 0.8);
      this.geometries.push(pierGeo);
      const pier = new THREE.Mesh(pierGeo, stoneMat);
      pier.position.set(px, wallH / 2, 0);
      pier.castShadow = true;
      pier.receiveShadow = true;
      backGroup.add(pier);

      const bayGeo = new THREE.PlaneGeometry(pierW * 0.75, wallH * 0.7);
      this.geometries.push(bayGeo);
      const bay = new THREE.Mesh(bayGeo, booksMat);
      bay.position.set(px, wallH * 0.45, 0.42);
      backGroup.add(bay);
    });

    const sillGeo = new THREE.BoxGeometry(7.6, 0.8, 1.0);
    this.geometries.push(sillGeo);
    const sill = new THREE.Mesh(sillGeo, stoneMat);
    sill.position.set(0, 0.4, 0);
    sill.castShadow = true;
    sill.receiveShadow = true;
    backGroup.add(sill);

    const archGeo = new THREE.CylinderGeometry(3.8, 3.8, 1.0, 24, 1, false, 0, Math.PI);
    this.geometries.push(archGeo);
    const arch = new THREE.Mesh(archGeo, stoneMat);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 6.4, 0);
    arch.castShadow = true;
    backGroup.add(arch);

    // Fluted Classical Marble Columns with capital and base
    [-3.4, 3.4].forEach((cx) => {
      const colBaseGeo = new THREE.BoxGeometry(0.65, 0.28, 0.65);
      this.geometries.push(colBaseGeo);
      const colBase = new THREE.Mesh(colBaseGeo, stoneMat);
      colBase.position.set(cx, 0.95, 0.1);
      backGroup.add(colBase);

      const colGeo = new THREE.CylinderGeometry(0.22, 0.26, 5.2, 16);
      this.geometries.push(colGeo);
      const col = new THREE.Mesh(colGeo, stoneMat);
      col.position.set(cx, 3.65, 0.1);
      col.castShadow = true;
      col.receiveShadow = true;
      backGroup.add(col);

      const colCapGeo = new THREE.BoxGeometry(0.65, 0.28, 0.65);
      this.geometries.push(colCapGeo);
      const colCap = new THREE.Mesh(colCapGeo, stoneMat);
      colCap.position.set(cx, 6.35, 0.1);
      backGroup.add(colCap);
    });

    // Elegant Palladian arch transom and slender side mullions (Central vista completely clear!)
    const barVGeo = new THREE.BoxGeometry(0.08, 5.8, 0.14);
    this.geometries.push(barVGeo);
    [-2.2, 2.2].forEach((bx) => {
      const barV = new THREE.Mesh(barVGeo, woodMat);
      barV.position.set(bx, 3.9, 0);
      backGroup.add(barV);
    });

    // High transom bar dividing arch lunette from lower rectangular window (Above eye line)
    const barHGeo = new THREE.BoxGeometry(6.6, 0.08, 0.14);
    this.geometries.push(barHGeo);
    const barH = new THREE.Mesh(barHGeo, woodMat);
    barH.position.set(0, 5.2, 0);
    backGroup.add(barH);

    // Grand panoramic vista backdrop plane featuring authentic Panini Roman Capriccio oil painting
    const vistaGeo = new THREE.PlaneGeometry(15.0, 8.47);
    this.geometries.push(vistaGeo);
    const vistaMat = new THREE.MeshBasicMaterial({
      map: windowViewTexture,
      toneMapped: false
    });
    this.materials.push(vistaMat);
    const vista = new THREE.Mesh(vistaGeo, vistaMat);
    vista.position.set(0, 4.4, -0.25);
    backGroup.add(vista);

    this.group.add(backGroup);
  }

  /**
   * 4. Coffered Ceiling
   */
  private buildCofferedCeiling(darkWoodMat: THREE.Material, brassMat: THREE.Material): void {
    const ceilingGroup = new THREE.Group();
    ceilingGroup.position.set(0, 5.4, -1.5);

    const ceilGeo = new THREE.BoxGeometry(20, 0.3, 14);
    this.geometries.push(ceilGeo);
    const ceil = new THREE.Mesh(ceilGeo, darkWoodMat);
    ceilingGroup.add(ceil);

    for (let x = -7.5; x <= 7.5; x += 2.5) {
      const beamGeoX = new THREE.BoxGeometry(0.32, 0.4, 14);
      this.geometries.push(beamGeoX);
      const beamX = new THREE.Mesh(beamGeoX, darkWoodMat);
      beamX.position.set(x, -0.2, 0);
      ceilingGroup.add(beamX);
    }

    for (let z = -5.0; z <= 5.0; z += 2.5) {
      const beamGeoZ = new THREE.BoxGeometry(16, 0.4, 0.32);
      this.geometries.push(beamGeoZ);
      const beamZ = new THREE.Mesh(beamGeoZ, darkWoodMat);
      beamZ.position.set(0, -0.2, z);
      ceilingGroup.add(beamZ);
    }

    const rosetteGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8);
    this.geometries.push(rosetteGeo);
    for (let rx = -5.0; rx <= 5.0; rx += 2.5) {
      for (let rz = -2.5; rz <= 2.5; rz += 2.5) {
        const rosette = new THREE.Mesh(rosetteGeo, brassMat);
        rosette.position.set(rx + 1.25, -0.15, rz + 1.25);
        ceilingGroup.add(rosette);
      }
    }

    this.group.add(ceilingGroup);
  }

  /**
   * 5. Solid Scholar's Walnut Table with Inlaid Florentine Leather Blotter
   * Continuous, grounded desk surface (NO floating planks!)
   */
  private buildScholarDesk(
    walnutMat: THREE.Material,
    brassMat: THREE.Material,
    blotterMat: THREE.Material,
    waxMat: THREE.Material,
    parchmentMat: THREE.Material
  ): void {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, -3.2, 0.0);

    const deskW = 9.8;
    const deskD = 3.6;
    const deskH = 1.6; // Table top surface at y = -1.6

    // Heavy Walnut Table Top with beveled edge
    const topGeo = new THREE.BoxGeometry(deskW, 0.16, deskD);
    this.geometries.push(topGeo);
    const top = new THREE.Mesh(topGeo, walnutMat);
    top.position.set(0, deskH, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Florentine Leather Writing Blotter sitting flush on the desk top
    const blotterGeo = new THREE.BoxGeometry(6.4, 0.02, 2.2);
    this.geometries.push(blotterGeo);
    const blotter = new THREE.Mesh(blotterGeo, blotterMat);
    blotter.position.set(0, deskH + 0.09, 0.55);
    blotter.receiveShadow = true;
    deskGroup.add(blotter);

    // Turned Renaissance Legs (4 corners) with brass ferrules
    const legGeo = new THREE.CylinderGeometry(0.18, 0.24, deskH - 0.08, 14);
    this.geometries.push(legGeo);
    const ferruleGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 14);
    this.geometries.push(ferruleGeo);

    [
      [-deskW / 2 + 0.6, -deskD / 2 + 0.6],
      [deskW / 2 - 0.6, -deskD / 2 + 0.6],
      [-deskW / 2 + 0.6, deskD / 2 - 0.6],
      [deskW / 2 - 0.6, deskD / 2 - 0.6]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, walnutMat);
      leg.position.set(lx, deskH / 2, lz);
      leg.castShadow = true;
      deskGroup.add(leg);

      const ferrule = new THREE.Mesh(ferruleGeo, brassMat);
      ferrule.position.set(lx, 0.06, lz);
      deskGroup.add(ferrule);
    });

    // Realistic Renaissance 3-Branch Candelabra on the left side of desk
    const candelabra = this.buildAuthenticCandelabra(brassMat, waxMat);
    candelabra.position.set(-4.2, deskH + 0.08, 0.2);
    deskGroup.add(candelabra);

    // Antique Brass Inkpot & White Feather Quill
    const inkpotGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.32, 12);
    this.geometries.push(inkpotGeo);
    const inkpot = new THREE.Mesh(inkpotGeo, brassMat);
    inkpot.position.set(-3.7, deskH + 0.2, 0.9);
    deskGroup.add(inkpot);

    const quillGeo = new THREE.CylinderGeometry(0.015, 0.04, 1.1, 6);
    this.geometries.push(quillGeo);
    const quill = new THREE.Mesh(quillGeo, waxMat);
    quill.rotation.z = 0.45;
    quill.rotation.x = -0.15;
    quill.position.set(-3.5, deskH + 0.65, 0.9);
    deskGroup.add(quill);

    // Celestial Armillary Sphere on the right side of desk
    const armillary = new THREE.Group();
    armillary.position.set(4.2, deskH + 0.08, 0.2);

    const aBaseGeo = new THREE.CylinderGeometry(0.38, 0.52, 0.16, 16);
    this.geometries.push(aBaseGeo);
    const aBase = new THREE.Mesh(aBaseGeo, walnutMat);
    armillary.add(aBase);

    const aStemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.5, 12);
    this.geometries.push(aStemGeo);
    const aStem = new THREE.Mesh(aStemGeo, brassMat);
    aStem.position.y = 0.35;
    armillary.add(aStem);

    [0.6, 0.5, 0.4].forEach((radius, rIndex) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.025, 8, 24);
      this.geometries.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, brassMat);
      ring.rotation.x = (rIndex * Math.PI) / 3;
      ring.rotation.y = (rIndex * Math.PI) / 4;
      ring.position.y = 0.85;
      ring.castShadow = true;
      armillary.add(ring);
    });

    const earthGeo = new THREE.SphereGeometry(0.14, 12, 12);
    this.geometries.push(earthGeo);
    const earth = new THREE.Mesh(earthGeo, brassMat);
    earth.position.y = 0.85;
    armillary.add(earth);

    // Rolled Parchment scrolls
    const scrollGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 12);
    this.geometries.push(scrollGeo);
    const scroll1 = new THREE.Mesh(scrollGeo, parchmentMat);
    scroll1.rotation.z = Math.PI / 2;
    scroll1.rotation.y = 0.35;
    scroll1.position.set(3.4, deskH + 0.2, 0.9);
    scroll1.castShadow = true;
    armillary.add(scroll1);

    deskGroup.add(armillary);

    this.group.add(deskGroup);
  }

  /**
   * Generates a soft radial optical glow halo for candle flames
   */
  private generateFlameGlowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 195, 80, 0.75)');
    grad.addColorStop(0.5, 'rgba(255, 110, 15, 0.32)');
    grad.addColorStop(0.85, 'rgba(200, 50, 0, 0.08)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Builds an authentic turned brass candelabra with realistic teardrop flame geometry & optical glow
   */
  private buildAuthenticCandelabra(brassMat: THREE.Material, waxMat: THREE.Material): THREE.Group {
    const candelabra = new THREE.Group();
    const flameGlowTex = this.generateFlameGlowTexture();

    // Turned Stepped Brass Base
    const cBaseGeo = new THREE.CylinderGeometry(0.42, 0.55, 0.14, 16);
    this.geometries.push(cBaseGeo);
    const cBase = new THREE.Mesh(cBaseGeo, brassMat);
    cBase.position.y = 0.07;
    cBase.castShadow = true;
    candelabra.add(cBase);

    // Turned Fluted Baluster Stem
    const cStemGeo = new THREE.CylinderGeometry(0.07, 0.12, 1.1, 14);
    this.geometries.push(cStemGeo);
    const cStem = new THREE.Mesh(cStemGeo, brassMat);
    cStem.position.y = 0.65;
    cStem.castShadow = true;
    candelabra.add(cStem);

    // Flame Core Material (Luminous white-yellow with soft additive glow)
    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff6dc
    });
    this.materials.push(flameCoreMat);

    // Three graceful S-curved branches
    [-0.42, 0, 0.42].forEach((cx, idx) => {
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 8);
      this.geometries.push(armGeo);
      const arm = new THREE.Mesh(armGeo, brassMat);
      arm.rotation.z = cx > 0 ? 0.72 : cx < 0 ? -0.72 : 0;
      arm.position.set(cx * 0.5, 0.85, 0);
      candelabra.add(arm);

      // Brass Bobeche (Drip catcher cup)
      const bobecheGeo = new THREE.CylinderGeometry(0.14, 0.06, 0.08, 12);
      this.geometries.push(bobecheGeo);
      const bobeche = new THREE.Mesh(bobecheGeo, brassMat);
      bobeche.position.set(cx, 1.05, 0);
      bobeche.castShadow = true;
      candelabra.add(bobeche);

      // Beeswax Candle Stick
      const candleH = 0.65 + (idx === 1 ? 0.2 : 0);
      const waxGeo = new THREE.CylinderGeometry(0.065, 0.07, candleH, 12);
      this.geometries.push(waxGeo);
      const wax = new THREE.Mesh(waxGeo, waxMat);
      wax.position.set(cx, 1.05 + candleH / 2, 0);
      wax.castShadow = true;
      candelabra.add(wax);

      // Blackened Wick
      const wickGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6);
      this.geometries.push(wickGeo);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      this.materials.push(wickMat);
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(cx, 1.05 + candleH + 0.04, 0);
      candelabra.add(wick);

      // Teardrop Flame Geometry (Elongated cone tapering at tip)
      const flameGeo = new THREE.ConeGeometry(0.045, 0.18, 10);
      this.geometries.push(flameGeo);
      const flame = new THREE.Mesh(flameGeo, flameCoreMat);
      flame.position.set(cx, 1.05 + candleH + 0.12, 0);
      candelabra.add(flame);
      this.flameMeshes.push(flame);

      // Warm Optical Candle Glow Sprite (Bloom effect without heavy post-processing overhead)
      const glowMat = new THREE.SpriteMaterial({
        map: flameGlowTex,
        color: 0xffa836,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.82,
        depthWrite: false
      });
      this.materials.push(glowMat);
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(0.65, 0.65, 0.65);
      glowSprite.position.set(cx, 1.05 + candleH + 0.14, 0);
      candelabra.add(glowSprite);
    });

    // Dynamic Candle PointLight with realistic inverse-square decay
    this.candleLight = new THREE.PointLight(0xff9429, 2.8, 8.5, 2.0);
    this.candleLight.position.set(0, 2.0, 0.1);
    this.candleLight.castShadow = true;
    this.candleLight.shadow.bias = -0.00015;
    candelabra.add(this.candleLight);

    return candelabra;
  }

  /**
   * 6. Dedicated Low Renaissance Folio Cradle / Lectern Stand
   * Open, airy, low-profile cradle resting directly on the scholar desk at z = -0.15.
   * Completely unobstructed: NO overhead beams, NO tall backboards, NO blocking of the Roman vista!
   * The 5 antique volumes rest securely on a carved walnut & brass ledge with low scroll bookends.
   */
  private buildOpenBookRack(walnutMat: THREE.Material, darkWoodMat: THREE.Material, brassMat: THREE.Material): void {
    const rackGroup = new THREE.Group();
    // Positioned directly on the desk surface at z = -0.15 (Desk top is at y = -1.6, surface at -1.52)
    rackGroup.position.set(0, -1.6, -0.15);

    const rackW = 6.8;
    const rackD = 0.50;

    // A. Solid Carved Walnut Base Deck
    const baseGeo = new THREE.BoxGeometry(rackW, 0.08, rackD);
    this.geometries.push(baseGeo);
    const base = new THREE.Mesh(baseGeo, walnutMat);
    base.position.set(0, 0.04, 0);
    base.receiveShadow = true;
    rackGroup.add(base);

    // Front Brass Retaining Lip (Slender protective rail)
    const lipGeo = new THREE.BoxGeometry(rackW - 0.2, 0.035, 0.03);
    this.geometries.push(lipGeo);
    const lip = new THREE.Mesh(lipGeo, brassMat);
    lip.position.set(0, 0.08, rackD / 2 - 0.02);
    rackGroup.add(lip);

    // B. Low Angled Backrest Rail (Only 0.35 high to support tilted folios without blocking window!)
    const backRailH = 0.35;
    const backRailGeo = new THREE.BoxGeometry(rackW - 0.2, backRailH, 0.03);
    this.geometries.push(backRailGeo);
    const backRail = new THREE.Mesh(backRailGeo, darkWoodMat);
    backRail.rotation.x = -0.06;
    backRail.position.set(0, backRailH / 2 + 0.04, -rackD / 2 + 0.06);
    backRail.receiveShadow = true;
    rackGroup.add(backRail);

    // Slender Top Brass Trim for the backrest
    const backTrimGeo = new THREE.BoxGeometry(rackW - 0.1, 0.02, 0.03);
    this.geometries.push(backTrimGeo);
    const backTrim = new THREE.Mesh(backTrimGeo, brassMat);
    backTrim.position.set(0, backRailH + 0.05, -rackD / 2 + 0.06);
    rackGroup.add(backTrim);

    // C. Low Sculpted Walnut & Brass Scroll Bookends on far LEFT and far RIGHT only
    [-rackW / 2 + 0.1, rackW / 2 - 0.1].forEach((bx) => {
      const bookendH = 0.58;
      const bookendGeo = new THREE.BoxGeometry(0.18, bookendH, rackD - 0.06);
      this.geometries.push(bookendGeo);
      const bookend = new THREE.Mesh(bookendGeo, walnutMat);
      bookend.position.set(bx, bookendH / 2 + 0.04, 0);
      bookend.castShadow = true;
      bookend.receiveShadow = true;
      rackGroup.add(bookend);

      // Brass ornamental medallion on outer side
      const medalGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
      this.geometries.push(medalGeo);
      const medal = new THREE.Mesh(medalGeo, brassMat);
      medal.rotation.z = Math.PI / 2;
      medal.position.set(bx + (bx > 0 ? 0.09 : -0.09), bookendH * 0.6, 0);
      rackGroup.add(medal);
    });

    // D. 5 Inlaid Brass Roman Numeral Plates mounted neatly on the front shelf lip
    const slots = 5;
    for (let s = 0; s < slots; s++) {
      const sx = -2.6 + s * 1.30;
      const plaqueGeo = new THREE.BoxGeometry(0.48, 0.035, 0.02);
      this.geometries.push(plaqueGeo);
      const plaque = new THREE.Mesh(plaqueGeo, brassMat);
      plaque.position.set(sx, 0.05, rackD / 2 - 0.01);
      rackGroup.add(plaque);

      // Embedded brass guide inlay under each book
      const markerGeo = new THREE.BoxGeometry(0.85, 0.005, 0.02);
      this.geometries.push(markerGeo);
      const marker = new THREE.Mesh(markerGeo, brassMat);
      marker.position.set(sx, 0.082, rackD / 2 - 0.10);
      rackGroup.add(marker);
    }

    this.group.add(rackGroup);
  }

  /**
   * Organic flame flicker animation simulating real air convection currents
   */
  public updateCandleFlicker(time: number): void {
    if (this.candleLight) {
      const flicker =
        Math.sin(time * 7.0) * 0.18 +
        Math.cos(time * 13.0) * 0.1 +
        Math.sin(time * 23.0) * 0.06;
      this.candleLight.intensity = 2.4 + flicker;

      // Gentle organic sway of flame geometry
      this.flameMeshes.forEach((flame, i) => {
        flame.scale.y = 1.0 + Math.sin(time * 9.0 + i) * 0.12;
        flame.rotation.z = Math.sin(time * 6.0 + i * 2.0) * 0.08;
      });
    }
  }

  public dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
  }
}
