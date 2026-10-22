import * as THREE from 'three';
import type { ProjectItem } from '../data/projects';

/**
 * 3D Interactive Renaissance Tome & Illuminated Manuscript
 *
 * Implements realistic physical book anatomy:
 * 1. Center Spine at x = 0 (Curved leather spine with raised gold ribs)
 * 2. Left Page / Cover Wing (Verso):
 *    - Closed (0 rad): Lies flat over the right page, displaying the embossed leather front cover.
 *    - Open (-PI rad): Swings 180° to lie flat on the left side, displaying the illuminated artwork.
 * 3. Right Page Wing (Recto):
 *    - Fixed on the right side [0, +W]. Displays the project title, story, role, tags & color chips.
 *    - Underneath: Supported by the leather back cover.
 * 4. Zero Sinking: Perfectly calibrated geometry resting squarely on the desk and shelf ledges.
 */
export class RenaissanceBook {
  public group: THREE.Group;
  public project: ProjectItem;
  public index: number;

  // Single page dimensions (Calibrated for reading comfort & shelf fit)
  public readonly pageW = 1.7;
  public readonly pageH = 2.3;
  public readonly bookD = 0.22;

  // Internal hinge at the spine (x = 0)
  private coverHinge: THREE.Group;
  private turningLeafMesh!: THREE.Mesh;
  private rightPageMesh!: THREE.Mesh;
  private backCoverMesh!: THREE.Mesh;
  private spineMesh!: THREE.Mesh;

  private targetOpen = 0.0; // 0.0 = closed, 1.0 = open
  private currentOpen = 0.0;

  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private textures: THREE.Texture[] = [];

  constructor(project: ProjectItem, index: number) {
    this.project = project;
    this.index = index;
    this.group = new THREE.Group();

    this.coverHinge = new THREE.Group();
    this.coverHinge.position.set(0, 0, this.bookD / 2);

    this.buildBook();
  }

