<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap - Tools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8f9fa;
            color: #333;
            line-height: 1.6;
            padding: 40px 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            padding: 40px;
          }
          h1 {
            font-size: 32px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .count {
            color: #666;
            font-size: 14px;
            margin-bottom: 32px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
            margin-bottom: 16px;
          }
          .url-group {
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .url-group:last-child {
            border-bottom: none;
          }
          .url-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
          }
          .url-link {
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
            word-break: break-all;
          }
          .url-link:hover {
            text-decoration: underline;
          }
          .lang-badge {
            font-size: 11px;
            font-weight: 500;
            color: #666;
            background: #f3f4f6;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            flex-shrink: 0;
            margin-left: 12px;
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #eee;
          }
          .back-link:hover {
            text-decoration: underline;
          }
          .back-link::before {
            content: '←';
            margin-right: 8px;
          }
          @media (max-width: 600px) {
            body {
              padding: 20px 12px;
            }
            .container {
              padding: 24px 20px;
            }
            h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sitemap</h1>
          <p class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</p>

          <div class="section-title">Pages</div>

          <!-- Only process English URLs (not containing /ko) -->
          <xsl:for-each select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/ko'))]">
            <xsl:sort select="sitemap:priority" order="descending"/>
            <xsl:variable name="en-url" select="sitemap:loc"/>
            <xsl:variable name="path" select="substring-after($en-url, '.com')"/>

            <!-- Calculate Korean URL -->
            <xsl:variable name="ko-url">
              <xsl:choose>
                <xsl:when test="$path = '' or $path = '/'">
                  <xsl:value-of select="concat($en-url, '/ko')"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="concat(substring-before($en-url, $path), '/ko', $path)"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:variable>

            <div class="url-group">
              <!-- English URL -->
              <div class="url-row">
                <a class="url-link" href="{$en-url}">
                  <xsl:value-of select="$en-url"/>
                </a>
                <span class="lang-badge">EN</span>
              </div>

              <!-- Korean URL (if exists in sitemap) -->
              <xsl:if test="//sitemap:url[sitemap:loc = $ko-url]">
                <div class="url-row">
                  <a class="url-link" href="{$ko-url}">
                    <xsl:value-of select="$ko-url"/>
                  </a>
                  <span class="lang-badge">KO</span>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>

          <a class="back-link" href="/">Back to Tools</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
