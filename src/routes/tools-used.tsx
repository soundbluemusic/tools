import { type Component, For } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import '../styles/pages/About.css';

const pageContent = {
  title: {
    ko: '사용된 도구',
    en: 'Tools Used',
  },
  seo: {
    ko: {
      description:
        'Tools 플랫폼을 만드는 데 사용된 기술 스택과 라이브러리를 소개합니다.',
      keywords:
        'SolidJS, TypeScript, Vite, Tailwind CSS, Web Audio API, 프론트엔드 기술',
    },
    en: {
      description:
        'Discover the technology stack and libraries used to build the Tools platform.',
      keywords:
        'SolidJS, TypeScript, Vite, Tailwind CSS, Web Audio API, frontend technology',
    },
  },
  intro: {
    ko: '이 플랫폼은 최신 웹 기술로 구축되었습니다. 모든 코드는 오픈소스입니다.',
    en: 'This platform is built with modern web technologies. All code is open source.',
  },
  categories: {
    ko: [
      {
        title: '프레임워크',
        items: [
          { name: 'SolidJS', desc: '빠르고 반응적인 UI 프레임워크' },
          { name: 'SolidStart', desc: '풀스택 메타 프레임워크' },
          { name: 'TypeScript', desc: '타입 안전한 JavaScript' },
        ],
      },
      {
        title: '빌드 도구',
        items: [
          { name: 'Vite', desc: '차세대 프론트엔드 빌드 도구' },
          { name: 'Vinxi', desc: 'SolidStart 빌드 시스템' },
          { name: 'pnpm', desc: '빠르고 효율적인 패키지 매니저' },
        ],
      },
      {
        title: '스타일링',
        items: [
          { name: 'Tailwind CSS v4', desc: '유틸리티 우선 CSS 프레임워크' },
          { name: 'CSS Custom Properties', desc: '테마 및 디자인 토큰' },
        ],
      },
      {
        title: '오디오 & 미디어',
        items: [
          { name: 'Web Audio API', desc: '브라우저 내장 오디오 처리' },
          { name: 'Audio Worklet', desc: '고성능 오디오 처리' },
          { name: 'WebAssembly', desc: '고성능 연산 처리' },
        ],
      },
      {
        title: '테스팅',
        items: [
          { name: 'Vitest', desc: '빠른 단위 테스트' },
          { name: 'Playwright', desc: 'E2E 테스트' },
          { name: 'Solid Testing Library', desc: '컴포넌트 테스트' },
        ],
      },
      {
        title: '코드 품질',
        items: [
          { name: 'ESLint', desc: '코드 린팅' },
          { name: 'Prettier', desc: '코드 포맷팅' },
          { name: 'Husky', desc: 'Git 훅 관리' },
        ],
      },
    ],
    en: [
      {
        title: 'Frameworks',
        items: [
          { name: 'SolidJS', desc: 'Fast and reactive UI framework' },
          { name: 'SolidStart', desc: 'Full-stack meta framework' },
          { name: 'TypeScript', desc: 'Type-safe JavaScript' },
        ],
      },
      {
        title: 'Build Tools',
        items: [
          { name: 'Vite', desc: 'Next-generation frontend build tool' },
          { name: 'Vinxi', desc: 'SolidStart build system' },
          { name: 'pnpm', desc: 'Fast and efficient package manager' },
        ],
      },
      {
        title: 'Styling',
        items: [
          { name: 'Tailwind CSS v4', desc: 'Utility-first CSS framework' },
          { name: 'CSS Custom Properties', desc: 'Theming and design tokens' },
        ],
      },
      {
        title: 'Audio & Media',
        items: [
          { name: 'Web Audio API', desc: 'Built-in browser audio processing' },
          { name: 'Audio Worklet', desc: 'High-performance audio processing' },
          { name: 'WebAssembly', desc: 'High-performance computation' },
        ],
      },
      {
        title: 'Testing',
        items: [
          { name: 'Vitest', desc: 'Fast unit testing' },
          { name: 'Playwright', desc: 'E2E testing' },
          { name: 'Solid Testing Library', desc: 'Component testing' },
        ],
      },
      {
        title: 'Code Quality',
        items: [
          { name: 'ESLint', desc: 'Code linting' },
          { name: 'Prettier', desc: 'Code formatting' },
          { name: 'Husky', desc: 'Git hooks management' },
        ],
      },
    ],
  },
};

/**
 * Tools Used Page Component
 */
const ToolsUsed: Component = () => {
  const { language } = useLanguage();

  useSEO({
    title: pageContent.title[language()],
    description: pageContent.seo[language()].description,
    keywords: pageContent.seo[language()].keywords,
    canonicalPath: '/tools-used',
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

          {/* Categories */}
          <For each={pageContent.categories[language()]}>
            {(category) => (
              <section class="about-section">
                <h3 class="about-section-title">{category.title}</h3>
                <ul class="about-creator-list">
                  <For each={category.items}>
                    {(item) => (
                      <li class="about-creator-item">
                        <strong>{item.name}</strong> — {item.desc}
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            )}
          </For>
        </div>
      </PageLayout>
    </>
  );
};

export default ToolsUsed;
