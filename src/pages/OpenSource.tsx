import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n';
import './OpenSource.css';

/**
 * Open source libraries used in this project
 */
const LIBRARIES = [
  {
    name: 'React',
    version: '18.3.1',
    license: 'MIT',
    url: 'https://react.dev',
    description: {
      ko: 'UI 구축을 위한 JavaScript 라이브러리',
      en: 'JavaScript library for building user interfaces',
    },
  },
  {
    name: 'React DOM',
    version: '18.3.1',
    license: 'MIT',
    url: 'https://react.dev',
    description: {
      ko: 'React의 DOM 렌더링 패키지',
      en: 'React package for DOM rendering',
    },
  },
  {
    name: 'React Router DOM',
    version: '7.9.6',
    license: 'MIT',
    url: 'https://reactrouter.com',
    description: {
      ko: 'React 앱을 위한 선언적 라우팅',
      en: 'Declarative routing for React apps',
    },
  },
  {
    name: 'QRious',
    version: '4.0.2',
    license: 'MIT',
    url: 'https://github.com/neocotic/qrious',
    description: {
      ko: 'Canvas를 사용한 QR 코드 생성 라이브러리',
      en: 'QR code generation library using Canvas',
    },
  },
  {
    name: 'Vite',
    version: '5.4.1',
    license: 'MIT',
    url: 'https://vitejs.dev',
    description: {
      ko: '차세대 프론트엔드 빌드 도구',
      en: 'Next generation frontend build tool',
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
  {
    name: 'Vitest',
    version: '2.1.8',
    license: 'MIT',
    url: 'https://vitest.dev',
    description: {
      ko: 'Vite 기반 유닛 테스트 프레임워크',
      en: 'Vite-native unit testing framework',
    },
  },
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
] as const;

/**
 * Open Source Libraries Page
 */
const OpenSource = memo(function OpenSource() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '오픈소스 라이브러리' : 'Open Source Libraries';
  const description =
    language === 'ko'
      ? '이 프로젝트에 사용된 오픈소스 라이브러리 목록입니다'
      : 'List of open source libraries used in this project';

  return (
    <PageLayout title={title} description={description}>
      <ul className="opensource-list">
        {LIBRARIES.map((lib) => (
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
              <span className="opensource-version">v{lib.version}</span>
              <span className="opensource-license">{lib.license}</span>
            </div>
            <p className="opensource-desc">{lib.description[language]}</p>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
});

OpenSource.displayName = 'OpenSource';

export default OpenSource;
