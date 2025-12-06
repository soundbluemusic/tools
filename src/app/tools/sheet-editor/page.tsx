'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sheetEditorTool.meta.icon}</span>
            <h1 className="text-xl font-semibold">
              {sheetEditorTool.meta.name.ko}
            </h1>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Tool Content */}
      <main className="flex-1 overflow-hidden">
        <ToolComponent
          instanceId="main"
          settings={settings}
          onSettingsChange={handleSettingsChange}
          size={{ width: 900, height: 500 }}
          isActive={true}
        />
      </main>
    </div>
  );
}
