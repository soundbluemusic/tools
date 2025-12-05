import type { Component } from 'solid-js';
import { CategoryPage } from '../components/CategoryPage';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '기타 도구',
    description:
      '디자이너와 마케터를 위한 무료 온라인 도구. QR 코드 생성기 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 도구, QR 코드 생성기, 디자이너 도구, 마케터 도구',
  },
  en: {
    title: 'Other Tools',
    description:
      'Free online tools for designers and marketers. QR code generator and more. No signup, no ads, completely free!',
    keywords: 'free tools, QR code generator, designer tools, marketer tools',
  },
};

const subtitle = {
  ko: '디자이너와 마케터를 위한 도구',
  en: 'Tools for designers and marketers',
};

/**
 * Other Tools Category Page
 */
const OtherTools: Component = () => (
  <CategoryPage
    seo={categorySEO}
    canonicalPath="/other-tools"
    subtitle={subtitle}
    filterApps={(apps) =>
      apps.filter(
        (app) =>
          !MUSIC_APP_PATHS.includes(
            app.url as (typeof MUSIC_APP_PATHS)[number]
          ) &&
          !COMBINED_APP_PATHS.includes(
            app.url as (typeof COMBINED_APP_PATHS)[number]
          )
      )
    }
  />
);

export default OtherTools;
