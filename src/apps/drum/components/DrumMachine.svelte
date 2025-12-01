<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import {
    STEPS,
    INSTRUMENTS,
    TEMPO_RANGE,
    VOLUME_RANGE,
    AUDIO,
    PRESETS,
    DEFAULT_VOLUMES,
    createEmptyPattern,
    copyPattern,
    type Instrument,
    type InstrumentVolumes,
    type Pattern,
  } from '../constants';
  import './DrumMachine.css';

  // State
  let pattern: Pattern = createEmptyPattern();
  let tempo = TEMPO_RANGE.DEFAULT;
  let volumes: InstrumentVolumes = { ...DEFAULT_VOLUMES };
  let isPlaying = false;
  let currentStep = 0;
  let statusMessage: { text: string; type: 'success' | 'error' | 'info' } | null = null;

  // Audio refs
  let audioContext: AudioContext | null = null;
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let nextStepTime = 0;
  let schedulerStep = 0;

  $: drum = $t.drum;

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  }

  function playSound(inst: Instrument, time: number, velocity: number = 100) {
    const ctx = audioContext;
    if (!ctx || velocity <= 0) return;

    const startTime = time;
    const volumeMultiplier = (volumes[inst] / 100) * (velocity / 100);

    switch (inst) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, startTime);
        osc.frequency.exponentialRampToValueAtTime(
          AUDIO.KICK.FREQUENCY_END,
          startTime + AUDIO.KICK.DURATION
        );
        gain.gain.setValueAtTime(AUDIO.KICK.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.KICK.DURATION);
        osc.start(startTime);
        osc.stop(startTime + AUDIO.KICK.DURATION);
        break;
      }
      case 'snare': {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * AUDIO.SNARE.DURATION, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.SNARE.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.SNARE.DURATION);
        source.start(startTime);
        break;
      }
      case 'hihat':
      case 'openhat': {
        const isOpen = inst === 'openhat';
        const duration = isOpen ? AUDIO.OPENHAT.DURATION : AUDIO.HIHAT.DURATION;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = isOpen ? AUDIO.OPENHAT.FILTER_FREQUENCY : AUDIO.HIHAT.FILTER_FREQUENCY;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(
          (isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN) * volumeMultiplier,
          startTime
        );
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        source.start(startTime);
        break;
      }
      case 'clap': {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * AUDIO.CLAP.DURATION, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.CLAP.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.CLAP.DURATION);
        source.start(startTime);
        break;
      }
    }
  }

  function scheduleStep(stepIndex: number, time: number) {
    INSTRUMENTS.forEach((inst) => {
      const velocity = pattern[inst][stepIndex];
      if (velocity > 0) {
        playSound(inst, time, velocity);
      }
    });
  }

  function scheduler() {
    const ctx = audioContext;
    if (!ctx || !isPlaying) return;

    const scheduleAheadTime = 0.1;
    const stepDuration = 60 / tempo / 4;

    while (nextStepTime < ctx.currentTime + scheduleAheadTime) {
      scheduleStep(schedulerStep, nextStepTime);

      const stepToShow = schedulerStep;
      const timeUntilStep = (nextStepTime - ctx.currentTime) * 1000;
      setTimeout(() => {
        currentStep = stepToShow;
      }, Math.max(0, timeUntilStep));

      schedulerStep = (schedulerStep + 1) % STEPS;
      nextStepTime += stepDuration;
    }
  }

  function play() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!isPlaying) {
      isPlaying = true;
      nextStepTime = ctx.currentTime;
      schedulerStep = currentStep;
      schedulerInterval = setInterval(scheduler, 25);
    } else {
      isPlaying = false;
      if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
      }
    }
  }

  function stop() {
    isPlaying = false;
    currentStep = 0;
    schedulerStep = 0;
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
  }

  function clear() {
    pattern = createEmptyPattern();
  }

  function showStatus(text: string, type: 'success' | 'error' | 'info') {
    statusMessage = { text, type };
    setTimeout(() => (statusMessage = null), 3000);
  }

  function toggleStep(inst: Instrument, step: number) {
    const currentValue = pattern[inst][step];
    pattern[inst][step] = currentValue > 0 ? 0 : 100;
    pattern = pattern;
  }

  function handleVolumeChange(inst: Instrument, value: number) {
    volumes[inst] = value;
    volumes = volumes;
  }

  function loadPreset(presetName: string) {
    const preset = PRESETS[presetName];
    if (preset) {
      pattern = copyPattern(preset);
      showStatus(drum.loadedPreset.replace('{preset}', presetName), 'success');
    }
  }

  function getInstrumentLabel(inst: Instrument): string {
    const labels: Record<Instrument, string> = {
      kick: drum.kick,
      snare: drum.snare,
      hihat: drum.hihat,
      openhat: drum.openhat,
      clap: drum.clap,
    };
    return labels[inst];
  }

  function getPresetLabel(preset: string): string {
    const labels: Record<string, string> = {
      techno: drum.presetTechno,
      house: drum.presetHouse,
      trap: drum.presetTrap,
      breakbeat: drum.presetBreakbeat,
      minimal: drum.presetMinimal,
    };
    return labels[preset] || preset;
  }

  onDestroy(() => {
    stop();
    if (audioContext) {
      audioContext.close();
    }
  });
