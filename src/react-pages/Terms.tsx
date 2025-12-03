/**
 * Terms of Service Page Component (Astro Version)
 */
import { memo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import type { Language } from '../i18n/types';
import '../pages/_Legal.css';

interface TermsPageProps {
  language: Language;
}

const TermsPage = memo(function TermsPage({ language }: TermsPageProps) {
  const title = language === 'ko' ? '이용약관' : 'Terms of Service';
  const description =
    language === 'ko'
      ? '본 서비스의 이용약관입니다'
      : 'Terms of service for using our platform';

  if (language === 'ko') {
    return (
      <PageLayoutAstro
        title={title}
        description={description}
        language={language}
      >
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 서비스 이용</h2>
            <p>
              Tools(이하 "서비스")는 무료로 제공되는 온라인 도구 모음입니다.
              서비스 이용에 회원가입이 필요하지 않습니다.
            </p>
            <p className="legal-updated">최종 업데이트: 2025년 1월</p>
          </section>

          <section className="legal-section">
            <h2>2. 사용자 책임</h2>
            <p>사용자는 서비스를 합법적인 목적으로만 사용해야 합니다.</p>
          </section>

          <section className="legal-section">
            <h2>3. 오픈 소스 라이선스</h2>
            <p>본 서비스는 MIT 라이선스에 따라 오픈 소스로 제공됩니다.</p>
          </section>

          <section className="legal-section">
            <h2>4. 면책 조항</h2>
            <p>
              본 서비스는 "있는 그대로" 제공되며, 명시적이거나 묵시적인 어떠한
              보증도 하지 않습니다.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. 문의</h2>
            <p>
              문의사항은 GitHub 저장소의 Issues를 통해 연락해 주시기 바랍니다.
            </p>
          </section>
        </div>
      </PageLayoutAstro>
    );
  }

  return (
    <PageLayoutAstro
      title={title}
      description={description}
      language={language}
    >
      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Service Usage</h2>
          <p>
            Tools (the "Service") is a free collection of online tools. No
            registration is required to use the Service.
          </p>
          <p className="legal-updated">Last updated: January 2025</p>
        </section>

        <section className="legal-section">
          <h2>2. User Responsibility</h2>
          <p>Users must use the Service only for lawful purposes.</p>
        </section>

        <section className="legal-section">
          <h2>3. Open Source License</h2>
          <p>This Service is open source under the MIT License.</p>
        </section>

        <section className="legal-section">
          <h2>4. Disclaimer</h2>
          <p>The Service is provided "as is" without any warranties.</p>
        </section>

        <section className="legal-section">
          <h2>5. Contact</h2>
          <p>For questions, please contact us through GitHub Issues.</p>
        </section>
      </div>
    </PageLayoutAstro>
  );
});

TermsPage.displayName = 'TermsPage';

export default TermsPage;