  private buildBook(): void {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    const roman = romanNumerals[this.index] || 'I';

    // 1. Textures
    const frontCoverTex = this.generateFrontCoverTexture(roman);
    const versoPageTex = this.generateVersoPageTexture(roman);
    const rectoPageTex = this.generateRectoPageTexture(roman);
    const leatherBackTex = this.generatePlainLeatherTexture();
    const pageBlockEdgeTex = this.generatePageBlockEdgeTexture();

    // 2. Materials
    const frontCoverMat = new THREE.MeshStandardMaterial({
      map: frontCoverTex,
      roughness: 0.58,
      metalness: 0.15
    });
    this.materials.push(frontCoverMat);

    const versoPageMat = new THREE.MeshStandardMaterial({
      map: versoPageTex,
      roughness: 0.82,
      metalness: 0.03
    });
    this.materials.push(versoPageMat);

    const rectoPageMat = new THREE.MeshStandardMaterial({
      map: rectoPageTex,
      roughness: 0.82,
      metalness: 0.03
    });
    this.materials.push(rectoPageMat);

    const leatherBackMat = new THREE.MeshStandardMaterial({
      map: leatherBackTex,
      roughness: 0.65,
      metalness: 0.08
    });
    this.materials.push(leatherBackMat);

    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: pageBlockEdgeTex,
      roughness: 0.82,
      metalness: 0.22
    });
    this.materials.push(pageEdgeMat);

    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x381f10,
      roughness: 0.65,
      metalness: 0.1
    });
    this.materials.push(spineMat);

    // 3. Central Spine (At x = 0, along the hinge)
    const spineRadius = this.bookD / 2;
    const spineGeo = new THREE.CylinderGeometry(
      spineRadius,
      spineRadius,
      this.pageH + 0.08,
      16,
      1,
      false,
      0,
      Math.PI
    );
    this.geometries.push(spineGeo);
    this.spineMesh = new THREE.Mesh(spineGeo, spineMat);
    this.spineMesh.rotation.y = Math.PI / 2;
    this.spineMesh.position.set(0, 0, 0);
    this.spineMesh.castShadow = true;
    this.group.add(this.spineMesh);

    // Gilded Spine Ribs (4 decorative bands)
    for (let r = 0; r < 4; r++) {
      const ribGeo = new THREE.TorusGeometry(spineRadius + 0.015, 0.025, 8, 16, Math.PI);
      this.geometries.push(ribGeo);
      const rib = new THREE.Mesh(ribGeo, frontCoverMat);
      rib.rotation.y = Math.PI;
      rib.position.set(0, -this.pageH * 0.35 + r * (this.pageH * 0.23), 0);
      this.group.add(rib);
    }

    // 4. Right Page Wing (Recto side: x in [0, +pageW])
    // Leather Back Cover underneath the right page
    const backCoverGeo = new THREE.BoxGeometry(this.pageW + 0.04, this.pageH + 0.08, 0.04);
    this.geometries.push(backCoverGeo);
    this.backCoverMesh = new THREE.Mesh(backCoverGeo, leatherBackMat);
    this.backCoverMesh.position.set(this.pageW / 2 + 0.02, 0, -this.bookD / 2 - 0.02);
    this.backCoverMesh.castShadow = true;
    this.backCoverMesh.receiveShadow = true;
    this.group.add(this.backCoverMesh);

    // Gilded Page Block Core (Right side)
    const coreGeo = new THREE.BoxGeometry(this.pageW * 0.96, this.pageH, this.bookD * 0.88);
    this.geometries.push(coreGeo);
    const rightCore = new THREE.Mesh(coreGeo, pageEdgeMat);
    rightCore.position.set(this.pageW / 2 + 0.02, 0, 0);
    rightCore.castShadow = true;
    rightCore.receiveShadow = true;
    this.group.add(rightCore);

    // Right Page Top Surface (Readable Project Story & Meta)
    const rightPageGeo = new THREE.PlaneGeometry(this.pageW, this.pageH);
    this.geometries.push(rightPageGeo);
    this.rightPageMesh = new THREE.Mesh(rightPageGeo, rectoPageMat);
    this.rightPageMesh.position.set(this.pageW / 2, 0, this.bookD / 2 + 0.005);
    this.rightPageMesh.castShadow = true;
    this.rightPageMesh.receiveShadow = true;
    this.group.add(this.rightPageMesh);

    // 5. Left Page Wing (Front Cover & Verso Page: Swings 180° around x = 0)
    // Box Geometry: origin shifted to left edge so rotation pivots around spine hinge
    const leafGeo = new THREE.BoxGeometry(this.pageW, this.pageH, 0.04, 16, 4, 1);
    this.geometries.push(leafGeo);
    leafGeo.translate(this.pageW / 2, 0, 0);

    // Multi-material mapping:
    // [0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z (Front), 5: -Z (Back)]
    // When hinge rotation = 0: +Z points forward (Front Cover visible)
    // When hinge rotation = -PI: -Z points forward (Verso Page visible)
    const leafMaterials: THREE.Material[] = [
      pageEdgeMat,   // right edge
      spineMat,      // left hinge edge
      pageEdgeMat,   // top edge
      pageEdgeMat,   // bottom edge
      frontCoverMat, // FRONT FACE: Outside Leather Cover! (Visible when closed)
      versoPageMat   // BACK FACE: Inside Left Page Artwork! (Visible when open)
    ];

    this.turningLeafMesh = new THREE.Mesh(leafGeo, leafMaterials);
    this.turningLeafMesh.castShadow = true;
    this.turningLeafMesh.receiveShadow = true;

    this.coverHinge.add(this.turningLeafMesh);
    this.group.add(this.coverHinge);

    // Start completely closed
    this.coverHinge.rotation.y = 0.0;
  }

  /**
   * Generates the Outside Front Leather Cover with embossed gold tooling & title
   */
  private generateFrontCoverTexture(roman: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d')!;

    // Rich Florentine morocco leather base
    const grad = ctx.createRadialGradient(512, 700, 100, 512, 700, 900);
    grad.addColorStop(0, '#4e2f1b');
    grad.addColorStop(0.7, '#381f11');
    grad.addColorStop(1, '#221108');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1400);

    // Fine leather texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let i = 0; i < 900; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1400, 4, 4);
    }

    // Gold Leaf Embossed Borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(50, 50, 1024 - 100, 1400 - 100);

    ctx.strokeStyle = '#92743e';
    ctx.lineWidth = 3;
    ctx.strokeRect(74, 74, 1024 - 148, 1400 - 148);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#d4af37';
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚜', 26, 36);
      ctx.restore();
    };
    drawCorner(74, 74, 0);
    drawCorner(1024 - 74, 74, Math.PI / 2);
    drawCorner(1024 - 74, 1400 - 74, Math.PI);
    drawCorner(74, 1400 - 74, -Math.PI / 2);

    // Central Renaissance Gilt Medallion
    ctx.save();
    ctx.translate(512, 520);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 190, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#92743e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 170, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f5ecd8';
    ctx.font = '400 95px "Metamorphous", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roman, 0, -12);

    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillStyle = '#c6a258';
    ctx.fillText('LIBER ARTIFACTUM', 0, 75);
    ctx.restore();

    // Book Title Gilded Emboss
    ctx.fillStyle = '#f5ecd8';
    ctx.font = '400 54px "Metamorphous", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.project.title.toUpperCase(), 512, 910);

    ctx.fillStyle = '#c6a258';
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText(this.project.subtitle, 512, 970);

    // Prompt to open
    ctx.fillStyle = '#d4af37';
    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillText('✦  CLICK TO OPEN FOLIO  ✦', 512, 1140);

    // Classical brass corner clasps
    ctx.fillStyle = '#9e7b3a';
    [[0, 0], [1024 - 130, 0], [0, 1400 - 130], [1024 - 130, 1400 - 130]].forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 130, 30);
      ctx.fillRect(cx, cy, 30, 130);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    return texture;
  }

  /**
   * Generates Inside Left Page (Verso) - Illuminated Classical Artwork & Heading
   */
  private generateVersoPageTexture(roman: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d')!;

    // Mirror horizontally so when the leaf swings 180°, the back face displays in correct reading orientation
    ctx.translate(1024, 0);
    ctx.scale(-1, 1);

    // Warm ivory parchment base
    const pGrad = ctx.createLinearGradient(0, 0, 1024, 1400);
    pGrad.addColorStop(0, '#fbf7ee');
    pGrad.addColorStop(0.5, '#f4ece0');
    pGrad.addColorStop(1, '#ebe0cc');
    ctx.fillStyle = pGrad;
    ctx.fillRect(0, 0, 1024, 1400);

    // Spine gutter shadow on the right edge of left page (realistic valley shadow)
    const gutterGrad = ctx.createLinearGradient(880, 0, 1024, 0);
    gutterGrad.addColorStop(0, 'rgba(0,0,0,0)');
    gutterGrad.addColorStop(0.7, 'rgba(46, 33, 19, 0.16)');
    gutterGrad.addColorStop(1, 'rgba(32, 22, 12, 0.42)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(880, 0, 144, 1400);

    // Double border with gilded inner accent
    ctx.strokeStyle = '#4a3824';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(50, 50, 1024 - 100, 1400 - 100);

    ctx.strokeStyle = '#c6a258';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, 1024 - 124, 1400 - 124);

    // Classical Header
    ctx.fillStyle = '#564222';
    ctx.font = '600 22px "Inter", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`• TABULA ${roman} • ILLUMINATIO •`, 512, 110);

    // Architectural Arch framing the artwork
    const archX = 140;
    const archY = 160;
    const archW = 744;
    const archH = 960;

    ctx.fillStyle = '#26211a';
    ctx.beginPath();
    ctx.moveTo(archX, archY + archH);
    ctx.lineTo(archX, archY + archW / 2);
    ctx.arc(archX + archW / 2, archY + archW / 2, archW / 2, Math.PI, 0, false);
    ctx.lineTo(archX + archW, archY + archH);
    ctx.closePath();
    ctx.fill();

    // Render Illuminated Artwork
    this.drawArtwork(ctx, archX + archW / 2, archY + archH * 0.52);

    // Footer
    ctx.fillStyle = '#4a3824';
    ctx.font = '500 18px "Metamorphous", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CREATIVE PLATFORM', 512, 1280);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    return texture;
  }

  /**
   * Generates Inside Right Page (Recto) - Project Story, Role, Achievement & Swatches
   */
  private generateRectoPageTexture(roman: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d')!;

    // Warm ivory parchment base
    const pGrad = ctx.createLinearGradient(0, 0, 1024, 1400);
    pGrad.addColorStop(0, '#fbf7ee');
    pGrad.addColorStop(0.5, '#f4ece0');
    pGrad.addColorStop(1, '#ebe0cc');
    ctx.fillStyle = pGrad;
    ctx.fillRect(0, 0, 1024, 1400);

    // Spine gutter shadow on the left edge of right page
    const gutterGrad = ctx.createLinearGradient(0, 0, 144, 0);
    gutterGrad.addColorStop(0, 'rgba(32, 22, 12, 0.42)');
    gutterGrad.addColorStop(0.3, 'rgba(46, 33, 19, 0.16)');
    gutterGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(0, 0, 144, 1400);

    // Double border
    ctx.strokeStyle = '#4a3824';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(50, 50, 1024 - 100, 1400 - 100);

    ctx.strokeStyle = '#c6a258';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, 1024 - 124, 1400 - 124);

    // Header
    ctx.fillStyle = '#564222';
    ctx.font = '600 22px "Inter", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`• CHRONICA DIGITALIS • FOLIO ${roman} •`, 512, 110);

    ctx.strokeStyle = '#92743e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 135);
    ctx.lineTo(844, 135);
    ctx.stroke();

    // Project Title
    ctx.fillStyle = '#2e2311';
    ctx.font = '400 68px "Metamorphous", Georgia, serif';
    ctx.fillText(this.project.title, 512, 235);

    ctx.fillStyle = '#564222';
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText(this.project.subtitle, 512, 290);

    // Color Swatches
    const swatchY = 360;
    const colors = [
      this.project.accentColor,
      this.project.secondaryColor,
      '#2e2311',
      '#92743e',
      '#b8ad9c'
    ];
    const sW = 44;
    const sGap = 16;
    const startSX = 512 - (5 * sW + 4 * sGap) / 2;

    ctx.font = '500 15px "Inter", monospace';
    ctx.fillStyle = '#736c60';
    ctx.fillText(`THEMA PALETTAE: ${this.project.paletteTheme.toUpperCase()}`, 512, swatchY - 18);

    colors.forEach((col, i) => {
      const sx = startSX + i * (sW + sGap);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx + sW / 2, swatchY + 16, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2e2311';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Story Description
    ctx.textAlign = 'left';
    ctx.fillStyle = '#26211a';
    ctx.font = '400 25px "Inter", sans-serif';

    const words = this.project.description.split(' ');
    let line = '';
    let lineY = 500;
    const maxW = 760;
    const leftMargin = 512 - maxW / 2;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        ctx.fillText(line.trim(), leftMargin, lineY);
        line = words[n] + ' ';
        lineY += 42;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), leftMargin, lineY);

    // Achievement & Role Meta Card
    const metaBoxY = lineY + 60;
    ctx.fillStyle = 'rgba(46, 35, 17, 0.06)';
    ctx.fillRect(leftMargin, metaBoxY, maxW, 140);
    ctx.strokeStyle = '#92743e';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftMargin, metaBoxY, maxW, 140);

    ctx.font = '700 16px "Inter", sans-serif';
    ctx.fillStyle = '#736c60';
    ctx.fillText('OFFICIUM (ROLE):', leftMargin + 24, metaBoxY + 40);
    ctx.fillText('VICTORIA (ACHIEVEMENT):', leftMargin + 24, metaBoxY + 92);

    ctx.font = '600 19px "Inter", sans-serif';
    ctx.fillStyle = '#2e2311';
    ctx.fillText(this.project.role, leftMargin + 230, metaBoxY + 40);
    ctx.fillText(this.project.stats, leftMargin + 270, metaBoxY + 92);

    // Tags
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7a3f34';
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillText(this.project.tags.join('  •  '), 512, 1260);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);
    return texture;
  }

  private drawArtwork(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.strokeStyle = this.project.accentColor;
    ctx.fillStyle = this.project.secondaryColor;
    ctx.lineWidth = 3;

    switch (this.index % 5) {
      case 0:
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, 180, 50 + i * 35, (i * Math.PI) / 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#c6b18f';
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 1:
        [-130, 130].forEach((ox) => {
          ctx.strokeRect(cx + ox - 22, cy - 150, 44, 300);
        });
        ctx.beginPath();
        ctx.arc(cx, cy - 150, 130, Math.PI, 0, false);
        ctx.stroke();
        break;
      case 2:
        const r = 170;
        const pts: [number, number][] = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.stroke();
        break;
      case 3:
        ctx.beginPath();
        ctx.arc(cx, cy, 170, 0, Math.PI * 2);
        ctx.stroke();
        for (let a = 0; a < 360; a += 15) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * 148, cy + Math.sin(rad) * 148);
          ctx.lineTo(cx + Math.cos(rad) * 170, cy + Math.sin(rad) * 170);
          ctx.stroke();
        }
        break;
      case 4:
      default:
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < 16; i++) {
          const a = (i * 2 * Math.PI) / 16;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 75, cy + Math.sin(a) * 75);
          ctx.lineTo(cx + Math.cos(a) * (i % 2 === 0 ? 160 : 120), cy + Math.sin(a) * (i % 2 === 0 ? 160 : 120));
          ctx.stroke();
        }
        break;
    }
    ctx.restore();
  }

  private generatePlainLeatherTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#381f11';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
    }
    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  private generatePageBlockEdgeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#b89f68';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#947a46';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 256, 1.5);
    }
    const texture = new THREE.CanvasTexture(canvas);
    this.textures.push(texture);
    return texture;
  }

  /**
   * Set target opening state: 0.0 (closed) to 1.0 (fully open)
   */
  public setOpen(target: number): void {
    this.targetOpen = THREE.MathUtils.clamp(target, 0.0, 1.0);
  }

  public get isOpen(): boolean {
    return this.targetOpen > 0.5;
  }

  /**
   * Realistic physical hinge rotation for 180-degree page turn
   * NOTE: Does NOT overwrite this.group.position (managed by engine!)
   */
  public update(): boolean {
    const diff = this.targetOpen - this.currentOpen;
    if (Math.abs(diff) > 0.0005) {
      this.currentOpen += diff * 0.09;

      // 180-degree swing around center spine hinge
      const coverAngle = -this.currentOpen * Math.PI;
      this.coverHinge.rotation.y = coverAngle;

      // Natural paper curl while in mid-air
      const midAir = Math.sin(this.currentOpen * Math.PI);
      this.turningLeafMesh.rotation.z = midAir * 0.04;

      return true;
    }
    return false;
  }

  public dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
  }
}
