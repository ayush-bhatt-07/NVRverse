import React, { useState } from 'react';
import { 
  Tv, 
  PlayCircle, 
  Video, 
  HardDrive, 
  Network, 
  Settings, 
  RotateCcw, 
  Shield, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Clock,
  Calendar,
  Lock,
  RefreshCw,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export const ConfigurationLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'playback' | 'cameras' | 'storage' | 'network' | 'maintenance' | 'wizard'>('live');
  const [gridSplit, setGridSplit] = useState<1 | 4 | 9>(4);
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [playbackTime, setPlaybackTime] = useState<number>(14); // 14:00
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState<boolean>(false);

  // Storage State
  const [hddFormatted, setHddFormatted] = useState<boolean>(true);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [overwriteMode, setOverwriteMode] = useState<string>('auto');

  // Network State
  const [dhcpEnabled, setDhcpEnabled] = useState<boolean>(true);
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.100');
  const [subnetMask, setSubnetMask] = useState<string>('255.255.255.0');
  const [gateway, setGateway] = useState<string>('192.168.1.1');
  const [dns, setDns] = useState<string>('1.1.1.1');
  const [netSavedNotice, setNetSavedNotice] = useState<boolean>(false);

  // Cameras State
  const [cameras, setCameras] = useState([
    { id: 1, name: 'Ch 01 - Main Entrance (4K)', ip: '10.151.108.11', port: 1, status: 'online', resolution: '3840x2160', fps: 30, bitrate: '4096 kbps' },
    { id: 2, name: 'Ch 02 - Parking Lot North', ip: '10.151.108.12', port: 2, status: 'online', resolution: '3840x2160', fps: 30, bitrate: '4096 kbps' },
    { id: 3, name: 'Ch 03 - Loading Bay PTZ', ip: '10.151.108.13', port: 3, status: 'online', resolution: '2560x1440', fps: 30, bitrate: '3072 kbps' },
    { id: 4, name: 'Ch 04 - Perimeter Fence West', ip: '10.151.108.14', port: 4, status: 'online', resolution: '1920x1080', fps: 30, bitrate: '2048 kbps' },
    { id: 5, name: 'Ch 05 - Cashier / Reception', ip: '10.151.108.15', port: 5, status: 'online', resolution: '1920x1080', fps: 30, bitrate: '2048 kbps' },
    { id: 6, name: 'Ch 06 - Server Room Interior', ip: '10.151.108.16', port: 6, status: 'online', resolution: '1920x1080', fps: 30, bitrate: '2048 kbps' },
    { id: 7, name: 'Ch 07 - Warehouse High Bay', ip: '10.151.108.17', port: 7, status: 'online', resolution: '3840x2160', fps: 30, bitrate: '4096 kbps' },
    { id: 8, name: 'Ch 08 - Rear Emergency Exit', ip: '10.151.108.18', port: 8, status: 'online', resolution: '1920x1080', fps: 30, bitrate: '2048 kbps' },
  ]);

  // Factory Reset Modal
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleFormatDisk = () => {
    setIsFormatting(true);
    setTimeout(() => {
      setIsFormatting(false);
      setHddFormatted(true);
    }, 1500);
  };

  const handleFactoryReset = () => {
    setShowResetModal(false);
    setResetSuccess(true);
    setDhcpEnabled(true);
    setIpAddress('192.168.1.100');
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* OS Monitor Outer Bezel */}
      <div className="bg-slate-950 rounded-2xl p-3 sm:p-5 shadow-2xl border-4 border-slate-800 text-slate-100">
        {/* Monitor Screen Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <div>
              <span className="font-mono-tech font-bold text-xs tracking-wider text-slate-200">
                NVR-OS v4.82.001 // ENTERPRISE MONITOR CONSOLE
              </span>
              <p className="text-[10px] text-slate-500 font-mono-tech -mt-0.5">
                LOCAL HDMI 4K OUTPUT • 8 CHANNELS • REC: ALLFRAME ACTIVE
              </p>
            </div>
          </div>

          {/* Top Clock */}
          <div className="flex items-center gap-3 font-mono-tech text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              <Calendar size={13} className="text-blue-400" />
              <span>2026-10-28</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-cyan-400 font-bold">
              <Clock size={13} />
              <span>09:50:42 UTC</span>
            </span>
          </div>
        </div>

        {/* NVR OS Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Vertical App Bar (NVR Menu Tabs) */}
          <div className="md:col-span-3 space-y-1 bg-slate-900/90 p-2 rounded-xl border border-slate-800 font-mono-tech text-xs">
            {[
              { id: 'live', label: 'LIVE VIEW', icon: Tv },
              { id: 'playback', label: 'PLAYBACK', icon: PlayCircle },
              { id: 'cameras', label: 'CAMERA MGMT', icon: Video },
              { id: 'storage', label: 'STORAGE & HDD', icon: HardDrive },
              { id: 'network', label: 'NETWORK SETUP', icon: Network },
              { id: 'maintenance', label: 'MAINTENANCE', icon: Settings },
              { id: 'wizard', label: 'SETUP WIZARD', icon: Sliders },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800 px-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                SYSTEM TELEMETRY
              </span>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>CPU Load:</span>
                  <span className="text-emerald-400 font-bold">14.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>RAM Usage:</span>
                  <span className="text-cyan-400 font-bold">1.2 / 4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate In:</span>
                  <span className="text-white font-bold">28.4 Mbps</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Active Work Area */}
          <div className="md:col-span-9 bg-slate-900/60 p-4 rounded-xl border border-slate-800 min-h-[500px]">
            {/* 1. LIVE VIEW TAB */}
            {activeTab === 'live' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono-tech">
                    <span className="font-bold text-white">SPLIT MATRIX:</span>
                    <button
                      onClick={() => setGridSplit(1)}
                      className={`px-2 py-0.5 rounded border text-xs ${
                        gridSplit === 1 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      1x1
                    </button>
                    <button
                      onClick={() => setGridSplit(4)}
                      className={`px-2 py-0.5 rounded border text-xs ${
                        gridSplit === 4 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      2x2 (4CH)
                    </button>
                    <button
                      onClick={() => setGridSplit(9)}
                      className={`px-2 py-0.5 rounded border text-xs ${
                        gridSplit === 9 ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      3x3 (8CH)
                    </button>
                  </div>
                  <span className="text-[11px] font-mono-tech text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    REC: 8 CHANNELS STREAMING TO DISK
                  </span>
                </div>

                {/* Simulated Grid of Camera Streams */}
                <div className={`grid gap-2 ${
                  gridSplit === 1 ? 'grid-cols-1' : gridSplit === 4 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {cameras.slice(0, gridSplit === 1 ? 1 : gridSplit === 4 ? 4 : 8).map(cam => (
                    <div
                      key={cam.id}
                      onClick={() => setSelectedChannel(cam.id)}
                      className="relative bg-slate-950 aspect-video rounded-lg overflow-hidden border border-slate-800 group hover:border-blue-500 cursor-pointer"
                    >
                      {/* Video stream mockup background */}
                      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
                        <Video size={28} className="text-slate-800 group-hover:text-blue-500/40 transition-colors" />
                      </div>

                      {/* On-screen Display (OSD) Overlay */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono-tech text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{cam.name}</span>
                      </div>

                      <div className="absolute top-2 right-2 bg-red-600/80 px-1.5 py-0.2 rounded text-[9px] font-mono-tech font-bold text-white flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        <span>REC</span>
                      </div>

                      <div className="absolute bottom-2 left-2 text-[9px] font-mono-tech text-slate-400 bg-black/50 px-1.5 py-0.5 rounded">
                        {cam.resolution} • {cam.fps} FPS • {cam.bitrate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PLAYBACK TAB */}
            {activeTab === 'playback' && (
              <div className="space-y-4 font-mono-tech">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">HISTORICAL RECORDING TIMELINE</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">CH 01 // 2026-10-28</span>
                    <button
                      onClick={() => setIsPlaybackPlaying(!isPlaybackPlaying)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors"
                    >
                      {isPlaybackPlaying ? 'PAUSE PLAYBACK' : 'PLAY RECORDING'}
                    </button>
                  </div>
                </div>

                {/* Playback Canvas Preview */}
                <div className="bg-slate-950 aspect-video max-h-72 w-full rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                  <div className="text-center text-slate-400">
                    <Video size={40} className="mx-auto text-blue-500 mb-2" />
                    <span className="text-xs font-bold text-white">PLAYBACK STREAM // CH 01</span>
                    <p className="text-[10px] text-slate-500 mt-1">TIMESTAMP: 2026-10-28 {playbackTime.toString().padStart(2, '0')}:00:00</p>
                  </div>
                  <div className="absolute bottom-3 right-3 text-xs bg-black/80 px-2 py-1 rounded text-cyan-400">
                    SPEED: 1x REALTIME
                  </div>
                </div>

                {/* 24-Hour Scrubbable Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00 (NOON)</span>
                    <span>18:00</span>
                    <span>23:59</span>
                  </div>
                  <div className="h-6 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden flex items-center">
                    {/* Continuous green recording blocks */}
                    <div className="absolute inset-y-1 left-0 right-0 bg-emerald-600/40 border-y border-emerald-500" />
                    {/* Scrubber pointer */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-yellow-400 shadow-md transition-all"
                      style={{ left: `${(playbackTime / 24) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={playbackTime}
                    onChange={e => setPlaybackTime(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. CAMERAS TAB */}
            {activeTab === 'cameras' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">IP Camera Channel Matrix</h3>
                    <p className="text-xs text-slate-400 font-mono-tech">8 PoE Ports • Auto ONVIF Profile S Discovery</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-mono-tech font-bold hover:bg-blue-500 transition-colors">
                    <Search size={13} />
                    <span>SCAN ONVIF</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono-tech text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Port</th>
                        <th className="py-2 px-3">Channel Name</th>
                        <th className="py-2 px-3">Assigned IP</th>
                        <th className="py-2 px-3">Resolution</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cameras.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-blue-400">P0{c.port}</td>
                          <td className="py-2.5 px-3 text-white font-medium">{c.name}</td>
                          <td className="py-2.5 px-3 text-slate-300">{c.ip}</td>
                          <td className="py-2.5 px-3 text-slate-400">{c.resolution}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {c.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. STORAGE TAB */}
            {activeTab === 'storage' && (
              <div className="space-y-4 font-mono-tech text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Mass Storage & S.M.A.R.T. Health</h3>
                    <p className="text-xs text-slate-400">SATA III 6Gbps • AllFrame 24/7 Firmware</p>
                  </div>
                  <button
                    disabled={isFormatting}
                    onClick={handleFormatDisk}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isFormatting ? 'INITIALIZING DISK...' : 'FORMAT / INITIALIZE STORAGE'}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">DISK 1: Western Digital Purple NV-4000PURZ</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      hddFormatted ? 'bg-emerald-950 text-emerald-400 border-emerald-600/40' : 'bg-red-950 text-red-400 border-red-600/40'
                    }`}>
                      {hddFormatted ? 'HEALTHY // EXT4 SURVEILLANCE' : 'UNFORMATTED // RAW'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>CAPACITY UTILIZATION:</span>
                      <strong className="text-white">1,842 GB USED / 4,000 GB TOTAL (46%)</strong>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '46%' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">S.M.A.R.T. State:</span>
                      <strong className="text-emerald-400">PASSED (0 ERR)</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Platter Temp:</span>
                      <strong className="text-white">38.2°C (NOMINAL)</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Power On Hours:</span>
                      <strong className="text-white">1,420 HOURS</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Overwrite Policy:</span>
                      <strong className="text-blue-400">FIFO OVERWRITE</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. NETWORK SETTINGS TAB */}
            {activeTab === 'network' && (
              <div className="space-y-4 font-mono-tech text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Gigabit WAN/LAN Configuration</h3>
                  {netSavedNotice && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <Check size={14} /> Network settings applied!
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-w-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">DHCP Automatic IP Assignment:</span>
                    <button
                      onClick={() => setDhcpEnabled(!dhcpEnabled)}
                      className={`px-3 py-1 rounded font-bold ${
                        dhcpEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {dhcpEnabled ? 'ENABLED' : 'STATIC IP'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">NVR IPv4 Address:</label>
                    <input
                      disabled={dhcpEnabled}
                      type="text"
                      value={ipAddress}
                      onChange={e => setIpAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Subnet Mask:</label>
                    <input
                      disabled={dhcpEnabled}
                      type="text"
                      value={subnetMask}
                      onChange={e => setSubnetMask(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Default Gateway:</label>
                    <input
                      disabled={dhcpEnabled}
                      type="text"
                      value={gateway}
                      onChange={e => setGateway(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white disabled:opacity-50"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setNetSavedNotice(true);
                      setTimeout(() => setNetSavedNotice(false), 2000);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                  >
                    SAVE NETWORK PARAMETERS
                  </button>
                </div>
              </div>
            )}

            {/* 6. MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4 font-mono-tech text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">System Diagnostics & Firmware</h3>
                  <span className="text-slate-400">FIRMWARE: VER 4.82.001</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-white">Config Backup & Restore</span>
                    <p className="text-slate-400 text-[11px]">Export active parameters or restore from USB drive.</p>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded">
                      EXPORT CONFIG TO USB
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-red-400">Factory Reset NVR</span>
                    <p className="text-slate-400 text-[11px]">Reverts all network, camera, and recording rules to factory state.</p>
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded font-bold"
                    >
                      FACTORY RESET
                    </button>
                  </div>
                </div>

                {resetSuccess && (
                  <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300">
                    System successfully reset to factory defaults! Reinitializing...
                  </div>
                )}
              </div>
            )}

            {/* 7. SETUP WIZARD TAB */}
            {activeTab === 'wizard' && (
              <div className="space-y-4 font-mono-tech text-xs">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Out-of-Box Initial Setup Wizard</h3>
                  <p className="text-slate-400">Guiding first-time deployment and security hardening.</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 max-w-lg">
                  <div className="space-y-1">
                    <label className="text-slate-300">Administrator Password:</label>
                    <input
                      type="password"
                      defaultValue="Admin@2026!"
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white"
                    />
                    <span className="text-[10px] text-emerald-400">Strong (Special char, number, capital)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300">NTP Timezone:</label>
                    <select className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white">
                      <option>UTC-08:00 (Pacific Time - Los Angeles)</option>
                      <option>UTC+00:00 (GMT London)</option>
                      <option>UTC+01:00 (Central European Time)</option>
                      <option>UTC+08:00 (Singapore / Beijing)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setActiveTab('live')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                  >
                    COMPLETE SETUP & LAUNCH LIVE VIEW
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Factory Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={22} />
              <h3 className="text-lg font-bold">Confirm Factory Reset?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono-tech">
              This action will reset administrator credentials, purge camera mappings, and reset network NIC parameters to 192.168.1.100. Hard drive recordings will remain safe on disk.
            </p>
            <div className="flex justify-end gap-2 pt-2 font-mono-tech text-xs">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold"
              >
                CANCEL
              </button>
              <button
                onClick={handleFactoryReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
