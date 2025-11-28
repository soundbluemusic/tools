import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';

const toolsUsed = [
  {
    name: 'Claude Code',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
    desc: {
      ko: 'AI 기반 개발 도구 - 모든 코드 작성 및 개발',
      en: 'AI-assisted development - All code writing and development',
    },
  },
];

const pageContent = {
  title: {
    ko: '사용된 툴',
    en: 'Tools Used',
  },
  description: {
    ko: '이 프로젝트는 Claude Code (AI-assisted development)를 이용해 제작되었습니다.',
    en: 'This project was built with Claude Code (AI-assisted development).',
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
