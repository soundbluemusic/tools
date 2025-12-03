/**
 * Privacy Policy Page - Vanilla TypeScript
 */
import { Component, html } from '../../core';
import { languageStore } from '../../core/Store';

export class PrivacyPage extends Component {
  protected render(): string {
    const language = languageStore.getState().language;

    if (language === 'ko') {
      return html`
        <div class="max-w-container-md mx-auto px-4 py-8">
          <header class="mb-8">
            <h1 class="text-3xl font-bold text-text-primary mb-2">
              개인정보 처리방침
            </h1>
            <p class="text-text-secondary">
              본 서비스의 개인정보 처리에 관한 정책입니다
            </p>
          </header>

          <div class="mx-auto max-w-3xl">
            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                1. 개요
              </h2>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                Tools(이하 "서비스")는 사용자의 개인정보를 중요하게 생각합니다.
                본 개인정보 처리방침은 서비스가 어떤 정보를 수집하고 어떻게
                사용하는지 설명합니다.
              </p>
              <p class="text-sm italic text-text-tertiary">
                최종 업데이트: 2025년 1월
              </p>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                2. 수집하는 정보
              </h2>
              <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
                2.1 자동으로 수집되는 정보
              </h3>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 서비스는 다음 정보를 브라우저의 로컬 저장소(localStorage)에
                저장합니다:
              </p>
              <ul class="mb-3 list-disc pl-6">
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  <strong class="text-text-primary">언어 설정:</strong>
                  사용자가 선택한 언어(한국어/영어)
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  <strong class="text-text-primary">테마 설정:</strong>
                  사용자가 선택한 화면 테마(라이트/다크)
                </li>
              </ul>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                이 정보는 사용자의 기기에만 저장되며, 외부 서버로 전송되지
                않습니다.
              </p>

              <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
                2.2 수집하지 않는 정보
              </h3>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 서비스는 다음 정보를 수집하지 않습니다:
              </p>
              <ul class="mb-3 list-disc pl-6">
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  개인 식별 정보(이름, 이메일, 전화번호 등)
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  위치 정보
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  결제 정보
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  사용 행동 분석 데이터
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  쿠키(Cookie)
                </li>
              </ul>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                3. 제3자 서비스
              </h2>
              <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
                3.1 Cloudflare
              </h3>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 서비스는 Cloudflare를 통해 호스팅됩니다. Cloudflare는 서비스
                제공을 위해 기본적인 연결 정보(IP 주소, 브라우저 유형 등)를
                처리할 수 있습니다.
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-info no-underline hover:underline"
                >
                  Cloudflare 개인정보 처리방침
                </a>
              </p>

              <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
                3.2 Google Fonts
              </h3>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 서비스는 웹 폰트를 제공하기 위해 Google Fonts를 사용합니다.
                폰트 로딩 시 Google 서버에 연결되며, 이 과정에서 IP 주소 등의
                정보가 Google에 전송될 수 있습니다.
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-info no-underline hover:underline"
                >
                  Google 개인정보 처리방침
                </a>
              </p>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                4. 데이터 보안
              </h2>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 서비스는 HTTPS를 통한 암호화된 연결을 사용하며, 적절한 보안
                헤더를 적용하여 사용자의 보안을 보호합니다.
              </p>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                5. 사용자 권리
              </h2>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                사용자는 다음과 같은 권리를 가집니다:
              </p>
              <ul class="mb-3 list-disc pl-6">
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  브라우저 설정에서 localStorage 데이터를 삭제할 수 있습니다
                </li>
                <li class="mb-2 text-base leading-relaxed text-text-secondary">
                  브라우저의 개인정보 보호 모드를 사용하여 데이터 저장을 방지할
                  수 있습니다
                </li>
              </ul>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                6. 정책 변경
              </h2>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                본 개인정보 처리방침은 법률 변경이나 서비스 변경에 따라 수정될
                수 있습니다. 중요한 변경 사항이 있을 경우 서비스 내에서
                공지합니다.
              </p>
            </section>

            <section class="mb-6">
              <h2
                class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
              >
                7. 문의
              </h2>
              <p class="mb-3 text-base leading-relaxed text-text-secondary">
                개인정보 처리에 관한 문의사항은 GitHub 저장소의 Issues를 통해
                연락해 주시기 바랍니다.
              </p>
            </section>
          </div>
        </div>
      `;
    }

    // English version
    return html`
      <div class="max-w-container-md mx-auto px-4 py-8">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-text-primary mb-2">
            Privacy Policy
          </h1>
          <p class="text-text-secondary">
            Our privacy policy regarding data collection and usage
          </p>
        </header>

        <div class="mx-auto max-w-3xl">
          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              1. Overview
            </h2>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              Tools (the "Service") values your privacy. This Privacy Policy
              explains what information we collect and how we use it.
            </p>
            <p class="text-sm italic text-text-tertiary">
              Last updated: January 2025
            </p>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              2. Information We Collect
            </h2>
            <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
              2.1 Automatically Collected Information
            </h3>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Service stores the following information in your browser's
              local storage (localStorage):
            </p>
            <ul class="mb-3 list-disc pl-6">
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                <strong class="text-text-primary">Language preference:</strong>
                Your selected language (Korean/English)
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                <strong class="text-text-primary">Theme preference:</strong>
                Your selected theme (Light/Dark)
              </li>
            </ul>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This information is stored only on your device and is not
              transmitted to any external servers.
            </p>

            <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
              2.2 Information We Do Not Collect
            </h3>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Service does not collect:
            </p>
            <ul class="mb-3 list-disc pl-6">
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                Personal identification information (name, email, phone, etc.)
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                Location data
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                Payment information
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                Usage analytics data
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                Cookies
              </li>
            </ul>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              3. Third-Party Services
            </h2>
            <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
              3.1 Cloudflare
            </h3>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Service is hosted via Cloudflare. Cloudflare may process
              basic connection information (IP address, browser type, etc.) to
              provide the service.
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-info no-underline hover:underline"
              >
                Cloudflare Privacy Policy
              </a>
            </p>

            <h3 class="mb-2 mt-4 text-lg font-medium text-text-primary">
              3.2 Google Fonts
            </h3>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Service uses Google Fonts to provide web fonts. When loading
              fonts, your browser connects to Google servers, and information
              such as your IP address may be transmitted to Google.
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                class="text-info no-underline hover:underline"
              >
                Google Privacy Policy
              </a>
            </p>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              4. Data Security
            </h2>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Service uses encrypted connections via HTTPS and implements
              appropriate security headers to protect user security.
            </p>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              5. Your Rights
            </h2>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              You have the following rights:
            </p>
            <ul class="mb-3 list-disc pl-6">
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                You can delete localStorage data through your browser settings
              </li>
              <li class="mb-2 text-base leading-relaxed text-text-secondary">
                You can use your browser's private browsing mode to prevent data
                storage
              </li>
            </ul>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              6. Policy Changes
            </h2>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              This Privacy Policy may be updated due to legal changes or service
              updates. Significant changes will be announced within the Service.
            </p>
          </section>

          <section class="mb-6">
            <h2
              class="mb-3 border-b border-border-secondary pb-2 text-xl font-semibold text-text-primary"
            >
              7. Contact
            </h2>
            <p class="mb-3 text-base leading-relaxed text-text-secondary">
              For questions about privacy practices, please contact us through
              Issues on our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    `;
  }
}
