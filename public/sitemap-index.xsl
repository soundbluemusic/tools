<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap Index - Tools</title>
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
          .sitemap-list {
            list-style: none;
          }
          .sitemap-item {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 16px;
            transition: all 0.15s ease;
          }
          .sitemap-item:hover {
            border-color: #2563eb;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
          }
          .sitemap-link {
            color: #2563eb;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            display: block;
            margin-bottom: 8px;
          }
          .sitemap-link:hover {
            text-decoration: underline;
          }
          .sitemap-meta {
            font-size: 13px;
            color: #666;
          }
          .sitemap-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-right: 12px;
            vertical-align: middle;
            background: #f3f4f6;
            border-radius: 4px;
            text-align: center;
            line-height: 24px;
            font-size: 14px;
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
          <h1>Sitemap Index</h1>
          <p class="count"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps</p>

          <ul class="sitemap-list">
            <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
              <li class="sitemap-item">
                <xsl:variable name="loc" select="sitemap:loc"/>
                <xsl:variable name="name">
                  <xsl:choose>
                    <xsl:when test="contains($loc, 'sitemap-pages')">
                      <xsl:text>Pages</xsl:text>
                    </xsl:when>
                    <xsl:when test="contains($loc, 'sitemap-tools')">
                      <xsl:text>Tools</xsl:text>
                    </xsl:when>
                    <xsl:when test="contains($loc, 'sitemap-info')">
                      <xsl:text>Information</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:text>Sitemap</xsl:text>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>
                <xsl:variable name="icon">
                  <xsl:choose>
                    <xsl:when test="contains($loc, 'sitemap-pages')">🏠</xsl:when>
                    <xsl:when test="contains($loc, 'sitemap-tools')">🔧</xsl:when>
                    <xsl:when test="contains($loc, 'sitemap-info')">ℹ️</xsl:when>
                    <xsl:otherwise>📄</xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>
                <a class="sitemap-link" href="{sitemap:loc}">
                  <span class="sitemap-icon"><xsl:value-of select="$icon"/></span>
                  <xsl:value-of select="$name"/> Sitemap
                </a>
                <div class="sitemap-meta">
                  Last modified: <xsl:value-of select="sitemap:lastmod"/>
                </div>
              </li>
            </xsl:for-each>
          </ul>

          <a class="back-link" href="/">Back to Tools</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
