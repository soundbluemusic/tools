<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { t } from '$lib/stores';
  import { cn } from '$lib/utils';
  import {
    DRUM_TYPES,
    KICK_RANGES, SNARE_RANGES, HIHAT_RANGES, CLAP_RANGES, TOM_RANGES, RIM_RANGES, MASTER_RANGES,
    DEFAULT_ALL_PARAMS, SYNTH_PRESETS,
    type DrumType, type AllDrumParams,
  } from './constants';
  import { exportDrum, exportAllDrums, type ExportFormat } from './utils/audioExport';

  let selectedDrum = $state<DrumType>('kick');
  let params = $state<AllDrumParams>({ ...DEFAULT_ALL_PARAMS });
  let isPlaying = $state<DrumType | null>(null);
  let isExporting = $state(false);
  let statusMessage = $state<{ text: string; type: 'success' | 'error' } | null>(null);
  let audioContext: AudioContext | null = null;

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) audioContext = new AudioContextClass();
    }
    return audioContext!;
  }

  function makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const k = (amount / 100) * 50;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function playKick() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const kickParams = params.kick;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = kickParams.tone > 50 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(kickParams.pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(kickParams.pitchEnd, 0.01), now + kickParams.pitchDecay);
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + kickParams.ampDecay);

    if (kickParams.click > 0) {
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(kickParams.pitchStart * 4, now);
      clickGain.gain.setValueAtTime((kickParams.click / 100) * volume * 0.3, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.01);
    }

    if (kickParams.drive > 0) {
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(kickParams.drive);
      distortion.oversample = '2x';
      osc.connect(distortion);
      distortion.connect(gainNode);
    } else {
      osc.connect(gainNode);
    }
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + kickParams.ampDecay + 0.1);
  }

  function playSnare() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const snareParams = params.snare;
    const toneMix = snareParams.toneMix / 100;

    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(snareParams.toneFreq, now);
    toneOsc.frequency.exponentialRampToValueAtTime(snareParams.toneFreq * 0.5, now + snareParams.toneDecay);
    toneGain.gain.setValueAtTime(volume * toneMix * 0.5, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.toneDecay);
    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(now);
    toneOsc.stop(now + snareParams.toneDecay + 0.1);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * snareParams.noiseDecay, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(snareParams.noiseFilter, now);
    noiseFilter.Q.setValueAtTime(snareParams.snappy / 20, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * (1 - toneMix) * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.noiseDecay);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
  }

  function playHihat() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const hihatParams = params.hihat;
    const actualDecay = hihatParams.decay + (hihatParams.openness / 100) * 0.3;
    const numOscs = 6;
    const baseFreq = 4000 + (hihatParams.pitch / 100) * 4000;
    const ratios = [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523];

    for (let i = 0; i < numOscs; i++) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq * ratios[i], now);
      oscGain.gain.setValueAtTime((volume * 0.08) / numOscs, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(hihatParams.filterFreq, now);
      filter.Q.setValueAtTime(hihatParams.filterQ, now);
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + actualDecay + 0.1);
    }

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * actualDecay, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(hihatParams.filterFreq, now);
    noiseFilter.Q.setValueAtTime(hihatParams.filterQ + hihatParams.ring / 50, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
  }

  function playClap() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const clapParams = params.clap;
    const numClaps = Math.floor(3 + (clapParams.spread / 100) * 5);
    const baseSpacing = 0.008;

    for (let c = 0; c < numClaps; c++) {
      const randomOffset = (Math.random() - 0.5) * 0.006;
      const clapTime = now + c * baseSpacing * (1 + clapParams.spread / 200) + randomOffset;
      const hitDuration = clapParams.decay * (0.7 + Math.random() * 0.3);
      const bufferLength = Math.max(ctx.sampleRate * hitDuration, ctx.sampleRate * 0.1);
      const noiseBuffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        const t = i / ctx.sampleRate;
        noiseData[i] = (Math.random() * 2 - 1) * Math.min(1, t / 0.002) * Math.exp(-t / (hitDuration * 0.3));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime((clapParams.filterFreq + (clapParams.tone / 100) * 800) * (1 + (Math.random() - 0.5) * 0.2), clapTime);
      bpFilter.Q.setValueAtTime(clapParams.filterQ * 0.8, clapTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.35 * (c === 0 ? 1 : 0.6 + Math.random() * 0.3) * Math.pow(0.85, c), clapTime);
      noiseSource.connect(bpFilter);
      bpFilter.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start(clapTime);
    }
  }

  function playTom() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const tomParams = params.tom;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    const pitchDrop = (tomParams.pitchDecay / 100) * tomParams.pitch * 0.3;
    osc.frequency.setValueAtTime(tomParams.pitch, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(tomParams.pitch - pitchDrop, 20), now + tomParams.decay * 0.3);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.005 + (1 - tomParams.attack / 100) * 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomParams.decay);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + tomParams.decay + 0.1);
  }

  function playRim() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = params.master.volume / 100;
    const rimParams = params.rim;

    if (rimParams.click > 0) {
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(rimParams.pitch * 2, now);
      clickGain.gain.setValueAtTime((rimParams.click / 100) * volume * 0.4, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.01);
    }

    const metalOsc = ctx.createOscillator();
    const metalGain = ctx.createGain();
    metalOsc.type = 'triangle';
    metalOsc.frequency.setValueAtTime(rimParams.pitch, now);
    metalGain.gain.setValueAtTime((rimParams.metallic / 100) * volume * 0.5, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + rimParams.decay);
    const metalFilter = ctx.createBiquadFilter();
    metalFilter.type = 'bandpass';
    metalFilter.frequency.setValueAtTime(rimParams.pitch, now);
    metalFilter.Q.setValueAtTime(5, now);
    metalOsc.connect(metalFilter);
    metalFilter.connect(metalGain);
    metalGain.connect(ctx.destination);
    metalOsc.start(now);
    metalOsc.stop(now + rimParams.decay + 0.1);
  }

  function playDrum(drumType: DrumType) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    isPlaying = drumType;
    setTimeout(() => (isPlaying = null), 150);

    switch (drumType) {
      case 'kick': playKick(); break;
      case 'snare': playSnare(); break;
      case 'hihat': playHihat(); break;
      case 'clap': playClap(); break;
      case 'tom': playTom(); break;
      case 'rim': playRim(); break;
    }
  }

  function updateKickParam(param: keyof typeof params.kick, value: number) {
    params.kick = { ...params.kick, [param]: value };
  }

  function updateSnareParam(param: keyof typeof params.snare, value: number) {
    params.snare = { ...params.snare, [param]: value };
  }

  function updateHihatParam(param: keyof typeof params.hihat, value: number) {
    params.hihat = { ...params.hihat, [param]: value };
  }

  function updateClapParam(param: keyof typeof params.clap, value: number) {
    params.clap = { ...params.clap, [param]: value };
  }

  function updateTomParam(param: keyof typeof params.tom, value: number) {
    params.tom = { ...params.tom, [param]: value };
  }

  function updateRimParam(param: keyof typeof params.rim, value: number) {
    params.rim = { ...params.rim, [param]: value };
  }

  function updateMasterParam(param: keyof typeof params.master, value: number) {
    params.master = { ...params.master, [param]: value };
  }

  function resetParams() {
    params = { ...DEFAULT_ALL_PARAMS };
  }

  function loadPreset(presetName: string) {
    const preset = SYNTH_PRESETS[presetName];
    if (preset) params = { ...preset };
  }

  function showStatus(text: string, type: 'success' | 'error') {
    statusMessage = { text, type };
    setTimeout(() => (statusMessage = null), 3000);
  }

  async function handleExport(format: ExportFormat) {
    if (isExporting) return;
    isExporting = true;
    try {
      await exportDrum(selectedDrum, params, format);
      showStatus($t.drumSynth.exportSuccess, 'success');
    } catch {
      showStatus($t.drumSynth.exportError, 'error');
    } finally {
      isExporting = false;
    }
  }

  async function handleExportAll(format: ExportFormat) {
    if (isExporting) return;
    isExporting = true;
    try {
      await exportAllDrums(params, format);
      showStatus($t.drumSynth.exportSuccess, 'success');
    } catch {
      showStatus($t.drumSynth.exportError, 'error');
    } finally {
      isExporting = false;
    }
  }

  function getDrumLabel(drum: DrumType): string {
    const labels: Record<DrumType, string> = {
      kick: $t.drumSynth.kick, snare: $t.drumSynth.snare, hihat: $t.drumSynth.hihat,
      clap: $t.drumSynth.clap, tom: $t.drumSynth.tom, rim: $t.drumSynth.rim,
    };
    return labels[drum];
  }

  onDestroy(() => { if (audioContext) audioContext.close(); });
