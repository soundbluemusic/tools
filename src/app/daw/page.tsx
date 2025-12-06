'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, Disc3, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { metronomeTool } from '@/tools/metronome';
import { drumMachineTool } from '@/tools/drum-machine';
import { drumSynthTool } from '@/tools/drum-synth';
import type { MetronomeSettings } from '@/tools/metronome';
import type { DrumMachineSettings } from '@/tools/drum-machine';
import type { DrumSynthSettings } from '@/tools/drum-synth';

export default function DAWPage() {
  const [metronomeSettings, setMetronomeSettings] = useState<MetronomeSettings>(
    metronomeTool.defaultSettings
  );
  const [drumMachineSettings, setDrumMachineSettings] =
    useState<DrumMachineSettings>(drumMachineTool.defaultSettings);
  const [drumSynthSettings, setDrumSynthSettings] = useState<DrumSynthSettings>(
    drumSynthTool.defaultSettings
  );

  const MetronomeComponent = metronomeTool.component;
  const DrumMachineComponent = drumMachineTool.component;
  const DrumSynthComponent = drumSynthTool.component;

  const defaultSize = { width: 800, height: 600 };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold">🎵 DAW</h1>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
            메트로놈 + 드럼머신 + 드럼신스
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="drum-machine" className="flex h-full flex-col">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="metronome" className="gap-2">
              <Timer className="h-4 w-4" />
              메트로놈
            </TabsTrigger>
            <TabsTrigger value="drum-machine" className="gap-2">
              <Disc3 className="h-4 w-4" />
              드럼머신
            </TabsTrigger>
            <TabsTrigger value="drum-synth" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              드럼신스
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 overflow-hidden rounded-lg border bg-card">
            <TabsContent value="metronome" className="m-0 h-full">
              <MetronomeComponent
                instanceId="daw-metronome"
                settings={metronomeSettings}
                onSettingsChange={(updates) =>
                  setMetronomeSettings((prev) => ({ ...prev, ...updates }))
                }
                size={defaultSize}
                isActive={true}
              />
            </TabsContent>

            <TabsContent value="drum-machine" className="m-0 h-full">
              <DrumMachineComponent
                instanceId="daw-drum-machine"
                settings={drumMachineSettings}
                onSettingsChange={(updates) =>
                  setDrumMachineSettings((prev) => ({ ...prev, ...updates }))
                }
                size={defaultSize}
                isActive={true}
              />
            </TabsContent>

            <TabsContent value="drum-synth" className="m-0 h-full">
              <DrumSynthComponent
                instanceId="daw-drum-synth"
                settings={drumSynthSettings}
                onSettingsChange={(updates) =>
                  setDrumSynthSettings((prev) => ({ ...prev, ...updates }))
                }
                size={defaultSize}
                isActive={true}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
