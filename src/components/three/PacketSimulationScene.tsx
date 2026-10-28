import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PACKET_STAGES, PROTOCOL_INFO } from '../../data/packetSimulationData';
import { PacketStage, ProtocolType } from '../../types';
import { setupStudioEnvironment, isSoftwareGl } from '../../utils/threeUtils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Sliders, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Camera, 
  Wifi, 
  Activity, 
  Eye, 
  ChevronRight, 
  Layers, 
  Info,
  X
} from 'lucide-react';

export const PacketSimulationScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'external' | 'internal'>('external');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<PacketStage | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  const activeStage = PACKET_STAGES[currentStageIndex];

  // Three.js mutable state in refs
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    controls: null as OrbitControls | null,
    isPlaying: true,
    speed: 1,
    stageIndex: 0,
    progressInStage: 0,
    viewMode: 'external' as 'external' | 'internal',
    packetParticles: [] as THREE.Mesh[],
    externalEthernetCurve: null as THREE.CatmullRomCurve3 | null,
    internalCurve1: null as THREE.CatmullRomCurve3 | null, // PHY to SoC
    internalCurve2: null as THREE.CatmullRomCurve3 | null, // SoC to RAM
    internalCurve3: null as THREE.CatmullRomCurve3 | null, // RAM to SATA
    internalCurve4: null as THREE.CatmullRomCurve3 | null, // SATA to HDD
    internalCurve5: null as THREE.CatmullRomCurve3 | null, // SoC to HDMI/Monitor
    activePacketMesh: null as THREE.Mesh | null,
    socGlowMesh: null as THREE.Mesh | null,
    ramGlowMesh: null as THREE.Mesh | null,
    hddGlowMesh: null as THREE.Mesh | null,
    targetCamPos: new THREE.Vector3(0, 24, 48),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isCamMoving: false,
    chassisCover: null as THREE.Mesh | null,
  });

  // Keep refs in sync
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.speed = simSpeed;
    stateRef.current.stageIndex = currentStageIndex;
    stateRef.current.viewMode = viewMode;

    // Adjust camera preset when viewMode switches
    const s = stateRef.current;
    if (viewMode === 'external') {
      s.targetCamPos.set(0, 22, 46);
      s.targetLookAt.set(0, 2, 0);
      s.isCamMoving = true;
      if (s.chassisCover) {
        (s.chassisCover.material as THREE.MeshStandardMaterial).opacity = 1.0;
        (s.chassisCover.material as THREE.MeshStandardMaterial).transparent = false;
      }
    } else {
      // Zoom right into the motherboard
      s.targetCamPos.set(8, 16, 18);
      s.targetLookAt.set(8, 0, 0);
      s.isCamMoving = true;
      if (s.chassisCover) {
        (s.chassisCover.material as THREE.MeshStandardMaterial).opacity = 0.15;
        (s.chassisCover.material as THREE.MeshStandardMaterial).transparent = true;
      }
    }
  }, [isPlaying, simSpeed, currentStageIndex, viewMode]);

  const handleStep = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const nextIdx = (currentStageIndex + 1) % PACKET_STAGES.length;
      setCurrentStageIndex(nextIdx);
      stateRef.current.progressInStage = 0;
    } else {
      const prevIdx = (currentStageIndex - 1 + PACKET_STAGES.length) % PACKET_STAGES.length;
      setCurrentStageIndex(prevIdx);
      stateRef.current.progressInStage = 0;
    }
  };

  const handleRestart = () => {
    setCurrentStageIndex(0);
    stateRef.current.progressInStage = 0;
    setIsPlaying(true);
  };

  const jumpToStage = (idx: number) => {
    setCurrentStageIndex(idx);
    stateRef.current.progressInStage = 0;
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    scene.fog = new THREE.FogExp2('#f8fafc', 0.006);
    stateRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 22, 46);
    stateRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 8;
    controls.maxDistance = 90;
    controls.target.set(0, 2, 0);
    controls.addEventListener('start', () => {
      stateRef.current.isCamMoving = false;
    });
    stateRef.current.controls = controls;

    const cleanupEnv = setupStudioEnvironment(renderer, scene);

    const dirLight = new THREE.DirectionalLight('#ffffff', 2.0);
    dirLight.position.set(25, 35, 25);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#06b6d4', 1.0);
    rimLight.position.set(-25, 25, -25);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight('#f8fafc', '#334155', 0.5);
    scene.add(hemiLight);

    // Ground Grid
    const grid = new THREE.GridHelper(100, 50, '#94a3b8', '#e2e8f0');
    grid.position.y = -0.05;
    scene.add(grid);

    // ==========================================
    // BUILD PHYSICAL NETWORK WORKSPACE
    // ==========================================
    // 1. IP CAMERA (Left: x = -28, y = 8, z = 0)
    const camGroup = new THREE.Group();
    camGroup.position.set(-28, 4, 0);
    scene.add(camGroup);

    // Camera Stand / Mount Arm
    const standGeo = new THREE.CylinderGeometry(0.8, 1.2, 8, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 4;
    camGroup.add(stand);

    // Turret Dome Body (White aluminum housing)
    const camBodyGeo = new THREE.SphereGeometry(3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const camBodyMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.25, metalness: 0.2 });
    const camBody = new THREE.Mesh(camBodyGeo, camBodyMat);
    camBody.position.set(0, 8, 0);
    camBody.rotation.x = Math.PI / 2;
    camGroup.add(camBody);

    // Camera Glass Lens & IR LED Ring
    const lensGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.4, 24);
    const lensMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.1, metalness: 0.9 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 8, 2.8);
    lens.rotation.x = Math.PI / 2;
    camGroup.add(lens);

    // Camera IR Status Ring (Red LED emitter)
    const irRingGeo = new THREE.TorusGeometry(1.8, 0.12, 8, 24);
    const irRingMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const irRing = new THREE.Mesh(irRingGeo, irRingMat);
    irRing.position.set(0, 8, 2.7);
    camGroup.add(irRing);

    // 2. NVR UNIT (Center-Right: x = 6, y = 2, z = 0)
    const nvrGroup = new THREE.Group();
    nvrGroup.position.set(6, 2, 0);
    scene.add(nvrGroup);

    // Chassis Box
    const nvrBoxGeo = new THREE.BoxGeometry(26, 4.8, 20);
    const nvrBoxMat = new THREE.MeshStandardMaterial({ color: '#151921', roughness: 0.5, metalness: 0.7 });
    const nvrBox = new THREE.Mesh(nvrBoxGeo, nvrBoxMat);
    nvrGroup.add(nvrBox);

    // Removable Top Cover for Internal Motherboard View
    const nvrCoverGeo = new THREE.BoxGeometry(26.2, 0.6, 20.2);
    const nvrCoverMat = new THREE.MeshStandardMaterial({
      color: '#1e2430',
      roughness: 0.4,
      metalness: 0.8,
    });
    const nvrCover = new THREE.Mesh(nvrCoverGeo, nvrCoverMat);
    nvrCover.position.y = 2.6;
    nvrGroup.add(nvrCover);
    stateRef.current.chassisCover = nvrCover;

    // Inside Motherboard (Green PCB)
    const mbPcbGeo = new THREE.BoxGeometry(24, 0.3, 18);
    const mbPcbMat = new THREE.MeshStandardMaterial({ color: '#0e3d23', roughness: 0.35, metalness: 0.3 });
    const mbPcb = new THREE.Mesh(mbPcbGeo, mbPcbMat);
    mbPcb.position.y = -1.2;
    nvrGroup.add(mbPcb);

    // Inside Motherboard Chips:
    // - Ethernet PHY (x: -9, z: -6)
    const phyGeo = new THREE.BoxGeometry(2, 0.4, 2);
    const phyMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const phyMesh = new THREE.Mesh(phyGeo, phyMat);
    phyMesh.position.set(-9, -0.9, -6);
    nvrGroup.add(phyMesh);

    // - Main SoC with Heatsink (x: -3, z: 0)
    const socGeo = new THREE.BoxGeometry(4.2, 1.2, 4.2);
    const socMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.8 });
    const socMesh = new THREE.Mesh(socGeo, socMat);
    socMesh.position.set(-3, -0.5, 0);
    nvrGroup.add(socMesh);

    // SoC Glow Ring (lights up when processing)
    const socGlowGeo = new THREE.RingGeometry(2.4, 3.2, 24);
    const socGlowMat = new THREE.MeshBasicMaterial({ color: '#8b5cf6', side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const socGlow = new THREE.Mesh(socGlowGeo, socGlowMat);
    socGlow.rotation.x = -Math.PI / 2;
    socGlow.position.set(-3, 0.2, 0);
    nvrGroup.add(socGlow);
    stateRef.current.socGlowMesh = socGlow;

    // - RAM Chips (x: -3, z: -5)
    const ramGeo = new THREE.BoxGeometry(2.2, 0.3, 3);
    const ramMesh = new THREE.Mesh(ramGeo, phyMat);
    ramMesh.position.set(-3, -0.9, -5);
    nvrGroup.add(ramMesh);

    const ramGlowGeo = new THREE.PlaneGeometry(2.8, 3.6);
    const ramGlowMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const ramGlow = new THREE.Mesh(ramGlowGeo, ramGlowMat);
    ramGlow.rotation.x = -Math.PI / 2;
    ramGlow.position.set(-3, -0.7, -5);
    nvrGroup.add(ramGlow);
    stateRef.current.ramGlowMesh = ramGlow;

    // - Surveillance HDD (x: 6, z: 0)
    const hddGeo = new THREE.BoxGeometry(8, 2.4, 12);
    const hddMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3, metalness: 0.85 });
    const hddMesh = new THREE.Mesh(hddGeo, hddMat);
    hddMesh.position.set(6, 0.1, 0);
    nvrGroup.add(hddMesh);

    const hddGlowGeo = new THREE.BoxGeometry(8.4, 2.6, 12.4);
    const hddGlowMat = new THREE.MeshBasicMaterial({ color: '#10b981', wireframe: true, transparent: true, opacity: 0 });
    const hddGlow = new THREE.Mesh(hddGlowGeo, hddGlowMat);
    hddGlow.position.set(6, 0.1, 0);
    nvrGroup.add(hddGlow);
    stateRef.current.hddGlowMesh = hddGlow;

    // 3. MONITOR DISPLAY (Far-Right: x = 28, y = 5, z = 0)
    const monGroup = new THREE.Group();
    monGroup.position.set(28, 5, 0);
    scene.add(monGroup);

    // Stand
    const monStandGeo = new THREE.CylinderGeometry(0.6, 1.2, 5, 16);
    const monStand = new THREE.Mesh(monStandGeo, standMat);
    monStand.position.y = 2.5;
    monGroup.add(monStand);

    // Display Frame
    const monFrameGeo = new THREE.BoxGeometry(16, 10, 0.8);
    const monFrameMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
    const monFrame = new THREE.Mesh(monFrameGeo, monFrameMat);
    monFrame.position.set(0, 6, 0);
    monGroup.add(monFrame);

    // Screen with Live Surveillance Grid Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    const sCtx = screenCanvas.getContext('2d')!;
    sCtx.fillStyle = '#020617';
    sCtx.fillRect(0, 0, 512, 320);

    // 2x2 Camera Quad Grid
    sCtx.strokeStyle = '#334155';
    sCtx.lineWidth = 2;
    sCtx.beginPath();
    sCtx.moveTo(256, 0);
    sCtx.lineTo(256, 320);
    sCtx.moveTo(0, 160);
    sCtx.lineTo(512, 160);
    sCtx.stroke();

    // Quad Feed 1: Simulated video graphics
    sCtx.fillStyle = '#065f46';
    sCtx.fillRect(8, 8, 240, 144);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 12px "JetBrains Mono", monospace';
    sCtx.fillText('CH 01 // 4K LIVE', 18, 30);
    sCtx.fillText('BITRATE: 4096 kbps', 18, 50);

    // Quad Feed 2-4
    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(264, 8, 240, 144);
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillText('CH 02 // STANDBY', 274, 30);

    sCtx.fillRect(8, 168, 240, 144);
    sCtx.fillText('CH 03 // STANDBY', 18, 190);

    sCtx.fillRect(264, 168, 240, 144);
    sCtx.fillText('CH 04 // STANDBY', 274, 190);

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenGeo = new THREE.PlaneGeometry(15.2, 9.2);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 6, 0.42);
    monGroup.add(screen);

    // ==========================================
    // 4. ANIMATED PHYSICAL DATA CABLING / SPLINES
    // ==========================================
    // External: Camera RJ45 to NVR RJ45 PoE Port
    const extCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-28, 4, 0),
      new THREE.Vector3(-22, 1.2, -4),
      new THREE.Vector3(-12, 1.2, -8),
      new THREE.Vector3(-4, 2, -6),
    ]);
    stateRef.current.externalEthernetCurve = extCurve;

    const extCableGeo = new THREE.TubeGeometry(extCurve, 40, 0.35, 8, false);
    const extCableMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.4 });
    const extCable = new THREE.Mesh(extCableGeo, extCableMat);
    scene.add(extCable);

    // Internal Splines:
    // 1. RJ45 to PHY
    stateRef.current.internalCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2, 0.5, -6),
      new THREE.Vector3(-3, 0.5, -6),
    ]);
    // 2. PHY to SoC
    stateRef.current.internalCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 0.5, -6),
      new THREE.Vector3(3, 0.5, 0),
    ]);
    // 3. SoC to RAM Buffer
    stateRef.current.internalCurve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3, 0.5, 0),
      new THREE.Vector3(3, 0.5, -5),
    ]);
    // 4. RAM to SATA / HDD
    stateRef.current.internalCurve4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3, 0.5, 0),
      new THREE.Vector3(8, 0.5, 2),
      new THREE.Vector3(12, 1.5, 0),
    ]);
    // 5. SoC to Monitor (HDMI)
    stateRef.current.internalCurve5 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(6, 2, 0),
      new THREE.Vector3(16, 2.5, 0),
      new THREE.Vector3(28, 5, 0),
    ]);

    // Active Moving Packet Sphere Mesh
    const packetGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    packetMesh.position.set(-28, 4, 0);
    scene.add(packetMesh);
    stateRef.current.activePacketMesh = packetMesh;

    // Glow halo around the packet
    const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.4 });
    const glowHalo = new THREE.Mesh(glowGeo, glowMat);
    packetMesh.add(glowHalo);

    // ==========================================
    // 5. SIMULATION ANIMATION LOOP
    // ==========================================
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;

      // Camera smooth damping
      if (s.isCamMoving && s.camera && s.controls) {
        s.camera.position.lerp(s.targetCamPos, 0.08);
        s.controls.target.lerp(s.targetLookAt, 0.08);
        if (s.camera.position.distanceTo(s.targetCamPos) < 0.2) {
          s.isCamMoving = false;
        }
      }

      // Simulation playback progression
      if (s.isPlaying) {
        s.progressInStage += delta * 0.45 * s.speed;

        if (s.progressInStage >= 1.0) {
          s.progressInStage = 0;
          const nextIdx = (s.stageIndex + 1) % PACKET_STAGES.length;
          s.stageIndex = nextIdx;
          setCurrentStageIndex(nextIdx);
        }
      }

      // Update packet position along current stage path
      const stage = PACKET_STAGES[s.stageIndex];
      if (s.activePacketMesh) {
        (s.activePacketMesh.material as THREE.MeshBasicMaterial).color.set(stage.color);
        (glowHalo.material as THREE.MeshBasicMaterial).color.set(stage.color);

        let activeCurve: THREE.CatmullRomCurve3 | null = null;
        if (stage.internalPath === 'external') {
          activeCurve = s.externalEthernetCurve;
        } else if (stage.internalPath === 'phy') {
          activeCurve = s.internalCurve1;
        } else if (stage.internalPath === 'soc') {
          activeCurve = s.internalCurve2;
        } else if (stage.internalPath === 'ram') {
          activeCurve = s.internalCurve3;
        } else if (stage.internalPath === 'sata' || stage.internalPath === 'hdd') {
          activeCurve = s.internalCurve4;
        } else if (stage.internalPath === 'display') {
          activeCurve = s.internalCurve5;
        }

        if (activeCurve) {
          const pt = activeCurve.getPoint(Math.min(s.progressInStage, 0.999));
          s.activePacketMesh.position.copy(pt);
          s.activePacketMesh.visible = true;
        } else {
          s.activePacketMesh.visible = false;
        }
      }

      // Component glows based on active processing stage
      if (s.socGlowMesh) {
        const isSocActive = stage.internalPath === 'soc' || stage.internalPath === 'display';
        (s.socGlowMesh.material as THREE.MeshBasicMaterial).opacity = isSocActive ? 0.75 : 0;
      }
      if (s.ramGlowMesh) {
        const isRamActive = stage.internalPath === 'ram';
        (s.ramGlowMesh.material as THREE.MeshBasicMaterial).opacity = isRamActive ? 0.8 : 0;
      }
      if (s.hddGlowMesh) {
        const isHddActive = stage.internalPath === 'hdd' || stage.internalPath === 'sata';
        (s.hddGlowMesh.material as THREE.MeshBasicMaterial).opacity = isHddActive ? 0.9 : 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      cleanupEnv();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[640px] flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      {/* 3D Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HUD: Simulation Stage Readout & Perspective Switcher */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: activeStage.color }}
            />
            <span className="font-mono-tech text-xs font-bold text-slate-800">
              STAGE {activeStage.step}/10 // {activeStage.protocol}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-medium text-slate-600 truncate max-w-xs sm:max-w-md">
            {activeStage.title}
          </span>
        </div>

        {/* View Perspective Toggle: External vs Motherboard */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('external')}
            className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'external' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wifi size={13} />
            <span>EXTERNAL NETWORK</span>
          </button>
          <button
            onClick={() => setViewMode('internal')}
            className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'internal' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu size={13} />
            <span>ENTER MOTHERBOARD VIEW</span>
          </button>
        </div>
      </div>

      {/* PACKET INSPECTOR DRAWER */}
      {selectedStage && (
        <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-xl border border-blue-200 shadow-2xl p-5 z-20 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span
                className="text-[10px] font-mono-tech uppercase font-bold text-white px-2 py-0.5 rounded"
                style={{ backgroundColor: selectedStage.color }}
              >
                {selectedStage.protocol} • {selectedStage.layer}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedStage.title}</h3>
              <p className="text-xs text-slate-500 font-mono-tech">{selectedStage.subType}</p>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">{selectedStage.description}</p>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="font-mono-tech font-medium text-slate-800">{selectedStage.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-mono-tech font-medium text-slate-800">{selectedStage.destination}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Packet Payload Telemetry:</span>
              <pre className="font-mono-tech text-[10px] bg-slate-900 text-cyan-300 p-2.5 rounded border border-slate-800 mt-1 overflow-x-auto whitespace-pre-wrap">
                {selectedStage.packetPayloadPreview}
              </pre>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Active Circuit & Hardware:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStage.hardwareInvolved.map((hw, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-mono-tech px-2 py-0.5 rounded border border-slate-200">
                    {hw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM UNIFIED PLAYBACK & TIMELINE CONTROLS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-4 z-10 text-slate-800">
        {/* Scrubbable 10-Stage Event Timeline */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono-tech font-bold text-slate-500 text-[10px] uppercase tracking-wider">
              EVENT SEQUENCE TIMELINE
            </span>
            <button
              onClick={() => setSelectedStage(activeStage)}
              className="text-[11px] font-mono-tech font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Info size={12} />
              <span>INSPECT ACTIVE PACKET</span>
            </button>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {PACKET_STAGES.map((stg, i) => {
              const isCurrent = i === currentStageIndex;
              const isPassed = i < currentStageIndex;
              return (
                <button
                  key={stg.id}
                  onClick={() => jumpToStage(i)}
                  className={`h-2 rounded transition-all relative group ${
                    isCurrent
                      ? 'ring-2 ring-blue-500 shadow-sm scale-y-125'
                      : isPassed
                      ? 'opacity-80'
                      : 'opacity-35 hover:opacity-60'
                  }`}
                  style={{ backgroundColor: stg.color }}
                  title={`${stg.step}. ${stg.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Playback Transport Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              title="Restart Sequence"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => handleStep('prev')}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              title="Step Back"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-mono-tech text-xs font-bold shadow-sm transition-colors"
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={() => handleStep('next')}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              title="Step Forward"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono-tech font-bold text-slate-600">
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  simSpeed === speed ? 'bg-white text-blue-600 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Protocol Legend Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono-tech font-bold">
            {(['RTP', 'RTSP', 'ONVIF', 'DHCP'] as ProtocolType[]).map(proto => (
              <span
                key={proto}
                className="px-2 py-0.5 rounded border"
                style={{
                  borderColor: PROTOCOL_INFO[proto].color,
                  color: PROTOCOL_INFO[proto].color,
                  backgroundColor: `${PROTOCOL_INFO[proto].color}12`,
                }}
              >
                {proto}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
