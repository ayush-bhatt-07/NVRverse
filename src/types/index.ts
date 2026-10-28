export type LabRoute = 
  | '/'
  | '/lab'
  | '/lab/motherboard'
  | '/lab/packet-flow'
  | '/lab/installation'
  | '/lab/configuration'
  | '/network-builder'
  | '/troubleshooting'
  | '/learn';

export interface HardwarePort {
  id: string;
  name: string;
  type: 'poe' | 'lan' | 'hdmi' | 'vga' | 'usb' | 'power' | 'audio';
  category: 'Video' | 'Network' | 'Peripheral' | 'Power';
  direction: 'NVR → Monitor' | 'Camera → NVR (PoE)' | 'Network ↔ NVR' | 'Peripheral → NVR' | 'Mains → NVR';
  connector: string;
  maxBandwidthOrPower: string;
  description: string;
  visualSignal: string;
  pinoutSummary: string;
  commonIssues: string[];
  relatedComponents: string[];
  coordinates3D: [number, number, number];
}

export interface HardwareComponent {
  id: string;
  name: string;
  label: string;
  category: 'chassis' | 'storage' | 'processing' | 'power' | 'cooling' | 'io';
  spec: string;
  description: string;
  keyRole: string;
  maintenanceNote: string;
  explosionOffset: [number, number, number];
  thermalNormal: number; // in Celsius
  thermalMax: number;
}

export interface MotherboardChip {
  id: string;
  name: string;
  codeName: string;
  category: 'SoC' | 'RAM' | 'PHY' | 'PoE' | 'Storage' | 'Power' | 'Flash' | 'Clock';
  package: string;
  function: string;
  dataThroughput: string;
  operatingTemp: string;
  details: string;
  busInterconnect: string;
  commonProblems: string[];
  boardPosition: [number, number, number];
  size: [number, number, number];
}

export type ProtocolType = 'RTP' | 'RTSP' | 'ONVIF' | 'DHCP' | 'ARP' | 'TCP' | 'UDP';

export interface PacketStage {
  step: number;
  id: string;
  title: string;
  protocol: ProtocolType;
  subType: string;
  source: string;
  destination: string;
  layer: 'L2 Data Link' | 'L3 Network' | 'L4 Transport' | 'L7 Application' | 'Internal Bus';
  color: string;
  description: string;
  technicalDetails: string;
  hardwareInvolved: string[];
  packetPayloadPreview: string;
  internalPath: 'external' | 'phy' | 'soc' | 'ram' | 'sata' | 'hdd' | 'display';
}

export interface InstallationStep {
  id: number;
  title: string;
  category: 'Chassis' | 'Storage' | 'Cabling' | 'Peripherals' | 'Boot & Config';
  actionPrompt: string;
  instructions: string;
  requiredTool: string;
  safetyWarning?: string;
  componentTarget: string;
  completed: boolean;
  visualState: string;
}

export interface TopologyDevice {
  id: string;
  name: string;
  type: 'camera' | 'nvr' | 'switch' | 'router' | 'monitor' | 'laptop';
  ip: string;
  subnet: string;
  gateway: string;
  mac: string;
  poePowerWatts: number;
  poeRequired: boolean;
  x: number;
  y: number;
  ports: { id: string; name: string; type: 'rj45' | 'hdmi' | 'power' }[];
  status: 'online' | 'conflict' | 'offline' | 'error';
}

export interface TopologyCable {
  id: string;
  fromDeviceId: string;
  fromPortId: string;
  toDeviceId: string;
  toPortId: string;
  cableType: 'cat6' | 'hdmi' | 'dc12v';
  status: 'active' | 'fault' | 'no-power';
}

export interface TroubleshootingScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Network' | 'PoE' | 'Storage' | 'Authentication' | 'Video Stream';
  symptom: string;
  initialState: {
    affectedPort?: string;
    affectedDevice?: string;
    errorLog: string;
    ipSetting?: string;
  };
  diagnosticTests: {
    name: string;
    tool: 'ping' | 'poe_meter' | 'cable_tester' | 'log_viewer' | 'smart_inspect';
    resultOutput: string;
  }[];
  fixOptions: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface LearningLesson {
  id: string;
  title: string;
  subtitle: string;
  category: 'Architecture' | 'Protocols' | 'Storage' | 'Networking' | 'Operations';
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  deepDive: string;
  calculatorType?: 'storage' | 'poe' | 'bandwidth';
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
