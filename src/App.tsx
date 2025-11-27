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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.2s',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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