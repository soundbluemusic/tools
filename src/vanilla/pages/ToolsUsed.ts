/**
 * Tools Used Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';

interface Tool {
  name: string;
  url: string;
  desc: { ko: string; en: string };
}

const TOOLS_USED: Tool[] = [
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

export class ToolsUsedPage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;

    const title = language === 'ko' ? '사용된 도구' : 'Tools Used';
    const description =
      language === 'ko'
        ? '이 프로젝트는 Claude Code와 Claude Artifacts를 활용하여 개발되었습니다.'
        : 'This project was built with Claude Code and Claude Artifacts.';

    return html`
      <div class="max-w-container-md mx-auto px-4 py-8">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text-primary mb-2">${title}</h1>
          <p class="text-text-secondary">${description}</p>
        </header>

        <ul class="m-0 flex list-none flex-col gap-4 p-0">
          ${TOOLS_USED.map(
            (tool) => html`
              <li
                class="rounded-md border border-border-secondary bg-bg-tertiary p-4 transition-shadow duration-fast hover:shadow-md"
              >
                <a
                  href="${tool.url}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-lg font-semibold text-info no-underline hover:underline"
                >
                  ${tool.name}
                </a>
                <p class="m-0 mt-2 text-sm leading-relaxed text-text-secondary">
                  ${tool.desc[language]}
                </p>
              </li>
            `
          ).join('')}
        </ul>
      </div>
    `;
  }
}
