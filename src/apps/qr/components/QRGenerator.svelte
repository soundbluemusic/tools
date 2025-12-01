<script lang="ts">
  import { onMount } from 'svelte';
  import QRious from 'qrious';
  import { t } from '../../../stores';
  import { QR_SIZE, URL_DEBOUNCE_MS, COLOR_THRESHOLD, TIMEOUTS } from '../constants';
  import './QRGenerator.css';

  type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
  type ColorMode = 'black' | 'white';

  let url = '';
  let errorLevel: ErrorLevel = 'H';
  let colorMode: ColorMode = 'black';
  let qrBlack: string | null = null;
  let qrWhite: string | null = null;
  let copySuccess = false;
  let debounceTimer: ReturnType<typeof setTimeout>;

  $: qr = $t.qr;
  $: common = $t.common;

  $: errorLevels = [
    { level: 'L' as const, recovery: '7%', use: qr.onlineOnly, desc: qr.noDamageRisk },
    { level: 'M' as const, recovery: '15%', use: qr.smallPrint, desc: qr.coatedSurface },
    { level: 'Q' as const, recovery: '25%', use: qr.generalPrint, desc: qr.paperLabel },
    { level: 'H' as const, recovery: '30%', use: qr.outdoorLarge, desc: qr.highDamageRisk },
  ];

  function makeTransparent(canvas: HTMLCanvasElement, isWhite: boolean): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (isWhite) {
        if (r <= COLOR_THRESHOLD.BLACK && g <= COLOR_THRESHOLD.BLACK && b <= COLOR_THRESHOLD.BLACK) {
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      } else {
        if (r >= COLOR_THRESHOLD.WHITE && g >= COLOR_THRESHOLD.WHITE && b >= COLOR_THRESHOLD.WHITE) {
          data[i + 3] = 0;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function createQR(text: string, level: ErrorLevel) {
    if (!text.trim()) {
      qrBlack = null;
      qrWhite = null;
      return;
    }

    const canvas1 = document.createElement('canvas');
    new QRious({
      element: canvas1,
      value: text,
      size: QR_SIZE,
      level: level,
      background: 'white',
      foreground: 'black',
    });

    qrBlack = makeTransparent(canvas1, false);

    const canvas2 = document.createElement('canvas');
    new QRious({
      element: canvas2,
      value: text,
      size: QR_SIZE,
      level: level,
      background: 'black',
      foreground: 'white',
    });

    qrWhite = makeTransparent(canvas2, true);
  }

  function handleUrlInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      createQR(url, errorLevel);
    }, URL_DEBOUNCE_MS);
  }

  function handleErrorLevelChange() {
    createQR(url, errorLevel);
  }

  async function handleCopyImage() {
    const qrData = colorMode === 'black' ? qrBlack : qrWhite;
    if (!qrData) return;

    try {
      const response = await fetch(qrData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      copySuccess = true;
      setTimeout(() => copySuccess = false, TIMEOUTS.COPY_SUCCESS);
    } catch {
      alert(qr.imageCopyNotSupported);
    }
  }

  function handleDownload() {
    const qrData = colorMode === 'black' ? qrBlack : qrWhite;
    if (!qrData) return;

    const link = document.createElement('a');
    link.download = `qr-code-${colorMode}.png`;
    link.href = qrData;
    link.click();
  }

  $: currentQR = colorMode === 'black' ? qrBlack : qrWhite;
</script>

<div class="qr-generator">
  <!-- URL Input -->
  <div class="qr-input-section">
    <label class="qr-label" for="url-input">{qr.urlLabel}</label>
    <input
      id="url-input"
      type="url"
      class="qr-url-input"
      placeholder={qr.urlPlaceholder}
      bind:value={url}
      on:input={handleUrlInput}
    />
    <p class="qr-help">{qr.urlHelp}</p>
  </div>

  <!-- Error Correction Level -->
  <div class="qr-error-section">
    <label class="qr-label">{qr.errorCorrectionLevel}</label>
    <div class="error-levels">
      {#each errorLevels as level}
        <label class="error-level-option" class:selected={errorLevel === level.level}>
          <input
            type="radio"
            name="errorLevel"
            value={level.level}
            bind:group={errorLevel}
            on:change={handleErrorLevelChange}
          />
          <span class="error-level-info">
            <strong>{qr.level} {level.level}</strong>
            <span class="error-recovery">({qr.recoveryRate}: {level.recovery})</span>
            <span class="error-use">{level.use}</span>
          </span>
        </label>
      {/each}
    </div>
    <p class="qr-info">{qr.errorLevelInfo}</p>
  </div>

  <!-- Color Mode -->
  <div class="qr-color-section">
    <label class="qr-label">{qr.qrCodeColor}</label>
    <div class="color-modes">
      <button
        class="color-mode-btn"
        class:selected={colorMode === 'black'}
        on:click={() => colorMode = 'black'}
      >
        {qr.black}
      </button>
      <button
        class="color-mode-btn"
        class:selected={colorMode === 'white'}
        on:click={() => colorMode = 'white'}
      >
        {qr.white}
      </button>
    </div>
  </div>

  <!-- QR Code Display -->
  <div class="qr-display-section">
    <label class="qr-label">{qr.generatedQrCode}</label>
    <div class="qr-preview" class:qr-preview-dark={colorMode === 'white'}>
      {#if currentQR}
        <img src={currentQR} alt={colorMode === 'black' ? qr.blackQrCode : qr.whiteQrCode} />
      {:else}
        <p class="qr-placeholder">{qr.enterUrl}</p>
      {/if}
    </div>
    <p class="qr-transparent-note">{qr.transparentBg}</p>
  </div>

  <!-- Actions -->
  {#if currentQR}
    <div class="qr-actions">
      <button class="qr-btn qr-btn-copy" on:click={handleCopyImage}>
        {copySuccess ? common.common.copied : common.common.copyImage}
      </button>
      <button class="qr-btn qr-btn-download" on:click={handleDownload}>
        {common.common.download}
      </button>
    </div>
  {/if}

  <!-- Footer -->
  <p class="qr-footer">{qr.footer}</p>
</div>
