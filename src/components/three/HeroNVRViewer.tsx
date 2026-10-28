import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  createBrushedMetalTexture, 
  createPcbTraceTexture, 
  createHddLabelTexture, 
  createFrontPanelTexture,
  setupStudioEnvironment,
  isSoftwareGl 
} from '../../utils/threeUtils';
import { RotateCcw, Play, Pause, Layers, Sliders, Eye, ArrowUpRight, Zap, HardDrive, Cpu, Video } from 'lucide-react';

interface HeroNVRViewerProps {
  onEnterLab?: () => void;
}

export const HeroNVRViewer: React.FC<HeroNVRViewerProps> = ({ onEnterLab }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'iso' | 'front' | 'rear' | 'internals'>('iso');
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    controls: null as OrbitControls | null,
    topCoverMesh: null as THREE.Mesh | null,
    hddGroup: null as THREE.Group | null,
    motherboardGroup: null as THREE.Group | null,
    fanGroup: null as THREE.Group | null,
    rotorMesh: null as THREE.Mesh | null,
    explodedProgress: 0,
    targetExploded: 0,
    autoRotate: true,
    targetCameraPos: new THREE.Vector3(36, 24, 42),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isCamMoving: false,
  });

  const setCameraPreset = useCallback((preset: 'iso' | 'front' | 'rear' | 'internals') => {
    setActivePreset(preset);
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;

    if (preset === 'iso') {
      s.targetCameraPos.set(36, 24, 42);
      s.targetLookAt.set(0, 0, 0);
      setIsExploded(false);
    } else if (preset === 'front') {
      s.targetCameraPos.set(0, 4, 38);
      s.targetLookAt.set(0, -1, 18);
      setIsExploded(false);
    } else if (preset === 'rear') {
      s.targetCameraPos.set(0, 4, -42);
      s.targetLookAt.set(0, -1, -18);
      setIsExploded(false);
    } else if (preset === 'internals') {
      s.targetCameraPos.set(0, 32, 14);
      s.targetLookAt.set(0, 0, 0);
      setIsExploded(true);
    }
    s.isCamMoving = true;
  }, []);

  useEffect(() => {
    stateRef.current.targetExploded = isExploded ? 1 : 0;
  }, [isExploded]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    if (stateRef.current.controls) {
      stateRef.current.controls.autoRotate = autoRotate;
      stateRef.current.controls.autoRotateSpeed = 1.0;
    }
  }, [autoRotate]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    scene.fog = new THREE.FogExp2('#f8fafc', 0.007);
    stateRef.current.scene = scene;

    // 2. Camera (Cinematic hero angle)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(36, 24, 42);
    stateRef.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.minDistance = 14;
    controls.maxDistance = 85;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0, 0);
    controls.addEventListener('start', () => {
      stateRef.current.isCamMoving = false;
    });
    stateRef.current.controls = controls;

    // 5. Environment & Studio Lights
    const cleanupEnv = setupStudioEnvironment(renderer, scene);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(25, 40, 25);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.3);
    rimLight.position.set(-30, 25, -30);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#2563eb', 0.6);
    fillLight.position.set(0, -10, 20);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight('#f8fafc', '#1e293b', 0.5);
    scene.add(hemiLight);

    // Floor Grid
    const grid = new THREE.GridHelper(80, 40, '#cbd5e1', '#e2e8f0');
    grid.position.y = -6.18;
    scene.add(grid);

    // Contact shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.18)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowGeo = new THREE.PlaneGeometry(54, 46);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -6.15;
    scene.add(contactShadow);

    // ==========================================
    // 6. BUILD NVR 3D HARDWARE MODEL
    // ==========================================
    const nvrGroup = new THREE.Group();
    scene.add(nvrGroup);

    const brushedMetalTex = createBrushedMetalTexture();
    const pcbTex = createPcbTraceTexture();
    const hddLabelTex = createHddLabelTexture();
    const frontPanelTex = createFrontPanelTexture();

    // Chassis Base
    const baseGeo = new THREE.BoxGeometry(48, 8.5, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#151921',
      roughness: 0.5,
      metalness: 0.65,
      bumpMap: brushedMetalTex,
      bumpScale: 0.02,
    });
    const chassisBase = new THREE.Mesh(baseGeo, baseMat);
    chassisBase.position.y = -1.75;
    chassisBase.castShadow = !isSoftwareGl;
    chassisBase.receiveShadow = !isSoftwareGl;
    nvrGroup.add(chassisBase);

    // Rubber Feet
    const footGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.6, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: '#090d13', roughness: 0.9 });
    [[-21, -6.0, -15], [21, -6.0, -15], [-21, -6.0, 15], [21, -6.0, 15]].forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      nvrGroup.add(foot);
    });

    // Top Cover Housing
    const coverGeo = new THREE.BoxGeometry(48.2, 1.2, 36.2);
    const coverMat = new THREE.MeshStandardMaterial({
      color: '#181d26',
      roughness: 0.45,
      metalness: 0.7,
      bumpMap: brushedMetalTex,
      bumpScale: 0.02,
    });
    const topCover = new THREE.Mesh(coverGeo, coverMat);
    topCover.position.y = 2.8;
    topCover.castShadow = !isSoftwareGl;
    nvrGroup.add(topCover);
    stateRef.current.topCoverMesh = topCover;

    // Front Bezel Faceplate
    const frontGeo = new THREE.PlaneGeometry(48, 8.4);
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontPanelTex,
      roughness: 0.25,
      metalness: 0.4,
    });
    const frontPanel = new THREE.Mesh(frontGeo, frontMat);
    frontPanel.position.set(0, -1.75, 18.06);
    nvrGroup.add(frontPanel);

    // Front Status LEDs
    const ledGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    ledGeo.rotateX(Math.PI / 2);
    const pwrMat = new THREE.MeshStandardMaterial({ color: '#2563eb', emissive: '#2563eb', emissiveIntensity: 2.5 });
    const pwrLed = new THREE.Mesh(ledGeo, pwrMat);
    pwrLed.position.set(-1, -2.2, 18.15);
    nvrGroup.add(pwrLed);

    const recMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 2.5 });
    const recLed = new THREE.Mesh(ledGeo, recMat);
    recLed.position.set(8, -2.2, 18.15);
    nvrGroup.add(recLed);

    // Motherboard Inside
    const mbGroup = new THREE.Group();
    mbGroup.position.set(-6, -1.8, 2);
    nvrGroup.add(mbGroup);
    stateRef.current.motherboardGroup = mbGroup;

    const pcbGeo = new THREE.BoxGeometry(32, 0.4, 28);
    const pcbMat = new THREE.MeshStandardMaterial({ color: '#0e3d23', map: pcbTex, roughness: 0.4, metalness: 0.3 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    mbGroup.add(pcb);

    // Main SoC Heatsink
    const hsBaseGeo = new THREE.BoxGeometry(5.2, 0.5, 5.2);
    const hsMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.35, metalness: 0.85 });
    const hsBase = new THREE.Mesh(hsBaseGeo, hsMat);
    hsBase.position.set(0, 0.45, 0);
    mbGroup.add(hsBase);

    for (let f = -2.2; f <= 2.2; f += 0.55) {
      const finGeo = new THREE.BoxGeometry(5.2, 1.4, 0.18);
      const fin = new THREE.Mesh(finGeo, hsMat);
      fin.position.set(0, 1.2, f);
      mbGroup.add(fin);
    }

    // 3.5" Hard Drive
    const hddGroup = new THREE.Group();
    hddGroup.position.set(13, -1.2, 2);
    nvrGroup.add(hddGroup);
    stateRef.current.hddGroup = hddGroup;

    const hddBodyGeo = new THREE.BoxGeometry(14, 4.2, 20);
    const hddBodyMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.35, metalness: 0.8 });
    const hddBody = new THREE.Mesh(hddBodyGeo, hddBodyMat);
    hddGroup.add(hddBody);

    const hddLabelGeo = new THREE.PlaneGeometry(13.6, 19.6);
    const hddLabelMeshMat = new THREE.MeshStandardMaterial({ map: hddLabelTex, roughness: 0.3, metalness: 0.2 });
    const hddLabel = new THREE.Mesh(hddLabelGeo, hddLabelMeshMat);
    hddLabel.rotation.x = -Math.PI / 2;
    hddLabel.position.y = 2.12;
    hddGroup.add(hddLabel);

    // Rear 8 PoE Ports
    const rj45MetalMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 });
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const portBoxGeo = new THREE.BoxGeometry(2.4, 2.0, 3.2);
        const portBox = new THREE.Mesh(portBoxGeo, rj45MetalMat);
        portBox.position.set(-18.5 + col * 3.0, -0.6 - row * 2.4, -18.05);
        nvrGroup.add(portBox);
      }
    }

    // Rear HDMI port
    const hdmiGeo = new THREE.BoxGeometry(3.2, 1.6, 2.4);
    const hdmiMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.95, roughness: 0.15 });
    const hdmiMesh = new THREE.Mesh(hdmiGeo, hdmiMat);
    hdmiMesh.position.set(11, -1.8, -18.05);
    nvrGroup.add(hdmiMesh);

    // Fan
    const fanGroup = new THREE.Group();
    fanGroup.position.set(-20, -1.8, -13);
    nvrGroup.add(fanGroup);
    stateRef.current.fanGroup = fanGroup;

    const fanShroudGeo = new THREE.BoxGeometry(4.2, 4.2, 2.0);
    const fanShroudMat = new THREE.MeshStandardMaterial({ color: '#090d13', roughness: 0.6 });
    const fanShroud = new THREE.Mesh(fanShroudGeo, fanShroudMat);
    fanGroup.add(fanShroud);

    const rotorGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 16);
    const rotor = new THREE.Mesh(rotorGeo, fanShroudMat);
    rotor.rotation.x = Math.PI / 2;
    fanGroup.add(rotor);
    stateRef.current.rotorMesh = rotor;

    // ==========================================
    // 7. ANIMATION LOOP
    // ==========================================
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;

      // Camera preset smooth damping
      if (s.isCamMoving && s.camera && s.controls) {
        s.camera.position.lerp(s.targetCameraPos, 0.08);
        s.controls.target.lerp(s.targetLookAt, 0.08);
        if (s.camera.position.distanceTo(s.targetCameraPos) < 0.2) {
          s.isCamMoving = false;
        }
      }

      // Exploded interpolation
      s.explodedProgress = THREE.MathUtils.damp(s.explodedProgress, s.targetExploded, 8, delta);

      if (s.topCoverMesh) {
        s.topCoverMesh.position.y = 2.8 + s.explodedProgress * 22;
      }
      if (s.hddGroup) {
        s.hddGroup.position.y = -1.2 + s.explodedProgress * 14;
        s.hddGroup.rotation.z = s.explodedProgress * 0.1;
      }
      if (s.motherboardGroup) {
        s.motherboardGroup.position.y = -1.8 + s.explodedProgress * 6;
      }
      if (s.fanGroup) {
        s.fanGroup.position.y = -1.8 + s.explodedProgress * 8;
      }
      if (s.rotorMesh) {
        s.rotorMesh.rotation.z += 0.08;
      }

      // Blink REC LED
      const time = clock.getElapsedTime();
      recMat.emissiveIntensity = Math.sin(time * 6) > 0 ? 3.0 : 0.2;

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
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[650px] bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9] rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP BAR: Perspective Presets */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono-tech text-xs font-bold text-slate-800">
            DIGITAL TWIN // NVR-8000POE
          </span>
        </div>

        {/* Camera Angles Presets */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
          {[
            { id: 'iso', label: 'ISOMETRIC' },
            { id: 'front', label: 'FRONT PANEL' },
            { id: 'rear', label: 'REAR I/O' },
            { id: 'internals', label: 'INTERNAL PCB' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setCameraPreset(p.id as any)}
              className={`px-3 py-1.5 text-xs font-mono-tech font-bold rounded-lg transition-all ${
                activePreset === p.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* FLOATING INTERACTIVE HOTSPOT PINS ON THE 3D MODEL */}
      <div className="absolute top-24 left-6 hidden sm:flex flex-col gap-2 z-10 pointer-events-auto">
        <button
          onClick={() => setCameraPreset('rear')}
          onMouseEnter={() => setHoveredHotspot('8x RJ45 PoE Ports (120W PSE)')}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-mono-tech font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-all text-left"
        >
          <Zap size={13} className="text-amber-500" />
          <span>8x PoE Matrix (120W)</span>
        </button>

        <button
          onClick={() => setCameraPreset('internals')}
          onMouseEnter={() => setHoveredHotspot('HiSilicon 4K Surveillance SoC')}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-mono-tech font-semibold text-slate-700 hover:text-cyan-600 hover:border-cyan-400 transition-all text-left"
        >
          <Cpu size={13} className="text-cyan-500" />
          <span>Quad-Core 4K SoC</span>
        </button>

        <button
          onClick={() => setCameraPreset('internals')}
          onMouseEnter={() => setHoveredHotspot('4TB AllFrame SATA 6G Hard Drive')}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-mono-tech font-semibold text-slate-700 hover:text-emerald-600 hover:border-emerald-400 transition-all text-left"
        >
          <HardDrive size={13} className="text-emerald-500" />
          <span>4TB Surveillance HDD</span>
        </button>

        <button
          onClick={() => setCameraPreset('rear')}
          onMouseEnter={() => setHoveredHotspot('HDMI 2.0 4K 60Hz Local Output')}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-mono-tech font-semibold text-slate-700 hover:text-purple-600 hover:border-purple-400 transition-all text-left"
        >
          <Video size={13} className="text-purple-500" />
          <span>HDMI 2.0 4K Output</span>
        </button>

        {hoveredHotspot && (
          <div className="bg-slate-900 text-cyan-300 text-[11px] font-mono-tech px-2.5 py-1 rounded-lg shadow-lg border border-slate-800 animate-in fade-in">
            {hoveredHotspot}
          </div>
        )}
      </div>

      {/* BOTTOM UNIFIED CONTROLS & ENTER LAB BUTTON */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-3 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xl z-10 w-[92%] max-w-xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold transition-all ${
            autoRotate ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {autoRotate ? <Pause size={13} /> : <Play size={13} />}
          <span>{autoRotate ? 'ROTATING' : 'ROTATE'}</span>
        </button>

        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono-tech font-bold transition-all ${
            isExploded ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers size={13} />
          <span>{isExploded ? 'ASSEMBLE' : 'EXPLODE CHASSIS'}</span>
        </button>

        <span className="text-slate-300 hidden sm:inline">|</span>

        {onEnterLab && (
          <button
            onClick={onEnterLab}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono-tech font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>FULL 3D LAB</span>
            <ArrowUpRight size={14} className="text-cyan-400" />
          </button>
        )}
      </div>
    </div>
  );
};
