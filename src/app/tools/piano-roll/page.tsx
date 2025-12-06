'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            <span className="text-2xl">{pianoRollTool.meta.icon}</span>
            <h1 className="text-xl font-semibold">
              {pianoRollTool.meta.name.ko}
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
          size={{ width: 800, height: 600 }}
          isActive={true}
        />
      </main>
    </div>
  );
}
