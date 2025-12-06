'use client';

import { useState } from 'react';
import { pianoRollTool } from '@/tools/piano-roll';
import type { PianoRollSettings } from '@/tools/piano-roll';

export default function PianoRollPage() {
  const [settings, setSettings] = useState<PianoRollSettings>(
    pianoRollTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<PianoRollSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = pianoRollTool.component;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{pianoRollTool.meta.icon}</span>
          {pianoRollTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {pianoRollTool.meta.description.ko}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <ToolComponent
          instanceId="main"
          settings={settings}
          onSettingsChange={handleSettingsChange}
          size={{ width: 800, height: 600 }}
          isActive={true}
        />
      </div>
    </div>
  );
}
