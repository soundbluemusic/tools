import { type Component, createSignal, For, Show } from 'solid-js';
import { useLanguage } from '../../../i18n';
import { DrumMachine } from '../../drum/components/DrumMachine';
import {
  DEFAULT_ALL_PARAMS,
  type AllDrumParams,
  type DrumType,
  DRUM_TYPES,
  KICK_RANGES,
  SNARE_RANGES,
  HIHAT_RANGES,
  CLAP_RANGES,
  TOM_RANGES,
  RIM_RANGES,
  MASTER_RANGES,
} from '../../drum-synth/constants';
import { cn } from '../../../utils';
import './DrumTool.css';

/**
 * Parameter Slider Component (Compact version)
 */
interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const ParamSlider: Component<ParamSliderProps> = (props) => {
  const displayValue = () =>
    props.step < 1 ? props.value.toFixed(2) : props.value;
  return (
    <div class="synth-compact-param">
      <div class="synth-compact-param-header">
        <span class="synth-compact-param-label">{props.label}</span>
        <span class="synth-compact-param-value">
          {displayValue()}
          {props.unit || ''}
        </span>
      </div>
      <input
        type="range"
        class="synth-compact-slider"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onInput={(e) =>
          props.onChange(parseFloat((e.target as HTMLInputElement).value))
        }
      />
    </div>
  );
};

/**
 * DrumTool Component
 * Combines Drum Machine and Drum Synth into a single unified interface
 * Both components share synth parameters - real-time editing affects playback immediately
 */
