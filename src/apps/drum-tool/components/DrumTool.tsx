import { memo, useState, useCallback } from 'react';
import { useLanguage } from '../../../i18n';
import { DrumMachine } from '../../drum/components/DrumMachine';
import { DrumSynth } from '../../drum-synth/components';
import { cn } from '../../../utils';
import './DrumTool.css';

type TabType = 'machine' | 'synth';

/**
 * DrumTool Component
 * Combines Drum Machine and Drum Synth into a single tool with tabs
 */
export const DrumTool = memo(function DrumTool() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('machine');

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
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
          {activeTab === 'machine' && <DrumMachine />}
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
          {activeTab === 'synth' && <DrumSynth />}
        </div>
      </div>
    </div>
  );
});

DrumTool.displayName = 'DrumTool';
