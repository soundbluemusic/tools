'use client';

import { useState } from 'react';
import { qrGeneratorTool } from '@/tools/qr-generator';
import type { QRSettings } from '@/tools/qr-generator';

export default function QRGeneratorPage() {
  const [settings, setSettings] = useState<QRSettings>(
    qrGeneratorTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<QRSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = qrGeneratorTool.component;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{qrGeneratorTool.meta.icon}</span>
          {qrGeneratorTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {qrGeneratorTool.meta.description.ko}
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
