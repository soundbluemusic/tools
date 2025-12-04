import { memo } from 'react';
import type { Route } from './+types/tools-used';
import { PageLayout } from '../../src/components/layout';
import { useLanguage } from '../../src/i18n/context';
import { useSEO } from '../../src/hooks';

const toolsUsed = [
  { name: 'Claude Code', url: 'https://docs.anthropic.com/en/docs/claude-code', desc: { ko: 'AI 기반 개발 도구', en: 'AI-powered development tool' } },
  { name: 'Claude Artifacts', url: 'https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them', desc: { ko: 'AI 기반 콘텐츠 생성 도구', en: 'AI-powered content creation tool' } },
];

export const meta: Route.MetaFunction = () => [
  { title: 'Tools Used - Tools' },
  { name: 'description', content: 'Tools 개발에 사용된 도구 목록' },
];

const ToolsUsed = memo(function ToolsUsed() {
  const { language } = useLanguage();

  const title = language === 'ko' ? '사용된 도구' : 'Tools Used';
  const description = language === 'ko' ? '이 프로젝트는 Claude Code와 Claude Artifacts를 활용하여 개발되었습니다.' : 'This project was built with Claude Code and Claude Artifacts.';

  useSEO({ title, description, canonicalPath: '/tools-used', noindex: true });

  return (
    <PageLayout title={title} description={description}>
      <ul className="opensource-list">
        {toolsUsed.map((tool) => (
          <li key={tool.name} className="opensource-item">
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="opensource-link">{tool.name}</a>
            <span className="opensource-desc">{tool.desc[language]}</span>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
});

ToolsUsed.displayName = 'ToolsUsed';

export default ToolsUsed;