</script>

<div class="drum-synth">
  <!-- Quick Play Pads -->
  <div class="synth-pads">
    <span class="synth-pads-label">{$t.drumSynth.quickPlay}</span>
    <div class="synth-pads-grid">
      {#each DRUM_TYPES as drum}
        <button class={cn('synth-pad', isPlaying === drum && 'synth-pad--playing')} onclick={() => playDrum(drum)} aria-label={getDrumLabel(drum)}>
          {getDrumLabel(drum)}
        </button>
      {/each}
    </div>
  </div>

  <!-- Drum Type Selector -->
  <div class="synth-selector">
    {#each DRUM_TYPES as drum}
      <button class={cn('synth-drum-btn', selectedDrum === drum && 'synth-drum-btn--selected', isPlaying === drum && 'synth-drum-btn--playing')} onclick={() => (selectedDrum = drum)}>
        {getDrumLabel(drum)}
      </button>
    {/each}
  </div>

  <!-- Main Content -->
  <div class="synth-content">
    <div class="synth-params">
      <div class="synth-params-header">
        <h3 class="synth-params-title">{getDrumLabel(selectedDrum)} {$t.drumSynth.parameters}</h3>
        <button class="synth-reset-btn" onclick={resetParams} aria-label={$t.drumSynth.reset}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
      </div>
      <div class="synth-params-grid">
        {#if selectedDrum === 'kick'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitchStart}</span><span class="synth-param-value">{params.kick.pitchStart}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.pitchStart.min} max={KICK_RANGES.pitchStart.max} step={KICK_RANGES.pitchStart.step} bind:value={params.kick.pitchStart} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitchEnd}</span><span class="synth-param-value">{params.kick.pitchEnd}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.pitchEnd.min} max={KICK_RANGES.pitchEnd.max} step={KICK_RANGES.pitchEnd.step} bind:value={params.kick.pitchEnd} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitchDecay}</span><span class="synth-param-value">{params.kick.pitchDecay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.pitchDecay.min} max={KICK_RANGES.pitchDecay.max} step={KICK_RANGES.pitchDecay.step} bind:value={params.kick.pitchDecay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.ampDecay}</span><span class="synth-param-value">{params.kick.ampDecay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.ampDecay.min} max={KICK_RANGES.ampDecay.max} step={KICK_RANGES.ampDecay.step} bind:value={params.kick.ampDecay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.click}</span><span class="synth-param-value">{params.kick.click}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.click.min} max={KICK_RANGES.click.max} step={KICK_RANGES.click.step} bind:value={params.kick.click} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.drive}</span><span class="synth-param-value">{params.kick.drive}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.drive.min} max={KICK_RANGES.drive.max} step={KICK_RANGES.drive.step} bind:value={params.kick.drive} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.tone}</span><span class="synth-param-value">{params.kick.tone}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={KICK_RANGES.tone.min} max={KICK_RANGES.tone.max} step={KICK_RANGES.tone.step} bind:value={params.kick.tone} /></div></div>
        {:else if selectedDrum === 'snare'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.toneFreq}</span><span class="synth-param-value">{params.snare.toneFreq}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.toneFreq.min} max={SNARE_RANGES.toneFreq.max} step={SNARE_RANGES.toneFreq.step} bind:value={params.snare.toneFreq} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.toneDecay}</span><span class="synth-param-value">{params.snare.toneDecay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.toneDecay.min} max={SNARE_RANGES.toneDecay.max} step={SNARE_RANGES.toneDecay.step} bind:value={params.snare.toneDecay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.noiseDecay}</span><span class="synth-param-value">{params.snare.noiseDecay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.noiseDecay.min} max={SNARE_RANGES.noiseDecay.max} step={SNARE_RANGES.noiseDecay.step} bind:value={params.snare.noiseDecay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.noiseFilter}</span><span class="synth-param-value">{params.snare.noiseFilter}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.noiseFilter.min} max={SNARE_RANGES.noiseFilter.max} step={SNARE_RANGES.noiseFilter.step} bind:value={params.snare.noiseFilter} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.toneMix}</span><span class="synth-param-value">{params.snare.toneMix}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.toneMix.min} max={SNARE_RANGES.toneMix.max} step={SNARE_RANGES.toneMix.step} bind:value={params.snare.toneMix} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.snappy}</span><span class="synth-param-value">{params.snare.snappy}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={SNARE_RANGES.snappy.min} max={SNARE_RANGES.snappy.max} step={SNARE_RANGES.snappy.step} bind:value={params.snare.snappy} /></div></div>
        {:else if selectedDrum === 'hihat'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.filterFreq}</span><span class="synth-param-value">{params.hihat.filterFreq}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.filterFreq.min} max={HIHAT_RANGES.filterFreq.max} step={HIHAT_RANGES.filterFreq.step} bind:value={params.hihat.filterFreq} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.filterQ}</span><span class="synth-param-value">{params.hihat.filterQ.toFixed(1)}</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.filterQ.min} max={HIHAT_RANGES.filterQ.max} step={HIHAT_RANGES.filterQ.step} bind:value={params.hihat.filterQ} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.decay}</span><span class="synth-param-value">{params.hihat.decay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.decay.min} max={HIHAT_RANGES.decay.max} step={HIHAT_RANGES.decay.step} bind:value={params.hihat.decay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.openness}</span><span class="synth-param-value">{params.hihat.openness}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.openness.min} max={HIHAT_RANGES.openness.max} step={HIHAT_RANGES.openness.step} bind:value={params.hihat.openness} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitch}</span><span class="synth-param-value">{params.hihat.pitch}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.pitch.min} max={HIHAT_RANGES.pitch.max} step={HIHAT_RANGES.pitch.step} bind:value={params.hihat.pitch} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.ring}</span><span class="synth-param-value">{params.hihat.ring}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={HIHAT_RANGES.ring.min} max={HIHAT_RANGES.ring.max} step={HIHAT_RANGES.ring.step} bind:value={params.hihat.ring} /></div></div>
        {:else if selectedDrum === 'clap'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.filterFreq}</span><span class="synth-param-value">{params.clap.filterFreq}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.filterFreq.min} max={CLAP_RANGES.filterFreq.max} step={CLAP_RANGES.filterFreq.step} bind:value={params.clap.filterFreq} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.filterQ}</span><span class="synth-param-value">{params.clap.filterQ.toFixed(1)}</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.filterQ.min} max={CLAP_RANGES.filterQ.max} step={CLAP_RANGES.filterQ.step} bind:value={params.clap.filterQ} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.decay}</span><span class="synth-param-value">{params.clap.decay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.decay.min} max={CLAP_RANGES.decay.max} step={CLAP_RANGES.decay.step} bind:value={params.clap.decay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.spread}</span><span class="synth-param-value">{params.clap.spread}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.spread.min} max={CLAP_RANGES.spread.max} step={CLAP_RANGES.spread.step} bind:value={params.clap.spread} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.tone}</span><span class="synth-param-value">{params.clap.tone}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.tone.min} max={CLAP_RANGES.tone.max} step={CLAP_RANGES.tone.step} bind:value={params.clap.tone} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.reverb}</span><span class="synth-param-value">{params.clap.reverb}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={CLAP_RANGES.reverb.min} max={CLAP_RANGES.reverb.max} step={CLAP_RANGES.reverb.step} bind:value={params.clap.reverb} /></div></div>
        {:else if selectedDrum === 'tom'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitch}</span><span class="synth-param-value">{params.tom.pitch}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={TOM_RANGES.pitch.min} max={TOM_RANGES.pitch.max} step={TOM_RANGES.pitch.step} bind:value={params.tom.pitch} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitchDecay}</span><span class="synth-param-value">{params.tom.pitchDecay}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={TOM_RANGES.pitchDecay.min} max={TOM_RANGES.pitchDecay.max} step={TOM_RANGES.pitchDecay.step} bind:value={params.tom.pitchDecay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.decay}</span><span class="synth-param-value">{params.tom.decay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={TOM_RANGES.decay.min} max={TOM_RANGES.decay.max} step={TOM_RANGES.decay.step} bind:value={params.tom.decay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.body}</span><span class="synth-param-value">{params.tom.body}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={TOM_RANGES.body.min} max={TOM_RANGES.body.max} step={TOM_RANGES.body.step} bind:value={params.tom.body} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.attack}</span><span class="synth-param-value">{params.tom.attack}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={TOM_RANGES.attack.min} max={TOM_RANGES.attack.max} step={TOM_RANGES.attack.step} bind:value={params.tom.attack} /></div></div>
        {:else if selectedDrum === 'rim'}
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.pitch}</span><span class="synth-param-value">{params.rim.pitch}Hz</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={RIM_RANGES.pitch.min} max={RIM_RANGES.pitch.max} step={RIM_RANGES.pitch.step} bind:value={params.rim.pitch} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.decay}</span><span class="synth-param-value">{params.rim.decay.toFixed(2)}s</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={RIM_RANGES.decay.min} max={RIM_RANGES.decay.max} step={RIM_RANGES.decay.step} bind:value={params.rim.decay} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.metallic}</span><span class="synth-param-value">{params.rim.metallic}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={RIM_RANGES.metallic.min} max={RIM_RANGES.metallic.max} step={RIM_RANGES.metallic.step} bind:value={params.rim.metallic} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.body}</span><span class="synth-param-value">{params.rim.body}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={RIM_RANGES.body.min} max={RIM_RANGES.body.max} step={RIM_RANGES.body.step} bind:value={params.rim.body} /></div></div>
          <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.click}</span><span class="synth-param-value">{params.rim.click}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={RIM_RANGES.click.min} max={RIM_RANGES.click.max} step={RIM_RANGES.click.step} bind:value={params.rim.click} /></div></div>
        {/if}
      </div>
    </div>

    <div class="synth-play-section">
      <button class={cn('synth-play-btn', isPlaying === selectedDrum && 'synth-play-btn--playing')} onclick={() => playDrum(selectedDrum)} aria-label={`${$t.drumSynth.play} ${getDrumLabel(selectedDrum)}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        <span>{$t.drumSynth.play}</span>
      </button>
    </div>
  </div>

  <!-- Master Section -->
  <div class="synth-master">
    <h3 class="synth-section-title">{$t.drumSynth.master}</h3>
    <div class="synth-param"><div class="synth-param-header"><span class="synth-param-label">{$t.drumSynth.volume}</span><span class="synth-param-value">{params.master.volume}%</span></div><div class="synth-param-slider-wrap"><input type="range" class="synth-param-slider" min={MASTER_RANGES.volume.min} max={MASTER_RANGES.volume.max} step={MASTER_RANGES.volume.step} bind:value={params.master.volume} /></div></div>
  </div>

  <!-- Presets -->
  <div class="synth-presets">
    <span class="synth-presets-label">{$t.drumSynth.presets}</span>
    <div class="synth-presets-buttons">
      <button class="synth-preset-btn" onclick={() => loadPreset('classic808')}>{$t.drumSynth.presetClassic808}</button>
      <button class="synth-preset-btn" onclick={() => loadPreset('hardTechno')}>{$t.drumSynth.presetHardTechno}</button>
      <button class="synth-preset-btn" onclick={() => loadPreset('lofi')}>{$t.drumSynth.presetLofi}</button>
      <button class="synth-preset-btn" onclick={() => loadPreset('minimal')}>{$t.drumSynth.presetMinimal}</button>
      <button class="synth-preset-btn" onclick={() => loadPreset('acoustic')}>{$t.drumSynth.presetAcoustic}</button>
    </div>
  </div>

  <!-- Export Section -->
  <div class="synth-export">
    <span class="synth-export-label">{$t.drumSynth.export}</span>
    <div class="synth-export-buttons">
      <button class={cn('synth-export-btn', isExporting && 'synth-export-btn--disabled')} onclick={() => handleExport('wav')} disabled={isExporting}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <span>{$t.drumSynth.exportWav}</span>
      </button>
      <button class={cn('synth-export-btn', 'synth-export-btn--all', isExporting && 'synth-export-btn--disabled')} onclick={() => handleExportAll('wav')} disabled={isExporting}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <span>{$t.drumSynth.exportAll}</span>
      </button>
    </div>
    {#if isExporting}
      <div class="synth-export-status">{$t.drumSynth.exporting}</div>
    {/if}
  </div>

  <!-- Status Message -->
  {#if statusMessage}
    <div class={cn('synth-status', `synth-status--${statusMessage.type}`)}>{statusMessage.text}</div>
  {/if}
</div>
