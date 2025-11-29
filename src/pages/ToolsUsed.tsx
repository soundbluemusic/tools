import { memo } from 'react';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';

const toolsUsed = [
  {
    name: 'Claude Code',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
    desc: {
      ko: 'AI 기반 개발 도구',
      en: 'AI-powered development tool',
    },
  },
];

const pageContent = {
  title: {
    ko: '사용된 도구',
    en: 'Tools Used',
  },
  description: {
    ko: '이 프로젝트는 Claude Code를 활용하여 개발되었습니다.',
    en: 'This project was built with Claude Code.',
  },
};

/**
 * Tools Used Page - Lists tools used in development
 */
const ToolsUsed = memo(function ToolsUsed() {
  const { language } = useLanguage();

  // SEO for ToolsUsed page (noindex as it's supplementary content)
  useSEO({
    title: pageContent.title[language],
    description: pageContent.description[language],
    canonicalPath: '/tools-used',
    noindex: true,
  });

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
