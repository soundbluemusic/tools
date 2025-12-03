/**
 * Privacy Policy Page Component (Astro Version)
 */
import { memo } from 'react';
import { PageLayoutAstro } from './PageLayoutAstro';
import type { Language } from '../i18n/types';
import '../pages/_Legal.css';

interface PrivacyPageProps {
  language: Language;
}

const PrivacyPage = memo(function PrivacyPage({ language }: PrivacyPageProps) {
  const title = language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy';
  const description =
    language === 'ko'
      ? '본 서비스의 개인정보 처리에 관한 정책입니다'
      : 'Our privacy policy regarding data collection and usage';

  if (language === 'ko') {
    return (
      <PageLayoutAstro
        title={title}
        description={description}
        language={language}
      >
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 개요</h2>
            <p>
              Tools(이하 "서비스")는 사용자의 개인정보를 중요하게 생각합니다. 본
              개인정보 처리방침은 서비스가 어떤 정보를 수집하고 어떻게
              사용하는지 설명합니다.
            </p>
            <p className="legal-updated">최종 업데이트: 2025년 1월</p>
          </section>

          <section className="legal-section">
            <h2>2. 수집하는 정보</h2>
            <h3>2.1 자동으로 수집되는 정보</h3>
            <p>
              본 서비스는 다음 정보를 브라우저의 로컬 저장소(localStorage)에
              저장합니다:
            </p>
            <ul>
              <li>
                <strong>언어 설정:</strong> 사용자가 선택한 언어(한국어/영어)
              </li>
              <li>
                <strong>테마 설정:</strong> 사용자가 선택한 화면
                테마(라이트/다크)
              </li>
            </ul>
            <p>
              이 정보는 사용자의 기기에만 저장되며, 외부 서버로 전송되지
              않습니다.
            </p>

            <h3>2.2 수집하지 않는 정보</h3>
            <p>본 서비스는 다음 정보를 수집하지 않습니다:</p>
            <ul>
              <li>개인 식별 정보(이름, 이메일, 전화번호 등)</li>
              <li>위치 정보</li>
              <li>결제 정보</li>
              <li>사용 행동 분석 데이터</li>
              <li>쿠키(Cookie)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. 제3자 서비스</h2>
            <h3>3.1 Cloudflare</h3>
            <p>
              본 서비스는 Cloudflare를 통해 호스팅됩니다.{' '}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cloudflare 개인정보 처리방침
              </a>
            </p>

            <h3>3.2 Google Fonts</h3>
            <p>
              본 서비스는 웹 폰트를 제공하기 위해 Google Fonts를 사용합니다.{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 개인정보 처리방침
              </a>
            </p>
          </section>

          <section className="legal-section">
            <h2>4. 데이터 보안</h2>
            <p>본 서비스는 HTTPS를 통한 암호화된 연결을 사용합니다.</p>
          </section>

          <section className="legal-section">
            <h2>5. 문의</h2>
            <p>
              개인정보 처리에 관한 문의사항은 GitHub 저장소의 Issues를 통해
              연락해 주시기 바랍니다.
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
          <h2>1. Overview</h2>
          <p>
            Tools (the "Service") values your privacy. This Privacy Policy
            explains what information we collect and how we use it.
          </p>
          <p className="legal-updated">Last updated: January 2025</p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <h3>2.1 Automatically Collected Information</h3>
          <p>
            This Service stores the following in your browser's localStorage:
          </p>
          <ul>
            <li>
              <strong>Language preference:</strong> Your selected language
              (Korean/English)
            </li>
            <li>
              <strong>Theme preference:</strong> Your selected theme
              (Light/Dark)
            </li>
          </ul>
          <p>This information is stored only on your device.</p>

          <h3>2.2 Information We Do Not Collect</h3>
          <p>This Service does not collect:</p>
          <ul>
            <li>Personal identification information</li>
            <li>Location data</li>
            <li>Payment information</li>
            <li>Usage analytics</li>
            <li>Cookies</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Third-Party Services</h2>
          <h3>3.1 Cloudflare</h3>
          <p>
            This Service is hosted via Cloudflare.{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare Privacy Policy
            </a>
          </p>

          <h3>3.2 Google Fonts</h3>
          <p>
            This Service uses Google Fonts.{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Privacy Policy
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Data Security</h2>
          <p>This Service uses encrypted connections via HTTPS.</p>
        </section>

        <section className="legal-section">
          <h2>5. Contact</h2>
          <p>For questions, please contact us through GitHub Issues.</p>
        </section>
      </div>
    </PageLayoutAstro>
  );
});

PrivacyPage.displayName = 'PrivacyPage';

export default PrivacyPage;
