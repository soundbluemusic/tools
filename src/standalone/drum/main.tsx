import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

const initTheme = () => {
  const stored = localStorage.getItem('drum-theme');
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  }
};

initTheme();

render(() => <App />, document.getElementById('root')!);
