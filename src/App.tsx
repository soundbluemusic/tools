import './App.css'

const apps = [
  { id: 1, name: '계약서 분석 도구', desc: 'Contract Risk Analysis', icon: '📄', url: '/contract' },
  { id: 2, name: '메트로놈', desc: 'Metronome', icon: '🎵', url: '/metronome' },
  { id: 3, name: 'QR 코드 생성기', desc: 'QR Code Generator', icon: '📱', url: '/qr' },
]

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    }}>
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2rem' }}>
        🎨 SoundBlue Apps
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        width: '100%',
        maxWidth: '800px'
      }}>
        {apps.map(app => (
          
            key={app.id}
            href={app.url}
            className="app-card"
          >
            <span style={{ fontSize: '2.5rem' }}>{app.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.name}</div>
              <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{app.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default App