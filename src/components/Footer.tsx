import { type Component } from 'solid-js';
import { Link } from './ui';
import { useTranslations, useLanguage } from '../i18n';
import { useLocalizedPath } from '../hooks';
import { BRAND } from '../constants';

/**
 * Footer component - Reference: soundbluemusic.com style
 * Simple centered links with copyright
 */
export const Footer: Component = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const { toLocalizedPath } = useLocalizedPath();

  const getPath = (path: string) => toLocalizedPath(path);

  const linkClass =
    'text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-text-primary)] transition-colors duration-150';

  return (
    <footer class="footer">
      {/* Footer Menu - Simple centered links */}
      <nav
        class="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4"
        aria-label="Footer navigation"
      >
        <Link href={getPath('/privacy')} class={linkClass}>
          {t().common.footer.privacy}
        </Link>
        <Link href={getPath('/terms')} class={linkClass}>
          {t().common.footer.terms}
        </Link>
        <Link href={getPath('/opensource')} class={linkClass}>
          {language() === 'ko' ? '라이선스' : 'License'}
        </Link>
        <Link href={getPath('/sitemap')} class={linkClass}>
          {t().common.footer.sitemap}
        </Link>
      </nav>

      {/* Copyright */}
      <p class="text-center text-[var(--color-text-tertiary)] text-xs m-0">
        © {BRAND.copyrightHolder}. All rights reserved.
      </p>
    </footer>
  );
};
