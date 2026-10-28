import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Detect software WebGL renderer
export const isSoftwareGl = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

// Setup standard PBR studio environment
export function setupStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): () => void {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const renderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = renderTarget.texture;

  return () => {
    renderTarget.dispose();
    pmremGenerator.dispose();
  };
}

// Procedural texture: Brushed black/slate anodized metal
export function createBrushedMetalTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e232a';
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal brushing lines
  for (let i = 0; i < 600; i++) {
    const y = Math.random() * height;
    const opacity = 0.03 + Math.random() * 0.06;
    const brightness = Math.random() > 0.5 ? 255 : 0;
    ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${opacity})`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural texture: Green FR-4 PCB circuit traces and solder pads
export function createPcbTraceTexture(width = 1024, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep matte electronics green substrate
  ctx.fillStyle = '#0e3d23';
  ctx.fillRect(0, 0, width, height);

  // Subtle fiberglass weave
  ctx.fillStyle = 'rgba(18, 60, 36, 0.5)';
  for (let x = 0; x < width; x += 8) {
    ctx.fillRect(x, 0, 4, height);
  }

  // Golden / copper electronic circuit traces
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const traceCount = 140;
  for (let i = 0; i < traceCount; i++) {
    let startX = Math.floor(Math.random() * (width / 32)) * 32;
    let startY = Math.floor(Math.random() * (height / 32)) * 32;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const steps = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < steps; s++) {
      const dir = Math.floor(Math.random() * 4);
      const dist = 32 + Math.floor(Math.random() * 3) * 32;
      if (dir === 0) startX += dist;
      else if (dir === 1) startX -= dist;
      else if (dir === 2) startY += dist;
      else startY -= dist;
      ctx.lineTo(startX, startY);
    }
    ctx.stroke();

    // Solder via ring at end of trace
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a2e1a';
    ctx.beginPath();
    ctx.arc(startX, startY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Silk-screen labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText('NVR-MAIN-V2.4', 40, 50);
  ctx.fillText('IEEE-802.3AT PSE', 40, 80);
  ctx.fillText('SATA_III 6G', 600, 800);
  ctx.fillText('DDR4_CLK_DIFF', 300, 400);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural texture: Surveillance Hard Drive top label
export function createHddLabelTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Silver metal base
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, width, height);

  // Top header banner: High-grade Surveillance Purple / SkyHawk Cyan
  ctx.fillStyle = '#581c87';
  ctx.fillRect(20, 20, width - 40, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Inter", sans-serif';
  ctx.fillText('SURVEILLANCE HDD', 40, 65);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('24/7 ALLFRAME 6G // 4TB', 40, 92);

  // Center specifications box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 120, width - 40, height - 140);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(20, 120, width - 40, height - 140);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText('MODEL: NV-4000PURZ', 40, 160);
  ctx.fillText('CAPACITY: 4000 GB (4TB)', 40, 190);
  ctx.fillText('INTERFACE: SATA 6.0 Gb/s', 40, 220);
  ctx.fillText('RPM: 5400 CLASS / 256MB CACHE', 40, 250);

  // Barcode visualization
  ctx.fillStyle = '#1e293b';
  let barX = 40;
  while (barX < width - 60) {
    const barW = Math.random() > 0.4 ? 4 : 2;
    ctx.fillRect(barX, 280, barW, 40);
    barX += barW + (Math.random() > 0.5 ? 3 : 2);
  }

  // Safety / Environmental badges
  ctx.font = '11px "Inter", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('DO NOT COVER BREATHER HOLE // SHOCK SENSITIVE', 40, 360);
  ctx.fillText('RATED WORKLOAD: 180 TB/YEAR // MTTF 1,000,000 HRS', 40, 385);
  ctx.fillText('FIRMWARE: VER 82.00A82 // CE / FCC / RoHS COMPLIANT', 40, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural texture: Front panel silkscreen & branding
export function createFrontPanelTexture(width = 1024, height = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark matte brushed panel
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, width, height);

  // Brushed hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Left branding: NVRVerse 8CH POE 4K
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px "Inter", sans-serif';
  ctx.fillText('NVRVerse', 48, 55);

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText('4K ULTRA HD // 8-CHANNEL POE NVR', 48, 80);

  // Status LED labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('PWR', 480, 85);
  ctx.fillText('HDD', 540, 85);
  ctx.fillText('NET', 600, 85);
  ctx.fillText('REC', 660, 85);

  // USB port border
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(820, 38, 52, 28);
  ctx.fillText('USB 2.0', 824, 85);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
