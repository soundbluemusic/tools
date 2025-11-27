import './App.css'

const apps = [
  { id: 1, name: '계약서 분석 도구', desc: 'Contract Risk Analysis', icon: '📄', url: '/contract' },
  { id: 2, name: '메트로놈', desc: 'Metronome', icon: '🎵', url: '/metronome' },
  { id: 3, name: 'QR 코드 생성기', desc: 'QR Code Generator', icon: '📱', url: '/qr' },
]

function App() {
  return (
    <>
      <div className="container">
        <h1>🎨 SoundBlue Apps</h1>
        <div className="grid">
          {apps.map(app => (
            <a key={app.id} href={app.url} className="app-card">
              <span className="icon">{app.icon}</span>
              <div>
                <div className="name">{app.name}</div>
                <div className="desc">{app.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

export default App