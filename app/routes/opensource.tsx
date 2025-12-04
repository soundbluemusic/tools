import { memo } from 'react';
import type { Route } from './+types/opensource';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n';
import { useSEO } from '../../src/hooks';

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
      { name: 'React', version: '19.2.0', license: 'MIT', url: 'https://react.dev', description: { ko: 'UI 구축을 위한 JavaScript 라이브러리', en: 'JavaScript library for building user interfaces' } },
      { name: 'React Router', version: '7.10.0', license: 'MIT', url: 'https://reactrouter.com', description: { ko: 'React 앱을 위한 선언적 라우팅', en: 'Declarative routing for React apps' } },
    ],
  },
  {
    title: { ko: '도구별 라이브러리', en: 'Tool-specific Libraries' },
    libraries: [
      { name: 'QRious', version: '4.0.2', license: 'MIT', url: 'https://github.com/neocotic/qrious', description: { ko: 'Canvas 기반 QR 코드 생성 라이브러리', en: 'Canvas-based QR code generation library' } },
      { name: 'Web Audio API', version: 'Browser Built-in', license: 'W3C', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', description: { ko: '오디오 합성에 사용되는 브라우저 내장 API', en: 'Browser built-in API for audio synthesis' } },
    ],
  },
  {
    title: { ko: '빌드 도구', en: 'Build Tools' },
    libraries: [
      { name: 'Vite', version: '7.2.6', license: 'MIT', url: 'https://vitejs.dev', description: { ko: '차세대 프론트엔드 빌드 도구', en: 'Next generation frontend build tool' } },
      { name: 'Tailwind CSS', version: '4.1.17', license: 'MIT', url: 'https://tailwindcss.com', description: { ko: '유틸리티 우선 CSS 프레임워크', en: 'Utility-first CSS framework' } },
      { name: 'TypeScript', version: '5.5.3', license: 'Apache-2.0', url: 'https://www.typescriptlang.org', description: { ko: 'JavaScript의 타입 확장 언어', en: 'Typed superset of JavaScript' } },
    ],
  },
];

export const meta: Route.MetaFunction = () => [
  { title: 'Open Source Libraries - Tools' },
  { name: 'description', content: 'Tools에 사용된 오픈소스 라이브러리 목록' },
];

const OpenSource = memo(function OpenSource() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries';
  const description = language === 'ko' ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다' : 'List of open source libraries used in this project';

  useSEO({ title, description, canonicalPath: '/opensource', noindex: true });

  return (
    <PageLayout title={title} description={description}>
      {LIBRARY_CATEGORIES.map((category) => (
        <section key={category.title.en} className="opensource-category">
          <h2 className="opensource-category-title">{category.title[language]}</h2>
          <ul className="opensource-list">
            {category.libraries.map((lib) => (
              <li key={lib.name} className="opensource-item">
                <div className="opensource-header">
                  <a href={lib.url} target="_blank" rel="noopener noreferrer" className="opensource-name">{lib.name}</a>
                  <span className="opensource-version">{lib.version.startsWith('Browser') ? lib.version : `v${lib.version}`}</span>
                  <span className="opensource-license">{lib.license}</span>
                </div>
                <p className="opensource-desc">{lib.description[language]}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageLayout>
  );
});

OpenSource.displayName = 'OpenSource';

export default OpenSource;
