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
import { NVR_PORTS, NVR_COMPONENTS } from '../../data/hardwareData';
import { HardwarePort, HardwareComponent } from '../../types';
import { 
  RotateCcw, 
  Eye, 
  Layers, 
  Activity, 
  Thermometer, 
  Zap, 
  HardDrive, 
  Wifi, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  X,
  Play,
  Pause,
  Sliders
} from 'lucide-react';

interface NVRSceneProps {
  onSelectPort?: (port: HardwarePort | null) => void;
  onSelectComponent?: (comp: HardwareComponent | null) => void;
}

export type XRayLayer = 'physical' | 'network' | 'power' | 'storage' | 'thermal';

export const NVRScene: React.FC<NVRSceneProps> = ({ onSelectPort, onSelectComponent }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // UI state
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [xrayLayer, setXrayLayer] = useState<XRayLayer>('physical');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);
  const [selectedPort, setSelectedPort] = useState<HardwarePort | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<HardwareComponent | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Three.js mutable state in refs
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    controls: null as OrbitControls | null,
    explodedProgress: 0,
    targetExploded: 0,
    isXRay: false,
    xrayLayer: 'physical' as XRayLayer,
    autoRotate: false,
    topCoverMesh: null as THREE.Mesh | null,
    chassisBaseMesh: null as THREE.Mesh | null,
    hddGroup: null as THREE.Group | null,
    motherboardGroup: null as THREE.Group | null,
    fanGroup: null as THREE.Group | null,
    poeGroup: null as THREE.Group | null,
    portMeshes: [] as { id: string; mesh: THREE.Mesh; port: HardwarePort }[],
    dataPipes: [] as THREE.Mesh[],
    powerPipes: [] as THREE.Mesh[],
    storagePipe: null as THREE.Mesh | null,
    thermalMeshes: [] as THREE.Mesh[],
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    targetCameraPos: new THREE.Vector3(38, 28, 45),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isTransitioningCamera: false,
  });

  // Sync state refs
  useEffect(() => {
    stateRef.current.targetExploded = explodedAmount;
  }, [explodedAmount]);

  useEffect(() => {
    stateRef.current.isXRay = isXRay;
    stateRef.current.xrayLayer = xrayLayer;
    updateMaterials();
  }, [isXRay, xrayLayer]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    if (stateRef.current.controls) {
      stateRef.current.controls.autoRotate = autoRotate;
      stateRef.current.controls.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  const updateMaterials = () => {
    const s = stateRef.current;
    if (!s.topCoverMesh || !s.chassisBaseMesh) return;

    const coverMat = s.topCoverMesh.material as THREE.MeshStandardMaterial;
    const baseMat = s.chassisBaseMesh.material as THREE.MeshStandardMaterial;

    if (s.isXRay) {
      coverMat.transparent = true;
      coverMat.opacity = 0.15;
      coverMat.roughness = 0.1;
      coverMat.metalness = 0.1;
      coverMat.depthWrite = false;

      baseMat.transparent = true;
      baseMat.opacity = 0.35;
      baseMat.roughness = 0.2;
      baseMat.metalness = 0.2;
    } else {
      coverMat.transparent = false;
      coverMat.opacity = 1.0;
      coverMat.roughness = 0.45;
      coverMat.metalness = 0.7;
      coverMat.depthWrite = true;

      baseMat.transparent = false;
      baseMat.opacity = 1.0;
      baseMat.roughness = 0.5;
      baseMat.metalness = 0.65;
      baseMat.depthWrite = true;
    }

    // Toggle X-Ray layer conduits visibility
    s.dataPipes.forEach(p => {
      p.visible = s.isXRay && (s.xrayLayer === 'network' || s.xrayLayer === 'physical');
    });
    s.powerPipes.forEach(p => {
      p.visible = s.isXRay && (s.xrayLayer === 'power' || s.xrayLayer === 'physical');
    });
    if (s.storagePipe) {
      s.storagePipe.visible = s.isXRay && (s.xrayLayer === 'storage' || s.xrayLayer === 'physical');
    }
    s.thermalMeshes.forEach(m => {
      m.visible = s.isXRay && s.xrayLayer === 'thermal';
    });
  };

  const resetCamera = useCallback(() => {
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;
    s.targetCameraPos.set(38, 28, 45);
    s.targetLookAt.set(0, 0, 0);
    s.isTransitioningCamera = true;
    setSelectedPort(null);
    setSelectedComponent(null);
    if (onSelectPort) onSelectPort(null);
    if (onSelectComponent) onSelectComponent(null);
  }, [onSelectPort, onSelectComponent]);

  const focusPort = useCallback((port: HardwarePort) => {
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;
    setSelectedPort(port);
    if (onSelectPort) onSelectPort(port);

    const [px, py, pz] = port.coordinates3D;
    s.targetLookAt.set(px, py, pz);
    // Move camera to a close angled rear view of the port
    s.targetCameraPos.set(px + 6, py + 8, pz - 22);
    s.isTransitioningCamera = true;
  }, [onSelectPort]);

  const focusComponent = useCallback((comp: HardwareComponent) => {
    const s = stateRef.current;
    if (!s.camera || !s.controls) return;
    setSelectedComponent(comp);
    if (onSelectComponent) onSelectComponent(comp);

    if (comp.id === 'hdd-storage') {
      s.targetLookAt.set(12, 4, 2);
      s.targetCameraPos.set(22, 18, 14);
    } else if (comp.id === 'motherboard') {
      s.targetLookAt.set(-8, 2, 0);
      s.targetCameraPos.set(-8, 26, 8);
    } else if (comp.id === 'poe-subsystem') {
      s.targetLookAt.set(-16, 2, -18);
      s.targetCameraPos.set(-16, 16, -6);
    } else if (comp.id === 'cooling-fan') {
      s.targetLookAt.set(-20, 2, -18);
      s.targetCameraPos.set(-26, 14, -10);
    } else {
      s.targetLookAt.set(0, 0, 0);
      s.targetCameraPos.set(32, 22, 38);
    }
    s.isTransitioningCamera = true;
  }, [onSelectComponent]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Three.js Scene Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    scene.fog = new THREE.FogExp2('#f8fafc', 0.007);
    stateRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(38, 28, 45);
    stateRef.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
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

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow slightly below horizon
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);
    controls.addEventListener('start', () => {
      stateRef.current.isTransitioningCamera = false;
    });
    stateRef.current.controls = controls;

    // 5. Environment & Lights
    const cleanupEnv = setupStudioEnvironment(renderer, scene);

    // Warm Key Directional Light
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.2);
    keyLight.position.set(30, 45, 30);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 120;
    keyLight.shadow.camera.left = -30;
    keyLight.shadow.camera.right = 30;
    keyLight.shadow.camera.top = 30;
    keyLight.shadow.camera.bottom = -30;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Rim / Back Light
    const rimLight = new THREE.DirectionalLight('#b4c5ff', 1.4);
    rimLight.position.set(-35, 30, -35);
    scene.add(rimLight);

    // Subtle Cyan Fill light for tech speculars
    const fillLight = new THREE.DirectionalLight('#06b6d4', 0.8);
    fillLight.position.set(0, -20, 25);
    scene.add(fillLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight('#f1f5f9', '#334155', 0.6);
    scene.add(hemiLight);

    // 6. Ground Plane & Contact Shadow
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#f1f5f9',
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6.2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Subtle technical grid circle on the ground
    const gridHelper = new THREE.GridHelper(100, 50, '#94a3b8', '#e2e8f0');
    gridHelper.position.y = -6.18;
    scene.add(gridHelper);

    // Contact shadow plane directly beneath the NVR
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.2)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowGeo = new THREE.PlaneGeometry(54, 46);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -6.15;
    scene.add(contactShadow);

    // ==========================================
    // 7. BUILD PROCEDURAL 3D NVR HARDWARE MODEL
    // ==========================================
    const nvrGroup = new THREE.Group();
    scene.add(nvrGroup);

    // Textures
    const brushedMetalTex = createBrushedMetalTexture();
    const pcbTex = createPcbTraceTexture();
    const hddLabelTex = createHddLabelTexture();
    const frontPanelTex = createFrontPanelTexture();

    // --- A. Chassis Base Enclosure (SECC Cold-Rolled Steel) ---
    // Dimensions: Width 48, Height 8.5, Depth 36
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
    stateRef.current.chassisBaseMesh = chassisBase;

    // Rubber Feet (4 units)
    const footGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.6, 16);
    const footMat = new THREE.MeshStandardMaterial({ color: '#090d13', roughness: 0.9, metalness: 0.1 });
    const footOffsets = [
      [-21, -6.0, -15],
      [21, -6.0, -15],
      [-21, -6.0, 15],
      [21, -6.0, 15],
    ];
    footOffsets.forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      nvrGroup.add(foot);
    });

    // --- B. Top Cover Housing (Removable during Explode) ---
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

    // --- C. Front Bezel Faceplate ---
    const frontGeo = new THREE.PlaneGeometry(48, 8.4);
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontPanelTex,
      roughness: 0.25,
      metalness: 0.4,
    });
    const frontPanel = new THREE.Mesh(frontGeo, frontMat);
    frontPanel.position.set(0, -1.75, 18.06);
    nvrGroup.add(frontPanel);

    // Front Status LEDs (PWR, HDD, NET, REC)
    const ledGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    ledGeo.rotateX(Math.PI / 2);

    // PWR LED (Solid Blue)
    const pwrMat = new THREE.MeshStandardMaterial({ color: '#2563eb', emissive: '#2563eb', emissiveIntensity: 2.0 });
    const pwrLed = new THREE.Mesh(ledGeo, pwrMat);
    pwrLed.position.set(-1, -2.2, 18.15);
    nvrGroup.add(pwrLed);

    // HDD LED (Flashing Green)
    const hddMat = new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 2.2 });
    const hddLed = new THREE.Mesh(ledGeo, hddMat);
    hddLed.position.set(2, -2.2, 18.15);
    nvrGroup.add(hddLed);

    // NET LED (Cyan)
    const netMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#06b6d4', emissiveIntensity: 1.8 });
    const netLed = new THREE.Mesh(ledGeo, netMat);
    netLed.position.set(5, -2.2, 18.15);
    nvrGroup.add(netLed);

    // REC LED (Active Red)
    const recMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 2.5 });
    const recLed = new THREE.Mesh(ledGeo, recMat);
    recLed.position.set(8, -2.2, 18.15);
    nvrGroup.add(recLed);

    // Front USB Port cutout
    const frontUsbGeo = new THREE.BoxGeometry(2.6, 1.4, 0.8);
    const frontUsbMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9, roughness: 0.2 });
    const frontUsb = new THREE.Mesh(frontUsbGeo, frontUsbMat);
    frontUsb.position.set(16, -1.8, 18.1);
    nvrGroup.add(frontUsb);

    // --- D. Motherboard Group ---
    const mbGroup = new THREE.Group();
    mbGroup.position.set(-6, -1.8, 2);
    nvrGroup.add(mbGroup);
    stateRef.current.motherboardGroup = mbGroup;

    // Motherboard PCB
    const pcbGeo = new THREE.BoxGeometry(32, 0.4, 28);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: '#0e3d23',
      map: pcbTex,
      roughness: 0.4,
      metalness: 0.3,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = !isSoftwareGl;
    pcb.receiveShadow = !isSoftwareGl;
    mbGroup.add(pcb);

    // Main SoC Heatsink (Black extruded aluminum with cooling fins)
    const hsBaseGeo = new THREE.BoxGeometry(5.2, 0.5, 5.2);
    const hsMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.35, metalness: 0.85 });
    const hsBase = new THREE.Mesh(hsBaseGeo, hsMat);
    hsBase.position.set(0, 0.45, 0);
    mbGroup.add(hsBase);

    // Heatsink fins
    for (let f = -2.2; f <= 2.2; f += 0.55) {
      const finGeo = new THREE.BoxGeometry(5.2, 1.4, 0.18);
      const fin = new THREE.Mesh(finGeo, hsMat);
      fin.position.set(0, 1.2, f);
      mbGroup.add(fin);
    }

    // Dual DDR4 RAM chips
    const ramGeo = new THREE.BoxGeometry(2.2, 0.3, 3.2);
    const ramMat = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.5, metalness: 0.2 });
    const ram1 = new THREE.Mesh(ramGeo, ramMat);
    ram1.position.set(-4.5, 0.35, 0);
    const ram2 = new THREE.Mesh(ramGeo, ramMat);
    ram2.position.set(-4.5, 0.35, -4.5);
    mbGroup.add(ram1, ram2);

    // PoE Switch Controller IC & Inductors
    const poeIcGeo = new THREE.BoxGeometry(3.5, 0.4, 3.5);
    const poeIc = new THREE.Mesh(poeIcGeo, ramMat);
    poeIc.position.set(-10, 0.4, -6);
    mbGroup.add(poeIc);

    // High-current ferrite inductors (cubes)
    const indGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
    const indMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6, metalness: 0.4 });
    for (let i = 0; i < 4; i++) {
      const ind = new THREE.Mesh(indGeo, indMat);
      ind.position.set(-12 + i * 2.2, 0.8, -10.5);
      mbGroup.add(ind);
    }

    // --- E. 3.5" Surveillance Hard Drive Group ---
    const hddGroup = new THREE.Group();
    hddGroup.position.set(13, -1.2, 2);
    nvrGroup.add(hddGroup);
    stateRef.current.hddGroup = hddGroup;

    // HDD Cast Aluminum Body
    const hddBodyGeo = new THREE.BoxGeometry(14, 4.2, 20);
    const hddBodyMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.35,
      metalness: 0.8,
    });
    const hddBody = new THREE.Mesh(hddBodyGeo, hddBodyMat);
    hddBody.castShadow = !isSoftwareGl;
    hddGroup.add(hddBody);

    // HDD Top Cover with Label
    const hddLabelGeo = new THREE.PlaneGeometry(13.6, 19.6);
    const hddLabelMeshMat = new THREE.MeshStandardMaterial({
      map: hddLabelTex,
      roughness: 0.3,
      metalness: 0.2,
    });
    const hddLabel = new THREE.Mesh(hddLabelGeo, hddLabelMeshMat);
    hddLabel.rotation.x = -Math.PI / 2;
    hddLabel.position.y = 2.12;
    hddGroup.add(hddLabel);

    // SATA Data & Power Cables
    // SATA Red Data Ribbon Cable (curved spline)
    const sataCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(7, -1.8, 6),
      new THREE.Vector3(8.5, -0.5, 7.5),
      new THREE.Vector3(12.5, -1.5, 8.5),
    ]);
    const sataGeo = new THREE.TubeGeometry(sataCurve, 20, 0.3, 8, false);
    const sataMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4, metalness: 0.1 });
    const sataCable = new THREE.Mesh(sataGeo, sataMat);
    nvrGroup.add(sataCable);

    // SATA Power Cable (bundled rainbow lines)
    const pwrCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(7, -1.8, 9),
      new THREE.Vector3(9.5, -0.8, 10.5),
      new THREE.Vector3(12.5, -1.5, 10.5),
    ]);
    const pwrGeo = new THREE.TubeGeometry(pwrCurve, 20, 0.25, 8, false);
    const pwrCableMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });
    const pwrCable = new THREE.Mesh(pwrGeo, pwrCableMat);
    nvrGroup.add(pwrCable);

    // --- F. 40mm Cooling Exhaust Fan ---
    const fanGroup = new THREE.Group();
    fanGroup.position.set(-20, -1.8, -13);
    nvrGroup.add(fanGroup);
    stateRef.current.fanGroup = fanGroup;

    const fanShroudGeo = new THREE.BoxGeometry(4.2, 4.2, 2.0);
    const fanShroudMat = new THREE.MeshStandardMaterial({ color: '#090d13', roughness: 0.6 });
    const fanShroud = new THREE.Mesh(fanShroudGeo, fanShroudMat);
    fanGroup.add(fanShroud);

    // Rotating fan impeller
    const rotorGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 16);
    const rotor = new THREE.Mesh(rotorGeo, fanShroudMat);
    rotor.rotation.x = Math.PI / 2;
    fanGroup.add(rotor);

    // --- G. Rear I/O Ports with Clickable Raycast Colliders ---
    // 1. PoE 8-Port Matrix (2 rows of 4 RJ45 jacks)
    const rj45MetalMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 });
    const poePorts = NVR_PORTS.find(p => p.id === 'poe-ports')!;

    const poeGroup = new THREE.Group();
    poeGroup.position.set(-14, -1.8, -18.05);
    nvrGroup.add(poeGroup);
    stateRef.current.poeGroup = poeGroup;

    // 8 RJ45 ports layout
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const portBoxGeo = new THREE.BoxGeometry(2.4, 2.0, 3.2);
        const portBox = new THREE.Mesh(portBoxGeo, rj45MetalMat);
        portBox.position.set(-4.5 + col * 3.0, 1.2 - row * 2.4, 0);
        poeGroup.add(portBox);

        // RJ45 Cavity
        const cavGeo = new THREE.BoxGeometry(1.6, 1.2, 0.6);
        const cavMat = new THREE.MeshBasicMaterial({ color: '#020617' });
        const cav = new THREE.Mesh(cavGeo, cavMat);
        cav.position.set(-4.5 + col * 3.0, 1.2 - row * 2.4, -1.5);
        poeGroup.add(cav);

        // Status LED on each RJ45 jack
        const pLedGeo = new THREE.BoxGeometry(0.3, 0.3, 0.2);
        const pLedMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
        const pLed = new THREE.Mesh(pLedGeo, pLedMat);
        pLed.position.set(-5.2 + col * 3.0, 2.0 - row * 2.4, -1.6);
        poeGroup.add(pLed);
      }
    }

    // Interactive collider for PoE Ports
    const poeColliderGeo = new THREE.BoxGeometry(13.5, 5.8, 3.5);
    const poeColliderMat = new THREE.MeshBasicMaterial({ visible: false });
    const poeCollider = new THREE.Mesh(poeColliderGeo, poeColliderMat);
    poeCollider.position.set(0, 0, 0);
    poeGroup.add(poeCollider);
    stateRef.current.portMeshes.push({ id: 'poe-ports', mesh: poeCollider, port: poePorts });

    // 2. LAN Gigabit Port
    const lanPort = NVR_PORTS.find(p => p.id === 'lan-port')!;
    const lanGeo = new THREE.BoxGeometry(2.6, 2.4, 3.2);
    const lanMesh = new THREE.Mesh(lanGeo, rj45MetalMat);
    lanMesh.position.set(-2, -1.8, -18.05);
    nvrGroup.add(lanMesh);
    stateRef.current.portMeshes.push({ id: 'lan-port', mesh: lanMesh, port: lanPort });

    // 3. VGA Port (Blue D-Sub 15)
    const vgaPort = NVR_PORTS.find(p => p.id === 'vga-out')!;
    const vgaGeo = new THREE.BoxGeometry(3.6, 2.0, 2.2);
    const vgaMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.6, roughness: 0.3 });
    const vgaMesh = new THREE.Mesh(vgaGeo, vgaMat);
    vgaMesh.position.set(5, -1.8, -18.05);
    nvrGroup.add(vgaMesh);
    stateRef.current.portMeshes.push({ id: 'vga-out', mesh: vgaMesh, port: vgaPort });

    // 4. HDMI Port (Gold-plated)
    const hdmiPort = NVR_PORTS.find(p => p.id === 'hdmi-out')!;
    const hdmiGeo = new THREE.BoxGeometry(3.2, 1.6, 2.4);
    const hdmiMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.95, roughness: 0.15 });
    const hdmiMesh = new THREE.Mesh(hdmiGeo, hdmiMat);
    hdmiMesh.position.set(11, -1.8, -18.05);
    nvrGroup.add(hdmiMesh);
    stateRef.current.portMeshes.push({ id: 'hdmi-out', mesh: hdmiMesh, port: hdmiPort });

    // 5. Rear USB Ports
    const usbPort = NVR_PORTS.find(p => p.id === 'usb-ports')!;
    const usbGeo = new THREE.BoxGeometry(2.8, 3.2, 2.2);
    const usbMesh = new THREE.Mesh(usbGeo, rj45MetalMat);
    usbMesh.position.set(17, -1.8, -18.05);
    nvrGroup.add(usbMesh);
    stateRef.current.portMeshes.push({ id: 'usb-ports', mesh: usbMesh, port: usbPort });

    // 6. 12V DC Power Jack & Rocker Switch
    const pwrPort = NVR_PORTS.find(p => p.id === 'power-in')!;
    const dcGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 16);
    dcGeo.rotateX(Math.PI / 2);
    const dcMat = new THREE.MeshStandardMaterial({ color: '#090d13', metalness: 0.7, roughness: 0.3 });
    const dcMesh = new THREE.Mesh(dcGeo, dcMat);
    dcMesh.position.set(22, -1.8, -18.05);
    nvrGroup.add(dcMesh);
    stateRef.current.portMeshes.push({ id: 'power-in', mesh: dcMesh, port: pwrPort });

    // --- H. X-RAY MODE VISUALIZATION CONDUITS ---
    // 1. Network Data Path (Glowing Cyan Conduit: PoE Ports -> Switch -> SoC)
    const netPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, -1.5, -17.5),
      new THREE.Vector3(-14, 0.5, -10),
      new THREE.Vector3(-6, 0.5, -4),
      new THREE.Vector3(-6, 0.5, 2),
    ]);
    const netPathGeo = new THREE.TubeGeometry(netPathCurve, 30, 0.45, 8, false);
    const netPathMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', wireframe: true });
    const netPipe = new THREE.Mesh(netPathGeo, netPathMat);
    netPipe.visible = false;
    nvrGroup.add(netPipe);
    stateRef.current.dataPipes.push(netPipe);

    // 2. Power Distribution Path (Glowing Amber Conduit: DC12V -> Regulators -> PoE PSE 48V)
    const pwrPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(22, -1.5, -17.5),
      new THREE.Vector3(14, 0.5, -8),
      new THREE.Vector3(5, 0.5, -6),
      new THREE.Vector3(-10, 0.5, -6),
    ]);
    const pwrPathGeo = new THREE.TubeGeometry(pwrPathCurve, 30, 0.45, 8, false);
    const pwrPathMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', wireframe: true });
    const pwrPipe = new THREE.Mesh(pwrPathGeo, pwrPathMat);
    pwrPipe.visible = false;
    nvrGroup.add(pwrPipe);
    stateRef.current.powerPipes.push(pwrPipe);

    // 3. Storage Data Bus (Glowing Blue Conduit: SoC -> SATA -> HDD)
    const storPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0.5, 2),
      new THREE.Vector3(2, 0.5, 4),
      new THREE.Vector3(13, 0.5, 2),
    ]);
    const storPathGeo = new THREE.TubeGeometry(storPathCurve, 20, 0.45, 8, false);
    const storPathMat = new THREE.MeshBasicMaterial({ color: '#2563eb', wireframe: true });
    const storPipe = new THREE.Mesh(storPathGeo, storPathMat);
    storPipe.visible = false;
    nvrGroup.add(storPipe);
    stateRef.current.storagePipe = storPipe;

    // 4. Thermal Visualization Meshes (Heat dome spheres over SoC and PoE transformers)
    const heatSocGeo = new THREE.SphereGeometry(6.5, 16, 16);
    const heatSocMat = new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.35, wireframe: true });
    const heatSoc = new THREE.Mesh(heatSocGeo, heatSocMat);
    heatSoc.position.set(-6, 1.5, 2);
    heatSoc.visible = false;
    nvrGroup.add(heatSoc);
    stateRef.current.thermalMeshes.push(heatSoc);

    const heatPoeGeo = new THREE.SphereGeometry(5.0, 16, 16);
    const heatPoeMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.35, wireframe: true });
    const heatPoe = new THREE.Mesh(heatPoeGeo, heatPoeMat);
    heatPoe.position.set(-14, 1.5, -8);
    heatPoe.visible = false;
    nvrGroup.add(heatPoe);
    stateRef.current.thermalMeshes.push(heatPoe);

    // ==========================================
    // 8. INTERACTIVE POINTER / RAYCASTING HANDLERS
    // ==========================================
    const onPointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      stateRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
      const interactiveMeshes = stateRef.current.portMeshes.map(pm => pm.mesh);
      const intersects = stateRef.current.raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const found = stateRef.current.portMeshes.find(pm => pm.mesh === intersects[0].object);
        if (found) {
          mount.style.cursor = 'pointer';
          setHoveredObject(found.port.name);
          return;
        }
      }
      mount.style.cursor = 'default';
      setHoveredObject(null);
    };

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      stateRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
      const interactiveMeshes = stateRef.current.portMeshes.map(pm => pm.mesh);
      const intersects = stateRef.current.raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const found = stateRef.current.portMeshes.find(pm => pm.mesh === intersects[0].object);
        if (found) {
          focusPort(found.port);
        }
      }
    };

    mount.addEventListener('mousemove', onPointerMove);
    mount.addEventListener('click', onClick);

    // ==========================================
    // 9. ANIMATION LOOP WITH KINEMATICS DAMPING
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;

      // 1. Exploded view spring interpolation
      s.explodedProgress = THREE.MathUtils.damp(s.explodedProgress, s.targetExploded, 8, delta);

      if (s.topCoverMesh) {
        s.topCoverMesh.position.y = 2.8 + s.explodedProgress * 24;
      }
      if (s.hddGroup) {
        s.hddGroup.position.y = -1.2 + s.explodedProgress * 15;
        s.hddGroup.rotation.z = s.explodedProgress * 0.12;
      }
      if (s.motherboardGroup) {
        s.motherboardGroup.position.y = -1.8 + s.explodedProgress * 7;
      }
      if (s.fanGroup) {
        s.fanGroup.position.y = -1.8 + s.explodedProgress * 10;
        rotor.rotation.z += 0.08; // Fan spins
      }
      if (s.poeGroup) {
        s.poeGroup.position.z = -18.05 - s.explodedProgress * 8;
      }

      // 2. Camera smooth transition
      if (s.isTransitioningCamera && s.camera && s.controls) {
        s.camera.position.lerp(s.targetCameraPos, 0.06);
        s.controls.target.lerp(s.targetLookAt, 0.06);
        if (s.camera.position.distanceTo(s.targetCameraPos) < 0.2) {
          s.isTransitioningCamera = false;
        }
      }

      // 3. Status LED blinking
      const time = clock.getElapsedTime();
      if (recMat) {
        recMat.emissiveIntensity = Math.sin(time * 6) > 0 ? 3.0 : 0.2;
      }
      if (hddMat) {
        hddMat.emissiveIntensity = Math.sin(time * 12 + Math.cos(time * 4)) > 0 ? 2.5 : 0.3;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousemove', onPointerMove);
      mount.removeEventListener('click', onClick);
      cleanupEnv();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [focusPort]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[640px] flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HUD BAR: Minimal Technical Specs & Calibration Bead */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono-tech text-[11px] font-bold tracking-wider text-slate-800">
              NVR-8000POE // DIGITAL TWIN
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            8-CH 4K POE • 120W PSE • 4TB ALLFRAME HDD
          </span>
          {hoveredObject && (
            <span className="bg-blue-50 text-blue-700 text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded border border-blue-200">
              HOVER: {hoveredObject}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-sm ${
              autoRotate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 backdrop-blur-md text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Auto Rotation"
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{autoRotate ? 'ROTATING' : 'AUTO-ROTATE'}</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
            title="Reset Camera Angle"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* PORT INSPECTOR MODAL / INFORMATION CARD */}
      {selectedPort && (
        <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-lg rounded-xl border border-blue-200 shadow-2xl p-5 z-20 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono-tech uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {selectedPort.category} • {selectedPort.direction}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedPort.name}</h3>
              <p className="text-xs text-slate-500 font-mono-tech mt-0.5">{selectedPort.connector}</p>
            </div>
            <button
              onClick={() => setSelectedPort(null)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Physical Signal / Protocol:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedPort.visualSignal}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Max Bandwidth / Power:</span>
              <p className="text-blue-700 font-mono-tech font-bold mt-0.5">{selectedPort.maxBandwidthOrPower}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Pinout Architecture:</span>
              <p className="text-slate-600 font-mono-tech text-[11px] bg-slate-50 p-2 rounded border border-slate-200 mt-0.5">
                {selectedPort.pinoutSummary}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Common Diagnostics:</span>
              <ul className="mt-1 space-y-1 list-disc list-inside text-slate-600">
                {selectedPort.commonIssues.map((issue, idx) => (
                  <li key={idx} className="leading-snug">{issue}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono-tech">HARDWARE LINKED</span>
              <div className="flex gap-1.5 flex-wrap">
                {selectedPort.relatedComponents.map((c, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono-tech">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT INSPECTOR CARD */}
      {selectedComponent && !selectedPort && (
        <div className="absolute top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-lg rounded-xl border border-slate-300 shadow-2xl p-5 z-20">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono-tech uppercase font-bold text-slate-600 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                {selectedComponent.label}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedComponent.name}</h3>
              <p className="text-xs text-slate-500 font-mono-tech mt-0.5">{selectedComponent.spec}</p>
            </div>
            <button
              onClick={() => setSelectedComponent(null)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">{selectedComponent.description}</p>
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800">Operational Role:</span>
              <p className="text-slate-600 mt-0.5">{selectedComponent.keyRole}</p>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500">Normal Operating Thermal:</span>
              <span className="font-mono-tech font-bold text-slate-800">{selectedComponent.thermalNormal}°C (Max: {selectedComponent.thermalMax}°C)</span>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Maintenance:</strong> {selectedComponent.maintenanceNote}
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM UNIFIED CONTROL DOCK (Collapsible & Unobtrusive) */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl transition-all duration-300 z-10 ${
        isHudCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}>
        {/* Collapse / Expand Tab Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 rounded-t-lg shadow-sm text-[11px] font-mono-tech font-semibold hover:bg-slate-50 transition-colors"
          >
            {isHudCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isHudCollapsed ? 'EXPAND LAB CONTROLS' : 'COLLAPSE HUD (ZEN MODE)'}
          </button>
        </div>

        {/* Floating Glass Deck */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-4 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* 1. Exploded View Slider */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sliders size={14} className="text-blue-600" />
                  <span>EXPLODED VIEW</span>
                </div>
                <span className="font-mono-tech text-[11px] font-semibold text-blue-600">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedAmount}
                onChange={e => setExplodedAmount(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono-tech">
                <button 
                  onClick={() => setExplodedAmount(0)}
                  className="hover:text-blue-600 font-semibold"
                >
                  ASSEMBLE
                </button>
                <button 
                  onClick={() => setExplodedAmount(1)}
                  className="hover:text-blue-600 font-semibold"
                >
                  FULL DISASSEMBLY
                </button>
              </div>
            </div>

            {/* 2. X-Ray & Transparency Layer Switcher */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Layers size={14} className="text-cyan-600" />
                  <span>X-RAY INSPECTION</span>
                </div>
                <button
                  onClick={() => setIsXRay(!isXRay)}
                  className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded transition-colors ${
                    isXRay ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isXRay ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1 pt-1">
                {(
                  [
                    { id: 'physical', label: 'ALL', icon: Eye },
                    { id: 'network', label: 'NET', icon: Wifi },
                    { id: 'power', label: 'PWR', icon: Zap },
                    { id: 'storage', label: 'SATA', icon: HardDrive },
                    { id: 'thermal', label: 'HEAT', icon: Thermometer },
                  ] as const
                ).map(layer => {
                  const Icon = layer.icon;
                  const isActive = isXRay && xrayLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      disabled={!isXRay}
                      onClick={() => setXrayLayer(layer.id)}
                      className={`flex flex-col items-center justify-center p-1 rounded text-[10px] font-mono-tech font-bold transition-all ${
                        !isXRay
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon size={12} />
                      <span className="mt-0.5">{layer.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Quick Component Focus Chips */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono-tech font-bold text-slate-500 uppercase tracking-wider block">
                INSPECT SUBSYSTEM
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NVR_COMPONENTS.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => focusComponent(comp)}
                    className="text-[11px] font-mono-tech px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-md text-slate-700 transition-colors shadow-2xs"
                  >
                    {comp.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
