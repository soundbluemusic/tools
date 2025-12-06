'use client';

import { useState } from 'react';
import { sheetEditorTool } from '@/tools/sheet-editor';
import type { SheetEditorSettings } from '@/tools/sheet-editor';

export default function SheetEditorPage() {
  const [settings, setSettings] = useState<SheetEditorSettings>(
    sheetEditorTool.defaultSettings
  );

  const handleSettingsChange = (newSettings: Partial<SheetEditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const ToolComponent = sheetEditorTool.component;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <span>{sheetEditorTool.meta.icon}</span>
          {sheetEditorTool.meta.name.ko}
        </h1>
        <p className="text-sm text-muted-foreground">
          {sheetEditorTool.meta.description.ko}
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <ToolComponent
          instanceId="main"
          settings={settings}
          onSettingsChange={handleSettingsChange}
          size={{ width: 900, height: 500 }}
          isActive={true}
        />
      </div>
    </div>
  );
}
