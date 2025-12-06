'use client';

import { useState } from 'react';
import { worldClockTool } from '@/tools/world-clock';
import type { WorldClockSettings } from '@/tools/world-clock';

export default function WorldClockPage() {
  const [settings, setSettings] = useState<WorldClockSettings>(
    worldClockTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<WorldClockSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = worldClockTool.component;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{worldClockTool.meta.icon}</span>
          {worldClockTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {worldClockTool.meta.description.ko}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <ToolComponent
          instanceId="main"
          settings={settings}
          onSettingsChange={handleSettingsChange}
          size={{ width: 400, height: 400 }}
          isActive={true}
        />
      </div>
    </div>
  );
}
