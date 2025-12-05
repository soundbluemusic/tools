import { type Component, For, Show, createSignal, onMount } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import { APPS } from '../constants/apps';
import type { App } from '../types';
import '../styles/pages/Downloads.css';

const pageContent = {
  title: {
    ko: '다운로드',
    en: 'Downloads',
  },
  seo: {
    ko: {
      description:
        'Tools의 모든 앱을 독립적으로 다운로드하세요. 메트로놈, 드럼머신, QR 코드 생성기 등.',
      keywords: 'Tools 다운로드, 무료 도구, 메트로놈, 드럼머신, QR 코드, PWA',
    },
    en: {
      description:
        'Download all Tools apps independently. Metronome, Drum Machine, QR Code Generator, and more.',
      keywords:
        'Tools download, free tools, metronome, drum machine, QR code, PWA',
    },
  },
  intro: {
    ko: '모든 도구를 독립적으로 사용하세요. 웹에서 바로 사용하거나, 임베드하거나, PWA로 설치할 수 있습니다.',
    en: 'Use all tools independently. Use directly in browser, embed, or install as PWA.',
  },
  sections: {
    apps: {
      ko: '앱 목록',
      en: 'Available Apps',
    },
    pwa: {
      ko: 'PWA로 설치하기',
      en: 'Install as PWA',
    },
  },
  buttons: {
    open: {
      ko: '열기',
      en: 'Open',
    },
    newWindow: {
      ko: '새 창',
      en: 'New Window',
    },
    embed: {
      ko: '임베드 코드',
      en: 'Embed Code',
    },
  },
  embedModal: {
    title: {
      ko: '임베드 코드',
      en: 'Embed Code',
    },
    description: {
      ko: '아래 코드를 복사하여 웹사이트에 붙여넣으세요.',
      en: 'Copy the code below and paste it into your website.',
    },
    copied: {
      ko: '복사됨!',
      en: 'Copied!',
    },
    copy: {
      ko: '복사',
      en: 'Copy',
    },
    close: {
      ko: '닫기',
      en: 'Close',
    },
  },
  pwaIntro: {
    ko: 'Tools는 Progressive Web App(PWA)으로, 브라우저에서 바로 설치하여 네이티브 앱처럼 사용할 수 있습니다.',
    en: 'Tools is a Progressive Web App (PWA) that can be installed directly from your browser and used like a native app.',
  },
  installButton: {
    ko: '앱 설치하기',
    en: 'Install App',
  },
  installed: {
    ko: '이미 설치됨',
    en: 'Already Installed',
  },
  notSupported: {
    ko: '이 브라우저에서는 자동 설치가 지원되지 않습니다. 아래 방법을 참고하세요.',
    en: 'Automatic installation is not supported in this browser. Please follow the instructions below.',
  },
  installGuides: {
    ko: [
      {
        title: 'iOS (Safari)',
        steps: [
          'Safari에서 이 사이트를 엽니다',
          '하단 공유 버튼(□↑)을 탭합니다',
          '"홈 화면에 추가"를 선택합니다',
          '"추가"를 탭하여 완료합니다',
        ],
      },
      {
        title: 'Android (Chrome)',
        steps: [
          'Chrome에서 이 사이트를 엽니다',
          '주소창 오른쪽의 메뉴(⋮)를 탭합니다',
          '"앱 설치" 또는 "홈 화면에 추가"를 선택합니다',
          '"설치"를 탭하여 완료합니다',
        ],
      },
      {
        title: 'Desktop (Chrome/Edge)',
        steps: [
          '브라우저에서 이 사이트를 엽니다',
          '주소창 오른쪽의 설치 아이콘(⊕)을 클릭합니다',
          '"설치"를 클릭하여 완료합니다',
        ],
      },
    ],
    en: [
      {
        title: 'iOS (Safari)',
        steps: [
          'Open this site in Safari',
          'Tap the Share button (□↑) at the bottom',
          'Select "Add to Home Screen"',
          'Tap "Add" to complete',
        ],
      },
      {
        title: 'Android (Chrome)',
        steps: [
          'Open this site in Chrome',
          'Tap the menu (⋮) on the right of the address bar',
          'Select "Install app" or "Add to Home Screen"',
          'Tap "Install" to complete',
        ],
      },
      {
        title: 'Desktop (Chrome/Edge)',
        steps: [
          'Open this site in your browser',
          'Click the install icon (⊕) on the right of the address bar',
          'Click "Install" to complete',
        ],
      },
    ],
  },
  features: {
    title: {
      ko: 'PWA의 장점',
      en: 'Benefits of PWA',
    },
    items: {
      ko: [
        {
          name: '오프라인 사용',
          desc: '인터넷 연결 없이도 도구를 사용할 수 있습니다',
        },
        { name: '빠른 실행', desc: '홈 화면에서 바로 실행됩니다' },
        {
          name: '자동 업데이트',
          desc: '앱이 자동으로 최신 버전으로 업데이트됩니다',
        },
        {
          name: '저장 공간 절약',
          desc: '네이티브 앱보다 훨씬 적은 용량을 사용합니다',
        },
      ],
      en: [
        { name: 'Offline Use', desc: 'Use tools without internet connection' },
        { name: 'Quick Launch', desc: 'Launch directly from your home screen' },
        {
          name: 'Auto Update',
          desc: 'App automatically updates to the latest version',
        },
        {
          name: 'Save Storage',
          desc: 'Uses much less storage than native apps',
        },
      ],
    },
  },
};

