import { type Component } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n/context';
import { useSEO } from '../hooks';
import '../styles/pages/About.css';

const pageContent = {
  title: {
    ko: '소개',
    en: 'About',
  },
  seo: {
    ko: {
      description:
        '음악가, 작가, 디자이너, 영상 제작자 — 모든 창작자를 위한 무료 온라인 도구. 왜 무료인지, 누구를 위한 것인지 알아보세요.',
      keywords:
        '무료 창작 도구, 창작자를 위한 도구, 무료 온라인 도구, 음악가 도구, 디자이너 도구',
    },
    en: {
      description:
        'Free online tools for musicians, writers, designers, filmmakers — every creator. Learn why we make these tools free.',
      keywords:
        'free creative tools, tools for creators, free online tools, musician tools, designer tools',
    },
  },
  hero: {
    ko: {
      headline: '모든 창작자를 위한 무료 도구',
      subheadline: '회원가입 없이, 광고 없이, 완전히 무료.',
    },
    en: {
      headline: 'Free Tools for Every Creator',
      subheadline: 'No signup, no ads, completely free.',
    },
  },
  forCreators: {
    ko: {
      title: '누구를 위한 도구인가요?',
      items: [
        '음악가 — 연습실에서 메트로놈이 필요할 때',
        '작곡가 — 드럼 패턴을 실험할 때',
        '디자이너 — QR 코드를 빠르게 만들 때',
        '영상 제작자 — 사운드 레퍼런스가 필요할 때',
        '댄서 — 안무 연습에 정확한 템포가 필요할 때',
        '그리고 오늘 처음 무언가를 만들어보려는 당신',
      ],
    },
    en: {
      title: 'Who is this for?',
      items: [
        'Musicians — when you need a metronome in the practice room',
        'Composers — when experimenting with drum patterns',
        'Designers — when you need a QR code quickly',
        'Filmmakers — when you need a sound reference',
        'Dancers — when you need precise tempo for choreography',
        'And you, trying to create something for the first time today',
      ],
    },
  },
  philosophy: {
    ko: {
      title: '왜 무료인가요?',
      content: `창작은 누구나 할 수 있어야 합니다.

좋은 도구는 비싸거나 복잡할 필요가 없습니다.
필요한 순간에, 누구나, 바로 사용할 수 있어야 합니다.

그래서 우리는 이 도구들을 무료로 공개합니다.
광고도, 회원가입도, 숨겨진 비용도 없습니다.

모든 코드는 오픈소스로 공개되어 있습니다.
누구나 보고, 수정하고, 자신의 것으로 만들 수 있습니다.`,
    },
    en: {
      title: 'Why free?',
      content: `Creation should be accessible to everyone.

Good tools don't need to be expensive or complicated.
They should be available instantly, to anyone, when needed.

That's why we make these tools free.
No ads, no signup, no hidden costs.

All code is open source.
Anyone can view, modify, and make it their own.`,
    },
  },
  cta: {
    ko: '지금 바로 시작하세요',
    en: 'Start creating now',
  },
};

/**
 * About Page Component
 */
const About: Component = () => {
  const { language } = useLanguage();

  useSEO({
    title: pageContent.title[language()],
    description: pageContent.seo[language()].description,
    keywords: pageContent.seo[language()].keywords,
    canonicalPath: '/about',
  });

  return (
    <>
      <Title>{pageContent.title[language()]} | Tools</Title>
      <Meta
        name="description"
        content={pageContent.seo[language()].description}
      />

      <PageLayout title={pageContent.title[language()]}>
        <div class="about-container">
          {/* Hero Section */}
          <section class="about-hero">
            <h2 class="about-hero-headline">
              {pageContent.hero[language()].headline}
            </h2>
            <p class="about-hero-subheadline">
              {pageContent.hero[language()].subheadline}
            </p>
          </section>

          {/* For Creators Section */}
          <section class="about-section">
            <h3 class="about-section-title">
              {pageContent.forCreators[language()].title}
            </h3>
            <ul class="about-creator-list">
              {pageContent.forCreators[language()].items.map((item) => (
                <li class="about-creator-item">{item}</li>
              ))}
            </ul>
          </section>

          {/* Philosophy Section */}
          <section class="about-section">
            <h3 class="about-section-title">
              {pageContent.philosophy[language()].title}
            </h3>
            <div class="about-philosophy-content">
              {pageContent.philosophy[language()].content
                .split('\n\n')
                .map((paragraph) => (
                  <p class="about-philosophy-paragraph">{paragraph}</p>
                ))}
            </div>
          </section>

          {/* CTA */}
          <section class="about-cta">
            <a href="/" class="about-cta-button">
              {pageContent.cta[language()]}
            </a>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default About;
