<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import './DrumSynth.css';

  let audioContext: AudioContext | null = null;

  $: drumSynth = $t.drumSynth;

  // Selected drum type
  type DrumType = 'kick' | 'snare' | 'hihat' | 'clap';
  let selectedDrum: DrumType = 'kick';
  let playingDrum: DrumType | null = null;

  // Parameters for each drum type
  let kickParams = { pitchStart: 150, pitchEnd: 40, pitchDecay: 0.1, ampDecay: 0.3, volume: 80 };
  let snareParams = { toneFreq: 200, toneDecay: 0.1, noiseDecay: 0.15, volume: 80 };
  let hihatParams = { filterFreq: 8000, decay: 0.05, volume: 60 };
  let clapParams = { filterFreq: 1000, decay: 0.1, spread: 0.02, volume: 70 };

  const drumTypes: DrumType[] = ['kick', 'snare', 'hihat', 'clap'];

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  }

  function playKick() {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(kickParams.pitchStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(kickParams.pitchEnd, ctx.currentTime + kickParams.pitchDecay);
    gain.gain.setValueAtTime(kickParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + kickParams.ampDecay);
    osc.type = 'sine';

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + kickParams.ampDecay);
  }

  function playSnare() {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.frequency.value = snareParams.toneFreq;
    oscGain.gain.setValueAtTime(snareParams.volume / 200, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + snareParams.toneDecay);
    osc.type = 'triangle';
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + snareParams.toneDecay);

    // Noise component
    const buffer = ctx.createBuffer(1, ctx.sampleRate * snareParams.noiseDecay, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const noiseGain = ctx.createGain();
    source.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(snareParams.volume / 100, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + snareParams.noiseDecay);
    source.start(ctx.currentTime);
  }

  function playHihat() {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    const buffer = ctx.createBuffer(1, ctx.sampleRate * hihatParams.decay, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hihatParams.filterFreq;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(hihatParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + hihatParams.decay);
    source.start(ctx.currentTime);
  }

  function playClap() {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    const buffer = ctx.createBuffer(1, ctx.sampleRate * clapParams.decay, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = clapParams.filterFreq;
    filter.Q.value = 1;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(clapParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + clapParams.decay);
    source.start(ctx.currentTime);
  }

  function playDrum(type: DrumType) {
    playingDrum = type;
    setTimeout(() => playingDrum = null, 100);

    switch (type) {
      case 'kick': playKick(); break;
      case 'snare': playSnare(); break;
      case 'hihat': playHihat(); break;
      case 'clap': playClap(); break;
    }
  }

  function getDrumLabel(type: DrumType): string {
    return drumSynth[type] || type;
  }

  function resetParams() {
    switch (selectedDrum) {
      case 'kick':
        kickParams = { pitchStart: 150, pitchEnd: 40, pitchDecay: 0.1, ampDecay: 0.3, volume: 80 };
        break;
      case 'snare':
        snareParams = { toneFreq: 200, toneDecay: 0.1, noiseDecay: 0.15, volume: 80 };
        break;
      case 'hihat':
        hihatParams = { filterFreq: 8000, decay: 0.05, volume: 60 };
        break;
      case 'clap':
        clapParams = { filterFreq: 1000, decay: 0.1, spread: 0.02, volume: 70 };
        break;
    }
  }

  onDestroy(() => {
    if (audioContext) {
      audioContext.close();
    }
  });
</script>

<div class="drum-synth">
  <!-- Quick Play Pads -->
  <div class="synth-pads">
    <span class="synth-pads-label">{drumSynth.quickPlay}</span>
    <div class="synth-pads-grid">
      {#each drumTypes as type}
        <button
          class="synth-pad"
          class:synth-pad--playing={playingDrum === type}
          on:click={() => playDrum(type)}
        >
          {getDrumLabel(type)}
        </button>
      {/each}
    </div>
  </div>

  <!-- Drum Type Selector -->
  <div class="synth-selector">
    {#each drumTypes as type}
      <button
        class="synth-drum-btn"
        class:synth-drum-btn--selected={selectedDrum === type}
        on:click={() => selectedDrum = type}
      >
        {getDrumLabel(type)}
      </button>
    {/each}
  </div>

  <!-- Parameters Section -->
  <div class="synth-content">
    <div class="synth-params">
      <div class="synth-params-header">
        <h3 class="synth-params-title">{getDrumLabel(selectedDrum)} {drumSynth.parameters}</h3>
        <button class="synth-reset-btn" on:click={resetParams} aria-label="Reset">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <div class="synth-params-grid">
        {#if selectedDrum === 'kick'}
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.pitchStart}</span>
              <span class="synth-param-value">{kickParams.pitchStart} Hz</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="50" max="300" bind:value={kickParams.pitchStart} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.pitchEnd}</span>
              <span class="synth-param-value">{kickParams.pitchEnd} Hz</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="20" max="100" bind:value={kickParams.pitchEnd} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.ampDecay}</span>
              <span class="synth-param-value">{kickParams.ampDecay.toFixed(2)}s</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0.1" max="1" step="0.05" bind:value={kickParams.ampDecay} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.volume}</span>
              <span class="synth-param-value">{kickParams.volume}%</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0" max="100" bind:value={kickParams.volume} />
            </div>
          </div>
        {:else if selectedDrum === 'snare'}
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.toneFreq}</span>
              <span class="synth-param-value">{snareParams.toneFreq} Hz</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="100" max="400" bind:value={snareParams.toneFreq} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.noiseDecay}</span>
              <span class="synth-param-value">{snareParams.noiseDecay.toFixed(2)}s</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0.05" max="0.5" step="0.01" bind:value={snareParams.noiseDecay} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.volume}</span>
              <span class="synth-param-value">{snareParams.volume}%</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0" max="100" bind:value={snareParams.volume} />
            </div>
          </div>
        {:else if selectedDrum === 'hihat'}
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.filterFreq}</span>
              <span class="synth-param-value">{hihatParams.filterFreq} Hz</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="4000" max="12000" bind:value={hihatParams.filterFreq} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.decay}</span>
              <span class="synth-param-value">{hihatParams.decay.toFixed(2)}s</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0.01" max="0.2" step="0.01" bind:value={hihatParams.decay} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.volume}</span>
              <span class="synth-param-value">{hihatParams.volume}%</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0" max="100" bind:value={hihatParams.volume} />
            </div>
          </div>
        {:else if selectedDrum === 'clap'}
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.filterFreq}</span>
              <span class="synth-param-value">{clapParams.filterFreq} Hz</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="500" max="2000" bind:value={clapParams.filterFreq} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.decay}</span>
              <span class="synth-param-value">{clapParams.decay.toFixed(2)}s</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0.05" max="0.3" step="0.01" bind:value={clapParams.decay} />
            </div>
          </div>
          <div class="synth-param">
            <div class="synth-param-header">
              <span class="synth-param-label">{drumSynth.volume}</span>
              <span class="synth-param-value">{clapParams.volume}%</span>
            </div>
            <div class="synth-param-slider-wrap">
              <input type="range" class="synth-param-slider" min="0" max="100" bind:value={clapParams.volume} />
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Play Button -->
    <div class="synth-play-section">
      <button
        class="synth-play-btn"
        class:synth-play-btn--playing={playingDrum === selectedDrum}
        on:click={() => playDrum(selectedDrum)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span>{drumSynth.play}</span>
      </button>
    </div>
  </div>
</div>
