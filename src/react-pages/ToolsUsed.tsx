/**
 * Tools Used Page Component (Astro Version)
 */
import { memo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import type { Language } from '../i18n/types';
import '../pages/_OpenSource.css';

const toolsUsed = [
  {
    name: 'Claude Code',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
    desc: {
      ko: 'AI 기반 개발 도구',
      en: 'AI-powered development tool',
    },
  },
  {
    name: 'Claude Artifacts',
    url: 'https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them',
    desc: {
      ko: 'AI 기반 콘텐츠 생성 도구',
      en: 'AI-powered content creation tool',
    },
  },
];

const pageContent = {
  title: {
    ko: '사용된 도구',
    en: 'Tools Used',
  },
  description: {
    ko: '이 프로젝트는 Claude Code와 Claude Artifacts를 활용하여 개발되었습니다.',
    en: 'This project was built with Claude Code and Claude Artifacts.',
  },
};

interface ToolsUsedPageProps {
  language: Language;
}

const ToolsUsedPage = memo(function ToolsUsedPage({
  language,
}: ToolsUsedPageProps) {
  const title = pageContent.title[language];
  const description = pageContent.description[language];

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
    </PageLayoutAstro>
  );
});

ToolsUsedPage.displayName = 'ToolsUsedPage';

export default ToolsUsedPage;
