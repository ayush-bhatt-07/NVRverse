import { TroubleshootingScenario } from '../types';

export const TROUBLESHOOTING_SCENARIOS: TroubleshootingScenario[] = [
  {
    id: 'cam-offline-poe',
    title: 'Camera 04 Offline — PoE Power Negotiation Failure',
    difficulty: 'Beginner',
    category: 'PoE',
    symptom: 'Channel 4 live view shows a black screen with "No Link / IPC Disconnected". Rear RJ45 port LED is completely unlit.',
    initialState: {
      affectedPort: 'PoE Port 4',
      affectedDevice: 'Dome IP Camera Ch4',
      errorLog: 'ERR_POE_FAULT: Port 4 detection resistance out of range (infinite ohms). PSE status: OFF.',
    },
    diagnosticTests: [
      {
        name: 'PoE Port Wattmeter Diagnostic',
        tool: 'poe_meter',
        resultOutput: 'PORT 4: Voltage=0.0V | Current=0mA | Sensed Resistance=∞ Ω (OPEN CIRCUIT) | PSE Status=STANDBY',
      },
      {
        name: 'Ethernet Cable Continuity & Pinout Test',
        tool: 'cable_tester',
        resultOutput: 'PAIR 1/2: PASS | PAIR 3/6: OPEN (Broken Pin 3 wire at 18.4 meters) | PAIR 4/5: PASS | PAIR 7/8: PASS',
      },
      {
        name: 'NVR Diagnostic System Log',
        tool: 'log_viewer',
        resultOutput: '[10:14:02] Link down detected on physical switch port eth4. Power classification handshake aborted.',
      },
    ],
    fixOptions: [
      {
        id: 'replace-cable',
        label: 'Recrimp RJ45 connector or replace damaged CAT6 patch cable',
        isCorrect: true,
        explanation: 'Pin 3 carries the negative DC phantom power return on 802.3af Alternative A. Repairing the open wire restores the 25kΩ detection signature and powers on the camera.',
      },
      {
        id: 'reboot-nvr',
        label: 'Power cycle the entire NVR unit',
        isCorrect: false,
        explanation: 'Power cycling the NVR will not repair a physical severed copper conductor inside the Ethernet patch cable.',
      },
      {
        id: 'factory-reset-cam',
        label: 'Perform factory reset on Camera 4 hardware button',
        isCorrect: false,
        explanation: 'The camera has zero electrical power; pressing buttons without electricity has zero effect.',
      },
    ],
  },
  {
    id: 'auth-error',
    title: 'Camera 02 Authentication Failure (ONVIF 401)',
    difficulty: 'Beginner',
    category: 'Authentication',
    symptom: 'Channel 2 discovers the IP camera and shows an active link, but video displays "Account Locked / Password Error".',
    initialState: {
      affectedPort: 'PoE Port 2',
      affectedDevice: 'Bullet IP Camera Ch2 (10.151.108.14)',
      errorLog: 'ONVIF_AUTH_FAIL: HTTP/1.1 401 Unauthorized on http://10.151.108.14/onvif/device_service (Bad Digest Auth).',
    },
    diagnosticTests: [
      {
        name: 'ONVIF Probe & Device Handshake Query',
        tool: 'log_viewer',
        resultOutput: 'WS-Discovery: IPC-Bullet-4K FOUND. Supported: ONVIF Profile S. Auth Method: WS-Security UsernameToken (Failed credentials).',
      },
      {
        name: 'Camera Ping Latency Test',
        tool: 'ping',
        resultOutput: 'PING 10.151.108.14: 64 bytes from 10.151.108.14: icmp_seq=1 ttl=64 time=0.82ms. 0% packet loss.',
      },
    ],
    fixOptions: [
      {
        id: 'update-nvr-cam-pass',
        label: 'Update Camera 2 password in NVR Camera Management to match camera admin secret',
        isCorrect: true,
        explanation: 'When camera passwords are changed via web browser or factory preset, the NVR channel profile credentials must be synced to satisfy WS-Security Digest Authentication.',
      },
      {
        id: 'change-subnet',
        label: 'Change the NVR LAN subnet from 192.168.1.0/24 to 10.0.0.0/8',
        isCorrect: false,
        explanation: 'Subnet changes will not resolve an application-layer 401 Unauthorized authentication mismatch.',
      },
    ],
  },
  {
    id: 'ip-conflict',
    title: 'Severe IP Address Conflict on Channel 3',
    difficulty: 'Intermediate',
    category: 'Network',
    symptom: 'Channel 3 video stream flashes intermittently every 5 seconds. Frame drops and "Duplicate IP detected" notifications appear in NVR OS.',
    initialState: {
      affectedPort: 'PoE Port 3',
      affectedDevice: 'Turret IP Camera Ch3 (192.168.1.120)',
      errorLog: 'NET_ALERT: Gratuitous ARP received for 192.168.1.120 claiming MAC 44:A8:42:19:B2:FF while registered MAC is 00:1A:3F:82:11:04.',
    },
    diagnosticTests: [
      {
        name: 'ARP Table & MAC Resolution Inspection',
        tool: 'log_viewer',
        resultOutput: 'ARP TABLE:\n192.168.1.120 -> 00:1A:3F:82:11:04 (IP Camera)\n192.168.1.120 -> 44:A8:42:19:B2:FF (Technician Laptop - Ethernet)',
      },
      {
        name: 'Continuous ICMP Ping Echo Test',
        tool: 'ping',
        resultOutput: 'Reply from 192.168.1.120: bytes=32 time=1ms (MAC 00:1A)\nReply from 192.168.1.120: bytes=32 time=2ms (MAC 44:A8)\nPACKET INTERFERENCE DETECTED.',
      },
    ],
    fixOptions: [
      {
        id: 'reassign-ip',
        label: 'Reassign Camera 3 to an unused static IP (192.168.1.145) outside the technician DHCP pool',
        isCorrect: true,
        explanation: 'Eliminating the duplicate IP address prevents ARP cache thrashing in the NVR switch table, allowing uninterrupted RTP video streaming.',
      },
      {
        id: 'increase-poe',
        label: 'Increase PoE wattage on Port 3 to 30W',
        isCorrect: false,
        explanation: 'This is an IP network conflict, not an electrical power shortage.',
      },
    ],
  },
  {
    id: 'poe-budget-exceeded',
    title: 'PoE Power Budget Overdraw (Total > 120W)',
    difficulty: 'Intermediate',
    category: 'PoE',
    symptom: 'Connecting an 8th high-power PTZ camera causes Port 7 and Port 8 to repeatedly power off and restart in a loop.',
    initialState: {
      affectedPort: 'PoE Ports 7 & 8',
      affectedDevice: 'High-Speed PTZ Dome with IR Illumination',
      errorLog: 'ERR_PSE_OVERLOAD: Cumulative PoE power demand 128.5W exceeds rated hardware limit (120.0W). Priority shed activated.',
    },
    diagnosticTests: [
      {
        name: 'Aggregate PoE Power Budget Telemetry',
        tool: 'poe_meter',
        resultOutput: 'TOTAL POWER CAPACITY: 120W\nPORTS 1-6 TOTAL: 94.2W\nPORT 7 (PTZ IR): 28.4W\nPORT 8 REQUEST: 26.0W\nCURRENT SUM: 148.6W (EXCEEDS 120W BY +28.6W)',
      },
    ],
    fixOptions: [
      {
        id: 'external-poe-injector',
        label: 'Install a dedicated 60W IEEE 802.3bt external PoE++ injector for the motorized PTZ camera',
        isCorrect: true,
        explanation: 'Offloading high-draw PTZ heaters and motorized pan/tilt motors to an external injector keeps the NVR internal power budget well within its safe 120W maximum.',
      },
      {
        id: 'ignore-warning',
        label: 'Disable PSE overcurrent safety shutdown in the firmware',
        isCorrect: false,
        explanation: 'Bypassing current protection will destroy the internal DC-DC converter MOSFETs or cause a fire hazard.',
      },
    ],
  },
  {
    id: 'hdd-unformatted',
    title: 'Storage Not Initialized — Video Recording Halted',
    difficulty: 'Beginner',
    category: 'Storage',
    symptom: 'System beeps every 30 seconds with an audible buzzer alert. Front panel HDD status LED is flashing Yellow/Red.',
    initialState: {
      affectedDevice: 'Storage Disk 1 (4TB)',
      errorLog: 'ERR_STORAGE_NO_FS: Disk 1 partition table missing or unrecognized raw filesystem. Recording engine cannot allocate blocks.',
    },
    diagnosticTests: [
      {
        name: 'S.M.A.R.T. Hard Disk Health Diagnostic',
        tool: 'smart_inspect',
        resultOutput: 'DEVICE: WDC WD40PURZ-85TTDY0 | CAPACITY: 4000.7 GB | S.M.A.R.T. STATUS: HEALTHY (0 Reallocated Sectors) | FS_STATE: RAW_UNFORMATTED',
      },
    ],
    fixOptions: [
      {
        id: 'format-hdd',
        label: 'Open NVR Storage Management and click "Format / Initialize Disk" to create ext4 surveillance partition',
        isCorrect: true,
        explanation: 'New surveillance hard drives arrive with unpartitioned raw blocks. Initializing the disk creates the optimized surveillance filesystem and database indexes required for 24/7 video.',
      },
      {
        id: 'replace-hdd',
        label: 'Replace the hard drive immediately thinking it is mechanically defective',
        isCorrect: false,
        explanation: 'The drive S.M.A.R.T. health is 100% nominal; brand new hard disks simply require software formatting prior to first use.',
      },
    ],
  },
  {
    id: 'gateway-mismatch',
    title: 'Remote Access Failure — Incorrect Default Gateway',
    difficulty: 'Intermediate',
    category: 'Network',
    symptom: 'NVR operates normally on local HDMI monitor, but the mobile app and cloud P2P service report "NVR Offline / Cannot Reach Cloud".',
    initialState: {
      affectedDevice: 'NVR Gigabit Uplink NIC',
      ipSetting: 'IP: 192.168.1.100 | Subnet: 255.255.255.0 | Gateway: 192.168.0.1 (Router is actually 192.168.1.1)',
      errorLog: 'ERR_NET_UNREACHABLE: No route to host 8.8.8.8. Gateway 192.168.0.1 not on local broadcast domain.',
    },
    diagnosticTests: [
      {
        name: 'Network Route & Gateway Ping Test',
        tool: 'ping',
        resultOutput: 'PING 192.168.0.1: Destination Host Unreachable. Local IP 192.168.1.100/24 cannot ARP for a gateway on a differing /24 subnet.',
      },
    ],
    fixOptions: [
      {
        id: 'fix-gateway',
        label: 'Correct Default Gateway to 192.168.1.1 and Primary DNS to 1.1.1.1 in Network Settings',
        isCorrect: true,
        explanation: 'For an IP device to communicate outside its local subnet (to cloud P2P servers), its Default Gateway must reside inside its own subnet (192.168.1.1).',
      },
      {
        id: 'turn-off-dhcp',
        label: 'Disable network encryption protocols',
        isCorrect: false,
        explanation: 'Encryption is unrelated to an incorrect IP routing gateway configuration.',
      },
    ],
  },
];
