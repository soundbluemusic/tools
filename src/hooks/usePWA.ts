import { createSignal, onMount, onCleanup } from 'solid-js';

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = createSignal(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  onMount(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    onCleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  });

  return isOnline;
}

/**
 * Hook to manage PWA service worker updates
 */
export function usePWA() {
  const [needRefresh, setNeedRefresh] = createSignal(false);
  const [offlineReady, setOfflineReady] = createSignal(false);
  const [registration, setRegistration] =
    createSignal<ServiceWorkerRegistration | null>(null);

  const updateServiceWorker = () => {
    const reg = registration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  onMount(async () => {
    // Only run in browser and production
    if (typeof window === 'undefined') return;

    try {
      // vite-plugin-pwa injects registerSW into virtual:pwa-register
      const { registerSW } = await import('virtual:pwa-register');

      registerSW({
        immediate: true,
        onRegisteredSW(swUrl, reg) {
          if (reg) {
            setRegistration(reg);
            // Check for updates periodically (every hour)
            setInterval(
              () => {
                reg.update();
              },
              60 * 60 * 1000
            );
          }
        },
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
        },
        onRegisterError(error) {
          console.error('SW registration error:', error);
        },
      });
    } catch {
      // virtual:pwa-register might not be available in dev mode
      console.log('PWA registration skipped (dev mode or not available)');
    }
  });

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    close,
  };
}
