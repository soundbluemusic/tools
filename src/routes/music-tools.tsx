import type { Component } from 'solid-js';
import { CategoryPage } from '../components/CategoryPage';
import { MUSIC_APP_PATHS } from '../constants/apps';

const categorySEO = {
  ko: {
    title: '음악 도구',
    description:
      '음악가와 작곡가를 위한 무료 온라인 도구. 메트로놈, 드럼머신, 드럼 신스 등. 회원가입 없이, 광고 없이, 완전히 무료!',
    keywords: '무료 음악 도구, 메트로놈, 드럼머신, 드럼 신스, 음악가 도구',
  },
  en: {
    title: 'Music Tools',
    description:
      'Free online tools for musicians and composers. Metronome, drum machine, drum synth and more. No signup, no ads, completely free!',
    keywords:
      'free music tools, metronome, drum machine, drum synth, musician tools',
  },
};

const subtitle = {
  ko: '음악가와 작곡가를 위한 도구',
  en: 'Tools for musicians and composers',
};

/**
 * Music Tools Category Page
 */
const MusicTools: Component = () => (
  <CategoryPage
    seo={categorySEO}
    canonicalPath="/music-tools"
    subtitle={subtitle}
    filterApps={(apps) =>
      apps.filter((app) =>
        MUSIC_APP_PATHS.includes(app.url as (typeof MUSIC_APP_PATHS)[number])
      )
    }
  />
);

export default MusicTools;
