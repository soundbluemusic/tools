import { Show, createEffect, createSignal } from 'solid-js';
import { useOnlineStatus, usePWA } from '../hooks/usePWA';
import { useLanguage } from '../i18n';
import './PWAPrompt.css';

/**
 * PWA update prompt and offline status banner
 */
export default function PWAPrompt() {
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();
  const { needRefresh, offlineReady, updateServiceWorker, close } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = createSignal(false);
  const [showReadyToast, setShowReadyToast] = createSignal(false);

  // Show offline banner when going offline
  createEffect(() => {
    if (!isOnline()) {
      setShowOfflineBanner(true);
    } else {
      // Auto-hide after coming back online
      setTimeout(() => setShowOfflineBanner(false), 2000);
    }
  });

  // Show offline-ready toast
  createEffect(() => {
    if (offlineReady()) {
      setShowReadyToast(true);
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowReadyToast(false);
        close();
      }, 4000);
    }
  });

  return (
    <>
      {/* Offline Status Banner */}
      <Show when={showOfflineBanner()}>
        <div
          class="pwa-banner pwa-banner--offline"
          role="alert"
          aria-live="assertive"
        >
          <div class="pwa-banner__content">
            <svg
              class="pwa-banner__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
            <div class="pwa-banner__text">
              <strong>{t().common.pwa.offlineTitle}</strong>
              <span>{t().common.pwa.offlineMessage}</span>
            </div>
          </div>
          <Show when={isOnline()}>
            <button
              class="pwa-banner__close"
              onClick={() => setShowOfflineBanner(false)}
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </Show>
        </div>
      </Show>

      {/* Update Available Prompt */}
      <Show when={needRefresh()}>
        <div
          class="pwa-banner pwa-banner--update"
          role="alert"
          aria-live="polite"
        >
          <div class="pwa-banner__content">
            <svg
              class="pwa-banner__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div class="pwa-banner__text">
              <span>{t().common.pwa.updateMessage}</span>
            </div>
          </div>
          <div class="pwa-banner__actions">
            <button
              class="pwa-banner__btn pwa-banner__btn--secondary"
              onClick={close}
            >
              {t().common.actions.later}
            </button>
            <button
              class="pwa-banner__btn pwa-banner__btn--primary"
              onClick={updateServiceWorker}
            >
              {t().common.pwa.updateButton}
            </button>
          </div>
        </div>
      </Show>

      {/* Offline Ready Toast */}
      <Show when={showReadyToast()}>
        <div class="pwa-toast" role="status" aria-live="polite">
          <svg
            class="pwa-toast__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <span>{t().common.pwa.offlineReady}</span>
        </div>
      </Show>
    </>
  );
}
