import { memo, useState, useCallback } from 'react';
import { useLanguage } from '../../../i18n';
import { DrumMachine } from '../../drum/components/DrumMachine';
import { DrumSynth } from '../../drum-synth/components';
import {
  DEFAULT_ALL_PARAMS,
  type AllDrumParams,
} from '../../drum-synth/constants';
import { cn } from '../../../utils';

type TabType = 'machine' | 'synth';

/**
 * DrumTool Component
 * Combines Drum Machine and Drum Synth into a single tool with tabs
 * Both components share synth parameters - DrumSynth edits them, DrumMachine uses them
 */
export const DrumTool = memo(function DrumTool() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('machine');

  // Shared synth parameters - edited in DrumSynth, used in DrumMachine
  const [synthParams, setSynthParams] =
    useState<AllDrumParams>(DEFAULT_ALL_PARAMS);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleSynthParamsChange = useCallback((params: AllDrumParams) => {
    setSynthParams(params);
  }, []);

  const tabs = [
    {
      id: 'machine' as const,
      label: language === 'ko' ? '드럼 머신' : 'Drum Machine',
      icon: '🥁',
    },
    {
      id: 'synth' as const,
      label: language === 'ko' ? '사운드 합성기' : 'Sound Synth',
      icon: '🎛️',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation */}
      <div
        className="flex gap-2 rounded-xl border border-border-primary bg-bg-secondary p-1"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-transparent px-4 py-3 text-[0.95rem] font-medium text-text-secondary transition-[background-color,color,box-shadow] duration-150 ease-default hover:bg-bg-tertiary hover:text-text-primary sm:px-3 sm:py-2.5 sm:text-sm',
              activeTab === tab.id &&
                'bg-bg-primary text-text-primary shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
            )}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="text-[1.1rem] sm:text-base">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        <div
          id="tabpanel-machine"
          role="tabpanel"
          aria-labelledby="tab-machine"
          className={cn(
            'hidden',
            activeTab === 'machine' &&
              'block animate-[fadeIn_0.2s_ease-out] motion-reduce:animate-none'
          )}
          hidden={activeTab !== 'machine'}
        >
          {activeTab === 'machine' && <DrumMachine synthParams={synthParams} />}
        </div>

        <div
          id="tabpanel-synth"
          role="tabpanel"
          aria-labelledby="tab-synth"
          className={cn(
            'hidden',
            activeTab === 'synth' &&
              'block animate-[fadeIn_0.2s_ease-out] motion-reduce:animate-none'
          )}
          hidden={activeTab !== 'synth'}
        >
          {activeTab === 'synth' && (
            <DrumSynth
              params={synthParams}
              onParamsChange={handleSynthParamsChange}
            />
          )}
        </div>
      </div>

      {/* Integration indicator */}
      <div className="rounded-lg border border-border-primary bg-bg-secondary px-4 py-3 text-center text-[0.85rem] text-text-secondary">
        {language === 'ko'
          ? '사운드 합성기에서 수정한 소리가 드럼 머신에서 사용됩니다.'
          : 'Sounds edited in Sound Synth are used by Drum Machine.'}
      </div>
    </div>
  );
});

DrumTool.displayName = 'DrumTool';
