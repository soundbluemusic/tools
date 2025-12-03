/**
 * Sitemap Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';

const SITE_URL = 'https://tools.soundbluemusic.com';

interface SitemapItem {
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  url: string;
  isExternal?: boolean;
}

interface SitemapSection {
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  items: SitemapItem[];
}

const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: { ko: '메인', en: 'Main' },
    description: {
      ko: '사이트의 메인 페이지입니다.',
      en: 'Main pages of the site.',
    },
    items: [
      {
        name: { ko: '홈', en: 'Home' },
        description: {
          ko: '무료 온라인 도구 모음 - 모든 도구를 한 곳에서',
          en: 'Free online tools - All tools in one place',
        },
        url: '/',
      },
    ],
  },
  {
    title: { ko: '도구', en: 'Tools' },
    description: {
      ko: '무료로 사용 가능한 온라인 도구입니다.',
      en: 'Free online tools available for use.',
    },
    items: [
      {
        name: { ko: '메트로놈', en: 'Metronome' },
        description: {
          ko: '음악가를 위한 정밀 박자 연습 도구',
          en: 'Precision tempo practice tool for musicians',
        },
        url: '/metronome',
      },
      {
        name: { ko: '드럼머신', en: 'Drum Machine' },
        description: {
          ko: '16스텝 드럼 시퀀서',
          en: '16-step drum sequencer',
        },
        url: '/drum',
      },
      {
        name: { ko: '드럼 신스', en: 'Drum Synth' },
        description: {
          ko: '드럼 사운드 신디사이저',
          en: 'Drum sound synthesizer',
        },
        url: '/drum-synth',
      },
      {
        name: { ko: 'QR 코드 생성기', en: 'QR Code Generator' },
        description: {
          ko: '고복구율 QR 코드 생성',
          en: 'High recovery QR code generation',
        },
        url: '/qr',
      },
    ],
  },
  {
    title: { ko: '정보', en: 'Information' },
    description: {
      ko: '사이트 관련 정보 페이지입니다.',
      en: 'Information pages about the site.',
    },
    items: [
      {
        name: { ko: '사이트맵', en: 'Sitemap' },
        description: {
          ko: '사이트의 모든 페이지 목록',
          en: 'Complete list of all site pages',
        },
        url: '/sitemap',
      },
      {
        name: { ko: '오픈소스 라이브러리', en: 'Open Source Libraries' },
        description: {
          ko: '프로젝트에 사용된 오픈소스 라이브러리 목록',
          en: 'List of open source libraries used in this project',
        },
        url: '/opensource',
      },
      {
        name: { ko: '사용된 도구', en: 'Tools Used' },
        description: {
          ko: '이 프로젝트 개발에 사용된 도구',
          en: 'Tools used to build this project',
        },
        url: '/tools-used',
      },
      {
        name: { ko: '개인정보 처리방침', en: 'Privacy Policy' },
        description: {
          ko: '개인정보 처리에 관한 정책',
          en: 'Privacy policy regarding data collection',
        },
        url: '/privacy',
      },
      {
        name: { ko: '이용약관', en: 'Terms of Service' },
        description: {
          ko: '서비스 이용에 관한 약관',
          en: 'Terms and conditions for using this service',
        },
        url: '/terms',
      },
    ],
  },
];

export class SitemapPage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;

    const title = language === 'ko' ? '사이트맵' : 'Sitemap';
    const description =
      language === 'ko'
        ? 'Tools의 모든 페이지를 한눈에 확인하세요.'
        : 'View all pages of Tools at a glance.';
    const xmlSitemapText =
      language === 'ko' ? 'XML 사이트맵 보기' : 'View XML Sitemap';

    return html`
      <div class="max-w-container-md mx-auto px-4 py-8">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text-primary mb-2">${title}</h1>
          <p class="text-text-secondary">${description}</p>
        </header>

        <div class="mx-auto flex max-w-3xl flex-col gap-10">
          ${SITEMAP_SECTIONS.map(
            (section) => html`
              <section
                class="rounded-xl border border-border-primary bg-bg-tertiary p-6 sm:p-4"
              >
                <h2
                  class="m-0 mb-2 border-b border-border-primary pb-3 text-xl font-semibold text-text-primary"
                >
                  ${section.title[language]}
                </h2>
                <p class="m-0 mb-5 text-sm opacity-80 text-text-secondary">
                  ${section.description[language]}
                </p>
                <ul class="m-0 flex list-none flex-col gap-4 p-0">
                  ${section.items
                    .map(
                      (item) => html`
                        <li
                          class="rounded-lg border border-border-primary bg-bg-primary p-4 transition-all duration-fast hover:border-text-secondary hover:shadow-md"
                        >
                          <a
                            href="${item.url}"
                            class="inline-flex items-center gap-2 text-base font-medium text-text-primary no-underline transition-colors duration-fast hover:text-accent-primary"
                            data-link
                          >
                            <span
                              class="border-b border-transparent transition-colors duration-fast hover:border-current"
                            >
                              ${item.name[language]}
                            </span>
                          </a>
                          <p
                            class="m-0 mt-2 mb-3 text-sm leading-6 text-text-secondary"
                          >
                            ${item.description[language]}
                          </p>
                          <span
                            class="block break-all font-mono text-xs text-text-secondary opacity-60"
                          >
                            ${SITE_URL}${item.url}
                          </span>
                        </li>
                      `
                    )
                    .join('')}
                </ul>
              </section>
            `
          ).join('')}

          <!-- XML Sitemap Link -->
          <div class="flex justify-center border-t border-border-primary pt-4">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-lg border border-border-primary bg-bg-tertiary px-6 py-3 text-sm font-medium text-text-secondary no-underline transition-all duration-fast hover:border-text-secondary hover:bg-bg-primary hover:text-text-primary"
            >
              ${xmlSitemapText}
              <span class="text-xs opacity-60">↗</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
