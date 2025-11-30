import { memo, useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { usePWA } from '../hooks/usePWA';
import './PWAPrompt.css';

const DISMISS_KEY = 'pwa-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Close icon component
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const PWAPrompt = memo(function PWAPrompt() {
  const { t } = useLanguage();
  const { isInstallable, isInstalled, isOnline, needsUpdate, install, update } =
    usePWA();
  const [isDismissed, setIsDismissed] = useState(true);

  // Check if the prompt was recently dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  const handleInstall = useCallback(async () => {
    const success = await install();
    if (!success) {
      // User dismissed, remember for 7 days
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      setIsDismissed(true);
    }
  }, [install]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  const pwa = t.common.pwa;

  // Show update banner
  if (needsUpdate) {
    return (
      <div className="pwa-toast pwa-toast--update" role="alert">
        <div className="pwa-toast__header">
          <div className="pwa-toast__icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
            </svg>
          </div>
          <div className="pwa-toast__text">
            <strong>{pwa.updateTitle}</strong>
            <span>{pwa.updateMessage}</span>
          </div>
        </div>
        <div className="pwa-toast__actions">
          <button className="pwa-toast__button" onClick={update}>
            {pwa.updateButton}
          </button>
        </div>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="pwa-toast pwa-toast--offline" role="status">
        <div className="pwa-toast__header">
          <div className="pwa-toast__icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
            </svg>
          </div>
          <div className="pwa-toast__text">
            <strong>{pwa.offlineTitle}</strong>
            <span>{pwa.offlineMessage}</span>
          </div>
        </div>
      </div>
    );
  }

  // Show install prompt
  if (isInstallable && !isDismissed && !isInstalled) {
    return (
      <div className="pwa-toast pwa-toast--install" role="banner">
        <div className="pwa-toast__header">
          <div className="pwa-toast__icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </div>
          <div className="pwa-toast__text">
            <strong>{pwa.installTitle}</strong>
            <span>{pwa.installMessage}</span>
          </div>
          <button
            className="pwa-toast__close"
            onClick={handleDismiss}
            aria-label={pwa.dismissButton}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="pwa-toast__actions">
          <button className="pwa-toast__button" onClick={handleInstall}>
            {pwa.installButton}
          </button>
        </div>
      </div>
    );
  }

  return null;
});

PWAPrompt.displayName = 'PWAPrompt';
