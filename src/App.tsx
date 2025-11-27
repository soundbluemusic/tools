import './App.css'

const apps = [
  {
    id: 1,
    name: '계약서 분석 도구',
    desc: '계약서의 위험 요소를 AI가 분석하여 핵심 조항을 빠르게 검토할 수 있습니다.',
    icon: '📄',
    url: '/contract'
  },
  {
    id: 2,
    name: '메트로놈',
    desc: '정확한 박자 연습을 위한 디지털 메트로놈으로 다양한 템포를 지원합니다.',
    icon: '🎵',
    url: '/metronome'
  },
  {
    id: 3,
    name: 'QR 코드 생성기',
    desc: '텍스트, URL 등을 QR 코드로 간편하게 변환하고 다운로드할 수 있습니다.',
    icon: '📱',
    url: '/qr'
  },
]

function App() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">♪</span>
            <h1 className="logo-text">SoundBlue</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className="hero">
            <h2 className="hero-title">Welcome to SoundBlue Apps</h2>
            <p className="hero-subtitle">
              일상을 더 편리하게 만들어주는 유용한 도구 모음
            </p>
            <div className="decorative-line">
              <span>◆</span>
            </div>
          </section>

          {/* Apps Section */}
          <section className="apps-section">
            <h3 className="section-title">Applications</h3>
            <div className="apps-grid">
              {apps.map(app => (
                <a key={app.id} href={app.url} className="app-card">
                  <span className="app-card-icon">{app.icon}</span>
                  <div className="app-card-content">
                    <div className="app-card-name">{app.name}</div>
                    <div className="app-card-desc">{app.desc}</div>
                  </div>
                  <div className="app-card-arrow">→</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-divider" />
          <p className="footer-text">
            © {currentYear} SoundBlue. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
