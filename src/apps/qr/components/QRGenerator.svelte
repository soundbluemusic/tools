<script lang="ts">
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

  $: currentQR = colorMode === 'black' ? qrBlack : qrWhite;
  $: currentFilename =
    colorMode === 'black'
      ? 'high_recovery_transparent_qr_black.png'
      : 'high_recovery_transparent_qr_white.png';

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

  function handleErrorLevelChange(level: ErrorLevel) {
    errorLevel = level;
    createQR(url, errorLevel);
  }

  function downloadQR(dataUrl: string, filename: string) {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;

      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, TIMEOUTS.DOWNLOAD_CLEANUP);
    } catch (error) {
      console.error('Download error:', error);
      try {
        const newWindow = window.open(dataUrl, '_blank');
        if (!newWindow) {
          alert(qr.popupBlocked);
        }
      } catch {
        alert(qr.downloadFailed);
      }
    }
  }

  function fallbackDownload(dataUrl: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr_${colorMode}.png`;
    link.click();
    alert(qr.imageCopyNotSupported);
  }

  async function copyImage(dataUrl: string) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                throw new Error('Blob creation failed');
              }

              if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                  const item = new ClipboardItem({ 'image/png': blob });
                  await navigator.clipboard.write([item]);
                  copySuccess = true;
                  setTimeout(() => {
                    copySuccess = false;
                  }, TIMEOUTS.COPY_SUCCESS);
                  return;
                } catch (clipErr) {
                  console.log('Clipboard API failed, trying fallback:', clipErr);
                }
              }

              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `qr_${colorMode}.png`;

              if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                const newWindow = window.open(blobUrl, '_blank');
                if (newWindow) {
                  alert(qr.imageOpenedInNewTab);
                } else {
                  link.click();
                  alert(qr.imageDownloaded);
                }
              } else {
                if (confirm(qr.imageCopyConfirm)) {
                  link.click();
                }
              }

              setTimeout(() => URL.revokeObjectURL(blobUrl), TIMEOUTS.BLOB_REVOKE);
            },
            'image/png',
            1.0
          );
        } catch (err) {
          console.error('Canvas processing error:', err);
          fallbackDownload(dataUrl);
        }
      };

      img.onerror = () => {
        console.error('Image load failed');
        fallbackDownload(dataUrl);
      };

      img.src = dataUrl;
    } catch (error) {
      console.error('Copy error:', error);
      fallbackDownload(dataUrl);
    }
  }
</script>

<div class="qr-generator">
  <div class="qr-card">
    <div class="qr-grid">
      <!-- Input Section -->
      <div class="qr-input-section">
        <h2>{qr.urlInput}</h2>

        <div class="qr-input-group">
          <label for="qr-url-input">{qr.urlLabel}</label>
          <input
            id="qr-url-input"
            type="text"
            bind:value={url}
            on:input={handleUrlInput}
            placeholder={qr.urlPlaceholder}
            class="qr-input"
          />
          <p class="qr-help-text">{qr.urlHelp}</p>
        </div>

        <div class="qr-error-section">
          <h3>{qr.errorCorrectionLevel}</h3>
          <!-- Desktop: Table view -->
          <div class="qr-table-wrapper">
            <table class="qr-table">
              <thead>
                <tr>
                  <th>{qr.level}</th>
                  <th>{qr.recoveryRate}</th>
                  <th>{qr.recommendedEnvironment}</th>
                  <th>{qr.description}</th>
                </tr>
              </thead>
              <tbody>
                {#each errorLevels as item}
                  <tr>
                    <td class="qr-level-cell">{item.level}</td>
                    <td>{item.recovery}</td>
                    <td>{item.use}</td>
                    <td class="qr-desc-cell">{item.desc}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <!-- Mobile: Card view -->
          <div class="qr-table-mobile">
            {#each errorLevels as item}
              <div class="qr-table-mobile-card">
                <div class="qr-table-mobile-card-header">
                  <span class="qr-table-mobile-level">{item.level}</span>
                  <span class="qr-table-mobile-recovery">{item.recovery}</span>
                </div>
                <div class="qr-table-mobile-use">{item.use}</div>
                <div class="qr-table-mobile-desc">{item.desc}</div>
              </div>
            {/each}
          </div>

          <div class="qr-level-buttons">
            {#each errorLevels as item}
              <button
                on:click={() => handleErrorLevelChange(item.level)}
                class="qr-level-btn"
                class:active={errorLevel === item.level}
              >
                {item.level}
              </button>
            {/each}
          </div>

          <p class="qr-info-text">{qr.errorLevelInfo}</p>
        </div>

        <div class="qr-color-section">
          <h3>{qr.qrCodeColor}</h3>
          <div class="qr-color-buttons">
            <button
              on:click={() => (colorMode = 'black')}
              class="qr-color-btn"
              class:active={colorMode === 'black'}
            >
              {qr.black}
            </button>
            <button
              on:click={() => (colorMode = 'white')}
              class="qr-color-btn"
              class:active={colorMode === 'white'}
            >
              {qr.white}
            </button>
          </div>
        </div>
      </div>

      <!-- QR Code Display Section -->
      <div class="qr-display-section">
        <h2>{qr.generatedQrCode}</h2>

        <div class="qr-preview-card">
          <h3>{colorMode === 'black' ? qr.blackQrCode : qr.whiteQrCode}</h3>
          <div class="qr-preview" class:light-bg={colorMode === 'black'} class:dark-bg={colorMode === 'white'}>
            {#if currentQR}
              <img
                src={currentQR}
                alt="{colorMode === 'black' ? 'Black' : 'White'} QR Code"
                class="qr-image"
              />
            {:else}
              <div class="qr-placeholder" class:light={colorMode === 'black'} class:dark={colorMode === 'white'}>
                <svg
                  class="qr-placeholder-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p>{qr.enterUrl}</p>
              </div>
            {/if}
          </div>
          {#if currentQR}
            <div class="qr-actions">
              <button on:click={() => copyImage(currentQR)} class="qr-action-btn secondary">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2" />
                  <path
                    stroke-width="2"
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  />
                </svg>
                {copySuccess ? common.common.copied : common.common.copyImage}
              </button>
              <button
                on:click={() => downloadQR(currentQR, currentFilename)}
                class="qr-action-btn primary"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  />
                </svg>
                {common.common.download}
              </button>
            </div>
          {/if}
          <p class="qr-spec-text">{qr.transparentBg}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="qr-footer">
    <p>{qr.footer}</p>
  </div>
</div>
