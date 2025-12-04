import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

// Initialize theme from localStorage or system preference
const initTheme = () => {
  const stored = localStorage.getItem('qr-theme');
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  }
};

initTheme();

render(() => <App />, document.getElementById('root')!);
