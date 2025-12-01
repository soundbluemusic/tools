<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import './DrumMachine.css';

  let isPlaying = false;
  let tempo = 120;
  let currentStep = 0;
  let volume = 80;
  let audioContext: AudioContext | null = null;
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;

  $: drum = $t.drum;

  // 16-step patterns for each instrument
  let patterns: Record<string, boolean[]> = {
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    openhat: Array(16).fill(false),
    clap: Array(16).fill(false),
  };

  const instruments = [
    { id: 'kick', name: () => drum.kick },
    { id: 'snare', name: () => drum.snare },
    { id: 'hihat', name: () => drum.hihat },
    { id: 'openhat', name: () => drum.openhat },
    { id: 'clap', name: () => drum.clap },
  ];

  function initAudio() {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  }

  function playSound(instrument: string) {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Simple synthesis based on instrument type
    switch (instrument) {
      case 'kick':
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(volume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.type = 'sine';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'snare':
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(volume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.type = 'triangle';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        break;
      case 'hihat':
        osc.frequency.value = 8000;
        gain.gain.setValueAtTime((volume / 100) * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.type = 'square';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
      case 'openhat':
        osc.frequency.value = 8000;
        gain.gain.setValueAtTime((volume / 100) * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.type = 'square';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'clap':
        osc.frequency.value = 1000;
        gain.gain.setValueAtTime((volume / 100) * 0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.type = 'sawtooth';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        break;
    }
  }

  function scheduler() {
    // Play sounds for current step
    for (const [instrument, pattern] of Object.entries(patterns)) {
      if (pattern[currentStep]) {
        playSound(instrument);
      }
    }
    currentStep = (currentStep + 1) % 16;
  }

  function play() {
    initAudio();
    audioContext?.resume();
    currentStep = 0;
    isPlaying = true;
    const intervalMs = (60 / tempo / 4) * 1000; // 16th notes
    schedulerInterval = setInterval(scheduler, intervalMs);
  }

  function stop() {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    isPlaying = false;
    currentStep = 0;
  }

  function clear() {
    stop();
    patterns = {
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      openhat: Array(16).fill(false),
      clap: Array(16).fill(false),
    };
  }

  function toggleStep(instrument: string, step: number) {
    patterns[instrument][step] = !patterns[instrument][step];
    patterns = patterns; // Trigger reactivity
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
    {#if isPlaying}
      <button class="drum-btn drum-btn-stop" on:click={stop}>
        {drum.stop}
      </button>
    {:else}
      <button class="drum-btn drum-btn-play" on:click={play}>
        {drum.play}
      </button>
    {/if}
    <button class="drum-btn drum-btn-clear" on:click={clear}>
      {drum.clear}
    </button>
  </div>

  <!-- Tempo Control -->
  <div class="drum-tempo">
    <label>{drum.tempo}: {tempo} BPM</label>
    <input
      type="range"
      min="60"
      max="200"
      bind:value={tempo}
      disabled={isPlaying}
      class="drum-slider"
    />
  </div>

  <!-- Volume Control -->
  <div class="drum-volume">
    <label>{drum.volume}: {volume}%</label>
    <input
      type="range"
      min="0"
      max="100"
      bind:value={volume}
      class="drum-slider"
    />
  </div>

  <!-- Pattern Grid -->
  <div class="drum-grid">
    {#each instruments as instrument}
      <div class="drum-row">
        <span class="drum-instrument">{instrument.name()}</span>
        <div class="drum-steps">
          {#each patterns[instrument.id] as active, step}
            <button
              class="drum-step"
              class:active
              class:current={currentStep === step && isPlaying}
              class:beat-marker={step % 4 === 0}
              on:click={() => toggleStep(instrument.id, step)}
            >
              {step + 1}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Info -->
  <p class="drum-info">{drum.synthesisInfo}</p>
</div>
