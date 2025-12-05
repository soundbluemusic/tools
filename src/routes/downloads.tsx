import { type Component, Show, createSignal, onMount } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import '../styles/pages/About.css';

const pageContent = {
  title: {
    ko: '다운로드',
    en: 'Downloads',
  },
  seo: {
    ko: {
      description:
        'Tools 앱을 기기에 설치하세요. 오프라인에서도 사용 가능한 PWA 앱입니다.',
      keywords:
        'Tools 다운로드, PWA 설치, 오프라인 앱, 무료 도구 설치',
    },
    en: {
      description:
        'Install Tools app on your device. A PWA app that works offline.',
      keywords:
        'Tools download, PWA install, offline app, free tools installation',
    },
  },
  intro: {
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
  sections: {
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
        { name: '오프라인 사용', desc: '인터넷 연결 없이도 도구를 사용할 수 있습니다' },
        { name: '빠른 실행', desc: '홈 화면에서 바로 실행됩니다' },
        { name: '자동 업데이트', desc: '앱이 자동으로 최신 버전으로 업데이트됩니다' },
        { name: '저장 공간 절약', desc: '네이티브 앱보다 훨씬 적은 용량을 사용합니다' },
      ],
      en: [
        { name: 'Offline Use', desc: 'Use tools without internet connection' },
        { name: 'Quick Launch', desc: 'Launch directly from your home screen' },
        { name: 'Auto Update', desc: 'App automatically updates to the latest version' },
        { name: 'Save Storage', desc: 'Uses much less storage than native apps' },
      ],
    },
  },
};

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Downloads Page Component
 * PWA installation guide and instructions
 */
const Downloads: Component = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = createSignal<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = createSignal(false);

  onMount(() => {
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
        <div class="about-container">
          {/* Intro */}
          <section class="about-hero">
            <p class="about-hero-subheadline">
              {pageContent.intro[language()]}
            </p>
          </section>

          {/* Install Button */}
          <section class="about-section">
            <Show
              when={!isInstalled()}
              fallback={
                <button
                  class="about-cta-button"
                  disabled
                  style={{ opacity: 0.6, cursor: 'default' }}
                >
                  {pageContent.installed[language()]}
                </button>
              }
            >
              <Show
                when={deferredPrompt()}
                fallback={
                  <p class="about-hero-subheadline" style={{ "font-size": "0.9rem", opacity: 0.8 }}>
                    {pageContent.notSupported[language()]}
                  </p>
                }
              >
                <button
                  class="about-cta-button"
                  onClick={handleInstall}
                >
                  {pageContent.installButton[language()]}
                </button>
              </Show>
            </Show>
          </section>

          {/* Installation Instructions */}
          {pageContent.sections[language()].map((section) => (
            <section class="about-section">
              <h3 class="about-section-title">{section.title}</h3>
              <ol class="about-creator-list" style={{ "list-style-type": "decimal", "padding-left": "1.5rem" }}>
                {section.steps.map((step) => (
                  <li class="about-creator-item" style={{ "margin-bottom": "0.5rem" }}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          ))}

          {/* PWA Features */}
          <section class="about-section">
            <h3 class="about-section-title">{pageContent.features.title[language()]}</h3>
            <ul class="about-creator-list">
              {pageContent.features.items[language()].map((item) => (
                <li class="about-creator-item">
                  <strong>{item.name}</strong> — {item.desc}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default Downloads;
