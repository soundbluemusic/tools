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
    <div class={cn('tool-page', props.class)}>
      {/* Breadcrumb Navigation */}
      <Show when={props.breadcrumb && props.breadcrumb.length > 0}>
        <Breadcrumb items={props.breadcrumb!} />
      </Show>

      <header class="tool-header">
        <div class="tool-header-content">
          <h1 class="tool-title">{props.title}</h1>
          <Show when={props.description}>
            <p class="tool-desc">{props.description}</p>
          </Show>
        </div>
        <Show when={props.actions}>
          <div class="tool-actions">{props.actions}</div>
        </Show>
      </header>

      <div class="tool-content">{props.children}</div>
    </div>
  );
};
