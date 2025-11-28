import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';

const toolsUsed = [
  {
    name: 'Claude',
    url: 'https://claude.ai',
    desc: {
      ko: 'AI 어시스턴트 - 코드 작성 및 개발 지원',
      en: 'AI Assistant - Code writing and development support',
    },
  },
];

const pageContent = {
  title: {
    ko: '사용된 툴',
    en: 'Tools Used',
  },
  description: {
    ko: '이 프로젝트 개발에 사용된 도구들입니다.',
    en: 'Tools used in developing this project.',
  },
};

/**
 * Tools Used Page - Lists tools used in development
 */
const ToolsUsed = memo(function ToolsUsed() {
  const { language } = useLanguage();

  return (
    <PageLayout
      title={pageContent.title[language]}
      description={pageContent.description[language]}
    >
      <ul className="opensource-list">
        {toolsUsed.map((tool) => (
          <li key={tool.name} className="opensource-item">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opensource-link"
            >
              {tool.name}
            </a>
            <span className="opensource-desc">{tool.desc[language]}</span>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
});

ToolsUsed.displayName = 'ToolsUsed';

export default ToolsUsed;
