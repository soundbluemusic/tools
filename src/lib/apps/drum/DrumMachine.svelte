<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { t } from '$lib/stores';
  import { cn } from '$lib/utils';
  import {
    STEPS,
    INSTRUMENTS,
    TEMPO_RANGE,
    VOLUME_RANGE,
    VELOCITY,
    AUDIO,
    PRESETS,
    DEFAULT_VOLUMES,
    MAX_LOOPS,
    createEmptyPattern,
    createInitialLoops,
    copyPattern,
    type Instrument,
    type InstrumentVolumes,
    type MultiLoopPattern,
    type Pattern,
  } from './constants';
  import { exportMidi } from './utils/midiExport';
  import { importMidiFile } from './utils/midiImport';

  // State
  let loops = $state<MultiLoopPattern>(createInitialLoops());
  let loopIds = $state<number[]>([1]);
  let nextLoopId = $state(2);
  let currentLoopIndex = $state(0);
  let tempo = $state(TEMPO_RANGE.DEFAULT);
  let volumes = $state<InstrumentVolumes>({ ...DEFAULT_VOLUMES });
  let isPlaying = $state(false);
  let currentStep = $state(0);
  let playingLoopIndex = $state(0);
  let statusMessage = $state<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  let dragLoopIndex = $state<number | null>(null);
  let dragOverLoopIndex = $state<number | null>(null);

  // Derived
  const displayLoopIndex = $derived(isPlaying ? playingLoopIndex : currentLoopIndex);
  const pattern = $derived(loops[displayLoopIndex]);

  // Refs
  let audioContext: AudioContext | null = null;
  let schedulerRef: number | null = null;
  let nextStepTimeRef = 0;
  let currentStepRef = 0;
  let currentPlayingLoopRef = 0;
  let isPlayingRef = false;
  let isDraggingRef = false;
  let paintModeRef: boolean | null = null;
  let fileInput: HTMLInputElement;
  let velocityDragRef: {
    inst: Instrument;
    step: number;
    startY: number;
    startVelocity: number;
    hasMoved: boolean;
  } | null = null;

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    return audioContext;
  }

  function playSound(inst: Instrument, time?: number, velocity: number = VELOCITY.DEFAULT) {
    const ctx = audioContext;
    if (!ctx || velocity <= 0) return;

    const startTime = time ?? ctx.currentTime;
    const volumeMultiplier = (volumes[inst] / 100) * (velocity / 100);

    switch (inst) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, startTime);
        osc.frequency.exponentialRampToValueAtTime(AUDIO.KICK.FREQUENCY_END, startTime + AUDIO.KICK.DURATION);
        gain.gain.setValueAtTime(AUDIO.KICK.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.KICK.DURATION);
        osc.start(startTime);
        osc.stop(startTime + AUDIO.KICK.DURATION);
        break;
      }
      case 'snare': {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * AUDIO.SNARE.DURATION, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
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
        gain.gain.setValueAtTime((isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN) * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        source.start(startTime);
        break;
      }
      case 'clap': {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * AUDIO.CLAP.DURATION, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
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

  function scheduleStep(stepIndex: number, loopIndex: number, time: number) {
    const currentPattern = loops[loopIndex];
    if (!currentPattern) return;
    INSTRUMENTS.forEach((inst) => {
      const velocity = currentPattern[inst][stepIndex];
      if (velocity > 0) playSound(inst, time, velocity);
    });
  }

  function scheduler() {
    const ctx = audioContext;
    if (!ctx || !isPlayingRef) return;

    const scheduleAheadTime = 0.1;
    const stepDuration = 60 / tempo / 4;

    while (nextStepTimeRef < ctx.currentTime + scheduleAheadTime) {
      scheduleStep(currentStepRef, currentPlayingLoopRef, nextStepTimeRef);

      const stepToShow = currentStepRef;
      const loopToShow = currentPlayingLoopRef;
      const timeUntilStep = (nextStepTimeRef - ctx.currentTime) * 1000;
      setTimeout(() => {
        currentStep = stepToShow;
        playingLoopIndex = loopToShow;
      }, Math.max(0, timeUntilStep));

      currentStepRef = currentStepRef + 1;

      if (currentStepRef >= STEPS) {
        currentStepRef = 0;
        currentPlayingLoopRef = (currentPlayingLoopRef + 1) % loops.length;
      }

      nextStepTimeRef += stepDuration;
    }

    schedulerRef = requestAnimationFrame(scheduler);
  }

  function play() {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!isPlaying) {
      if (ctx.state === 'suspended') ctx.resume();
      isPlaying = true;
      isPlayingRef = true;
      nextStepTimeRef = ctx.currentTime;
      currentStepRef = currentStep;
      schedulerRef = requestAnimationFrame(scheduler);
    } else {
      isPlaying = false;
      isPlayingRef = false;
      if (schedulerRef) {
        cancelAnimationFrame(schedulerRef);
        schedulerRef = null;
      }
    }
  }

  function stop() {
    isPlaying = false;
    isPlayingRef = false;
    currentStep = 0;
    currentStepRef = 0;
    playingLoopIndex = 0;
    currentPlayingLoopRef = 0;
    if (schedulerRef) {
      cancelAnimationFrame(schedulerRef);
      schedulerRef = null;
    }
  }

  function showStatus(text: string, type: 'success' | 'error' | 'info') {
    statusMessage = { text, type };
    setTimeout(() => (statusMessage = null), 3000);
  }

  function clear() {
    if (loops.length > 1) showStatus($t.drum.clearAllLoops, 'info');
    loops = createInitialLoops();
    loopIds = [1];
    nextLoopId = 2;
    currentLoopIndex = 0;
    playingLoopIndex = 0;
    currentPlayingLoopRef = 0;
  }

  function setStepVelocity(inst: Instrument, step: number, velocity: number) {
    const targetIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
    const newLoops = [...loops];
    const newPattern = { ...newLoops[targetIndex] };
    newPattern[inst] = newPattern[inst].map((val, i) => (i === step ? velocity : val));
    newLoops[targetIndex] = newPattern;
    loops = newLoops;
  }

  function handleStepMouseDown(inst: Instrument, step: number, clientY: number) {
    const currentValue = pattern[inst][step];
    if (currentValue > 0) {
      velocityDragRef = { inst, step, startY: clientY, startVelocity: currentValue, hasMoved: false };
      isDraggingRef = false;
      paintModeRef = null;
    } else {
      isDraggingRef = true;
      paintModeRef = true;
      velocityDragRef = null;
      setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  }

  function handleStepMouseEnter(inst: Instrument, step: number) {
    if (isDraggingRef && paintModeRef) {
      setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!velocityDragRef) return;
    const { inst, step, startY, startVelocity } = velocityDragRef;
    const deltaY = e.clientY - startY;
    if (Math.abs(deltaY) > 3) {
      velocityDragRef.hasMoved = true;
      const velocityChange = Math.round(-deltaY * 1);
      const newVelocity = Math.max(VELOCITY.OFF, Math.min(VELOCITY.MAX, startVelocity + velocityChange));
      setStepVelocity(inst, step, newVelocity);
    }
  }

  function handleDragEnd() {
    if (velocityDragRef && !velocityDragRef.hasMoved) {
      setStepVelocity(velocityDragRef.inst, velocityDragRef.step, VELOCITY.OFF);
    }
    isDraggingRef = false;
    paintModeRef = null;
    velocityDragRef = null;
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    if (velocityDragRef) {
      const { inst, step, startY, startVelocity } = velocityDragRef;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) > 3) {
        velocityDragRef.hasMoved = true;
        const velocityChange = Math.round(-deltaY * 1);
        const newVelocity = Math.max(VELOCITY.OFF, Math.min(VELOCITY.MAX, startVelocity + velocityChange));
        setStepVelocity(inst, step, newVelocity);
      }
      return;
    }
    if (!isDraggingRef || !paintModeRef) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('drum-step')) {
      const inst = element.getAttribute('data-instrument') as Instrument;
      const stepAttr = element.getAttribute('data-step');
      const step = stepAttr ? parseInt(stepAttr, 10) : NaN;
      if (inst && !isNaN(step)) setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  }

  function loadPreset(presetName: string) {
    const preset = PRESETS[presetName];
    if (preset) {
      const newLoops = [...loops];
      newLoops[currentLoopIndex] = copyPattern(preset);
      loops = newLoops;
      showStatus($t.drum.loadedPreset.replace('{preset}', presetName), 'success');
    }
  }

  function handleExportMidi() {
    exportMidi({ loops, tempo, filename: 'drum-pattern' });
    showStatus($t.drum.exportSuccess, 'success');
  }

  function handleImportClick() {
    fileInput?.click();
  }

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const result = await importMidiFile(file);
    if (result) {
      const newLoops = [...loops];
      newLoops[currentLoopIndex] = result.pattern;
      loops = newLoops;
      tempo = result.tempo;
      showStatus($t.drum.importSuccess, 'success');
    } else {
      showStatus($t.drum.importError, 'error');
    }
    target.value = '';
  }

  function addLoop() {
    if (loops.length >= MAX_LOOPS) {
      showStatus($t.drum.maxLoopsReached, 'error');
      return;
    }
    loops = [...loops, createEmptyPattern()];
    loopIds = [...loopIds, nextLoopId];
    nextLoopId = nextLoopId + 1;
    currentLoopIndex = loops.length - 1;
  }

  function copyCurrentLoop() {
    if (loops.length >= MAX_LOOPS) {
      showStatus($t.drum.maxLoopsReached, 'error');
      return;
    }
    loops = [...loops, copyPattern(loops[currentLoopIndex])];
    loopIds = [...loopIds, nextLoopId];
    nextLoopId = nextLoopId + 1;
    currentLoopIndex = loops.length - 1;
  }

  function removeCurrentLoop() {
    if (loops.length <= 1) return;
    loops = loops.filter((_, i) => i !== currentLoopIndex);
    loopIds = loopIds.filter((_, i) => i !== currentLoopIndex);
    currentLoopIndex = currentLoopIndex > 0 ? currentLoopIndex - 1 : 0;
  }

  function moveLoopLeft() {
    if (currentLoopIndex <= 0) return;
    const newLoops = [...loops];
    [newLoops[currentLoopIndex - 1], newLoops[currentLoopIndex]] = [newLoops[currentLoopIndex], newLoops[currentLoopIndex - 1]];
    loops = newLoops;
    const newIds = [...loopIds];
    [newIds[currentLoopIndex - 1], newIds[currentLoopIndex]] = [newIds[currentLoopIndex], newIds[currentLoopIndex - 1]];
    loopIds = newIds;
    currentLoopIndex = currentLoopIndex - 1;
  }

  function moveLoopRight() {
    if (currentLoopIndex >= loops.length - 1) return;
    const newLoops = [...loops];
    [newLoops[currentLoopIndex], newLoops[currentLoopIndex + 1]] = [newLoops[currentLoopIndex + 1], newLoops[currentLoopIndex]];
    loops = newLoops;
    const newIds = [...loopIds];
    [newIds[currentLoopIndex], newIds[currentLoopIndex + 1]] = [newIds[currentLoopIndex + 1], newIds[currentLoopIndex]];
    loopIds = newIds;
    currentLoopIndex = currentLoopIndex + 1;
  }

  function handleLoopDragStart(index: number) {
    dragLoopIndex = index;
  }

  function handleLoopDragOver(index: number) {
    if (dragLoopIndex !== null && dragLoopIndex !== index) {
      dragOverLoopIndex = index;
    }
  }

  function handleLoopDragEnd() {
    if (dragLoopIndex !== null && dragOverLoopIndex !== null && dragLoopIndex !== dragOverLoopIndex) {
      const newLoops = [...loops];
      const [draggedLoop] = newLoops.splice(dragLoopIndex, 1);
      newLoops.splice(dragOverLoopIndex, 0, draggedLoop);
      loops = newLoops;
      const newIds = [...loopIds];
      const [draggedId] = newIds.splice(dragLoopIndex, 1);
      newIds.splice(dragOverLoopIndex, 0, draggedId);
      loopIds = newIds;
      if (currentLoopIndex === dragLoopIndex) {
        currentLoopIndex = dragOverLoopIndex;
      } else if (dragLoopIndex < currentLoopIndex && dragOverLoopIndex >= currentLoopIndex) {
        currentLoopIndex = currentLoopIndex - 1;
      } else if (dragLoopIndex > currentLoopIndex && dragOverLoopIndex <= currentLoopIndex) {
        currentLoopIndex = currentLoopIndex + 1;
      }
    }
    dragLoopIndex = null;
    dragOverLoopIndex = null;
  }

  function handleLoopDragLeave() {
    dragOverLoopIndex = null;
  }

  function getInstrumentLabel(inst: Instrument): string {
    const labels: Record<Instrument, string> = {
      kick: $t.drum.kick,
      snare: $t.drum.snare,
      hihat: $t.drum.hihat,
      openhat: $t.drum.openhat,
      clap: $t.drum.clap,
    };
    return labels[inst];
  }

  function getPresetLabel(preset: string): string {
    const labels: Record<string, string> = {
      techno: $t.drum.presetTechno,
      house: $t.drum.presetHouse,
      trap: $t.drum.presetTrap,
      breakbeat: $t.drum.presetBreakbeat,
      minimal: $t.drum.presetMinimal,
    };
    return labels[preset] || preset;
  }

  onMount(() => {
    const handleGlobalMouseUp = () => {
      if (velocityDragRef && !velocityDragRef.hasMoved) {
        setStepVelocity(velocityDragRef.inst, velocityDragRef.step, VELOCITY.OFF);
      }
      isDraggingRef = false;
      paintModeRef = null;
      velocityDragRef = null;
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (velocityDragRef) handleMouseMove(e);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  });

  onDestroy(() => {
    if (schedulerRef) cancelAnimationFrame(schedulerRef);
    if (audioContext) audioContext.close();
  });
</script>

<div class="drum-machine">
  <!-- Transport Controls -->
  <div class="drum-transport">
    <div class="drum-transport-controls">
      <button class={cn('drum-btn', isPlaying && 'drum-btn--active')} onclick={play} aria-label={isPlaying ? $t.drum.pause : $t.drum.play}>
        {#if isPlaying}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        {/if}
        <span>{isPlaying ? $t.drum.pause : $t.drum.play}</span>
      </button>
      <button class="drum-btn" onclick={stop} aria-label={$t.drum.stop}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
        <span>{$t.drum.stop}</span>
      </button>
      <button class="drum-btn" onclick={clear} aria-label={$t.drum.clear}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
        <span>{$t.drum.clear}</span>
      </button>
      <button class="drum-btn drum-btn--export" onclick={handleExportMidi} aria-label={$t.drum.exportMidi}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        <span>{$t.drum.exportMidi}</span>
      </button>
      <button class="drum-btn drum-btn--import" onclick={handleImportClick} aria-label={$t.drum.importMidi}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        <span>{$t.drum.importMidi}</span>
      </button>
      <input bind:this={fileInput} type="file" accept=".mid,.midi,audio/midi,audio/x-midi" onchange={handleFileChange} style="display: none" aria-hidden="true" />
    </div>

    <div class="drum-tempo">
      <span class="drum-tempo-label">{$t.drum.tempo}</span>
      <input type="range" class="drum-slider" min={TEMPO_RANGE.MIN} max={TEMPO_RANGE.MAX} bind:value={tempo} aria-label={$t.drum.tempo} />
      <span class="drum-tempo-value">
        {tempo} BPM
        <span class="drum-tempo-duration">
          {loops.length > 1 ? `x${loops.length} ` : ''}({((240 / tempo) * loops.length).toFixed(1)}s)
        </span>
      </span>
    </div>
  </div>

  <!-- Loop Controls -->
  <div class="drum-loop-controls">
    <div class="drum-loop-row">
      <span class="drum-loop-label">{$t.drum.loop}</span>
      <div class="drum-loop-blocks">
        {#each loops as _, index}
          <button
            class={cn(
              'drum-loop-block',
              index === currentLoopIndex && 'drum-loop-block--selected',
              isPlaying && index === playingLoopIndex && 'drum-loop-block--playing',
              dragLoopIndex === index && 'drum-loop-block--dragging',
              dragOverLoopIndex === index && 'drum-loop-block--drag-over'
            )}
            draggable="true"
            ondragstart={() => handleLoopDragStart(index)}
            ondragover={(e) => { e.preventDefault(); handleLoopDragOver(index); }}
            ondragleave={handleLoopDragLeave}
            ondragend={handleLoopDragEnd}
            ondrop={handleLoopDragEnd}
            onclick={() => (currentLoopIndex = index)}
            aria-label={`${$t.drum.loop} ${loopIds[index]}`}
            title={`${$t.drum.loop} ${loopIds[index]}`}
          >
            {loopIds[index]}
          </button>
        {/each}
      </div>
    </div>
    <div class="drum-loop-actions">
      <button class="drum-loop-btn drum-loop-btn--action" onclick={moveLoopLeft} disabled={currentLoopIndex <= 0} aria-label={$t.drum.moveLoopLeft} title={$t.drum.moveLoopLeft}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button class="drum-loop-btn drum-loop-btn--action" onclick={moveLoopRight} disabled={currentLoopIndex >= loops.length - 1} aria-label={$t.drum.moveLoopRight} title={$t.drum.moveLoopRight}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <button class="drum-loop-btn drum-loop-btn--action" onclick={addLoop} disabled={loops.length >= MAX_LOOPS} aria-label={$t.drum.addLoop} title={$t.drum.addLoop}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>
      <button class="drum-loop-btn drum-loop-btn--action" onclick={copyCurrentLoop} disabled={loops.length >= MAX_LOOPS} aria-label={$t.drum.copyLoop} title={$t.drum.copyLoop}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      </button>
      <button class="drum-loop-btn drum-loop-btn--action" onclick={removeCurrentLoop} disabled={loops.length <= 1} aria-label={$t.drum.removeLoop} title={$t.drum.removeLoop}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>
    </div>
  </div>

  <!-- Sequencer Grid -->
  <div class="drum-sequencer" onmouseup={handleDragEnd} onmouseleave={handleDragEnd} ontouchmove={handleTouchMove} ontouchend={handleDragEnd}>
    {#each INSTRUMENTS as inst}
      <div class="drum-track">
        <div class="drum-track-info">
          <div class="drum-track-label">{getInstrumentLabel(inst)}</div>
          <div class="drum-track-volume">
            <input type="range" class="drum-volume-slider" min={VOLUME_RANGE.MIN} max={VOLUME_RANGE.MAX} bind:value={volumes[inst]} aria-label={`${getInstrumentLabel(inst)} ${$t.drum.volume}`} />
            <span class="drum-volume-value">{volumes[inst]}</span>
          </div>
        </div>
        <div class="drum-track-steps">
          {#each Array(STEPS) as _, step}
            {@const velocity = pattern[inst][step]}
            {@const isActive = velocity > 0}
            {@const opacity = isActive ? 0.3 + (velocity / VELOCITY.MAX) * 0.7 : 1}
            <button
              class={cn('drum-step', isActive && 'drum-step--active', isPlaying && currentStep === step && 'drum-step--playing')}
              style={isActive ? `opacity: ${opacity}` : undefined}
              data-instrument={inst}
              data-step={step}
              onmousedown={(e) => { e.preventDefault(); handleStepMouseDown(inst, step, e.clientY); }}
              onmouseenter={() => handleStepMouseEnter(inst, step)}
              ontouchstart={(e) => { e.preventDefault(); const touch = e.touches[0]; handleStepMouseDown(inst, step, touch.clientY); }}
              aria-label={`${getInstrumentLabel(inst)} ${$t.drum.step} ${step + 1}${isActive ? ` (${velocity}%)` : ''}`}
              aria-pressed={isActive}
            ></button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Presets -->
  <div class="drum-presets">
    <span class="drum-presets-label">{$t.drum.presets}</span>
    <div class="drum-presets-buttons">
      {#each Object.keys(PRESETS) as preset}
        <button class="drum-preset-btn" onclick={() => loadPreset(preset)}>{getPresetLabel(preset)}</button>
      {/each}
    </div>
  </div>

  <!-- Synthesis Info -->
  <div class="drum-synthesis-info">{$t.drum.synthesisInfo}</div>

  <!-- Status Message -->
  {#if statusMessage}
    <div class={cn('drum-status', `drum-status--${statusMessage.type}`)}>{statusMessage.text}</div>
  {/if}
</div>
