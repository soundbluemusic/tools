<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import {
    DEFAULTS,
    BPM_RANGE,
    VOLUME_RANGE,
    FREQUENCIES,
    TIMING,
    PENDULUM,
  } from '../constants';
  import './MetronomePlayer.css';

  // Settings state
  let bpm = DEFAULTS.BPM;
  let volume = DEFAULTS.VOLUME;
  let beatsPerMeasure = DEFAULTS.BEATS_PER_MEASURE;
  let beatUnit = DEFAULTS.BEAT_UNIT;

  // Playback state
  let isPlaying = false;
  let beat = 0;
  let measureCount = 0;
  let pendulumAngle = 0;

  // Timer state
  let timerMinutes = '';
  let timerSeconds = '';
  let countdownTime = 0;
  let countdownElapsed = 0;
  let elapsedTime = 0;

  // Timing refs
  let audioContext: AudioContext | null = null;
  let nextNoteTime = 0;
  let schedulerBeat = 0;
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let animationFrame: number | null = null;
  let startAudioTime = 0;

  $: metronome = $t.metronome;
  $: currentCountdown = countdownTime > 0 ? Math.max(0, countdownTime - countdownElapsed) : 0;

  function initAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    return audioContext;
  }

  function isAccentBeat(beatIndex: number): boolean {
    return beatIndex === 0;
  }

  function playClick(time: number, beatNumber: number) {
    const ctx = audioContext;
    if (!ctx) return;

    const isFirst = isAccentBeat(beatNumber);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const volumeMultiplier = volume / 100;

    if (isFirst) {
      osc.frequency.value = FREQUENCIES.ACCENT;
      gain.gain.setValueAtTime(0.8 * volumeMultiplier, time);
    } else {
      osc.frequency.value = FREQUENCIES.REGULAR;
      gain.gain.setValueAtTime(0.4 * volumeMultiplier, time);
    }

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, 0.01 * volumeMultiplier),
      time + TIMING.CLICK_DURATION_SECONDS
    );

    osc.start(time);
    osc.stop(time + TIMING.CLICK_DURATION_SECONDS);
  }

  function scheduleNotes() {
    if (!audioContext) return;

    const secondsPerBeat = 60.0 / bpm;
    const now = audioContext.currentTime;

    while (nextNoteTime < now + TIMING.LOOK_AHEAD_SECONDS) {
      playClick(nextNoteTime, schedulerBeat);
      nextNoteTime += secondsPerBeat;
      schedulerBeat = (schedulerBeat + 1) % beatsPerMeasure;
    }
  }

  function animate() {
    if (!audioContext || !isPlaying) return;

    if (startAudioTime === 0) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    const currentTime = audioContext.currentTime;
    const secondsPerBeat = 60 / bpm;
    const elapsed = currentTime - startAudioTime;
    const totalBeats = elapsed / secondsPerBeat;
    const currentBeatIndex = Math.floor(totalBeats) % beatsPerMeasure;
    const currentMeasure = Math.floor(totalBeats / beatsPerMeasure) + 1;

    // Pendulum swing (one cycle per 2 beats)
    const swingCycle = totalBeats % 2;
    const angle =
      swingCycle < 1
        ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
        : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

    beat = currentBeatIndex;
    measureCount = currentMeasure;
    pendulumAngle = angle;

    const elapsedMs = elapsed * 1000;

    if (countdownTime > 0) {
      const remaining = countdownTime - elapsedMs;
      if (remaining <= 0) {
        countdownElapsed = countdownTime;
        isPlaying = false;
        return;
      }
      elapsedTime = elapsedMs;
      countdownElapsed = elapsedMs;
    } else {
      elapsedTime = elapsedMs;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  async function handleStart() {
    initAudioContext();

    if (audioContext?.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (err) {
        console.error('AudioContext resume failed:', err);
        return;
      }
    }

    const timerEnded = countdownTime > 0 && countdownElapsed >= countdownTime;

    if (!isPlaying) {
      if (audioContext) {
        const currentTime = audioContext.currentTime;

        if (elapsedTime === 0 && countdownTime === 0) {
          const totalMinutes = parseInt(timerMinutes) || 0;
          const totalSeconds = parseInt(timerSeconds) || 0;
          const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;

          if (totalMs > 0) {
            countdownTime = totalMs;
            countdownElapsed = 0;
          }
          startAudioTime = currentTime;
          nextNoteTime = currentTime;
          schedulerBeat = 0;
          beat = 0;
          measureCount = 0;
          pendulumAngle = 0;
        } else if (timerEnded) {
          elapsedTime = 0;
          countdownElapsed = 0;
          beat = 0;
          measureCount = 0;
          pendulumAngle = 0;
          schedulerBeat = 0;
          startAudioTime = currentTime;
          nextNoteTime = currentTime;
        } else {
          const elapsedSeconds = elapsedTime / 1000;
          startAudioTime = currentTime - elapsedSeconds;

          const secondsPerBeat = 60 / bpm;
          const totalBeats = elapsedSeconds / secondsPerBeat;
          const currentBeatNumber = Math.floor(totalBeats);

          schedulerBeat = (currentBeatNumber + 1) % beatsPerMeasure;

          const nextBeatTime = startAudioTime + (currentBeatNumber + 1) * secondsPerBeat;
          nextNoteTime = nextBeatTime;
        }
      }

      isPlaying = true;
      schedulerInterval = setInterval(scheduleNotes, TIMING.SCHEDULER_INTERVAL_MS);
      animationFrame = requestAnimationFrame(animate);
    } else {
      isPlaying = false;
      if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }
  }

  function reset() {
    isPlaying = false;
    beat = 0;
    measureCount = 0;
    pendulumAngle = 0;
    timerMinutes = '';
    timerSeconds = '';
    countdownTime = 0;
    countdownElapsed = 0;
    elapsedTime = 0;
    schedulerBeat = 0;
    startAudioTime = 0;

    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  function getNoteSize(isActive: boolean, isFirstBeat: boolean): number {
    return isActive ? (isFirstBeat ? 28 : 24) : 16;
  }

  function getNoteColor(isActive: boolean, isFirstBeat: boolean): string {
    return isActive
      ? isFirstBeat
        ? 'var(--color-error)'
        : 'var(--color-text-primary)'
      : 'var(--color-text-tertiary)';
  }

  onMount(() => {
    initAudioContext();
  });

  onDestroy(() => {
    if (schedulerInterval) clearInterval(schedulerInterval);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (audioContext) audioContext.close();
  });
</script>

<div class="metronome">
  <!-- Top controls -->
  <div class="metronome-controls">
    <!-- Time signature -->
    <div class="metronome-control-group">
      <span class="metronome-label">{metronome.timeSignature}</span>
      <input
        type="number"
        min="1"
        max="12"
        bind:value={beatsPerMeasure}
        class="metronome-input metronome-input--small"
        disabled={isPlaying}
      />
      <span class="metronome-divider">/</span>
      <select
        bind:value={beatUnit}
        class="metronome-select"
        disabled={isPlaying}
      >
        <option value={2}>2</option>
        <option value={4}>4</option>
        <option value={8}>8</option>
        <option value={16}>16</option>
      </select>
    </div>

    <!-- Timer -->
    <div class="metronome-control-group">
      <span class="metronome-label">{metronome.timer}</span>
      <input
        type="number"
        min="0"
        max="99"
        bind:value={timerMinutes}
        placeholder="0"
        class="metronome-input metronome-input--small"
        disabled={isPlaying || elapsedTime > 0}
      />
      <span class="metronome-unit">{metronome.minutes}</span>
      <input
        type="number"
        min="0"
        max="59"
        bind:value={timerSeconds}
        placeholder="0"
        class="metronome-input metronome-input--small"
        disabled={isPlaying || elapsedTime > 0}
      />
      <span class="metronome-unit">{metronome.seconds}</span>
      <span class="metronome-separator"></span>
      <div class="metronome-countdown">
        <span class="metronome-countdown-label">{metronome.countdown}</span>
        <span class="metronome-countdown-value" class:active={countdownTime > 0}>
          {formatTime(currentCountdown)}
        </span>
      </div>
    </div>
  </div>

  <!-- Main display -->
  <div class="metronome-main">
    <!-- BPM display -->
    <div class="metronome-display">
      <div class="metronome-display-label">{metronome.bpm}</div>
      <div class="metronome-display-value">{bpm}</div>
    </div>

    <!-- Pendulum -->
    <div class="metronome-pendulum">
      <svg viewBox="0 0 100 120" class="metronome-pendulum-svg">
        <rect x="15" y="112" width="70" height="4" rx="2" fill="var(--color-border-secondary)" />
        <path
          d="M 50 22 L 22 112 L 78 112 Z"
          fill="var(--color-bg-tertiary)"
          stroke="var(--color-border-secondary)"
          stroke-width="1.5"
        />
        <g
          style="transform-origin: 50px 108px; transform: rotate({pendulumAngle}deg);"
          class="metronome-pendulum-arm"
        >
          <line
            x1="50"
            y1="28"
            x2="50"
            y2="108"
            stroke="var(--color-text-primary)"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="50" cy="55" r="4" fill="var(--color-text-primary)" />
        </g>
        <circle cx="50" cy="108" r="2.5" fill="var(--color-text-tertiary)" />
      </svg>
    </div>

    <!-- Volume display -->
    <div class="metronome-display">
      <div class="metronome-display-label">{metronome.volume}</div>
      <div class="metronome-display-value">{volume}</div>
    </div>
  </div>

  <!-- Sliders -->
  <div class="metronome-sliders">
    <div class="metronome-slider-group">
      <input
        type="range"
        min={BPM_RANGE.MIN}
        max={BPM_RANGE.MAX}
        bind:value={bpm}
        class="metronome-slider"
      />
      <div class="metronome-slider-labels">
        <span>{metronome.slow}</span>
        <span>{metronome.fast}</span>
      </div>
    </div>

    <div class="metronome-slider-group">
      <input
        type="range"
        min={VOLUME_RANGE.MIN}
        max={VOLUME_RANGE.MAX}
        bind:value={volume}
        class="metronome-slider"
      />
      <div class="metronome-slider-labels">
        <span>{metronome.quiet}</span>
        <span>{metronome.loud}</span>
      </div>
    </div>
  </div>

  <!-- Beat visualization -->
  <div class="metronome-beats">
    {#each Array(beatsPerMeasure) as _, i}
      {@const isActive = isPlaying && i === beat}
      {@const isFirstBeat = i === 0}
      {@const size = getNoteSize(isActive, isFirstBeat)}
      {@const color = getNoteColor(isActive, isFirstBeat)}
      <div class="metronome-beat">
        {#if beatUnit === 2}
          <svg
            width={size}
            height={size * 1.4}
            viewBox="0 0 24 34"
            fill="none"
            class="metronome-note"
          >
            <ellipse
              cx="12"
              cy="24"
              rx="7"
              ry="5"
              fill="var(--color-bg-tertiary)"
              stroke={color}
              stroke-width="2"
            />
            <line x1="19" y1="24" x2="19" y2="4" stroke={color} stroke-width="2" />
          </svg>
        {:else if beatUnit === 4}
          <svg
            width={size}
            height={size * 1.4}
            viewBox="0 0 24 34"
            fill="none"
            class="metronome-note"
          >
            <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
            <line x1="19" y1="24" x2="19" y2="4" stroke={color} stroke-width="2" />
          </svg>
        {:else if beatUnit === 8}
          <svg
            width={size}
            height={size * 1.4}
            viewBox="0 0 24 34"
            fill="none"
            class="metronome-note"
          >
            <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
            <line x1="19" y1="24" x2="19" y2="4" stroke={color} stroke-width="2" />
            <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
          </svg>
        {:else if beatUnit === 16}
          <svg
            width={size}
            height={size * 1.4}
            viewBox="0 0 24 34"
            fill="none"
            class="metronome-note"
          >
            <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
            <line x1="19" y1="24" x2="19" y2="4" stroke={color} stroke-width="2" />
            <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
            <path d="M19 8 L19 14 L24 12 L24 6 Z" fill={color} />
          </svg>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Info display -->
  <div class="metronome-info">
    <div class="metronome-info-item">
      <div class="metronome-info-label">{metronome.measure}</div>
      <div class="metronome-info-value">{measureCount}</div>
    </div>
    <div class="metronome-info-item">
      <div class="metronome-info-label">{metronome.elapsed}</div>
      <div class="metronome-info-value metronome-info-value--mono">
        {formatTime(elapsedTime)}
      </div>
      <div class="metronome-info-precision">{metronome.precision}</div>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="metronome-actions">
    <button on:click={handleStart} class="metronome-btn metronome-btn--primary">
      {#if isPlaying}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        <span>{metronome.stop}</span>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>{metronome.start}</span>
      {/if}
    </button>
    <button on:click={reset} class="metronome-btn metronome-btn--secondary" aria-label="Reset">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    </button>
  </div>

  <!-- Sync info -->
  <div class="metronome-sync">
    <div class="metronome-sync-title">{metronome.perfectSync}</div>
    <div class="metronome-sync-desc">{metronome.syncDescription}</div>
  </div>
</div>
