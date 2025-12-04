import { type Component, Show } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { PageLayout } from '../components/layout';
import { useLanguage } from '../i18n';
import { useSEO } from '../hooks';
import '../styles/pages/Legal.css';

/**
 * Privacy Policy Page
 */
const Privacy: Component = () => {
  const { language } = useLanguage();

  const title = () =>
    language() === 'ko' ? '개인정보 처리방침' : 'Privacy Policy';
  const description = () =>
    language() === 'ko'
      ? '본 서비스의 개인정보 처리에 관한 정책입니다'
      : 'Our privacy policy regarding data collection and usage';

  useSEO({
    title: title(),
    description: description(),
    canonicalPath: '/privacy',
    noindex: true,
  });

  return (
    <>
      <Title>{title()} | Tools</Title>
      <Meta name="robots" content="noindex, nofollow" />

      <PageLayout title={title()} description={description()}>
        <div class="legal-content">
          <Show
            when={language() === 'ko'}
            fallback={
              <>
                <section class="legal-section">
                  <h2>1. Overview</h2>
                  <p>
                    Tools (the "Service") values your privacy. This Privacy
                    Policy explains what information we collect and how we use
                    it.
                  </p>
                  <p class="legal-updated">Last updated: January 2025</p>
                </section>

                <section class="legal-section">
                  <h2>2. Information We Collect</h2>
                  <h3>2.1 Automatically Collected Information</h3>
                  <p>
                    This Service stores the following information in your
                    browser's local storage (localStorage):
                  </p>
                  <ul>
                    <li>
                      <strong>Language preference:</strong> Your selected
                      language (Korean/English)
                    </li>
                    <li>
                      <strong>Theme preference:</strong> Your selected theme
                      (Light/Dark)
                    </li>
                  </ul>
                  <p>
                    This information is stored only on your device and is not
                    transmitted to any external servers.
                  </p>

                  <h3>2.2 Information We Do Not Collect</h3>
                  <p>This Service does not collect:</p>
                  <ul>
                    <li>
                      Personal identification information (name, email, phone,
                      etc.)
                    </li>
                    <li>Location data</li>
                    <li>Payment information</li>
                    <li>Usage analytics data</li>
                    <li>Cookies</li>
                  </ul>
                </section>

                <section class="legal-section">
                  <h2>3. Third-Party Services</h2>
                  <h3>3.1 Cloudflare</h3>
                  <p>
                    This Service is hosted via Cloudflare. Cloudflare may
                    process basic connection information (IP address, browser
                    type, etc.) to provide the service.{' '}
                    <a
                      href="https://www.cloudflare.com/privacypolicy/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cloudflare Privacy Policy
                    </a>
                  </p>
                </section>

                <section class="legal-section">
                  <h2>4. Data Security</h2>
                  <p>
                    This Service uses encrypted connections via HTTPS and
                    implements appropriate security headers to protect user
                    security.
                  </p>
                </section>

                <section class="legal-section">
                  <h2>5. Contact</h2>
                  <p>
                    For questions about privacy practices, please contact us
                    through Issues on our GitHub repository.
                  </p>
                </section>
              </>
            }
          >
            <section class="legal-section">
              <h2>1. 개요</h2>
              <p>
                Tools(이하 "서비스")는 사용자의 개인정보를 중요하게 생각합니다.
                본 개인정보 처리방침은 서비스가 어떤 정보를 수집하고 어떻게
                사용하는지 설명합니다.
              </p>
              <p class="legal-updated">최종 업데이트: 2025년 1월</p>
            </section>

            <section class="legal-section">
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

            <section class="legal-section">
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
            </section>

            <section class="legal-section">
              <h2>4. 데이터 보안</h2>
              <p>
                본 서비스는 HTTPS를 통한 암호화된 연결을 사용하며, 적절한 보안
                헤더를 적용하여 사용자의 보안을 보호합니다.
              </p>
            </section>

            <section class="legal-section">
              <h2>5. 문의</h2>
              <p>
                개인정보 처리에 관한 문의사항은 GitHub 저장소의 Issues를 통해
                연락해 주시기 바랍니다.
              </p>
            </section>
          </Show>
        </div>
      </PageLayout>
    </>
  );
};

export default Privacy;
