/**
 * Open Source Libraries Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';

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
        name: 'Tailwind CSS',
        version: '4.0',
        license: 'MIT',
        url: 'https://tailwindcss.com',
        description: {
          ko: '유틸리티 퍼스트 CSS 프레임워크',
          en: 'Utility-first CSS framework',
        },
      },
      {
        name: 'PostCSS',
        version: '8.5',
        license: 'MIT',
        url: 'https://postcss.org',
        description: {
          ko: 'CSS 변환 도구',
          en: 'CSS transformation tool',
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

export class OpenSourcePage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;

    const title =
      language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries';
    const description =
      language === 'ko'
        ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다'
        : 'List of open source libraries used in this project';

    const notes = [
      {
        ko: '※ 드럼 머신과 메트로놈은 외부 사운드 파일 없이 Web Audio API를 사용하여 실시간으로 오디오를 합성합니다.',
        en: '※ The Drum Machine and Metronome synthesize audio in real-time using Web Audio API without external sound files.',
      },
      {
        ko: '※ QR 코드 생성기는 QRious 라이브러리를 사용하여 Canvas 기반으로 QR 코드를 생성하며, 서버 통신 없이 브라우저에서 직접 처리됩니다.',
        en: '※ The QR Code Generator uses the QRious library to generate QR codes via Canvas, processed directly in the browser without server communication.',
      },
    ];

    return html`
      <div class="max-w-container-md mx-auto px-4 py-8">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text-primary mb-2">${title}</h1>
          <p class="text-text-secondary">${description}</p>
        </header>

        <div class="mb-6 flex flex-col gap-3">
          ${notes
            .map(
              (note) => html`
                <p
                  class="m-0 rounded-md border-l-[3px] border-info bg-bg-secondary px-4 py-3 text-sm text-text-secondary"
                >
                  ${note[language]}
                </p>
              `
            )
            .join('')}
        </div>

        ${LIBRARY_CATEGORIES.map(
          (category) => html`
            <section class="mb-8 last:mb-0">
              <h2
                class="mb-4 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                ${category.title[language]}
              </h2>
              <ul class="m-0 flex list-none flex-col gap-4 p-0">
                ${category.libraries
                  .map(
                    (lib) => html`
                      <li
                        class="rounded-md border border-border-secondary bg-bg-tertiary p-4 transition-shadow duration-fast hover:shadow-md"
                      >
                        <div class="mb-2 flex flex-wrap items-center gap-3">
                          <a
                            href="${lib.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-lg font-semibold text-info no-underline hover:underline"
                          >
                            ${lib.name}
                          </a>
                          <span
                            class="rounded-sm bg-bg-secondary px-2 py-1 text-sm text-text-secondary"
                          >
                            ${lib.version.startsWith('Browser')
                              ? lib.version
                              : `v${lib.version}`}
                          </span>
                          <span
                            class="rounded-sm bg-bg-secondary px-2 py-1 text-xs font-medium text-text-tertiary"
                          >
                            ${lib.license}
                          </span>
                        </div>
                        <p
                          class="m-0 text-sm leading-relaxed text-text-secondary"
                        >
                          ${lib.description[language]}
                        </p>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </section>
          `
        ).join('')}
      </div>
    `;
  }
}
