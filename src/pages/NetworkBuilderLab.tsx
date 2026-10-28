import React, { useState } from 'react';
import { TopologyDevice, TopologyCable } from '../types';
import { 
  Network, 
  Camera, 
  Box, 
  Share2, 
  Monitor, 
  Laptop, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  RotateCcw,
  Sliders,
  Cable,
  Zap,
  Play
} from 'lucide-react';

const INITIAL_DEVICES: TopologyDevice[] = [
  {
    id: 'dev-router',
    name: 'Edge Router / Gateway',
    type: 'router',
    ip: '192.168.1.1',
    subnet: '255.255.255.0',
    gateway: '0.0.0.0',
    mac: '00:1A:2B:3C:4D:01',
    poePowerWatts: 0,
    poeRequired: false,
    x: 80,
    y: 80,
    ports: [{ id: 'p1', name: 'LAN1', type: 'rj45' }, { id: 'p2', name: 'LAN2', type: 'rj45' }],
    status: 'online',
  },
  {
    id: 'dev-nvr',
    name: 'NVR-8000POE (8-CH)',
    type: 'nvr',
    ip: '192.168.1.100',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:02',
    poePowerWatts: 0,
    poeRequired: false,
    x: 360,
    y: 120,
    ports: [
      { id: 'wan', name: 'LAN Uplink', type: 'rj45' },
      { id: 'poe1', name: 'PoE 1', type: 'rj45' },
      { id: 'poe2', name: 'PoE 2', type: 'rj45' },
      { id: 'poe3', name: 'PoE 3', type: 'rj45' },
      { id: 'hdmi', name: 'HDMI Out', type: 'hdmi' },
    ],
    status: 'online',
  },
  {
    id: 'dev-cam1',
    name: 'Entrance 4K Turret IPC',
    type: 'camera',
    ip: '10.151.108.11',
    subnet: '255.255.255.0',
    gateway: '10.151.108.1',
    mac: '00:1A:2B:3C:4D:03',
    poePowerWatts: 11.5,
    poeRequired: true,
    x: 640,
    y: 60,
    ports: [{ id: 'eth', name: 'PoE In', type: 'rj45' }],
    status: 'online',
  },
  {
    id: 'dev-cam2',
    name: 'Parking Lot Bullet IPC',
    type: 'camera',
    ip: '10.151.108.12',
    subnet: '255.255.255.0',
    gateway: '10.151.108.1',
    mac: '00:1A:2B:3C:4D:04',
    poePowerWatts: 14.0,
    poeRequired: true,
    x: 640,
    y: 190,
    ports: [{ id: 'eth', name: 'PoE In', type: 'rj45' }],
    status: 'online',
  },
  {
    id: 'dev-mon',
    name: 'Security 4K Monitor',
    type: 'monitor',
    ip: 'N/A',
    subnet: 'N/A',
    gateway: 'N/A',
    mac: 'N/A',
    poePowerWatts: 0,
    poeRequired: false,
    x: 360,
    y: 320,
    ports: [{ id: 'hdmi_in', name: 'HDMI In', type: 'hdmi' }],
    status: 'online',
  },
];

const INITIAL_CABLES: TopologyCable[] = [
  { id: 'c1', fromDeviceId: 'dev-router', fromPortId: 'p1', toDeviceId: 'dev-nvr', toPortId: 'wan', cableType: 'cat6', status: 'active' },
  { id: 'c2', fromDeviceId: 'dev-nvr', fromPortId: 'poe1', toDeviceId: 'dev-cam1', toPortId: 'eth', cableType: 'cat6', status: 'active' },
  { id: 'c3', fromDeviceId: 'dev-nvr', fromPortId: 'poe2', toDeviceId: 'dev-cam2', toPortId: 'eth', cableType: 'cat6', status: 'active' },
  { id: 'c4', fromDeviceId: 'dev-nvr', fromPortId: 'hdmi', toDeviceId: 'dev-mon', toPortId: 'hdmi_in', cableType: 'hdmi', status: 'active' },
];

