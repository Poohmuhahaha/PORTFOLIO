import * as THREE from 'three';
import type { ProjectItem } from '../data/projects';

/**
 * Creates high-fidelity Renaissance manuscript / tablet textures
 * with classical etchings, architectural borders, and Renaissance motifs.
 */
export function createArtifactTexture(project: ProjectItem, index: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d')!;

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const roman = romanNumerals[index] || 'I';

  // 1. Parchment / Antique Stone Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1400);
  bgGrad.addColorStop(0, '#e5c69f');
  bgGrad.addColorStop(0.5, '#d8b991');
  bgGrad.addColorStop(1, '#cbb085');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1400);

  // Subtle vintage noise / paper patina
  ctx.fillStyle = 'rgba(46, 35, 17, 0.03)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1400;
    const rw = Math.random() * 80 + 20;
    const rh = Math.random() * 80 + 20;
    ctx.fillRect(rx, ry, rw, rh);
  }

  // 2. Classical Architectural Borders
  ctx.strokeStyle = '#2e2311';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 1024 - 72, 1400 - 72);

  ctx.strokeStyle = '#92743e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, 1024 - 96, 1400 - 96);

  // Corner Ornaments (Renaissance Flourishes)
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#92743e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#564222';
    ctx.beginPath();
    ctx.arc(12, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCorner(48, 48, 0);
  drawCorner(1024 - 48, 48, Math.PI / 2);
  drawCorner(1024 - 48, 1400 - 48, Math.PI);
  drawCorner(48, 1400 - 48, -Math.PI / 2);

  // 3. Header: Roman Numeral & Archive Classification
  ctx.textAlign = 'center';
  ctx.fillStyle = '#564222';
  ctx.font = '600 24px "Inter", serif';
  ctx.fillText(`• CHRONICA ACADEMIA • LIBER ${roman} •`, 512, 110);

  // Decorative divider line
  ctx.strokeStyle = '#92743e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(300, 130);
  ctx.lineTo(724, 130);
  ctx.stroke();

  // Diamond emblem in middle
  ctx.fillStyle = '#92743e';
  ctx.beginPath();
  ctx.moveTo(512, 122);
  ctx.lineTo(520, 130);
  ctx.lineTo(512, 138);
  ctx.lineTo(504, 130);
  ctx.closePath();
  ctx.fill();

  // 4. Central Renaissance Emblem / Engraving Area
  const archX = 140;
  const archY = 180;
  const archW = 744;
  const archH = 680;

  // Arch Background
  ctx.save();
  ctx.fillStyle = '#26211a';
  ctx.beginPath();
  ctx.moveTo(archX, archY + archH);
  ctx.lineTo(archX, archY + 200);
  ctx.arcTo(archX, archY, archX + archW / 2, archY, 200);
  ctx.arcTo(archX + archW, archY, archX + archW, archY + 200, 200);
  ctx.lineTo(archX + archW, archY + archH);
  ctx.closePath();
  ctx.fill();

  // Subtle engraved inner border
  ctx.strokeStyle = '#b19c73';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Classical Illustration Artwork inside Arch
  drawClassicalIllustration(ctx, index, 512, archY + 360, project);
  ctx.restore();

  // 5. Title & Subtitle
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2e2311';
  ctx.font = '400 68px "Metamorphous", Georgia, serif';
  ctx.fillText(project.title, 512, 940);

  ctx.fillStyle = '#564222';
  ctx.font = '500 24px "Inter", sans-serif';
  ctx.fillText(project.subtitle, 512, 990);

  // 6. Renaissance Color Palette Swatches on Tablet
  const swatchY = 1040;
  const swatchWidth = 50;
  const swatchSpacing = 16;
  const totalSwatchesW = 5 * swatchWidth + 4 * swatchSpacing;
  const startSwatchX = 512 - totalSwatchesW / 2;

  // Decorative text
  ctx.font = '400 16px "Inter", monospace';
  ctx.fillStyle = '#736c60';
  ctx.fillText(`THEMA: ${project.paletteTheme.toUpperCase()}`, 512, swatchY - 16);

  const colors = [
    project.accentColor,
    project.secondaryColor,
    '#2e2311',
    '#92743e',
    '#b8ad9c'
  ];

  colors.forEach((col, i) => {
    const sx = startSwatchX + i * (swatchWidth + swatchSpacing);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(sx + swatchWidth / 2, swatchY + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2e2311';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 7. Description Quote / Parchment text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#26211a';
  ctx.font = '400 22px "Inter", sans-serif';

  // Wrap text cleanly
  const words = project.description.split(' ');
  let line = '';
  let lineY = 1130;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 720 && n > 0) {
      ctx.fillText(line.trim(), 512, lineY);
      line = words[n] + ' ';
      lineY += 34;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 512, lineY);

  // 8. Footer Metadata & Tags (Generous bottom padding)
  ctx.fillStyle = '#564222';
  ctx.font = '600 17px "Inter", monospace';
  ctx.fillText(`ANNO DOMINI ${project.year} • ${project.stats.toUpperCase()}`, 512, 1275);

  ctx.strokeStyle = '#b19c73';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(250, 1300);
  ctx.lineTo(774, 1300);
  ctx.stroke();

  ctx.fillStyle = '#7a3f34';
  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillText(project.tags.join('  •  '), 512, 1330);

  // Return optimized Three.js CanvasTexture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Draws stylized classical Renaissance vector engravings
 */
function drawClassicalIllustration(
  ctx: CanvasRenderingContext2D,
  index: number,
  cx: number,
  cy: number,
  project: ProjectItem
) {
  ctx.save();
  ctx.strokeStyle = project.accentColor;
  ctx.fillStyle = project.secondaryColor;
  ctx.lineWidth = 2.5;

  switch (index % 5) {
    case 0:
      // Artibition: Classical Bust & Celestial Compass
      drawCelestialSphere(ctx, cx, cy);
      break;
    case 1:
      // Huuk: Classical Architectural Columns & Arch
      drawClassicalColumns(ctx, cx, cy);
      break;
    case 2:
      // Pugu: Da Vinci Polyhedron & Relationship Nodes
      drawSacredPolyhedron(ctx, cx, cy);
      break;
    case 3:
      // Ascott: Astrolabe & Navigational Dial
      drawAstrolabe(ctx, cx, cy);
      break;
    case 4:
    default:
      // Teenueng: Classical Sun & Flourish
      drawRenaissanceSun(ctx, cx, cy);
      break;
  }

  ctx.restore();
}

function drawCelestialSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Inclined orbital rings
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 45 + i * 25, (i * Math.PI) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Central star
  ctx.fillStyle = '#c6b18f';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();
}

function drawClassicalColumns(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const colW = 34;
  const colH = 220;

  // Left & Right Corinthian columns
  [-110, 110].forEach((ox) => {
    ctx.strokeRect(cx + ox - colW / 2, cy - colH / 2, colW, colH);

    // Fluting lines
    for (let l = -colW / 4; l <= colW / 4; l += colW / 4) {
      ctx.beginPath();
      ctx.moveTo(cx + ox + l, cy - colH / 2);
      ctx.lineTo(cx + ox + l, cy + colH / 2);
      ctx.stroke();
    }
  });

  // Arch connecting tops
  ctx.beginPath();
  ctx.arc(cx, cy - colH / 2, 110, Math.PI, 0, false);
  ctx.stroke();
}

function drawSacredPolyhedron(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 130;
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }

  // Draw hexagon
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.stroke();

  // Internal triangulation (sacred geometry)
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      ctx.beginPath();
      ctx.moveTo(points[i][0], points[i][1]);
      ctx.lineTo(points[j][0], points[j][1]);
      ctx.stroke();
    }
  }
}

function drawAstrolabe(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.stroke();

  // Degree ticks
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    const x1 = cx + Math.cos(rad) * 115;
    const y1 = cy + Math.sin(rad) * 115;
    const x2 = cx + Math.cos(rad) * 130;
    const y2 = cy + Math.sin(rad) * 130;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - 130, cy);
  ctx.lineTo(cx + 130, cy);
  ctx.moveTo(cx, cy - 130);
  ctx.lineTo(cx, cy + 130);
  ctx.stroke();
}

function drawRenaissanceSun(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Flaming rays
  const rays = 16;
  for (let i = 0; i < rays; i++) {
    const a = (i * 2 * Math.PI) / rays;
    const inner = 55;
    const outer = i % 2 === 0 ? 125 : 95;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }
}
