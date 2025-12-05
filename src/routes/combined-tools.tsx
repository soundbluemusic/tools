import type { Component } from 'solid-js';
import { CategoryPage } from '../components/CategoryPage';
import { COMBINED_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '결합 도구',
    description:
      '여러 기능을 하나로 결합한 올인원 도구. 드럼 툴 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 도구, 올인원 도구, 드럼 툴, 결합 도구',
  },
  en: {
    title: 'Combined Tools',
    description:
      'All-in-one tools combining multiple features. Drum Tool and more. No signup, no ads, completely free!',
    keywords: 'free tools, all-in-one tools, drum tool, combined tools',
  },
};

const subtitle = {
  ko: '여러 기능을 하나로 결합한 도구',
  en: 'All-in-one tools combining multiple features',
};

/**
 * Combined Tools Category Page
 */
const CombinedTools: Component = () => (
  <CategoryPage
    seo={categorySEO}
    canonicalPath="/combined-tools"
    subtitle={subtitle}
    filterApps={(apps) =>
      apps.filter((app) =>
        COMBINED_APP_PATHS.includes(
          app.url as (typeof COMBINED_APP_PATHS)[number]
        )
      )
    }
  />
);

export default CombinedTools;
