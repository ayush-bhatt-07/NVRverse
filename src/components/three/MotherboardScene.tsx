import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  createPcbTraceTexture, 
  setupStudioEnvironment, 
  isSoftwareGl 
} from '../../utils/threeUtils';
import { MOTHERBOARD_CHIPS } from '../../data/hardwareData';
import { MotherboardChip } from '../../types';
import { 
  RotateCcw, 
  Compass, 
  ZoomIn, 
  Layers, 
  Cpu, 
  Maximize2, 
  Minimize2, 
  X, 
  AlertTriangle, 
  Share2, 
  Activity,
  Sliders
} from 'lucide-react';

export const MotherboardScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedChip, setSelectedChip] = useState<MotherboardChip | null>(null);
  const [hoveredChipName, setHoveredChipName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'problems' | 'bus'>('info');
  const [cameraMode, setCameraMode] = useState<'angled' | 'top' | 'closeup'>('angled');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    controls: null as OrbitControls | null,
    chipMeshes: [] as { chip: MotherboardChip; mesh: THREE.Mesh; outline: THREE.LineSegments }[],
    dataBusLines: [] as THREE.Line[],
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    targetCameraPos: new THREE.Vector3(0, 24, 20),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isTransitioningCamera: false,
    hoveredMesh: null as THREE.Mesh | null,
  });

  const focusChip = useCallback((chip: MotherboardChip) => {
    setSelectedChip(chip);
    setActiveTab('info');
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;

    const [bx, by, bz] = chip.boardPosition;
    s.targetLookAt.set(bx, by, bz);
    s.targetCameraPos.set(bx + 4, by + 8, bz + 9);
    s.isTransitioningCamera = true;
    setCameraMode('closeup');
  }, []);

  const setViewMode = useCallback((mode: 'angled' | 'top' | 'closeup') => {
    setCameraMode(mode);
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;

    if (mode === 'top') {
      s.targetLookAt.set(0, 0, 0);
      s.targetCameraPos.set(0, 32, 0.1); // top down
    } else if (mode === 'angled') {
      s.targetLookAt.set(0, 0, 0);
      s.targetCameraPos.set(0, 24, 20); // angled
    } else if (mode === 'closeup') {
      s.targetLookAt.set(0, 1.2, 0);
      s.targetCameraPos.set(4, 6, 8); // macro SoC view
    }
    s.isTransitioningCamera = true;
  }, []);

  const resetCamera = useCallback(() => {
    setSelectedChip(null);
    setViewMode('angled');
  }, [setViewMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    scene.fog = new THREE.FogExp2('#f8fafc', 0.006);
    stateRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 24, 20);
    stateRef.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    mount.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 60;
    controls.target.set(0, 0, 0);
    controls.addEventListener('start', () => {
      stateRef.current.isTransitioningCamera = false;
    });
    stateRef.current.controls = controls;

    // 5. Environment & Lights
    const cleanupEnv = setupStudioEnvironment(renderer, scene);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(20, 30, 20);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
    rimLight.position.set(-20, 20, -20);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#334155', 0.6);
    scene.add(hemiLight);

    // Grid Floor
    const grid = new THREE.GridHelper(80, 40, '#94a3b8', '#e2e8f0');
    grid.position.y = -0.05;
    scene.add(grid);

    // ==========================================
    // 6. DETAILED 3D MOTHERBOARD PCB MODEL
    // ==========================================
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);

    const pcbTex = createPcbTraceTexture(2048, 2048);

    // Main 4-Layer FR-4 Substrate (36cm x 28cm)
    const pcbGeo = new THREE.BoxGeometry(32, 0.4, 26);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: '#0e3d23',
      map: pcbTex,
      roughness: 0.35,
      metalness: 0.25,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = !isSoftwareGl;
    pcbGroup.add(pcbMesh);

    // Gold ground edge bezel
    const edgeGeo = new THREE.BoxGeometry(32.2, 0.2, 26.2);
    const edgeMat = new THREE.MeshStandardMaterial({ color: '#c5a059', metalness: 0.9, roughness: 0.2 });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.y = -0.15;
    pcbGroup.add(edgeMesh);

    // Surface Mount Decoupling SMD Capacitors (instanced around board)
    const smdCapGeo = new THREE.BoxGeometry(0.35, 0.2, 0.2);
    const smdCapMat = new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.4, metalness: 0.7 });
    for (let c = 0; c < 120; c++) {
      const cap = new THREE.Mesh(smdCapGeo, smdCapMat);
      cap.position.set(
        (Math.random() - 0.5) * 28,
        0.3,
        (Math.random() - 0.5) * 22
      );
      cap.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      pcbGroup.add(cap);
    }

    // Connectors along edges:
    // 1. RJ45 Ingestion Shield Block
    const rj45BlockGeo = new THREE.BoxGeometry(16, 3.2, 4);
    const rj45BlockMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 });
    const rj45Block = new THREE.Mesh(rj45BlockGeo, rj45BlockMat);
    rj45Block.position.set(-7, 1.8, -11);
    pcbGroup.add(rj45Block);

    // 2. SATA Header (Red 7-pin keyed connector)
    const sataConnGeo = new THREE.BoxGeometry(1.8, 1.2, 2.4);
    const sataConnMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });
    const sataConn = new THREE.Mesh(sataConnGeo, sataConnMat);
    sataConn.position.set(11, 0.8, 4);
    pcbGroup.add(sataConn);

    // 3. HDMI Header
    const hdmiConnGeo = new THREE.BoxGeometry(2.4, 1.2, 2.0);
    const hdmiConnMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.95, roughness: 0.2 });
    const hdmiConn = new THREE.Mesh(hdmiConnGeo, hdmiConnMat);
    hdmiConn.position.set(6, 0.8, -11.5);
    pcbGroup.add(hdmiConn);

    // ==========================================
    // 7. BUILD INTERACTIVE MOTHERBOARD CHIPS
    // ==========================================
    MOTHERBOARD_CHIPS.forEach(chip => {
      const [w, h, d] = chip.size;
      const [bx, by, bz] = chip.boardPosition;

      const chipGroup = new THREE.Group();
      chipGroup.position.set(bx, by, bz);
      pcbGroup.add(chipGroup);

      // Matte Black Epoxy Package
      const chipGeo = new THREE.BoxGeometry(w, h, d);
      const chipMat = new THREE.MeshStandardMaterial({
        color: chip.category === 'SoC' ? '#111827' : '#1e293b',
        roughness: 0.4,
        metalness: 0.3,
      });
      const chipMesh = new THREE.Mesh(chipGeo, chipMat);
      chipMesh.castShadow = !isSoftwareGl;
      chipMesh.receiveShadow = !isSoftwareGl;
      chipGroup.add(chipMesh);

      // Laser Silkscreen Marking on Top of Chip
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 256, 256);

      // White laser text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(chip.codeName.split(' ')[0], 20, 60);
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText(chip.category, 20, 100);
      ctx.fillText('NVR_SYS', 20, 130);

      // Pin 1 indicator dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(30, 220, 10, 0, Math.PI * 2);
      ctx.fill();

      const markTex = new THREE.CanvasTexture(canvas);
      markTex.colorSpace = THREE.SRGBColorSpace;

      const markGeo = new THREE.PlaneGeometry(w * 0.9, d * 0.9);
      const markMat = new THREE.MeshBasicMaterial({ map: markTex });
      const markMesh = new THREE.Mesh(markGeo, markMat);
      markMesh.rotation.x = -Math.PI / 2;
      markMesh.position.y = h / 2 + 0.01;
      chipGroup.add(markMesh);

      // If SoC, add realistic aluminum cooling heatsink fins on top
      if (chip.category === 'SoC') {
        const hsGeo = new THREE.BoxGeometry(w * 1.1, 1.2, d * 1.1);
        const hsMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.85 });
        const hs = new THREE.Mesh(hsGeo, hsMat);
        hs.position.y = h / 2 + 0.65;
        chipGroup.add(hs);

        // Fins
        for (let fi = -w * 0.45; fi <= w * 0.45; fi += 0.6) {
          const finGeo = new THREE.BoxGeometry(w * 1.1, 1.0, 0.16);
          const fin = new THREE.Mesh(finGeo, hsMat);
          fin.position.set(0, h / 2 + 1.6, fi);
          chipGroup.add(fin);
        }
      }

      // Selection Highlight Wireframe Box (hidden initially)
      const wireGeo = new THREE.BoxGeometry(w + 0.3, h + 0.3, d + 0.3);
      const wireMat = new THREE.LineBasicMaterial({ color: '#2563eb', linewidth: 2 });
      const edges = new THREE.EdgesGeometry(wireGeo);
      const outline = new THREE.LineSegments(edges, wireMat);
      outline.visible = false;
      chipGroup.add(outline);

      // Store in stateRef for Raycaster
      stateRef.current.chipMeshes.push({ chip, mesh: chipMesh, outline });
    });

    // ==========================================
    // 8. INTERACTIVE RAYCASTING
    // ==========================================
    const onPointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      stateRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
      const meshes = stateRef.current.chipMeshes.map(c => c.mesh);
      const intersects = stateRef.current.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const entry = stateRef.current.chipMeshes.find(c => c.mesh === hit || c.mesh === hit.parent);
        if (entry) {
          mount.style.cursor = 'pointer';
          setHoveredChipName(entry.chip.name);
          entry.outline.visible = true;
          return;
        }
      }
      mount.style.cursor = 'default';
      setHoveredChipName(null);
      stateRef.current.chipMeshes.forEach(c => {
        if (!selectedChip || selectedChip.id !== c.chip.id) {
          c.outline.visible = false;
        }
      });
    };

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      stateRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
      const meshes = stateRef.current.chipMeshes.map(c => c.mesh);
      const intersects = stateRef.current.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const entry = stateRef.current.chipMeshes.find(c => c.mesh === hit || c.mesh === hit.parent);
        if (entry) {
          focusChip(entry.chip);
        }
      }
    };

    mount.addEventListener('mousemove', onPointerMove);
    mount.addEventListener('click', onClick);

    // ==========================================
    // 9. ANIMATION LOOP
    // ==========================================
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = stateRef.current;

      if (s.isTransitioningCamera && s.camera && s.controls) {
        s.camera.position.lerp(s.targetCameraPos, 0.08);
        s.controls.target.lerp(s.targetLookAt, 0.08);
        if (s.camera.position.distanceTo(s.targetCameraPos) < 0.15) {
          s.isTransitioningCamera = false;
        }
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
      mount.removeEventListener('mousemove', onPointerMove);
      mount.removeEventListener('click', onClick);
      cleanupEnv();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [focusChip, selectedChip]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[640px] flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP STATUS BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="font-mono-tech text-[11px] font-bold tracking-wider text-slate-800">
              MOTHERBOARD // HIGH-DENSITY PCB INSPECTOR
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-mono-tech hidden sm:inline">
            4-LAYER FR4 • IMPEDANCE MATCHED BUS • HI3536 SOC
          </span>
          {hoveredChipName && (
            <span className="bg-cyan-50 text-cyan-700 text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded border border-cyan-200">
              TARGET: {hoveredChipName}
            </span>
          )}
        </div>

        {/* Camera Perspective Modes */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('angled')}
            className={`px-2.5 py-1 text-xs font-mono-tech font-semibold rounded transition-colors ${
              cameraMode === 'angled' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ISOMETRIC
          </button>
          <button
            onClick={() => setViewMode('top')}
            className={`px-2.5 py-1 text-xs font-mono-tech font-semibold rounded transition-colors ${
              cameraMode === 'top' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            TOP 2D
          </button>
          <button
            onClick={() => setViewMode('closeup')}
            className={`px-2.5 py-1 text-xs font-mono-tech font-semibold rounded transition-colors ${
              cameraMode === 'closeup' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            MACRO SOC
          </button>
          <button
            onClick={resetCamera}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* CHIP INSPECTOR SIDE DRAWER */}
      {selectedChip && (
        <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-xl border border-blue-200 shadow-2xl p-5 z-20 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono-tech uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {selectedChip.category} • {selectedChip.package}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedChip.name}</h3>
              <p className="text-xs text-slate-500 font-mono-tech mt-0.5">{selectedChip.codeName}</p>
            </div>
            <button
              onClick={() => setSelectedChip(null)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub-tabs: Specs vs Common Problems vs Interconnect Bus */}
          <div className="flex gap-1 mt-3 p-1 bg-slate-100 rounded-lg text-xs font-mono-tech">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-1 rounded font-semibold transition-colors ${
                activeTab === 'info' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SPECS & ROLE
            </button>
            <button
              onClick={() => setActiveTab('bus')}
              className={`flex-1 py-1 rounded font-semibold transition-colors ${
                activeTab === 'bus' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DATA BUS
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex-1 py-1 rounded font-semibold transition-colors ${
                activeTab === 'problems' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FAULTS
            </button>
          </div>

          <div className="mt-3 text-xs space-y-3">
            {activeTab === 'info' && (
              <>
                <p className="text-slate-600 leading-relaxed">{selectedChip.details}</p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Function:</span>
                    <span className="text-slate-800 font-medium text-right max-w-[200px]">{selectedChip.function}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Throughput:</span>
                    <span className="font-mono-tech font-bold text-blue-700">{selectedChip.dataThroughput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Temp:</span>
                    <span className="font-mono-tech font-semibold text-slate-800">{selectedChip.operatingTemp}</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'bus' && (
              <div className="space-y-2">
                <span className="font-semibold text-slate-700">Internal Interconnect Routing:</span>
                <p className="text-slate-600 font-mono-tech text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                  {selectedChip.busInterconnect}
                </p>
                <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 text-[11px] text-blue-900">
                  <strong>Trace Design:</strong> Length-matched microstrip differential pairs to prevent timing skew across high-speed bus lines.
                </div>
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="space-y-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle size={14} /> Known Hardware Failure Modes:
                </span>
                <ul className="space-y-1.5">
                  {selectedChip.commonProblems.map((p, idx) => (
                    <li key={idx} className="bg-amber-50 p-2 rounded text-slate-700 border border-amber-200/60 leading-snug">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM COMPONENT SELECTOR DOCK */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono-tech font-bold text-slate-500 uppercase tracking-wider">
            QUICK CHIP INSPECT
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">
            CLICK ANY COMPONENT TO FOCUS MICROSCOPE
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOTHERBOARD_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => focusChip(chip)}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold transition-all ${
                selectedChip?.id === chip.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-blue-300'
              }`}
            >
              {chip.name.split(' ')[0]} ({chip.category})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