</script>

<div class="drum-machine">
  <!-- Transport Controls -->
  <div class="drum-transport">
    <div class="drum-transport-controls">
      <button
        class="drum-btn"
        class:drum-btn--active={isPlaying}
        on:click={play}
        aria-label={isPlaying ? drum.pause : drum.play}
      >
        {#if isPlaying}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <span>{drum.pause}</span>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>{drum.play}</span>
        {/if}
      </button>
      <button class="drum-btn" on:click={stop} aria-label={drum.stop}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
        <span>{drum.stop}</span>
      </button>
      <button class="drum-btn" on:click={clear} aria-label={drum.clear}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
        <span>{drum.clear}</span>
      </button>
    </div>

    <div class="drum-tempo">
      <span class="drum-tempo-label">{drum.tempo}</span>
      <input
        type="range"
        class="drum-slider"
        min={TEMPO_RANGE.MIN}
        max={TEMPO_RANGE.MAX}
        bind:value={tempo}
        aria-label={drum.tempo}
      />
      <span class="drum-tempo-value">
        {tempo} BPM
        <span class="drum-tempo-duration">
          ({(240 / tempo).toFixed(1)}s)
        </span>
      </span>
    </div>
  </div>

  <!-- Sequencer Grid -->
  <div class="drum-sequencer">
    {#each INSTRUMENTS as inst}
      <div class="drum-track">
        <div class="drum-track-info">
          <div class="drum-track-label">{getInstrumentLabel(inst)}</div>
          <div class="drum-track-volume">
            <input
              type="range"
              class="drum-volume-slider"
              min={VOLUME_RANGE.MIN}
              max={VOLUME_RANGE.MAX}
              value={volumes[inst]}
              on:input={(e) => handleVolumeChange(inst, parseInt(e.currentTarget.value, 10))}
              aria-label="{getInstrumentLabel(inst)} {drum.volume}"
            />
            <span class="drum-volume-value">{volumes[inst]}</span>
          </div>
        </div>
        <div class="drum-track-steps">
          {#each Array(STEPS) as _, step}
            {@const velocity = pattern[inst][step]}
            {@const isActive = velocity > 0}
            {@const opacity = isActive ? 0.3 + (velocity / 100) * 0.7 : 1}
            <button
              class="drum-step"
              class:drum-step--active={isActive}
              class:drum-step--playing={isPlaying && currentStep === step}
              style={isActive ? `opacity: ${opacity}` : undefined}
              on:click={() => toggleStep(inst, step)}
              aria-label="{getInstrumentLabel(inst)} {drum.step} {step + 1}{isActive ? ` (${velocity}%)` : ''}"
              aria-pressed={isActive}
            ></button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Presets -->
  <div class="drum-presets">
    <span class="drum-presets-label">{drum.presets}</span>
    <div class="drum-presets-buttons">
      {#each Object.keys(PRESETS) as preset}
        <button class="drum-preset-btn" on:click={() => loadPreset(preset)}>
          {getPresetLabel(preset)}
        </button>
      {/each}
    </div>
  </div>

  <!-- Synthesis Info -->
  <div class="drum-synthesis-info">
    {drum.synthesisInfo}
  </div>

  <!-- Status Message -->
  {#if statusMessage}
    <div class="drum-status drum-status--{statusMessage.type}">
      {statusMessage.text}
    </div>
  {/if}
</div>
