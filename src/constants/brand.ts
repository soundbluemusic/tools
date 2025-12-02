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
  name: 'Productivity Tools',

  /**
   * 저작권 표시 이름 (Copyright holder name)
   * 푸터 저작권 표시에 사용됩니다
   * 예: "© Your Name. MIT License"
   */
  copyrightHolder: 'SoundBlueMusic',

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
    ko: 'QR 코드 생성기, 메트로놈, 드럼머신 등 무료 온라인 도구',
    en: 'QR Code Generator, Metronome, Drum Machine and more free tools',
  },

  /**
   * 공유 시 제목 (Share title)
   * 소셜 미디어 공유 시 표시되는 제목
   */
  shareTitle: {
    ko: 'Productivity Tools - 무료 온라인 도구 모음',
    en: 'Productivity Tools - Free Online Tools',
  },
} as const;

export type Brand = typeof BRAND;
