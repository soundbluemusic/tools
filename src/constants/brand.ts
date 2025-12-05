/**
 * Brand Configuration
 *
 * 🔧 포크 시 이 파일을 수정하세요!
 * 🔧 Modify this file when forking!
 *
 * 이 파일의 값을 본인의 브랜드로 변경하면 사이트 전체에 적용됩니다.
 * Changing these values will apply your branding across the entire site.
 */

export const BRAND = {
  /**
   * 사이트 이름 (Site name)
   * 헤더, 푸터, SEO 등에 사용됩니다
   */
  name: 'Tools',

  /**
   * 태그라인 (Tagline)
   * 사이트 제목 옆에 표시되는 짧은 설명
   */
  tagline: {
    ko: '모든 창작자를 위한 무료 도구',
    en: 'Free Tools for Every Creator',
  },

  /**
   * 저작권 표시 이름 (Copyright holder name)
   * 푸터 저작권 표시에 사용됩니다
   * 예: "© Your Name. MIT License"
   */
  copyrightHolder: 'Tools by SoundBlueMusic',

  /**
   * 사이트 URL (Site URL)
   * SEO, 공유 기능 등에 사용됩니다
   * 배포 시 본인의 도메인으로 변경하세요
   */
  siteUrl: 'https://tools.soundbluemusic.com',

  /**
   * GitHub 저장소 URL (GitHub repository URL)
   * 푸터의 GitHub 링크에 사용됩니다
   * 포크한 저장소 URL로 변경하세요
   * 빈 문자열('')로 설정하면 GitHub 링크가 숨겨집니다
   */
  githubUrl: 'https://github.com/soundbluemusic/tools',

  /**
   * 사이트 설명 (Site description)
   * SEO 및 공유 기능에 사용됩니다
   */
  description: {
    ko: '음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 온라인 도구. 회원가입 없이, 광고 없이, 완전히 무료.',
    en: 'Free online tools for musicians, writers, designers, filmmakers — every creator. No signup, no ads, completely free.',
  },

  /**
   * 공유 시 제목 (Share title)
   * 소셜 미디어 공유 시 표시되는 제목
   */
  shareTitle: {
    ko: 'Tools - 창작자를 위한 무료 도구',
    en: 'Tools - Free Tools for Creators',
  },
} as const;

export type Brand = typeof BRAND;
