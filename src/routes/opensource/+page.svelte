<script lang="ts">
  import { language } from '$lib/stores';

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
        { name: 'Svelte', version: '5.14.0', license: 'MIT', url: 'https://svelte.dev', description: { ko: '반응형 UI 구축을 위한 컴파일러', en: 'Compiler for building reactive user interfaces' } },
        { name: 'SvelteKit', version: '2.15.0', license: 'MIT', url: 'https://kit.svelte.dev', description: { ko: 'Svelte 앱을 위한 풀스택 프레임워크', en: 'Full-stack framework for Svelte apps' } },
      ],
    },
    {
      title: { ko: '도구별 라이브러리', en: 'Tool-specific Libraries' },
      libraries: [
        { name: 'QRious', version: '4.0.2', license: 'MIT', url: 'https://github.com/neocotic/qrious', description: { ko: 'QR 코드 생성기에서 사용하는 Canvas 기반 QR 코드 생성 라이브러리', en: 'Canvas-based QR code generation library used in QR Code Generator' } },
        { name: 'Web Audio API', version: 'Browser Built-in', license: 'W3C', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', description: { ko: '메트로놈과 드럼 머신의 오디오 합성에 사용되는 브라우저 내장 API', en: 'Browser built-in API for audio synthesis in Metronome and Drum Machine' } },
      ],
    },
    {
      title: { ko: '빌드 도구', en: 'Build Tools' },
      libraries: [
        { name: 'Vite', version: '6.4.1', license: 'MIT', url: 'https://vitejs.dev', description: { ko: '차세대 프론트엔드 빌드 도구', en: 'Next generation frontend build tool' } },
        { name: 'Vite Plugin PWA', version: '1.2.0', license: 'MIT', url: 'https://vite-pwa-org.netlify.app', description: { ko: 'PWA(Progressive Web App) 지원 플러그인', en: 'Plugin for Progressive Web App support' } },
        { name: 'TypeScript', version: '5.5.3', license: 'Apache-2.0', url: 'https://www.typescriptlang.org', description: { ko: 'JavaScript의 타입 확장 언어', en: 'Typed superset of JavaScript' } },
      ],
    },
    {
      title: { ko: '테스트 라이브러리', en: 'Testing Libraries' },
      libraries: [
        { name: 'Vitest', version: '3.2.4', license: 'MIT', url: 'https://vitest.dev', description: { ko: 'Vite 기반 유닛 테스트 프레임워크', en: 'Vite-native unit testing framework' } },
        { name: 'Playwright', version: '1.48.0', license: 'Apache-2.0', url: 'https://playwright.dev', description: { ko: 'E2E 테스트 프레임워크', en: 'End-to-end testing framework' } },
        { name: 'Testing Library Svelte', version: '5.2.0', license: 'MIT', url: 'https://testing-library.com/svelte', description: { ko: 'Svelte 컴포넌트 테스트 유틸리티', en: 'Svelte component testing utilities' } },
      ],
    },
    {
      title: { ko: '코드 품질 도구', en: 'Code Quality Tools' },
      libraries: [
        { name: 'ESLint', version: '9.9.0', license: 'MIT', url: 'https://eslint.org', description: { ko: 'JavaScript/TypeScript 린터', en: 'JavaScript/TypeScript linter' } },
        { name: 'Prettier', version: '3.4.2', license: 'MIT', url: 'https://prettier.io', description: { ko: '코드 포매터', en: 'Code formatter' } },
      ],
    },
  ];

  const title = $derived($language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries');
  const description = $derived($language === 'ko' ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다' : 'List of open source libraries used in this project');
  const noteText = $derived($language === 'ko' ? '※ 드럼 머신과 메트로놈은 외부 사운드 파일 없이 Web Audio API를 사용하여 실시간으로 오디오를 합성합니다.' : '※ The Drum Machine and Metronome synthesize audio in real-time using Web Audio API without external sound files.');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="https://tools.soundblue.net/opensource" />
</svelte:head>

<div class="page-layout">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item"><a href="/" class="breadcrumb-link">{$language === 'ko' ? '홈' : 'Home'}</a></li>
      <li class="breadcrumb-separator" aria-hidden="true">/</li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">{title}</li>
    </ol>
  </nav>

  <header class="page-header">
    <h1 class="page-title">{title}</h1>
    <p class="page-description">{description}</p>
  </header>

  <div class="page-content">
    <p class="opensource-note">{noteText}</p>
    {#each LIBRARY_CATEGORIES as category}
      <section class="opensource-category">
        <h2 class="opensource-category-title">{category.title[$language]}</h2>
        <ul class="opensource-list">
          {#each category.libraries as lib}
            <li class="opensource-item">
              <div class="opensource-header">
                <a href={lib.url} target="_blank" rel="noopener noreferrer" class="opensource-name">{lib.name}</a>
                <span class="opensource-version">{lib.version.startsWith('Browser') ? lib.version : `v${lib.version}`}</span>
                <span class="opensource-license">{lib.license}</span>
              </div>
              <p class="opensource-desc">{lib.description[$language]}</p>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</div>

<style>
  .page-layout { display: flex; flex-direction: column; gap: var(--spacing-6); }
  .breadcrumb { font-size: var(--font-size-sm); }
  .breadcrumb-list { display: flex; align-items: center; gap: var(--spacing-2); list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
  .breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; transition: color var(--transition-fast) var(--ease-default); }
  .breadcrumb-link:hover { color: var(--color-text-primary); }
  .breadcrumb-separator { color: var(--color-text-tertiary); }
  .breadcrumb-current { color: var(--color-text-primary); font-weight: var(--font-weight-medium); }
  .page-header { margin-bottom: var(--spacing-4); }
  .page-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0 0 var(--spacing-2) 0; }
  .page-description { font-size: var(--font-size-base); color: var(--color-text-secondary); margin: 0; }
  .page-content { background: var(--color-bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-6); }
  @media (max-width: 480px) { .page-content { padding: var(--spacing-4); } .page-title { font-size: var(--font-size-xl); } }
</style>
