<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import './DrumSynth.css';

  let audioContext: AudioContext | null = null;

  $: drumSynth = $t.drumSynth;

  // Parameters for each drum type
  let kickParams = { pitchStart: 150, pitchEnd: 40, pitchDecay: 0.1, ampDecay: 0.3, volume: 80 };
  let snareParams = { toneFreq: 200, toneDecay: 0.1, noiseDecay: 0.15, volume: 80 };
  let hihatParams = { filterFreq: 8000, decay: 0.05, volume: 60 };
  let clapParams = { filterFreq: 1000, decay: 0.1, spread: 0.02, volume: 70 };

  const drumTypes = ['kick', 'snare', 'hihat', 'clap'] as const;
  type DrumType = typeof drumTypes[number];

  function initAudio() {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  }

  function playKick() {
    const ctx = initAudio();
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = snareParams.toneFreq;
    gain.gain.setValueAtTime(snareParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + snareParams.noiseDecay);
    osc.type = 'triangle';

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + snareParams.noiseDecay);
  }

  function playHihat() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = hihatParams.filterFreq;
    gain.gain.setValueAtTime(hihatParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + hihatParams.decay);
    osc.type = 'square';

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + hihatParams.decay);
  }

  function playClap() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = clapParams.filterFreq;
    gain.gain.setValueAtTime(clapParams.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + clapParams.decay);
    osc.type = 'sawtooth';

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + clapParams.decay);
  }

  function playDrum(type: DrumType) {
    switch (type) {
      case 'kick': playKick(); break;
      case 'snare': playSnare(); break;
      case 'hihat': playHihat(); break;
      case 'clap': playClap(); break;
    }
  }

  onDestroy(() => {
    if (audioContext) {
      audioContext.close();
    }
  });
</script>

<div class="drum-synth">
  <!-- Quick Play -->
  <div class="drum-synth-section">
    <h3>{drumSynth.quickPlay}</h3>
    <div class="drum-synth-pads">
      {#each drumTypes as type}
        <button class="drum-pad drum-pad-{type}" on:click={() => playDrum(type)}>
          {drumSynth[type]}
        </button>
      {/each}
    </div>
  </div>

  <!-- Kick Parameters -->
  <div class="drum-synth-section">
    <h3>{drumSynth.kick} {drumSynth.parameters}</h3>
    <div class="param-group">
      <label>{drumSynth.pitchStart}: {kickParams.pitchStart} Hz</label>
      <input type="range" min="50" max="300" bind:value={kickParams.pitchStart} />
    </div>
    <div class="param-group">
      <label>{drumSynth.pitchEnd}: {kickParams.pitchEnd} Hz</label>
      <input type="range" min="20" max="100" bind:value={kickParams.pitchEnd} />
    </div>
    <div class="param-group">
      <label>{drumSynth.ampDecay}: {kickParams.ampDecay}s</label>
      <input type="range" min="0.1" max="1" step="0.05" bind:value={kickParams.ampDecay} />
    </div>
    <div class="param-group">
      <label>{drumSynth.volume}: {kickParams.volume}%</label>
      <input type="range" min="0" max="100" bind:value={kickParams.volume} />
    </div>
  </div>

  <!-- Snare Parameters -->
  <div class="drum-synth-section">
    <h3>{drumSynth.snare} {drumSynth.parameters}</h3>
    <div class="param-group">
      <label>{drumSynth.toneFreq}: {snareParams.toneFreq} Hz</label>
      <input type="range" min="100" max="400" bind:value={snareParams.toneFreq} />
    </div>
    <div class="param-group">
      <label>{drumSynth.noiseDecay}: {snareParams.noiseDecay}s</label>
      <input type="range" min="0.05" max="0.5" step="0.01" bind:value={snareParams.noiseDecay} />
    </div>
    <div class="param-group">
      <label>{drumSynth.volume}: {snareParams.volume}%</label>
      <input type="range" min="0" max="100" bind:value={snareParams.volume} />
    </div>
  </div>

  <!-- Hihat Parameters -->
  <div class="drum-synth-section">
    <h3>{drumSynth.hihat} {drumSynth.parameters}</h3>
    <div class="param-group">
      <label>{drumSynth.filterFreq}: {hihatParams.filterFreq} Hz</label>
      <input type="range" min="4000" max="12000" bind:value={hihatParams.filterFreq} />
    </div>
    <div class="param-group">
      <label>{drumSynth.decay}: {hihatParams.decay}s</label>
      <input type="range" min="0.01" max="0.2" step="0.01" bind:value={hihatParams.decay} />
    </div>
    <div class="param-group">
      <label>{drumSynth.volume}: {hihatParams.volume}%</label>
      <input type="range" min="0" max="100" bind:value={hihatParams.volume} />
    </div>
  </div>

  <!-- Clap Parameters -->
  <div class="drum-synth-section">
    <h3>{drumSynth.clap} {drumSynth.parameters}</h3>
    <div class="param-group">
      <label>{drumSynth.filterFreq}: {clapParams.filterFreq} Hz</label>
      <input type="range" min="500" max="2000" bind:value={clapParams.filterFreq} />
    </div>
    <div class="param-group">
      <label>{drumSynth.decay}: {clapParams.decay}s</label>
      <input type="range" min="0.05" max="0.3" step="0.01" bind:value={clapParams.decay} />
    </div>
    <div class="param-group">
      <label>{drumSynth.volume}: {clapParams.volume}%</label>
      <input type="range" min="0" max="100" bind:value={clapParams.volume} />
    </div>
  </div>
</div>
