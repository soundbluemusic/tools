/**
 * Open Source Libraries Page Component (Astro Version)
 */
import { memo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import type { Language } from '../i18n/types';
import '../pages/_OpenSource.css';

interface Library {
  name: string;
  version: string;
  license: string;
  url: string;
  description: { ko: string; en: string };
}

interface LibraryCategory {
  title: { ko: string; en: string };
  libraries: Library[];
}

const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    title: { ko: '핵심 런타임 라이브러리', en: 'Core Runtime Libraries' },
    libraries: [
      {
        name: 'React',
        version: '19.2.0',
        license: 'MIT',
        url: 'https://react.dev',
        description: {
          ko: 'UI 구축을 위한 JavaScript 라이브러리',
          en: 'JavaScript library for building user interfaces',
        },
      },
      {
        name: 'React DOM',
        version: '19.2.0',
        license: 'MIT',
        url: 'https://react.dev',
        description: {
          ko: 'React의 DOM 렌더링 패키지',
          en: 'React package for DOM rendering',
        },
      },
      {
        name: 'Astro',
        version: '5.x',
        license: 'MIT',
        url: 'https://astro.build',
        description: {
          ko: '정적 사이트 생성을 위한 웹 프레임워크',
          en: 'Web framework for static site generation',
        },
      },
    ],
  },
  {
    title: { ko: '도구별 라이브러리', en: 'Tool-specific Libraries' },
    libraries: [
      {
        name: 'QRious',
        version: '4.0.2',
        license: 'MIT',
        url: 'https://github.com/neocotic/qrious',
        description: {
          ko: 'QR 코드 생성기에서 사용하는 Canvas 기반 QR 코드 생성 라이브러리',
          en: 'Canvas-based QR code generation library used in QR Code Generator',
        },
      },
      {
        name: 'Web Audio API',
        version: 'Browser Built-in',
        license: 'W3C',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
        description: {
          ko: '메트로놈과 드럼 머신의 오디오 합성에 사용되는 브라우저 내장 API',
          en: 'Browser built-in API for audio synthesis in Metronome and Drum Machine',
        },
      },
    ],
  },
  {
    title: { ko: '빌드 도구', en: 'Build Tools' },
    libraries: [
      {
        name: 'Vite',
        version: '7.2.6',
        license: 'MIT',
        url: 'https://vitejs.dev',
        description: {
          ko: '차세대 프론트엔드 빌드 도구',
          en: 'Next generation frontend build tool',
        },
      },
      {
        name: '@vite-pwa/astro',
        version: '0.x',
        license: 'MIT',
        url: 'https://vite-pwa-org.netlify.app',
        description: {
          ko: 'Astro용 PWA 지원 플러그인',
          en: 'PWA support plugin for Astro',
        },
      },
      {
        name: 'TypeScript',
        version: '5.5.3',
        license: 'Apache-2.0',
        url: 'https://www.typescriptlang.org',
        description: {
          ko: 'JavaScript의 타입 확장 언어',
          en: 'Typed superset of JavaScript',
        },
      },
    ],
  },
  {
    title: { ko: '테스트 라이브러리', en: 'Testing Libraries' },
    libraries: [
      {
        name: 'Vitest',
        version: '4.0.14',
        license: 'MIT',
        url: 'https://vitest.dev',
        description: {
          ko: 'Vite 기반 유닛 테스트 프레임워크',
          en: 'Vite-native unit testing framework',
        },
      },
      {
        name: 'Playwright',
        version: '1.48.0',
        license: 'Apache-2.0',
        url: 'https://playwright.dev',
        description: {
          ko: 'E2E 테스트 프레임워크',
          en: 'End-to-end testing framework',
        },
      },
    ],
  },
  {
    title: { ko: '코드 품질 도구', en: 'Code Quality Tools' },
    libraries: [
      {
        name: 'ESLint',
        version: '9.9.0',
        license: 'MIT',
        url: 'https://eslint.org',
        description: {
          ko: 'JavaScript/TypeScript 린터',
          en: 'JavaScript/TypeScript linter',
        },
      },
      {
        name: 'Prettier',
        version: '3.4.2',
        license: 'MIT',
        url: 'https://prettier.io',
        description: {
          ko: '코드 포매터',
          en: 'Code formatter',
        },
      },
    ],
  },
];

interface OpenSourcePageProps {
  language: Language;
}

const OpenSourcePage = memo(function OpenSourcePage({
  language,
}: OpenSourcePageProps) {
  const title =
    language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries';
  const description =
    language === 'ko'
      ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다'
      : 'List of open source libraries used in this project';

  const noteTexts = [
    {
      ko: '※ 드럼 머신과 메트로놈은 외부 사운드 파일 없이 Web Audio API를 사용하여 실시간으로 오디오를 합성합니다.',
      en: '※ The Drum Machine and Metronome synthesize audio in real-time using Web Audio API without external sound files.',
    },
    {
      ko: '※ QR 코드 생성기는 QRious 라이브러리를 사용하여 Canvas 기반으로 QR 코드를 생성하며, 서버 통신 없이 브라우저에서 직접 처리됩니다.',
      en: '※ The QR Code Generator uses the QRious library to generate QR codes via Canvas, processed directly in the browser without server communication.',
    },
  ];

  const breadcrumb = [
    { label: { ko: '홈', en: 'Home' }, href: '/' },
    { label: { ko: title, en: title } },
  ];

  return (
    <PageLayoutAstro
      title={title}
      description={description}
      breadcrumb={breadcrumb}
      language={language}
    >
      <div className="opensource-notes">
        {noteTexts.map((note, index) => (
          <p key={index} className="opensource-note">
            {note[language]}
          </p>
        ))}
      </div>
      {LIBRARY_CATEGORIES.map((category) => (
        <section key={category.title.en} className="opensource-category">
          <h2 className="opensource-category-title">
            {category.title[language]}
          </h2>
          <ul className="opensource-list">
            {category.libraries.map((lib) => (
              <li key={lib.name} className="opensource-item">
                <div className="opensource-header">
                  <a
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opensource-name"
                  >
                    {lib.name}
                  </a>
                  <span className="opensource-version">
                    {lib.version.startsWith('Browser')
                      ? lib.version
                      : `v${lib.version}`}
                  </span>
                  <span className="opensource-license">{lib.license}</span>
                </div>
                <p className="opensource-desc">{lib.description[language]}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageLayoutAstro>
  );
});

OpenSourcePage.displayName = 'OpenSourcePage';

export default OpenSourcePage;