export const NetworkBuilderLab: React.FC = () => {
  const [devices, setDevices] = useState<TopologyDevice[]>(INITIAL_DEVICES);
  const [cables, setCables] = useState<TopologyCable[]>(INITIAL_CABLES);
  const [selectedDevice, setSelectedDevice] = useState<TopologyDevice | null>(null);
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Dragging state
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate total PoE usage
  const totalPoeWatts = devices.reduce((sum, d) => sum + (d.poeRequired ? d.poePowerWatts : 0), 0);
  const poeBudgetLimit = 120; // 120W max
  const isPoeOverBudget = totalPoeWatts > poeBudgetLimit;

  // Check for IP conflict faults
  const ipCounts = devices
    .filter(d => d.ip !== 'N/A')
    .reduce((acc, d) => {
      acc[d.ip] = (acc[d.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const hasIpConflict = Object.values(ipCounts).some(c => c > 1);

  const handleMouseDown = (e: React.MouseEvent, dev: TopologyDevice) => {
    setDraggingDeviceId(dev.id);
    setDragOffset({
      x: e.clientX - dev.x,
      y: e.clientY - dev.y,
    });
    setSelectedDevice(dev);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingDeviceId) return;
    setDevices(prev =>
      prev.map(d => {
        if (d.id === draggingDeviceId) {
          return {
            ...d,
            x: Math.max(20, Math.min(720, e.clientX - dragOffset.x)),
            y: Math.max(20, Math.min(420, e.clientY - dragOffset.y)),
          };
        }
        return d;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingDeviceId(null);
  };

  const handleAddDevice = (type: 'camera' | 'laptop' | 'switch') => {
    const id = `dev-${Date.now()}`;
    const newDev: TopologyDevice = {
      id,
      name: type === 'camera' ? 'New IP Camera' : type === 'laptop' ? 'Tech Laptop' : 'PoE Switch',
      type,
      ip: type === 'camera' ? '10.151.108.20' : '192.168.1.150',
      subnet: '255.255.255.0',
      gateway: type === 'camera' ? '10.151.108.1' : '192.168.1.1',
      mac: '00:1A:2B:88:' + Math.floor(Math.random() * 90 + 10),
      poePowerWatts: type === 'camera' ? 12.0 : 0,
      poeRequired: type === 'camera',
      x: 300 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      ports: [{ id: 'p1', name: 'ETH1', type: 'rj45' }],
      status: 'online',
    };
    setDevices(prev => [...prev, newDev]);
    setSelectedDevice(newDev);
  };

  const handlePingTest = () => {
    setIsTestingPing(true);
    setPingResult(null);

    setTimeout(() => {
      setIsTestingPing(false);
      if (hasIpConflict) {
        setPingResult('PING FAILED: Duplicate IP detected on network. ARP packet storm detected!');
      } else if (isPoeOverBudget) {
        setPingResult('PING WARNING: Packet loss high. PoE budget overdrawn (Total wattage exceeds 120W)!');
      } else {
        setPingResult('PING 100% NOMINAL: All 5 nodes reachable. Average round-trip time: 0.74ms (0% drop).');
      }
    }, 1000);
  };

  const handleResetTopology = () => {
    setDevices(INITIAL_DEVICES);
    setCables(INITIAL_CABLES);
    setSelectedDevice(null);
    setPingResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              NETWORKING LAB 02
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">INTERACTIVE TOPOLOGY DESIGNER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Network Topology & PoE Budget Builder
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Drag devices, connect Ethernet/HDMI links, adjust IP configurations, and validate connectivity with live automated fault analysis.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddDevice('camera')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono-tech font-bold shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>ADD CAMERA</span>
          </button>
          <button
            onClick={() => handleAddDevice('laptop')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-mono-tech font-bold transition-colors"
          >
            <Plus size={14} />
            <span>ADD LAPTOP</span>
          </button>
          <button
            onClick={handleResetTopology}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Reset Topology"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Device Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Topology Interactive Canvas */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative min-h-[500px] overflow-hidden lab-grid-dense"
        >
          {/* Top Canvas Badges */}
          <div className="flex items-center justify-between pointer-events-none z-10 relative">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-mono-tech text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CANVAS: DRAG NODES FREELY</span>
            </div>

            {/* PoE Budget Meter */}
            <div className="bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-mono-tech flex items-center gap-2">
              <Zap size={12} className={isPoeOverBudget ? 'text-red-400' : 'text-amber-400'} />
              <span>
                POE BUDGET: <strong className={isPoeOverBudget ? 'text-red-400 font-bold' : 'text-white'}>{totalPoeWatts.toFixed(1)}W</strong> / 120W
              </span>
            </div>
          </div>

          {/* SVG Cable Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {cables.map(cable => {
              const fromDev = devices.find(d => d.id === cable.fromDeviceId);
              const toDev = devices.find(d => d.id === cable.toDeviceId);
              if (!fromDev || !toDev) return null;

              const x1 = fromDev.x + 80;
              const y1 = fromDev.y + 35;
              const x2 = toDev.x + 80;
              const y2 = toDev.y + 35;

              return (
                <g key={cable.id}>
                  {/* Outer wire glow */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={cable.cableType === 'hdmi' ? '#d97706' : '#2563eb'}
                    strokeWidth="3"
                    strokeDasharray={isTestingPing ? '6,6' : 'none'}
                    className={isTestingPing ? 'animate-pulse' : ''}
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes (Devices) */}
          {devices.map(dev => {
            const isSelected = selectedDevice?.id === dev.id;
            return (
              <div
                key={dev.id}
                onMouseDown={e => handleMouseDown(e, dev)}
                style={{ transform: `translate(${dev.x}px, ${dev.y}px)` }}
                className={`absolute w-44 bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border cursor-move transition-shadow z-20 shadow-lg ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
                    {dev.type === 'camera' && <Camera size={14} />}
                    {dev.type === 'nvr' && <Box size={14} />}
                    {dev.type === 'router' && <Network size={14} />}
                    {dev.type === 'monitor' && <Monitor size={14} />}
                    {dev.type === 'laptop' && <Laptop size={14} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{dev.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono-tech block truncate">{dev.ip}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono-tech text-slate-400 flex justify-between items-center">
                  <span>{dev.ports.length} Port{dev.ports.length > 1 ? 's' : ''}</span>
                  {dev.poeRequired && (
                    <span className="text-amber-400 font-bold">{dev.poePowerWatts}W PoE</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom Floating Ping Trigger */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <button
              onClick={handlePingTest}
              disabled={isTestingPing}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono-tech font-bold shadow-md transition-colors disabled:opacity-50"
            >
              <Play size={13} />
              <span>{isTestingPing ? 'SIMULATING PING...' : 'TEST CONNECTIVITY (PING)'}</span>
            </button>

            {pingResult && (
              <span className={`text-xs font-mono-tech px-3 py-1.5 rounded-lg border max-w-md ${
                pingResult.includes('FAILED')
                  ? 'bg-red-950 text-red-300 border-red-500/40'
                  : pingResult.includes('WARNING')
                  ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              }`}>
                {pingResult}
              </span>
            )}
          </div>
        </div>

        {/* Right Inspector & Fault Analysis */}
        <div className="lg:col-span-4 space-y-4">
          {/* Automated Network Health & Fault Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-mono-tech">
                AUTOMATED FAULT DETECTION
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {hasIpConflict ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">CRITICAL: IP Address Conflict!</strong>
                    <p className="text-[11px] mt-0.5 text-red-700">Multiple nodes share the exact same IP address. Adjust in the inspector.</p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-mono-tech text-[11px]">No IP conflicts detected (All addresses unique)</span>
                </div>
              )}

              {isPoeOverBudget ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">PoE Over-Budget Warning!</strong>
                    <p className="text-[11px] mt-0.5 text-amber-700">Cumulative demand ({totalPoeWatts.toFixed(1)}W) exceeds 120W NVR budget.</p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="font-mono-tech text-[11px]">PoE Power Budget safe: {totalPoeWatts.toFixed(1)}W / 120W</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Device Inspector Card */}
          {selectedDevice ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono-tech uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedDevice.type.toUpperCase()}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedDevice.name}</h3>
                </div>
                <span className="text-xs font-mono-tech text-slate-400">{selectedDevice.mac}</span>
              </div>

              <div className="space-y-3 font-mono-tech text-xs">
                <div>
                  <label className="text-slate-500 text-[11px]">IPv4 Address:</label>
                  <input
                    type="text"
                    value={selectedDevice.ip}
                    onChange={e => {
                      const val = e.target.value;
                      setDevices(prev =>
                        prev.map(d => (d.id === selectedDevice.id ? { ...d, ip: val } : d))
                      );
                      setSelectedDevice(prev => (prev ? { ...prev, ip: val } : null));
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[11px]">Subnet Mask:</label>
                  <input
                    type="text"
                    value={selectedDevice.subnet}
                    onChange={e => {
                      const val = e.target.value;
                      setDevices(prev =>
                        prev.map(d => (d.id === selectedDevice.id ? { ...d, subnet: val } : d))
                      );
                      setSelectedDevice(prev => (prev ? { ...prev, subnet: val } : null));
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[11px]">Default Gateway:</label>
                  <input
                    type="text"
                    value={selectedDevice.gateway}
                    onChange={e => {
                      const val = e.target.value;
                      setDevices(prev =>
                        prev.map(d => (d.id === selectedDevice.id ? { ...d, gateway: val } : d))
                      );
                      setSelectedDevice(prev => (prev ? { ...prev, gateway: val } : null));
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                {selectedDevice.poeRequired && (
                  <div>
                    <label className="text-slate-500 text-[11px]">PoE Power Draw (Watts):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedDevice.poePowerWatts}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setDevices(prev =>
                          prev.map(d => (d.id === selectedDevice.id ? { ...d, poePowerWatts: val } : d))
                        );
                        setSelectedDevice(prev => (prev ? { ...prev, poePowerWatts: val } : null));
                      }}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs font-mono-tech">
              Click any device on the canvas to inspect its IP settings, MAC address, and PoE power consumption.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
