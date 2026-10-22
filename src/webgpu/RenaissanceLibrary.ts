import * as THREE from 'three';

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
    const windowViewTexture = this.generatePainterlyRomanSkyTexture();

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
   * Generates high-resolution Masterwork Italian Golden Hour / Sunset Oil Painting
   * Inspired by Giovanni Paolo Panini & Claude Lorrain:
   * - Radiant Roman sunset sky with warm golden-amber chiaroscuro gradient
   * - Volumetric crepuscular light rays streaming from the setting sun
   * - Multi-layered feathered cumulus clouds with warm rim highlights & lilac-umber shadows
   * - Layered Roman Capriccio architectural skyline: Pantheon dome, Colosseum, Temple colonnade, Aqueduct
   * - Italian Stone Pines (Pinus pinea) and stately Roman cypresses
   * - Golden atmospheric sfumato haze blending the architecture into the sunset
   */
  private generatePainterlyRomanSkyTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // 1. Masterwork Sunset Sky Gradient (Deep Twilight Zenith -> Apricot Amber -> Luminous Horizon Gold)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 2048);
    skyGrad.addColorStop(0.00, '#1a2738'); // Deep Italian twilight lapis
    skyGrad.addColorStop(0.20, '#2d4566'); // Mediterranean twilight sapphire
    skyGrad.addColorStop(0.40, '#6d5a6b'); // Mauve dusk transition
    skyGrad.addColorStop(0.55, '#c96f3b'); // Warm burnt apricot
    skyGrad.addColorStop(0.70, '#e59a4c'); // Radiant Italian amber
    skyGrad.addColorStop(0.84, '#fedfa8'); // Luminous golden horizon glow
    skyGrad.addColorStop(0.94, '#dfbe93'); // Warm Tuscan atmospheric mist
    skyGrad.addColorStop(1.00, '#8c6b4d'); // Roman earth
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // 2. Radiant Setting Sun in Upper-Left with Volumetric Corona
    const sunX = 580;
    const sunY = 780;

    // Outer warm atmospheric glow
    const outerGlow = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 1100);
    outerGlow.addColorStop(0.0, 'rgba(255, 246, 215, 0.90)');
    outerGlow.addColorStop(0.25, 'rgba(255, 210, 130, 0.55)');
    outerGlow.addColorStop(0.55, 'rgba(235, 145, 65, 0.28)');
    outerGlow.addColorStop(0.85, 'rgba(180, 85, 35, 0.08)');
    outerGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, 2048, 2048);

    // Brilliant golden sun core
    const coreGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 160);
    coreGlow.addColorStop(0.0, 'rgba(255, 255, 250, 1.0)');
    coreGlow.addColorStop(0.3, 'rgba(255, 248, 200, 0.95)');
    coreGlow.addColorStop(0.7, 'rgba(255, 218, 120, 0.6)');
    coreGlow.addColorStop(1.0, 'rgba(255, 190, 80, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
    ctx.fill();

    // 3. Crepuscular Golden Light Rays (God Rays radiating from the sunset)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rayAngles = [-0.65, -0.42, -0.18, 0.05, 0.28, 0.52, 0.78, 1.05];
    rayAngles.forEach((ang) => {
      const rayLen = 1600;
      const rayGrad = ctx.createRadialGradient(sunX, sunY, 40, sunX, sunY, rayLen);
      rayGrad.addColorStop(0, 'rgba(255, 240, 185, 0.22)');
      rayGrad.addColorStop(0.4, 'rgba(255, 215, 130, 0.12)');
      rayGrad.addColorStop(0.8, 'rgba(255, 180, 80, 0.03)');
      rayGrad.addColorStop(1, 'rgba(255, 160, 60, 0)');
      ctx.fillStyle = rayGrad;

      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      const spread = 0.14;
      ctx.lineTo(sunX + Math.cos(ang - spread) * rayLen, sunY + Math.sin(ang - spread) * rayLen);
      ctx.lineTo(sunX + Math.cos(ang + spread) * rayLen, sunY + Math.sin(ang + spread) * rayLen);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    // 4. Painterly Oil-Canvas Clouds (Multi-layered organic sfumato brushwork)
    const drawOilCloudCluster = (
      centerX: number,
      centerY: number,
      scaleX: number,
      scaleY: number,
      puffsCount: number
    ) => {
      // Step A: Deep warm mauve-lilac shadow base
      for (let p = 0; p < puffsCount; p++) {
        const ox = (Math.sin(p * 2.3) * 0.45) * scaleX;
        const oy = (Math.cos(p * 1.7) * 0.25 + 0.15) * scaleY;
        const pr = (0.28 + Math.sin(p * 3.1) * 0.12) * Math.min(scaleX, scaleY);

        const shadeGrad = ctx.createRadialGradient(
          centerX + ox,
          centerY + oy + pr * 0.25,
          pr * 0.1,
          centerX + ox,
          centerY + oy,
          pr
        );
        shadeGrad.addColorStop(0, 'rgba(92, 65, 78, 0.42)');
        shadeGrad.addColorStop(0.65, 'rgba(125, 82, 85, 0.22)');
        shadeGrad.addColorStop(1, 'rgba(125, 82, 85, 0)');
        ctx.fillStyle = shadeGrad;
        ctx.beginPath();
        ctx.arc(centerX + ox, centerY + oy, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Step B: Warm sunset amber midtones
      for (let p = 0; p < puffsCount; p++) {
        const ox = (Math.sin(p * 2.3) * 0.4) * scaleX;
        const oy = (Math.cos(p * 1.7) * 0.2) * scaleY;
        const pr = (0.24 + Math.cos(p * 2.9) * 0.1) * Math.min(scaleX, scaleY);

        const midGrad = ctx.createRadialGradient(
          centerX + ox - pr * 0.15,
          centerY + oy - pr * 0.15,
          pr * 0.1,
          centerX + ox,
          centerY + oy,
          pr
        );
        midGrad.addColorStop(0, 'rgba(248, 182, 112, 0.68)');
        midGrad.addColorStop(0.7, 'rgba(235, 142, 75, 0.35)');
        midGrad.addColorStop(1, 'rgba(235, 142, 75, 0)');
        ctx.fillStyle = midGrad;
        ctx.beginPath();
        ctx.arc(centerX + ox, centerY + oy, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Step C: Brilliant sunlit golden rim highlights on the top and left edges
      for (let p = 0; p < Math.floor(puffsCount * 0.8); p++) {
        const ox = (Math.sin(p * 2.3) * 0.36 - 0.08) * scaleX;
        const oy = (Math.cos(p * 1.7) * 0.2 - 0.18) * scaleY;
        const pr = (0.20 + Math.sin(p * 1.9) * 0.08) * Math.min(scaleX, scaleY);

        const rimGrad = ctx.createRadialGradient(
          centerX + ox - pr * 0.2,
          centerY + oy - pr * 0.2,
          pr * 0.05,
          centerX + ox,
          centerY + oy,
          pr
        );
        rimGrad.addColorStop(0, 'rgba(255, 252, 238, 0.92)');
        rimGrad.addColorStop(0.45, 'rgba(255, 230, 172, 0.65)');
        rimGrad.addColorStop(1, 'rgba(255, 215, 140, 0)');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(centerX + ox, centerY + oy, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Major golden evening cloud banks drifting across Rome
    drawOilCloudCluster(360, 520, 520, 240, 18);
    drawOilCloudCluster(940, 420, 680, 280, 24);
    drawOilCloudCluster(1620, 560, 580, 260, 20);
    drawOilCloudCluster(720, 660, 440, 180, 14);

    // Soft wisps of evening cirrus in the high twilight sky
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 195, 145, 0.25)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    for (let c = 0; c < 8; c++) {
      const cy = 180 + c * 38;
      ctx.beginPath();
      ctx.moveTo(120 + c * 40, cy);
      ctx.bezierCurveTo(600 + c * 50, cy - 35, 1200 - c * 40, cy + 30, 1920, cy - 20);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Layered Roman Capriccio Skyline (Panini & Claude Lorrain)
    // LAYER A: Distant Atmospheric Horizon & Hills (Soft sepia with warm haze)
    ctx.fillStyle = '#b38d6b';
    ctx.beginPath();
    ctx.ellipse(540, 1450, 920, 220, 0, 0, Math.PI * 2);
    ctx.ellipse(1560, 1470, 840, 240, 0, 0, Math.PI * 2);
    ctx.fill();

    // Distant Roman Aqueduct (Aqua Claudia) arches stepping across the hills
    ctx.fillStyle = '#8f6e52';
    const aqStartX = 1180;
    const aqY = 1380;
    const aqArches = 9;
    const aqSpan = 52;
    for (let a = 0; a < aqArches; a++) {
      const ax = aqStartX + a * aqSpan;
      ctx.fillRect(ax, aqY - 60, 14, 80);
      ctx.beginPath();
      ctx.arc(ax + aqSpan / 2, aqY - 55, (aqSpan - 14) / 2, Math.PI, 0, false);
      ctx.fill();
    }
    ctx.fillRect(aqStartX, aqY - 68, aqArches * aqSpan + 14, 12);

    // Distant Pantheon / St. Peter's Dome Silhouette
    const domeX = 1140;
    const domeBaseY = 1360;
    ctx.fillStyle = '#785b44';
    // Grand drum / tambour with column pilasters
    ctx.fillRect(domeX - 110, domeBaseY - 50, 220, 50);
    for (let col = 0; col < 10; col++) {
      ctx.fillStyle = '#634934';
      ctx.fillRect(domeX - 100 + col * 22, domeBaseY - 50, 6, 50);
    }
    // Hemispherical Roman Cupola
    ctx.fillStyle = '#6f533e';
    ctx.beginPath();
    ctx.arc(domeX, domeBaseY - 50, 105, Math.PI, 0, false);
    ctx.fill();
    // Ribs of the dome
    ctx.strokeStyle = '#5a4230';
    ctx.lineWidth = 3;
    for (let r = -4; r <= 4; r++) {
      ctx.beginPath();
      ctx.moveTo(domeX + r * 22, domeBaseY - 50);
      ctx.quadraticCurveTo(domeX + r * 10, domeBaseY - 130, domeX, domeBaseY - 155);
      ctx.stroke();
    }
    // Lantern cupola and cross/finial
    ctx.fillStyle = '#5a4230';
    ctx.fillRect(domeX - 14, domeBaseY - 180, 28, 30);
    ctx.beginPath();
    ctx.arc(domeX, domeBaseY - 180, 12, Math.PI, 0, false);
    ctx.fill();
    ctx.fillRect(domeX - 2, domeBaseY - 200, 4, 20);

    // LAYER B: Mid-ground Ancient Roman Ruined Architecture (Warm Travertine Umber)
    ctx.fillStyle = '#533c2a';

    // B1: Ruined Corinthian Temple Portico (Temple of Saturn / Vespasian) on the Left
    const porticoX = 320;
    const porticoBaseY = 1420;
    const porticoH = 220;
    // 4 Grand Fluted Columns
    for (let c = 0; c < 4; c++) {
      const cx = porticoX + c * 58;
      // Base
      ctx.fillRect(cx - 10, porticoBaseY, 20, 14);
      // Shaft
      ctx.fillRect(cx - 7, porticoBaseY - porticoH, 14, porticoH);
      // Capital with volutes
      ctx.fillRect(cx - 12, porticoBaseY - porticoH - 16, 24, 16);
    }
    // Entablature architrave & sculpted frieze
    ctx.fillRect(porticoX - 18, porticoBaseY - porticoH - 34, 210, 18);
    // Triangular Classical Pediment
    ctx.beginPath();
    ctx.moveTo(porticoX - 22, porticoBaseY - porticoH - 34);
    ctx.lineTo(porticoX + 87, porticoBaseY - porticoH - 85);
    ctx.lineTo(porticoX + 196, porticoBaseY - porticoH - 34);
    ctx.closePath();
    ctx.fill();

    // B2: The Colosseum Arcades (Flavian Amphitheater) in the Right Midground
    const coloX = 1580;
    const coloBaseY = 1420;
    const coloW = 340;
    // Massive curved outer wall structure
    ctx.fillRect(coloX - coloW / 2, coloBaseY - 170, coloW, 170);
    // 3 Tiers of classical Roman arches
    for (let tier = 0; tier < 3; tier++) {
      const ty = coloBaseY - 30 - tier * 50;
      for (let arc = 0; arc < 7; arc++) {
        const ax = coloX - coloW / 2 + 25 + arc * 44;
        ctx.fillStyle = '#2f2115';
        ctx.beginPath();
        ctx.arc(ax + 14, ty - 18, 14, Math.PI, 0, false);
        ctx.fill();
        ctx.fillRect(ax, ty - 18, 28, 26);
      }
    }
    ctx.fillStyle = '#533c2a';

    // B3: Roman Triumphal Arch (Arch of Constantine) in Center
    const archX = 820;
    const archBaseY = 1420;
    const archW = 160;
    const archH = 135;
    ctx.fillRect(archX - archW / 2, archBaseY - archH, archW, archH);
    // Central large portal
    ctx.fillStyle = '#2c1e13';
    ctx.beginPath();
    ctx.arc(archX, archBaseY - 65, 32, Math.PI, 0, false);
    ctx.fill();
    ctx.fillRect(archX - 32, archBaseY - 65, 64, 75);
    // Side portals
    [-52, 52].forEach((sx) => {
      ctx.beginPath();
      ctx.arc(archX + sx, archBaseY - 42, 16, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(archX + sx - 16, archBaseY - 42, 32, 52);
    });
    // Attic inscription block
    ctx.fillStyle = '#533c2a';
    ctx.fillRect(archX - archW / 2 + 10, archBaseY - archH - 30, archW - 20, 30);

    // LAYER C: Roman Foliage & Pines (Deep Umber & Cypress Green)
    // Iconic Italian Stone Pines (Umbrella Pines / Pinus pinea)
    const drawItalianStonePine = (px: number, py: number, pineScale: number) => {
      ctx.save();
      ctx.strokeStyle = '#281c12';
      ctx.lineWidth = 10 * pineScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + 12 * pineScale, py - 110 * pineScale, px + 26 * pineScale, py - 210 * pineScale);
      ctx.stroke();

      // Branch forks
      ctx.lineWidth = 6 * pineScale;
      ctx.beginPath();
      ctx.moveTo(px + 22 * pineScale, py - 180 * pineScale);
      ctx.quadraticCurveTo(px - 35 * pineScale, py - 230 * pineScale, px - 65 * pineScale, py - 260 * pineScale);
      ctx.moveTo(px + 24 * pineScale, py - 190 * pineScale);
      ctx.quadraticCurveTo(px + 75 * pineScale, py - 240 * pineScale, px + 105 * pineScale, py - 270 * pineScale);
      ctx.stroke();

      // Expansive flat-topped umbrella foliage canopy
      ctx.fillStyle = '#222616';
      ctx.beginPath();
      ctx.ellipse(px + 20 * pineScale, py - 270 * pineScale, 115 * pineScale, 45 * pineScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e351f';
      ctx.beginPath();
      ctx.ellipse(px + 5 * pineScale, py - 280 * pineScale, 85 * pineScale, 35 * pineScale, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawItalianStonePine(210, 1440, 1.15);
    drawItalianStonePine(610, 1450, 0.95);
    drawItalianStonePine(1440, 1450, 1.2);
    drawItalianStonePine(1860, 1430, 1.05);

    // Slender Roman Cypresses (Cupressus sempervirens)
    const drawCypress = (cx: number, cy: number, ch: number, cw: number) => {
      ctx.fillStyle = '#1c2214';
      ctx.beginPath();
      ctx.moveTo(cx, cy - ch);
      ctx.quadraticCurveTo(cx - cw, cy - ch * 0.45, cx - cw * 0.8, cy);
      ctx.lineTo(cx + cw * 0.8, cy);
      ctx.quadraticCurveTo(cx + cw, cy - ch * 0.45, cx, cy - ch);
      ctx.fill();
    };

    drawCypress(130, 1450, 240, 24);
    drawCypress(170, 1460, 200, 20);
    drawCypress(710, 1450, 220, 22);
    drawCypress(1010, 1450, 180, 18);
    drawCypress(1360, 1450, 260, 26);
    drawCypress(1760, 1450, 210, 21);

    // 6. Atmospheric Golden Sfumato Haze (Melts base of monuments into the sunset)
    const sfumatoGrad = ctx.createLinearGradient(0, 1240, 0, 1600);
    sfumatoGrad.addColorStop(0, 'rgba(255, 228, 175, 0)');
    sfumatoGrad.addColorStop(0.45, 'rgba(245, 195, 130, 0.42)');
    sfumatoGrad.addColorStop(0.75, 'rgba(220, 165, 105, 0.55)');
    sfumatoGrad.addColorStop(1.0, 'rgba(145, 105, 75, 0.7)');
    ctx.fillStyle = sfumatoGrad;
    ctx.fillRect(0, 1240, 2048, 360);

    // 7. Subtle Oil-Canvas Linen Grain & Vignette
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let y = 0; y < 2048; y += 4) {
      ctx.fillRect(0, y, 2048, 1.5);
    }
    for (let x = 0; x < 2048; x += 4) {
      ctx.fillRect(x, 0, 1.5, 2048);
    }

    // Gentle Warm Vignette around edges
    const vigGrad = ctx.createRadialGradient(1024, 1024, 700, 1024, 1024, 1400);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(28, 16, 8, 0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, 2048, 2048);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
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
    windowViewTexture: THREE.CanvasTexture
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

    // Grand panoramic vista backdrop plane (Expansive 12x9.6 to cover all parallax angles)
    const vistaGeo = new THREE.PlaneGeometry(12.0, 9.6);
    this.geometries.push(vistaGeo);
    const vistaMat = new THREE.MeshBasicMaterial({
      map: windowViewTexture
    });
    this.materials.push(vistaMat);
    const vista = new THREE.Mesh(vistaGeo, vistaMat);
    vista.position.set(0, 4.6, -0.2);
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

    // Scholar's Desktop Reading Lectern (Leggio da tavolo)
    // Carved Tuscan walnut desktop bookstand supporting the open tome squarely on the desk blotter
    const lecternGroup = new THREE.Group();
    lecternGroup.position.set(0, deskH + 0.1, 0.48);

    // Lectern Base Footprint resting flush on leather blotter
    const lBaseGeo = new THREE.BoxGeometry(3.9, 0.04, 2.1);
    this.geometries.push(lBaseGeo);
    const lBase = new THREE.Mesh(lBaseGeo, walnutMat);
    lBase.position.set(0, 0.02, 0);
    lBase.receiveShadow = true;
    lecternGroup.add(lBase);

    // Sloping Walnut Reading Board (inclined at -31.5 deg = -0.55 rad matching reading book angle)
    const lBoardGeo = new THREE.BoxGeometry(3.7, 0.04, 2.15);
    this.geometries.push(lBoardGeo);
    const lBoard = new THREE.Mesh(lBoardGeo, walnutMat);
    lBoard.rotation.x = -0.55;
    lBoard.position.set(0, 0.58, -0.11);
    lBoard.castShadow = true;
    lBoard.receiveShadow = true;
    lecternGroup.add(lBoard);

    // Carved Side Volute Brackets (Left & Right support wedges)
    [-1.75, 1.75].forEach((vx) => {
      const wedgeGeo = new THREE.BoxGeometry(0.08, 0.8, 1.6);
      this.geometries.push(wedgeGeo);
      const wedge = new THREE.Mesh(wedgeGeo, walnutMat);
      wedge.position.set(vx, 0.42, -0.2);
      wedge.castShadow = true;
      lecternGroup.add(wedge);
    });

    // Front Brass Retaining Lip (Secures open book pages squarely from sliding down)
    const lLipGeo = new THREE.BoxGeometry(3.7, 0.07, 0.06);
    this.geometries.push(lLipGeo);
    const lLip = new THREE.Mesh(lLipGeo, brassMat);
    lLip.position.set(0, 0.05, 0.44);
    lLip.castShadow = true;
    lecternGroup.add(lLip);

    deskGroup.add(lecternGroup);

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
   * Open, airy, low-profile cradle resting on the back edge of the scholar desk.
   * Completely unobstructed: NO overhead beams, NO tall backboards, NO blocking of the Roman arch!
   * The 5 antique volumes rest securely on a carved walnut & brass ledge with low scroll bookends.
   */
  private buildOpenBookRack(walnutMat: THREE.Material, darkWoodMat: THREE.Material, brassMat: THREE.Material): void {
    const rackGroup = new THREE.Group();
    // Positioned on the back half of the desk (Desk top is at y = -1.6)
    rackGroup.position.set(0, -1.6, -0.65);

    const rackW = 7.6;
    const rackD = 0.72;

    // A. Solid Carved Walnut Base Deck
    const baseGeo = new THREE.BoxGeometry(rackW, 0.08, rackD);
    this.geometries.push(baseGeo);
    const base = new THREE.Mesh(baseGeo, walnutMat);
    base.position.set(0, 0.04, 0);
    base.receiveShadow = true;
    rackGroup.add(base);

    // Front Brass Retaining Lip (Slender protective rail)
    const lipGeo = new THREE.BoxGeometry(rackW - 0.2, 0.04, 0.03);
    this.geometries.push(lipGeo);
    const lip = new THREE.Mesh(lipGeo, brassMat);
    lip.position.set(0, 0.09, rackD / 2 - 0.03);
    rackGroup.add(lip);

    // B. Low Angled Backrest Rail (Only 0.42 high to support tilted folios without blocking window!)
    const backRailH = 0.42;
    const backRailGeo = new THREE.BoxGeometry(rackW - 0.2, backRailH, 0.04);
    this.geometries.push(backRailGeo);
    const backRail = new THREE.Mesh(backRailGeo, darkWoodMat);
    backRail.rotation.x = -0.06;
    backRail.position.set(0, backRailH / 2 + 0.04, -rackD / 2 + 0.08);
    backRail.receiveShadow = true;
    rackGroup.add(backRail);

    // Slender Top Brass Trim for the backrest
    const backTrimGeo = new THREE.BoxGeometry(rackW - 0.1, 0.02, 0.04);
    this.geometries.push(backTrimGeo);
    const backTrim = new THREE.Mesh(backTrimGeo, brassMat);
    backTrim.position.set(0, backRailH + 0.05, -rackD / 2 + 0.08);
    rackGroup.add(backTrim);

    // C. Low Sculpted Walnut & Brass Scroll Bookends on far LEFT and far RIGHT only
    [-rackW / 2 + 0.12, rackW / 2 - 0.12].forEach((bx) => {
      const bookendH = 0.72;
      const bookendGeo = new THREE.BoxGeometry(0.22, bookendH, rackD - 0.1);
      this.geometries.push(bookendGeo);
      const bookend = new THREE.Mesh(bookendGeo, walnutMat);
      bookend.position.set(bx, bookendH / 2 + 0.04, 0);
      bookend.castShadow = true;
      bookend.receiveShadow = true;
      rackGroup.add(bookend);

      // Brass ornamental medallion on outer side
      const medalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
      this.geometries.push(medalGeo);
      const medal = new THREE.Mesh(medalGeo, brassMat);
      medal.rotation.z = Math.PI / 2;
      medal.position.set(bx + (bx > 0 ? 0.11 : -0.11), bookendH * 0.6, 0);
      rackGroup.add(medal);
    });

    // D. 5 Inlaid Brass Roman Numeral Plates mounted neatly on the front shelf lip
    const slots = 5;
    for (let s = 0; s < slots; s++) {
      const sx = -2.7 + s * 1.35;
      const plaqueGeo = new THREE.BoxGeometry(0.52, 0.05, 0.02);
      this.geometries.push(plaqueGeo);
      const plaque = new THREE.Mesh(plaqueGeo, brassMat);
      plaque.position.set(sx, 0.05, rackD / 2 - 0.01);
      rackGroup.add(plaque);

      // Embedded brass guide inlay under each book
      const markerGeo = new THREE.BoxGeometry(0.9, 0.005, 0.02);
      this.geometries.push(markerGeo);
      const marker = new THREE.Mesh(markerGeo, brassMat);
      marker.position.set(sx, 0.082, rackD / 2 - 0.12);
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
