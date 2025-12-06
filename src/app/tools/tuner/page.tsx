'use client';

import { useState } from 'react';
import { tunerTool } from '@/tools/tuner';
import type { TunerSettings } from '@/tools/tuner';

export default function TunerPage() {
  const [settings, setSettings] = useState<TunerSettings>(
    tunerTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<TunerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = tunerTool.component;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{tunerTool.meta.icon}</span>
          {tunerTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tunerTool.meta.description.ko}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <ToolComponent
          instanceId="main"
          settings={settings}
          onSettingsChange={handleSettingsChange}
          size={{ width: 400, height: 500 }}
          isActive={true}
        />
      </div>
    </div>
  );
}
