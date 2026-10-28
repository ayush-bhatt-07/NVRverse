import { LearningLesson } from '../types';

export const LEARNING_LESSONS: LearningLesson[] = [
  {
    id: 'nvr-vs-dvr',
    title: 'What is an NVR? Architecture vs Legacy DVRs',
    subtitle: 'Digital IP packet ingestion vs analog coaxial video encoding',
    category: 'Architecture',
    readTime: '3 min',
    summary: 'A Network Video Recorder (NVR) receives pre-encoded digital IP video streams over Ethernet, unlike legacy DVRs which must physically convert analog coaxial video signals.',
    keyTakeaways: [
      'NVRs process pure digital IP packets (H.264/H.265 over Ethernet)',
      'IP cameras perform image processing and compression at the edge sensor',
      'A single CAT6 cable delivers 4K video, audio, PTZ telemetry, and DC power (PoE)',
      'Eliminates video signal degradation over long distance runs',
    ],
    deepDive: 'In a DVR setup, raw analog composite video signals travel down coaxial cables (RG59) and are converted by hardware ADCs on the DVR board. In contrast, an NVR is essentially a specialized Linux-based high-throughput network appliance. The IP camera contains an onboard CMOS sensor, Image Signal Processor (ISP), and H.265 hardware encoder. The NVR merely receives the already-compressed bitstreams and writes them sequentially to SATA hard drives via direct memory access (DMA).',
    quiz: [
      {
        question: 'Where is the video compression (e.g. H.265) executed in an NVR security system?',
        options: [
          'Inside the NVR SoC processor',
          'At the IP Camera onboard encoder (edge processing)',
          'Inside the HDMI monitor controller',
          'Inside the SATA hard disk cache',
        ],
        correctIndex: 1,
        explanation: 'In an IP surveillance system, compression happens at the camera edge before transmission over the Ethernet network.',
      },
    ],
  },
  {
    id: 'poe-fundamentals',
    title: 'PoE Architecture: Power Over Ethernet Explained',
    subtitle: 'IEEE 802.3af (PoE), 802.3at (PoE+), and 802.3bt (PoE++)',
    category: 'Networking',
    readTime: '4 min',
    calculatorType: 'poe',
    summary: 'PoE injects 48V-54V direct current onto standard 4-pair twisted Ethernet cables to power IP cameras without dedicated AC electrical outlets.',
    keyTakeaways: [
      '802.3af supplies up to 15.4W at port (12.95W at device)',
      '802.3at (PoE+) supplies up to 30W at port (25.5W at device)',
      '802.3bt (PoE++) supplies 60W-90W for PTZ cameras with heaters',
      'Alternative A phantom power uses data pairs 1/2 and 3/6 simultaneously for power and 100Mbps data',
      '25kΩ resistance signature prevents frying non-PoE laptops',
    ],
    deepDive: 'PoE is completely safe for non-PoE hardware because of the hardware handshake. The Power Sourcing Equipment (NVR) applies a ramp detection voltage between 2.8V and 10V. It reads the current draw to measure if a 25.0 kΩ precision resistor exists in the Powered Device (PD). If verified, it performs a classification check to reserve the necessary wattage from the power supply, and only then applies full 48V DC.',
    quiz: [
      {
        question: 'Why does an NVR PoE port not fry a standard laptop plugged into it by mistake?',
        options: [
          'Laptops automatically repel 48V electricity',
          'The NVR performs a low-voltage 25kΩ resistance signature check before sending 48V',
          'The RJ45 jack physically blocks laptop plugs',
          'Ethernet switches only power devices on port 1',
        ],
        correctIndex: 1,
        explanation: 'IEEE 802.3af/at sensing requires a 25kΩ signature; non-PoE equipment does not have this circuit, so 48V is never enabled.',
      },
    ],
  },
  {
    id: 'storage-bitrate',
    title: 'Surveillance Storage & Bitrate Engineering',
    subtitle: 'Calculating storage requirements for multi-channel 4K recording',
    category: 'Storage',
    readTime: '4 min',
    calculatorType: 'storage',
    summary: 'Surveillance HDDs are optimized for 95% write / 5% read workloads with specialized firmware avoiding seek delays and frame drops.',
    keyTakeaways: [
      'Standard desktop HDDs fail under continuous 24/7 video write workloads',
      'Surveillance drives (WD Purple, Seagate SkyHawk) support ATA streaming commands',
      'H.265 compression reduces required storage by ~40-50% compared to H.264',
      'Bitrate formula: Storage (GB) = (Bitrate in Mbps × 3600 × 24 × Days × Cameras) / 8000',
    ],
    deepDive: 'Surveillance drives prioritize write integrity over error recovery. In a standard computer, if a sector fails to write cleanly, the drive will retry repeatedly, locking the bus for seconds. In video surveillance, losing a fraction of a millisecond frame is acceptable, but stalling the write buffer causes catastrophic loss of all 8 streaming channels. ATA Streaming command sets allow the NVR to enforce continuous sequential stream flushing.',
    quiz: [
      {
        question: 'Why are standard PC desktop hard drives NOT recommended for NVR installations?',
        options: [
          'They cannot spin faster than 100 RPM',
          'They are built for bursty 80% read / 20% write rather than 24/7 95% continuous write duty',
          'They do not have SATA connectors',
          'They only work with Windows OS',
        ],
        correctIndex: 1,
        explanation: 'Desktop drives are designed for light daytime read workloads and lack the vibration dampening and streaming firmware of 24/7 surveillance drives.',
      },
    ],
  },
  {
    id: 'onvif-rtsp-rtp',
    title: 'The Surveillance Protocol Stack: ONVIF, RTSP & RTP',
    subtitle: 'How discovery, session control, and media transmission collaborate',
    category: 'Protocols',
    readTime: '5 min',
    summary: 'Video surveillance relies on a 3-tier protocol model: ONVIF for device discovery & control, RTSP for session management, and RTP for media transport.',
    keyTakeaways: [
      'ONVIF: SOAP XML Web Services for discovery, PTZ control, and credentials',
      'RTSP (Port 554): The media playback remote control (SETUP, PLAY, TEARDOWN)',
      'RTP: The UDP transport container carrying encoded H.264/H.265 NAL packets',
      'RTCP: Companion protocol monitoring packet loss, jitter, and stream health',
    ],
    deepDive: 'When you plug an IP camera in, the NVR sends an ONVIF WS-Discovery probe across the network. Once the camera responds, the NVR authenticates using WS-Security UsernameToken and queries GetStreamUri. The camera returns an RTSP URI (e.g. `rtsp://10.151.108.12:554/Streaming/Channels/101`). The NVR connects via TCP port 554, initiates RTSP DESCRIBE/SETUP, and tells the camera to blast UDP packets containing RTP payload type 96 back to port 20000.',
    quiz: [
      {
        question: 'Which protocol is responsible for negotiating the video streaming session (PLAY, PAUSE, TEARDOWN)?',
        options: ['DHCP', 'RTSP (Real-Time Streaming Protocol)', 'ARP', 'ICMP'],
        correctIndex: 1,
        explanation: 'RTSP acts as the session control layer across port 554, while RTP carries the actual video data.',
      },
    ],
  },
];