function getEmbedCode(app: App, baseUrl: string): string {
  return `<iframe
  src="${baseUrl}${app.url}"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="${app.name.en}"
  allow="autoplay; microphone"
></iframe>`;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Downloads Page Component
 * Shows all apps with download/access options
 */
const Downloads: Component = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] =
    createSignal<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = createSignal(false);
  const [embedModalApp, setEmbedModalApp] = createSignal<App | null>(null);
  const [copied, setCopied] = createSignal(false);
  const [baseUrl, setBaseUrl] = createSignal(
    'https://tools.soundbluemusic.com'
  );

  onMount(() => {
    // Get base URL from current location
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  });

  const handleInstall = async () => {
    const prompt = deferredPrompt();
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const openEmbedModal = (app: App) => {
    setEmbedModalApp(app);
    setCopied(false);
  };

  const closeEmbedModal = () => {
    setEmbedModalApp(null);
    setCopied(false);
  };

  const copyEmbedCode = async () => {
    const app = embedModalApp();
    if (!app) return;

    try {
      await navigator.clipboard.writeText(getEmbedCode(app, baseUrl()));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = getEmbedCode(app, baseUrl());
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useSEO({
    title: pageContent.title[language()],
    description: pageContent.seo[language()].description,
    keywords: pageContent.seo[language()].keywords,
    canonicalPath: '/downloads',
  });

  return (
    <>
      <Title>{pageContent.title[language()]} | Tools</Title>
      <Meta
        name="description"
        content={pageContent.seo[language()].description}
      />

      <PageLayout title={pageContent.title[language()]}>
        <div class="downloads-container">
          {/* Intro */}
          <section class="downloads-hero">
            <p class="downloads-intro">{pageContent.intro[language()]}</p>
          </section>

          {/* Apps List */}
          <section class="downloads-section">
            <h2 class="downloads-section-title">
              {pageContent.sections.apps[language()]}
            </h2>
            <div class="downloads-apps-grid">
              <For each={APPS}>
                {(app) => (
                  <div class="downloads-app-card">
                    <div class="downloads-app-header">
                      <span class="downloads-app-icon">{app.icon}</span>
                      <div class="downloads-app-info">
                        <h3 class="downloads-app-name">
                          {app.name[language()]}
                        </h3>
                        <p class="downloads-app-desc">{app.desc[language()]}</p>
                      </div>
                    </div>
                    <div class="downloads-app-actions">
                      <a
                        href={app.url}
                        class="downloads-btn downloads-btn-primary"
                      >
                        {pageContent.buttons.open[language()]}
                      </a>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="downloads-btn downloads-btn-secondary"
                      >
                        {pageContent.buttons.newWindow[language()]}
                      </a>
                      <button
                        class="downloads-btn downloads-btn-tertiary"
                        onClick={() => openEmbedModal(app)}
                      >
                        {pageContent.buttons.embed[language()]}
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* PWA Installation Section */}
          <section class="downloads-section downloads-pwa-section">
            <h2 class="downloads-section-title">
              {pageContent.sections.pwa[language()]}
            </h2>
            <p class="downloads-pwa-intro">
              {pageContent.pwaIntro[language()]}
            </p>

            {/* Install Button */}
            <div class="downloads-install-action">
              <Show
                when={!isInstalled()}
                fallback={
                  <button class="downloads-install-btn" disabled>
                    {pageContent.installed[language()]}
                  </button>
                }
              >
                <Show
                  when={deferredPrompt()}
                  fallback={
                    <p class="downloads-install-note">
                      {pageContent.notSupported[language()]}
                    </p>
                  }
                >
                  <button
                    class="downloads-install-btn downloads-install-btn-active"
                    onClick={handleInstall}
                  >
                    {pageContent.installButton[language()]}
                  </button>
                </Show>
              </Show>
            </div>

            {/* Installation Guides */}
            <div class="downloads-guides">
              <For each={pageContent.installGuides[language()]}>
                {(guide) => (
                  <div class="downloads-guide">
                    <h4 class="downloads-guide-title">{guide.title}</h4>
                    <ol class="downloads-guide-steps">
                      <For each={guide.steps}>{(step) => <li>{step}</li>}</For>
                    </ol>
                  </div>
                )}
              </For>
            </div>

            {/* PWA Features */}
            <div class="downloads-features">
              <h4 class="downloads-features-title">
                {pageContent.features.title[language()]}
              </h4>
              <ul class="downloads-features-list">
                <For each={pageContent.features.items[language()]}>
                  {(item) => (
                    <li class="downloads-feature-item">
                      <strong>{item.name}</strong>
                      <span>{item.desc}</span>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </section>
        </div>
      </PageLayout>

      {/* Embed Code Modal - Outside PageLayout for proper fixed positioning */}
      <Show when={embedModalApp()}>
        <div class="downloads-modal-overlay" onClick={closeEmbedModal}>
          <div class="downloads-modal" onClick={(e) => e.stopPropagation()}>
            <h3 class="downloads-modal-title">
              {pageContent.embedModal.title[language()]}
            </h3>
            <p class="downloads-modal-desc">
              {pageContent.embedModal.description[language()]}
            </p>
            <pre class="downloads-modal-code">
              <code>{getEmbedCode(embedModalApp()!, baseUrl())}</code>
            </pre>
            <div class="downloads-modal-actions">
              <button
                class="downloads-btn downloads-btn-primary"
                onClick={copyEmbedCode}
              >
                {copied()
                  ? pageContent.embedModal.copied[language()]
                  : pageContent.embedModal.copy[language()]}
              </button>
              <button
                class="downloads-btn downloads-btn-secondary"
                onClick={closeEmbedModal}
              >
                {pageContent.embedModal.close[language()]}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Downloads;
