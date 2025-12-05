// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';

/**
 * FOUC (Flash of Unstyled Content) Prevention Script
 * Applies theme before CSS loads to prevent theme flash
 * Must execute synchronously before any content renders
 */
const themeScript = `(function(){
  try {
    var stored = localStorage.getItem('theme-preference');
    var theme = stored ? JSON.parse(stored) : null;
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = theme;
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
})()`;

/**
 * Critical CSS to hide app until styles are loaded
 * Prevents unstyled content flash during hydration
 */
const criticalCss = `#app{opacity:0;transition:opacity .15s ease-in}`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="ko">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
          {/* Critical CSS - must load before any content */}
          <style id="critical-css">{criticalCss}</style>
          {/* Theme script - prevents theme flash */}
          <script>{themeScript}</script>
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
