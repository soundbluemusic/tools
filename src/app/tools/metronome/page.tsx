'use client';

import { useState } from 'react';
import { metronomeTool } from '@/tools/metronome';
import type { MetronomeSettings } from '@/tools/metronome';

export default function MetronomePage() {
  const [settings, setSettings] = useState<MetronomeSettings>(
    metronomeTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<MetronomeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = metronomeTool.component;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{metronomeTool.meta.icon}</span>
          {metronomeTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {metronomeTool.meta.description.ko}
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
