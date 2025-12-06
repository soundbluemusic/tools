'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// World Clock Tool - 세계 시계
// ========================================

export interface WorldClockSettings {
  timezones: string[];
  use24Hour: boolean;
  showSeconds: boolean;
  [key: string]: unknown;
}

const defaultSettings: WorldClockSettings = {
  timezones: ['Asia/Seoul', 'America/New_York', 'Europe/London'],
  use24Hour: true,
  showSeconds: false,
};

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Seoul', label: '서울', emoji: '🇰🇷' },
  { value: 'Asia/Tokyo', label: '도쿄', emoji: '🇯🇵' },
  { value: 'Asia/Shanghai', label: '상하이', emoji: '🇨🇳' },
  { value: 'America/New_York', label: '뉴욕', emoji: '🇺🇸' },
  { value: 'America/Los_Angeles', label: 'LA', emoji: '🇺🇸' },
  { value: 'Europe/London', label: '런던', emoji: '🇬🇧' },
  { value: 'Europe/Paris', label: '파리', emoji: '🇫🇷' },
  { value: 'Europe/Berlin', label: '베를린', emoji: '🇩🇪' },
  { value: 'Australia/Sydney', label: '시드니', emoji: '🇦🇺' },
  { value: 'Pacific/Auckland', label: '오클랜드', emoji: '🇳🇿' },
];

function formatTime(
  date: Date,
  timezone: string,
  use24Hour: boolean,
  showSeconds: boolean
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  };

  if (showSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleTimeString('en-US', options);
}

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString('ko-KR', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTimezoneInfo(timezone: string) {
  return (
    TIMEZONE_OPTIONS.find((tz) => tz.value === timezone) || {
      value: timezone,
      label: timezone.split('/').pop() || timezone,
      emoji: '🌍',
    }
  );
}

function WorldClockComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<WorldClockSettings>) {
  const [now, setNow] = useState(new Date());
  const [showAddMenu, setShowAddMenu] = useState(false);

  const { timezones, use24Hour, showSeconds } = settings;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimezone = (tz: string) => {
    if (!timezones.includes(tz)) {
      onSettingsChange({ timezones: [...timezones, tz] });
    }
    setShowAddMenu(false);
  };

  const removeTimezone = (tz: string) => {
    onSettingsChange({ timezones: timezones.filter((t) => t !== tz) });
  };

  const isCompact = size.width < 280;
  const availableTimezones = TIMEZONE_OPTIONS.filter(
    (tz) => !timezones.includes(tz.value)
  );

  return (
    <div
      className={cn('flex h-full flex-col gap-2 p-4', isCompact && 'gap-1 p-2')}
    >
      {/* Clock List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {timezones.map((tz) => {
          const info = getTimezoneInfo(tz);
          return (
            <div
              key={tz}
              className={cn(
                'group flex items-center justify-between rounded-lg bg-muted/50 p-2',
                isCompact && 'p-1.5'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{info.emoji}</span>
                <div>
                  <div className="text-sm font-medium">{info.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(now, tz)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'font-mono font-bold',
                    isCompact ? 'text-lg' : 'text-2xl'
                  )}
                >
                  {formatTime(now, tz, use24Hour, showSeconds)}
                </div>
                <button
                  onClick={() => removeTimezone(tz)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Button */}
      <div className="relative">
        <Button
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          className="w-full"
          onClick={() => setShowAddMenu(!showAddMenu)}
          disabled={availableTimezones.length === 0}
        >
          <Plus className="mr-1 h-4 w-4" />
          시계 추가
        </Button>

        {showAddMenu && availableTimezones.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-48 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg">
            {availableTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => addTimezone(tz.value)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
              >
                <span>{tz.emoji}</span>
                <span>{tz.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options */}
      {!isCompact && (
        <div className="flex justify-center gap-4 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={use24Hour}
              onChange={(e) =>
                onSettingsChange({ use24Hour: e.target.checked })
              }
            />
            24시간
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) =>
                onSettingsChange({ showSeconds: e.target.checked })
              }
            />
            초 표시
          </label>
        </div>
      )}
    </div>
  );
}

// Tool Definition
export const worldClockTool: ToolDefinition<WorldClockSettings> = {
  meta: {
    id: 'world-clock',
    name: {
      ko: '세계 시계',
      en: 'World Clock',
    },
    description: {
      ko: '여러 도시의 현재 시간을 한눈에',
      en: 'View multiple time zones at once',
    },
    icon: '🌍',
    category: 'productivity',
    defaultSize: 'md',
    minSize: { width: 200, height: 200 },
    tags: ['time', 'timezone', 'clock', 'world'],
  },
  defaultSettings,
  component: WorldClockComponent,
};

// Auto-register
registerTool(worldClockTool);
