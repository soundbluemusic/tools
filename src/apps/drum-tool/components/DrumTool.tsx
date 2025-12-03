import { memo, useState, useCallback } from 'react';
import { useLanguage } from '../../../i18n';
import { DrumMachine } from '../../drum/components/DrumMachine';
import { DrumSynth } from '../../drum-synth/components';
import {
  DEFAULT_ALL_PARAMS,
  type AllDrumParams,
} from '../../drum-synth/constants';
import { cn } from '../../../utils';
import './DrumTool.css';

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
    <div className="drum-tool">
      {/* Tab Navigation */}
      <div className="drum-tool-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={cn(
              'drum-tool-tab',
              activeTab === tab.id && 'drum-tool-tab--active'
            )}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="drum-tool-tab-icon">{tab.icon}</span>
            <span className="drum-tool-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="drum-tool-content">
        <div
          id="tabpanel-machine"
          role="tabpanel"
          aria-labelledby="tab-machine"
          className={cn(
            'drum-tool-panel',
            activeTab === 'machine' && 'drum-tool-panel--active'
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
            'drum-tool-panel',
            activeTab === 'synth' && 'drum-tool-panel--active'
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
      <div className="drum-tool-integration-info">
        {language === 'ko'
          ? '사운드 합성기에서 수정한 소리가 드럼 머신에서 사용됩니다.'
          : 'Sounds edited in Sound Synth are used by Drum Machine.'}
      </div>
    </div>
  );
});

DrumTool.displayName = 'DrumTool';
