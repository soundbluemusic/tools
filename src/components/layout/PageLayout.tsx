import { type ParentComponent, type JSX, Show } from 'solid-js';
import { cn } from '../../utils';
import { Breadcrumb } from '../Breadcrumb';
import '../../styles/tool-page.css';

interface BreadcrumbItem {
  label: { ko: string; en: string };
  href?: string;
}

interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Breadcrumb items */
  breadcrumb?: BreadcrumbItem[];
  /** Additional class names */
  class?: string;
  /** Header actions */
  actions?: JSX.Element;
}

/**
 * Reusable page layout component for tool pages
 * - Includes breadcrumb navigation for better UX
 * - GPU accelerated animations via CSS
 */
export const PageLayout: ParentComponent<PageLayoutProps> = (props) => {
  return (
    <div class={cn('p-6 md:p-8 max-[480px]:p-4 translate-z-0', props.class)}>
      {/* Breadcrumb Navigation */}
      <Show when={props.breadcrumb && props.breadcrumb.length > 0}>
        <Breadcrumb items={props.breadcrumb!} />
      </Show>

      <header class="flex justify-between items-start gap-4 max-[768px]:flex-col max-[768px]:gap-3 max-[480px]:gap-2 mb-6 max-[480px]:mb-4 [contain:layout_style]">
        <div class="flex-1 min-w-0">
          <h1 class="text-[clamp(1.25rem,5vw,1.75rem)] font-semibold m-0 mb-2 text-[var(--text-color)]">
            {props.title}
          </h1>
          <Show when={props.description}>
            <p class="text-[var(--color-text-secondary)] m-0 text-[0.95rem] leading-relaxed">
              {props.description}
            </p>
          </Show>
        </div>
        <Show when={props.actions}>
          <div class="flex items-center gap-2 flex-shrink-0 max-[768px]:w-full max-[768px]:justify-start">
            {props.actions}
          </div>
        </Show>
      </header>

      <div class="bg-[var(--color-bg-secondary,var(--bg-color))] rounded-xl max-[480px]:rounded-lg border border-[var(--color-border-secondary,transparent)] p-8 max-[768px]:p-6 max-[480px]:p-5 max-[360px]:p-4 [contain:layout_style] translate-z-0">
        {props.children}
      </div>
    </div>
  );
};
