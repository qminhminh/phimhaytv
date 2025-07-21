const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://phimhaytv.top';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function generateStaticSitemap() {
  console.log('Generating static pages sitemap...');
  
  const staticPages = [
    {
      url: '/',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/latest',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/phim-le',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/phim-bo',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/tv-shows',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/hoat-hinh',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/vietsub',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/phim-thuyet-minh',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/phim-long-tieng',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      url: '/search',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.6'
    }
  ];

  const urls = staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap-static.xml');
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`Generated sitemap-static.xml with ${staticPages.length} static pages.`);
}

function updateSitemapIndex() {
  const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  
  // Tự động tìm tất cả sitemap files hiện có (trừ sitemap.xml chính)
  const allSitemapFiles = fs.readdirSync(PUBLIC_DIR)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'))
    .sort((a, b) => {
      // Đặt sitemap-static.xml lên đầu
      if (a === 'sitemap-static.xml') return -1;
      if (b === 'sitemap-static.xml') return 1;
      return a.localeCompare(b);
    });

  // Lọc ra chỉ những files thực sự tồn tại
  const existingFiles = allSitemapFiles.filter(filename => {
    const filePath = path.join(PUBLIC_DIR, filename);
    return fs.existsSync(filePath);
  });

  const sitemapIndexEntries = existingFiles.map(filename => {
    const filePath = path.join(PUBLIC_DIR, filename);
    const stats = fs.statSync(filePath);
    const lastMod = stats.mtime;
    
    return `
  <sitemap>
    <loc>${SITE_URL}/${filename}</loc>
    <lastmod>${lastMod.toISOString()}</lastmod>
  </sitemap>`;
  }).join('');

  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries}
</sitemapindex>`;

  fs.writeFileSync(sitemapIndexPath, sitemapIndexContent);
  console.log(`Updated sitemap.xml (index file) with ${existingFiles.length} sitemaps.`);
}

// Chạy script
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

generateStaticSitemap();
updateSitemapIndex();

console.log('Static sitemap generation completed!'); 