export const DrumTool: Component = () => {
  const { language } = useLanguage();

  // Shared synth parameters - edited in synth panel, used in DrumMachine
  const [synthParams, setSynthParams] =
    createSignal<AllDrumParams>(DEFAULT_ALL_PARAMS);

  // Selected drum for editing
  const [selectedDrum, setSelectedDrum] = createSignal<DrumType>('kick');

  // Synth panel collapsed state
  const [isSynthCollapsed, setIsSynthCollapsed] = createSignal(false);

  const handleSynthParamsChange = (
    newParams: AllDrumParams | ((prev: AllDrumParams) => AllDrumParams)
  ) => {
    if (typeof newParams === 'function') {
      setSynthParams(newParams);
    } else {
      setSynthParams(newParams);
    }
  };

  /**
   * Update parameter for selected drum
   */
  const updateParam = <T extends keyof AllDrumParams>(
    drum: T,
    param: keyof AllDrumParams[T],
    value: number
  ) => {
    handleSynthParamsChange((prev) => ({
      ...prev,
      [drum]: {
        ...prev[drum],
        [param]: value,
      },
    }));
  };

  /**
   * Get translated drum name
   */
  const getDrumLabel = (drum: DrumType): string => {
    const labels: Record<DrumType, Record<'ko' | 'en', string>> = {
      kick: { ko: '킥', en: 'Kick' },
      snare: { ko: '스네어', en: 'Snare' },
      hihat: { ko: '하이햇', en: 'Hi-Hat' },
      clap: { ko: '클랩', en: 'Clap' },
      tom: { ko: '탐', en: 'Tom' },
      rim: { ko: '림', en: 'Rim' },
    };
    return labels[drum][language()];
  };

  /**
   * Get parameter labels
   */
  const getParamLabel = (key: string): string => {
    const labels: Record<string, Record<'ko' | 'en', string>> = {
      pitchStart: { ko: '시작 피치', en: 'Pitch Start' },
      pitchEnd: { ko: '종료 피치', en: 'Pitch End' },
      pitchDecay: { ko: '피치 감쇠', en: 'Pitch Decay' },
      ampDecay: { ko: '볼륨 감쇠', en: 'Amp Decay' },
      click: { ko: '클릭', en: 'Click' },
      drive: { ko: '드라이브', en: 'Drive' },
      tone: { ko: '톤', en: 'Tone' },
      toneFreq: { ko: '톤 주파수', en: 'Tone Freq' },
      toneDecay: { ko: '톤 감쇠', en: 'Tone Decay' },
      noiseDecay: { ko: '노이즈 감쇠', en: 'Noise Decay' },
      noiseFilter: { ko: '노이즈 필터', en: 'Noise Filter' },
      toneMix: { ko: '톤 믹스', en: 'Tone Mix' },
      snappy: { ko: '스내피', en: 'Snappy' },
      filterFreq: { ko: '필터 주파수', en: 'Filter Freq' },
      filterQ: { ko: '필터 Q', en: 'Filter Q' },
      decay: { ko: '감쇠', en: 'Decay' },
      openness: { ko: '오픈', en: 'Openness' },
      pitch: { ko: '피치', en: 'Pitch' },
      ring: { ko: '링', en: 'Ring' },
      spread: { ko: '스프레드', en: 'Spread' },
      reverb: { ko: '리버브', en: 'Reverb' },
      body: { ko: '바디', en: 'Body' },
      attack: { ko: '어택', en: 'Attack' },
      metallic: { ko: '메탈릭', en: 'Metallic' },
      volume: { ko: '볼륨', en: 'Volume' },
    };
    return labels[key]?.[language()] ?? key;
  };

  return (
    <div class="drum-tool-unified">
      {/* Drum Machine (Pattern Sequencer) */}
      <div class="drum-tool-machine">
        <DrumMachine synthParams={synthParams()} />
      </div>

      {/* Synth Control Panel */}
      <div
        class={cn(
          'drum-tool-synth-panel',
          isSynthCollapsed() && 'drum-tool-synth-panel--collapsed'
        )}
      >
        {/* Panel Header */}
        <button
          class="drum-tool-synth-header"
          onClick={() => setIsSynthCollapsed((prev) => !prev)}
          aria-expanded={!isSynthCollapsed()}
        >
          <span class="drum-tool-synth-title">
            {language() === 'ko' ? '🎛️ 사운드 조절' : '🎛️ Sound Control'}
          </span>
          <span class="drum-tool-synth-toggle">
            {isSynthCollapsed() ? '▼' : '▲'}
          </span>
        </button>

        <Show when={!isSynthCollapsed()}>
          <div class="drum-tool-synth-content">
            {/* Drum Type Selector */}
            <div class="drum-tool-drum-selector">
              <For each={DRUM_TYPES}>
                {(drum) => (
                  <button
                    class={cn(
                      'drum-tool-drum-btn',
                      selectedDrum() === drum && 'drum-tool-drum-btn--selected'
                    )}
                    onClick={() => setSelectedDrum(drum)}
                  >
                    {getDrumLabel(drum)}
                  </button>
                )}
              </For>
            </div>

            {/* Parameter Controls */}
            <div class="drum-tool-params">
              {/* Kick Parameters */}
              <Show when={selectedDrum() === 'kick'}>
                <ParamSlider
                  label={getParamLabel('pitchStart')}
                  value={synthParams().kick.pitchStart}
                  min={KICK_RANGES.pitchStart.min}
                  max={KICK_RANGES.pitchStart.max}
                  step={KICK_RANGES.pitchStart.step}
                  unit="Hz"
                  onChange={(v) => updateParam('kick', 'pitchStart', v)}
                />
                <ParamSlider
                  label={getParamLabel('pitchEnd')}
                  value={synthParams().kick.pitchEnd}
                  min={KICK_RANGES.pitchEnd.min}
                  max={KICK_RANGES.pitchEnd.max}
                  step={KICK_RANGES.pitchEnd.step}
                  unit="Hz"
                  onChange={(v) => updateParam('kick', 'pitchEnd', v)}
                />
                <ParamSlider
                  label={getParamLabel('pitchDecay')}
                  value={synthParams().kick.pitchDecay}
                  min={KICK_RANGES.pitchDecay.min}
                  max={KICK_RANGES.pitchDecay.max}
                  step={KICK_RANGES.pitchDecay.step}
                  unit="s"
                  onChange={(v) => updateParam('kick', 'pitchDecay', v)}
                />
                <ParamSlider
                  label={getParamLabel('ampDecay')}
                  value={synthParams().kick.ampDecay}
                  min={KICK_RANGES.ampDecay.min}
                  max={KICK_RANGES.ampDecay.max}
                  step={KICK_RANGES.ampDecay.step}
                  unit="s"
                  onChange={(v) => updateParam('kick', 'ampDecay', v)}
                />
                <ParamSlider
                  label={getParamLabel('click')}
                  value={synthParams().kick.click}
                  min={KICK_RANGES.click.min}
                  max={KICK_RANGES.click.max}
                  step={KICK_RANGES.click.step}
                  unit="%"
                  onChange={(v) => updateParam('kick', 'click', v)}
                />
                <ParamSlider
                  label={getParamLabel('drive')}
                  value={synthParams().kick.drive}
                  min={KICK_RANGES.drive.min}
                  max={KICK_RANGES.drive.max}
                  step={KICK_RANGES.drive.step}
                  unit="%"
                  onChange={(v) => updateParam('kick', 'drive', v)}
                />
                <ParamSlider
                  label={getParamLabel('tone')}
                  value={synthParams().kick.tone}
                  min={KICK_RANGES.tone.min}
                  max={KICK_RANGES.tone.max}
                  step={KICK_RANGES.tone.step}
                  unit="%"
                  onChange={(v) => updateParam('kick', 'tone', v)}
                />
              </Show>

              {/* Snare Parameters */}
              <Show when={selectedDrum() === 'snare'}>
                <ParamSlider
                  label={getParamLabel('toneFreq')}
                  value={synthParams().snare.toneFreq}
                  min={SNARE_RANGES.toneFreq.min}
                  max={SNARE_RANGES.toneFreq.max}
                  step={SNARE_RANGES.toneFreq.step}
                  unit="Hz"
                  onChange={(v) => updateParam('snare', 'toneFreq', v)}
                />
                <ParamSlider
                  label={getParamLabel('toneDecay')}
                  value={synthParams().snare.toneDecay}
                  min={SNARE_RANGES.toneDecay.min}
                  max={SNARE_RANGES.toneDecay.max}
                  step={SNARE_RANGES.toneDecay.step}
                  unit="s"
                  onChange={(v) => updateParam('snare', 'toneDecay', v)}
                />
                <ParamSlider
                  label={getParamLabel('noiseDecay')}
                  value={synthParams().snare.noiseDecay}
                  min={SNARE_RANGES.noiseDecay.min}
                  max={SNARE_RANGES.noiseDecay.max}
                  step={SNARE_RANGES.noiseDecay.step}
                  unit="s"
                  onChange={(v) => updateParam('snare', 'noiseDecay', v)}
                />
                <ParamSlider
                  label={getParamLabel('noiseFilter')}
                  value={synthParams().snare.noiseFilter}
                  min={SNARE_RANGES.noiseFilter.min}
                  max={SNARE_RANGES.noiseFilter.max}
                  step={SNARE_RANGES.noiseFilter.step}
                  unit="Hz"
                  onChange={(v) => updateParam('snare', 'noiseFilter', v)}
                />
                <ParamSlider
                  label={getParamLabel('toneMix')}
                  value={synthParams().snare.toneMix}
                  min={SNARE_RANGES.toneMix.min}
                  max={SNARE_RANGES.toneMix.max}
                  step={SNARE_RANGES.toneMix.step}
                  unit="%"
                  onChange={(v) => updateParam('snare', 'toneMix', v)}
                />
                <ParamSlider
                  label={getParamLabel('snappy')}
                  value={synthParams().snare.snappy}
                  min={SNARE_RANGES.snappy.min}
                  max={SNARE_RANGES.snappy.max}
                  step={SNARE_RANGES.snappy.step}
                  unit="%"
                  onChange={(v) => updateParam('snare', 'snappy', v)}
                />
              </Show>

              {/* Hi-Hat Parameters */}
              <Show when={selectedDrum() === 'hihat'}>
                <ParamSlider
                  label={getParamLabel('filterFreq')}
                  value={synthParams().hihat.filterFreq}
                  min={HIHAT_RANGES.filterFreq.min}
                  max={HIHAT_RANGES.filterFreq.max}
                  step={HIHAT_RANGES.filterFreq.step}
                  unit="Hz"
                  onChange={(v) => updateParam('hihat', 'filterFreq', v)}
                />
                <ParamSlider
                  label={getParamLabel('filterQ')}
                  value={synthParams().hihat.filterQ}
                  min={HIHAT_RANGES.filterQ.min}
                  max={HIHAT_RANGES.filterQ.max}
                  step={HIHAT_RANGES.filterQ.step}
                  onChange={(v) => updateParam('hihat', 'filterQ', v)}
                />
                <ParamSlider
                  label={getParamLabel('decay')}
                  value={synthParams().hihat.decay}
                  min={HIHAT_RANGES.decay.min}
                  max={HIHAT_RANGES.decay.max}
                  step={HIHAT_RANGES.decay.step}
                  unit="s"
                  onChange={(v) => updateParam('hihat', 'decay', v)}
                />
                <ParamSlider
                  label={getParamLabel('openness')}
                  value={synthParams().hihat.openness}
                  min={HIHAT_RANGES.openness.min}
                  max={HIHAT_RANGES.openness.max}
                  step={HIHAT_RANGES.openness.step}
                  unit="%"
                  onChange={(v) => updateParam('hihat', 'openness', v)}
                />
                <ParamSlider
                  label={getParamLabel('pitch')}
                  value={synthParams().hihat.pitch}
                  min={HIHAT_RANGES.pitch.min}
                  max={HIHAT_RANGES.pitch.max}
                  step={HIHAT_RANGES.pitch.step}
                  unit="%"
                  onChange={(v) => updateParam('hihat', 'pitch', v)}
                />
                <ParamSlider
                  label={getParamLabel('ring')}
                  value={synthParams().hihat.ring}
                  min={HIHAT_RANGES.ring.min}
                  max={HIHAT_RANGES.ring.max}
                  step={HIHAT_RANGES.ring.step}
                  unit="%"
                  onChange={(v) => updateParam('hihat', 'ring', v)}
                />
              </Show>

              {/* Clap Parameters */}
              <Show when={selectedDrum() === 'clap'}>
                <ParamSlider
                  label={getParamLabel('filterFreq')}
                  value={synthParams().clap.filterFreq}
                  min={CLAP_RANGES.filterFreq.min}
                  max={CLAP_RANGES.filterFreq.max}
                  step={CLAP_RANGES.filterFreq.step}
                  unit="Hz"
                  onChange={(v) => updateParam('clap', 'filterFreq', v)}
                />
                <ParamSlider
                  label={getParamLabel('filterQ')}
                  value={synthParams().clap.filterQ}
                  min={CLAP_RANGES.filterQ.min}
                  max={CLAP_RANGES.filterQ.max}
                  step={CLAP_RANGES.filterQ.step}
                  onChange={(v) => updateParam('clap', 'filterQ', v)}
                />
                <ParamSlider
                  label={getParamLabel('decay')}
                  value={synthParams().clap.decay}
                  min={CLAP_RANGES.decay.min}
                  max={CLAP_RANGES.decay.max}
                  step={CLAP_RANGES.decay.step}
                  unit="s"
                  onChange={(v) => updateParam('clap', 'decay', v)}
                />
                <ParamSlider
                  label={getParamLabel('spread')}
                  value={synthParams().clap.spread}
                  min={CLAP_RANGES.spread.min}
                  max={CLAP_RANGES.spread.max}
                  step={CLAP_RANGES.spread.step}
                  unit="%"
                  onChange={(v) => updateParam('clap', 'spread', v)}
                />
                <ParamSlider
                  label={getParamLabel('tone')}
                  value={synthParams().clap.tone}
                  min={CLAP_RANGES.tone.min}
                  max={CLAP_RANGES.tone.max}
                  step={CLAP_RANGES.tone.step}
                  unit="%"
                  onChange={(v) => updateParam('clap', 'tone', v)}
                />
                <ParamSlider
                  label={getParamLabel('reverb')}
                  value={synthParams().clap.reverb}
                  min={CLAP_RANGES.reverb.min}
                  max={CLAP_RANGES.reverb.max}
                  step={CLAP_RANGES.reverb.step}
                  unit="%"
                  onChange={(v) => updateParam('clap', 'reverb', v)}
                />
              </Show>

              {/* Tom Parameters */}
              <Show when={selectedDrum() === 'tom'}>
                <ParamSlider
                  label={getParamLabel('pitch')}
                  value={synthParams().tom.pitch}
                  min={TOM_RANGES.pitch.min}
                  max={TOM_RANGES.pitch.max}
                  step={TOM_RANGES.pitch.step}
                  unit="Hz"
                  onChange={(v) => updateParam('tom', 'pitch', v)}
                />
                <ParamSlider
                  label={getParamLabel('pitchDecay')}
                  value={synthParams().tom.pitchDecay}
                  min={TOM_RANGES.pitchDecay.min}
                  max={TOM_RANGES.pitchDecay.max}
                  step={TOM_RANGES.pitchDecay.step}
                  unit="%"
                  onChange={(v) => updateParam('tom', 'pitchDecay', v)}
                />
                <ParamSlider
                  label={getParamLabel('decay')}
                  value={synthParams().tom.decay}
                  min={TOM_RANGES.decay.min}
                  max={TOM_RANGES.decay.max}
                  step={TOM_RANGES.decay.step}
                  unit="s"
                  onChange={(v) => updateParam('tom', 'decay', v)}
                />
                <ParamSlider
                  label={getParamLabel('body')}
                  value={synthParams().tom.body}
                  min={TOM_RANGES.body.min}
                  max={TOM_RANGES.body.max}
                  step={TOM_RANGES.body.step}
                  unit="%"
                  onChange={(v) => updateParam('tom', 'body', v)}
                />
                <ParamSlider
                  label={getParamLabel('attack')}
                  value={synthParams().tom.attack}
                  min={TOM_RANGES.attack.min}
                  max={TOM_RANGES.attack.max}
                  step={TOM_RANGES.attack.step}
                  unit="%"
                  onChange={(v) => updateParam('tom', 'attack', v)}
                />
              </Show>

              {/* Rim Parameters */}
              <Show when={selectedDrum() === 'rim'}>
                <ParamSlider
                  label={getParamLabel('pitch')}
                  value={synthParams().rim.pitch}
                  min={RIM_RANGES.pitch.min}
                  max={RIM_RANGES.pitch.max}
                  step={RIM_RANGES.pitch.step}
                  unit="Hz"
                  onChange={(v) => updateParam('rim', 'pitch', v)}
                />
                <ParamSlider
                  label={getParamLabel('decay')}
                  value={synthParams().rim.decay}
                  min={RIM_RANGES.decay.min}
                  max={RIM_RANGES.decay.max}
                  step={RIM_RANGES.decay.step}
                  unit="s"
                  onChange={(v) => updateParam('rim', 'decay', v)}
                />
                <ParamSlider
                  label={getParamLabel('metallic')}
                  value={synthParams().rim.metallic}
                  min={RIM_RANGES.metallic.min}
                  max={RIM_RANGES.metallic.max}
                  step={RIM_RANGES.metallic.step}
                  unit="%"
                  onChange={(v) => updateParam('rim', 'metallic', v)}
                />
                <ParamSlider
                  label={getParamLabel('body')}
                  value={synthParams().rim.body}
                  min={RIM_RANGES.body.min}
                  max={RIM_RANGES.body.max}
                  step={RIM_RANGES.body.step}
                  unit="%"
                  onChange={(v) => updateParam('rim', 'body', v)}
                />
                <ParamSlider
                  label={getParamLabel('click')}
                  value={synthParams().rim.click}
                  min={RIM_RANGES.click.min}
                  max={RIM_RANGES.click.max}
                  step={RIM_RANGES.click.step}
                  unit="%"
                  onChange={(v) => updateParam('rim', 'click', v)}
                />
              </Show>
            </div>

            {/* Master Volume */}
            <div class="drum-tool-master">
              <ParamSlider
                label={getParamLabel('volume')}
                value={synthParams().master.volume}
                min={MASTER_RANGES.volume.min}
                max={MASTER_RANGES.volume.max}
                step={MASTER_RANGES.volume.step}
                unit="%"
                onChange={(v) => updateParam('master', 'volume', v)}
              />
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};
