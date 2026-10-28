import React, { useState } from 'react';
import { NVRScene } from '../components/three/NVRScene';
import { NVR_PORTS, NVR_COMPONENTS } from '../data/hardwareData';
import { HardwarePort, HardwareComponent } from '../types';
import { Box, Layers, Sliders, CheckCircle2, Info } from 'lucide-react';

export const HardwareLab: React.FC = () => {
  const [selectedPort, setSelectedPort] = useState<HardwarePort | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<HardwareComponent | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#f8fafc]">
      {/* 3D NVR Canvas (Occupies full viewport) */}
      <div className="flex-1 relative w-full h-full">
        <NVRScene
          onSelectPort={setSelectedPort}
          onSelectComponent={setSelectedComponent}
        />
      </div>
    </div>
  );
};
