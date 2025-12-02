/**
 * Brand Configuration
 *
 * 이 파일을 수정하여 브랜드를 커스터마이즈하세요.
 * Customize your brand by modifying this file.
 *
 * 포크 시 이 파일만 수정하면 사이트 전체의 브랜드가 변경됩니다.
 * When forking, just modify this file to change branding across the entire site.
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
  copyrightHolder: 'Productivity Tools',

  /**
   * 사이트 URL (Site URL)
   * SEO, 공유 기능 등에 사용됩니다
   * 배포 시 본인의 도메인으로 변경하세요
   */
  siteUrl: 'https://example.com',

  /**
   * GitHub 저장소 URL (GitHub repository URL)
   * 푸터의 GitHub 링크에 사용됩니다
   * 포크한 저장소 URL로 변경하세요
   * 빈 문자열('')로 설정하면 GitHub 링크가 숨겨집니다
   */
  githubUrl: '',

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
