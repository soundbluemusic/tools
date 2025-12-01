<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from '../../../stores';
  import { DEFAULTS, BPM_RANGE, VOLUME_RANGE, FREQUENCIES, TIMING, PENDULUM } from '../constants';
  import './MetronomePlayer.css';

  // State
  let bpm = DEFAULTS.BPM;
  let volume = DEFAULTS.VOLUME;
  let beatsPerMeasure = DEFAULTS.BEATS_PER_MEASURE;
  let isPlaying = false;
  let beat = 0;
  let measureCount = 0;
  let pendulumAngle = 0;
  let elapsedTime = 0;
  let timerMinutes = '';
  let timerSeconds = '';
  let countdownTime = 0;
  let countdownElapsed = 0;

  // Audio context refs
  let audioContext: AudioContext | null = null;
  let nextNoteTime = 0;
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;

  $: metronome = $t.metronome;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  }

  function scheduleNote(time: number, isAccent: boolean) {
    const ctx = initAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = isAccent ? FREQUENCIES.ACCENT : FREQUENCIES.REGULAR;
    osc.type = 'sine';

    gain.gain.setValueAtTime(volume / 100, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + TIMING.CLICK_DURATION_SECONDS);

    osc.start(time);
    osc.stop(time + TIMING.CLICK_DURATION_SECONDS);
  }

  function scheduler() {
    if (!audioContext) return;

    while (nextNoteTime < audioContext.currentTime + TIMING.LOOK_AHEAD_SECONDS) {
      const isAccent = beat === 0;
      scheduleNote(nextNoteTime, isAccent);

      const secondsPerBeat = 60.0 / bpm;
      nextNoteTime += secondsPerBeat;
      beat = (beat + 1) % beatsPerMeasure;

      if (beat === 0) {
        measureCount++;
      }

      // Update pendulum
      pendulumAngle = pendulumAngle > 0 ? -PENDULUM.MAX_ANGLE : PENDULUM.MAX_ANGLE;
    }
  }

  function start() {
    initAudioContext();
    if (!audioContext) return;

    audioContext.resume();
    nextNoteTime = audioContext.currentTime;
    startTime = audioContext.currentTime;
    beat = 0;
    measureCount = 0;
    pendulumAngle = 0;
    isPlaying = true;

    // Set timer if specified
    const mins = parseInt(timerMinutes) || 0;
    const secs = parseInt(timerSeconds) || 0;
    countdownTime = mins * 60 + secs;
    countdownElapsed = 0;

    schedulerInterval = setInterval(() => {
      scheduler();
      // Update elapsed time
      if (audioContext) {
        elapsedTime = audioContext.currentTime - startTime;
        if (countdownTime > 0) {
          countdownElapsed = elapsedTime;
          if (countdownElapsed >= countdownTime) {
            stop();
          }
        }
      }
    }, TIMING.SCHEDULER_INTERVAL_MS);
  }

  function stop() {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    isPlaying = false;
    beat = 0;
    pendulumAngle = 0;
  }

  function reset() {
    stop();
    bpm = DEFAULTS.BPM;
    volume = DEFAULTS.VOLUME;
    beatsPerMeasure = DEFAULTS.BEATS_PER_MEASURE;
    measureCount = 0;
    elapsedTime = 0;
    timerMinutes = '';
    timerSeconds = '';
    countdownTime = 0;
    countdownElapsed = 0;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    stop();
    if (audioContext) {
      audioContext.close();
    }
  });
</script>

<div class="metronome-player">
  <!-- Pendulum Display -->
  <div class="metronome-display">
    <div class="pendulum-container">
      <div class="pendulum" style="transform: rotate({pendulumAngle}deg)">
        <div class="pendulum-weight"></div>
      </div>
    </div>
    <div class="metronome-info">
      <span class="metronome-bpm">{bpm} BPM</span>
      <span class="metronome-measure">{metronome.measure}: {measureCount}</span>
    </div>
  </div>

  <!-- BPM Control -->
  <div class="metronome-control">
    <label class="control-label">{metronome.bpm}</label>
    <div class="slider-container">
      <span class="slider-label">{metronome.slow}</span>
      <input
        type="range"
        min={BPM_RANGE.MIN}
        max={BPM_RANGE.MAX}
        bind:value={bpm}
        class="metronome-slider"
        disabled={isPlaying}
      />
      <span class="slider-label">{metronome.fast}</span>
    </div>
    <input
      type="number"
      min={BPM_RANGE.MIN}
      max={BPM_RANGE.MAX}
      bind:value={bpm}
      class="bpm-input"
      disabled={isPlaying}
    />
  </div>

  <!-- Volume Control -->
  <div class="metronome-control">
    <label class="control-label">{metronome.volume}</label>
    <div class="slider-container">
      <span class="slider-label">{metronome.quiet}</span>
      <input
        type="range"
        min={VOLUME_RANGE.MIN}
        max={VOLUME_RANGE.MAX}
        bind:value={volume}
        class="metronome-slider"
      />
      <span class="slider-label">{metronome.loud}</span>
    </div>
  </div>

  <!-- Time Signature -->
  <div class="metronome-control">
    <label class="control-label">{metronome.timeSignature}</label>
    <select bind:value={beatsPerMeasure} class="time-signature-select" disabled={isPlaying}>
      <option value={2}>2/4</option>
      <option value={3}>3/4</option>
      <option value={4}>4/4</option>
      <option value={6}>6/8</option>
    </select>
  </div>

  <!-- Timer -->
  <div class="metronome-control">
    <label class="control-label">{metronome.timer}</label>
    <div class="timer-inputs">
      <input
        type="number"
        placeholder={metronome.minutes}
        bind:value={timerMinutes}
        class="timer-input"
        min="0"
        max="60"
        disabled={isPlaying}
      />
      <span>:</span>
      <input
        type="number"
        placeholder={metronome.seconds}
        bind:value={timerSeconds}
        class="timer-input"
        min="0"
        max="59"
        disabled={isPlaying}
      />
    </div>
    {#if countdownTime > 0}
      <div class="countdown-display">
        {metronome.countdown}: {formatTime(Math.max(0, countdownTime - countdownElapsed))}
      </div>
    {/if}
  </div>

  <!-- Elapsed Time -->
  <div class="metronome-elapsed">
    {metronome.elapsed}: {formatTime(elapsedTime)}
  </div>

  <!-- Controls -->
  <div class="metronome-buttons">
    {#if isPlaying}
      <button class="metronome-btn metronome-btn-stop" on:click={stop}>
        {metronome.stop}
      </button>
    {:else}
      <button class="metronome-btn metronome-btn-start" on:click={start}>
        {metronome.start}
      </button>
    {/if}
    <button class="metronome-btn metronome-btn-reset" on:click={reset} disabled={isPlaying}>
      {metronome.reset}
    </button>
  </div>
</div>
