const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://phimapi.com';
const SITE_URL = 'https://phimhaytv.top'; // Thay đổi thành domain của bạn
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_MAX_URLS = 5000;

// --- Helper Functions ---

async function fetcher(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Error fetching ${url.toString()}: ${res.status} ${res.statusText}`);
      return null; // Return null instead of throwing to allow partial success
    }
    return res.json();
  } catch (error) {
    console.error(`Network or other error fetching ${url.toString()}:`, error);
    return null; // Return null on network error
  }
}

function writeSitemapFile(fileName, urls) {
  if (urls.length === 0) return;
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
  
  const sitemapPath = path.join(PUBLIC_DIR, fileName);
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`Generated ${fileName} with ${urls.length} URLs.`);
}

function updateSitemapIndex(sitemapFiles) {
  const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  const existingSitemaps = new Set();

  // Read existing sitemaps if the index file exists
  if (fs.existsSync(sitemapIndexPath)) {
    const sitemapIndexContent = fs.readFileSync(sitemapIndexPath, 'utf-8');
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(sitemapIndexContent)) !== null) {
      // Keep only non-recent sitemaps from the old index
      if (!match[1].includes('sitemap-recent')) {
        existingSitemaps.add(match[1]);
      }
    }
  }

  // Add the new sitemap files (could be full or recent)
  sitemapFiles.forEach(filename => {
    existingSitemaps.add(`${SITE_URL}/${filename}`);
  });

  const sitemapIndexEntries = Array.from(existingSitemaps).map(loc => {
    const filename = loc.replace(`${SITE_URL}/`, '');
    const filePath = path.join(PUBLIC_DIR, filename);
    let lastMod = new Date(); // Default to now
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        lastMod = stats.mtime;
    }
    return `
  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastMod.toISOString()}</lastmod>
  </sitemap>`;
  }).join('');

  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries}
</sitemapindex>`;

  fs.writeFileSync(sitemapIndexPath, sitemapIndexContent);
  console.log('Generated sitemap.xml (index file).');
}

async function getEpisodeUrlsForMovies(movies) {
    let allEpisodeUrls = [];
    const concurrencyLimit = 50;
    
    console.log(`\nFetching episode data for ${movies.length} movies...`);

    for (let i = 0; i < movies.length; i += concurrencyLimit) {
        const movieBatch = movies.slice(i, i + concurrencyLimit);
        process.stdout.write(`  - Processing movies ${i + 1}-${Math.min(i + concurrencyLimit, movies.length)}/${movies.length}...\r`);

        const promises = movieBatch.map(async (movie) => {
            const data = await fetcher(`/phim/${movie.slug}`);
            if (!data) return [];

            const detail = data.movie || data.item;
            const episodes = data.episodes || (data.item ? data.item.episodes : []);
            if (!detail || !episodes) return [];

            const lastMod = detail.modified?.time ? new Date(detail.modified.time).toISOString() : new Date().toISOString();
            const episodeUrls = [];

            episodes.forEach(server => {
                server.server_data?.forEach(episode => {
                    episodeUrls.push(`
  <url>
    <loc>${SITE_URL}/watch/${movie.slug}/${episode.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
                });
            });
            return episodeUrls;
        });

        const results = await Promise.all(promises);
        results.forEach(urls => allEpisodeUrls.push(...urls));
    }
    console.log(`\nFound ${allEpisodeUrls.length} total episode URLs.`);
    return Array.from(new Set(allEpisodeUrls)); // Deduplicate
}


// --- Sitemap Generation Modes ---

/**
 * FULL REBUILD MODE
 * Fetches all movies and regenerates all sitemap files from scratch.
 * This is slow and should be run periodically.
 */
async function generateFullSitemap() {
  console.log('Starting full sitemap generation...');
  let movies = [];
  let currentPage = 1;
  let totalPages = 1;

  // 1. Fetch all movies
  const initialResponse = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { page: 1, limit: 100 });
  if (!initialResponse?.status) {
    console.error("Could not fetch initial movie data. Aborting.");
    return;
  }
  
  movies.push(...initialResponse.items);
  totalPages = initialResponse.pagination.totalPages;
  console.log(`Total pages to fetch: ${totalPages}`);

  for (currentPage = 2; currentPage <= totalPages; currentPage++) {
    process.stdout.write(`Fetching page ${currentPage}/${totalPages}... \r`);
    const response = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { page: currentPage, limit: 100 });
    if (response?.status) {
      movies.push(...response.items);
    }
  }
  
  const uniqueMovies = Array.from(new Map(movies.map(m => [m._id, m])).values());
  console.log(`\nFetched a total of ${uniqueMovies.length} unique movies.`);

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const sitemapFiles = [];

  // 2. Generate sitemap for movies
  const movieUrls = uniqueMovies.map(movie => {
    const lastMod = movie.modified?.time ? new Date(movie.modified.time).toISOString() : new Date().toISOString();
    return `
  <url>
    <loc>${SITE_URL}/movies/${movie.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  for (let i = 0; i < movieUrls.length; i += SITEMAP_MAX_URLS) {
    const chunk = movieUrls.slice(i, i + SITEMAP_MAX_URLS);
    const sitemapFileName = `sitemap-movies-${sitemapFiles.filter(f=>f.startsWith("sitemap-movies")).length + 1}.xml`;
    writeSitemapFile(sitemapFileName, chunk);
    sitemapFiles.push(sitemapFileName);
  }

  // 3. Generate sitemap for episodes
  const episodeUrls = await getEpisodeUrlsForMovies(uniqueMovies);
  for (let i = 0; i < episodeUrls.length; i += SITEMAP_MAX_URLS) {
    const chunk = episodeUrls.slice(i, i + SITEMAP_MAX_URLS);
    const sitemapFileName = `sitemap-episodes-${sitemapFiles.filter(f=>f.startsWith("sitemap-episodes")).length + 1}.xml`;
    writeSitemapFile(sitemapFileName, chunk);
    sitemapFiles.push(sitemapFileName);
  }
  
  // 4. Update sitemap index
  updateSitemapIndex(sitemapFiles);
}


/**
 * RECENT UPDATE MODE
 * Fetches only the most recent movies and creates dedicated sitemaps for them.
 * This is fast and intended to be run on every build.
 */
async function generateRecentSitemap() {
  console.log('Starting recent sitemap update...');
  
  // 1. Fetch recent movies (first page)
  const response = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { page: 1, limit: 100 });
  if (!response?.status) {
    console.error('Could not fetch recent movies. Aborting.');
    return;
  }
  const recentMovies = response.items;
  console.log(`Fetched ${recentMovies.length} recent movies.`);
  
  if (recentMovies.length === 0) {
    console.log('No recent movies to update.');
    return;
  }

  // 2. Generate URLs for recent movies
  const movieUrls = recentMovies.map(movie => {
    const lastMod = movie.modified?.time ? new Date(movie.modified.time).toISOString() : new Date().toISOString();
    return `
  <url>
    <loc>${SITE_URL}/movies/${movie.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // 3. Generate URLs for recent episodes
  const episodeUrls = await getEpisodeUrlsForMovies(recentMovies);

  // 4. Write recent sitemap files
  const recentSitemapFiles = [];
  if (movieUrls.length > 0) {
    writeSitemapFile('sitemap-recent-movies.xml', movieUrls);
    recentSitemapFiles.push('sitemap-recent-movies.xml');
  }
  if (episodeUrls.length > 0) {
    writeSitemapFile('sitemap-recent-episodes.xml', episodeUrls);
    recentSitemapFiles.push('sitemap-recent-episodes.xml');
  }

  // 5. Update the main sitemap index
  updateSitemapIndex(recentSitemapFiles);
}


// --- Main Execution ---

async function main() {
  const isFullRebuild = process.argv.includes('--full');

  try {
    if (isFullRebuild) {
      await generateFullSitemap();
    } else {
      await generateRecentSitemap();
    }
    console.log('\nSitemap generation completed successfully!');
  } catch (error) {
    console.error('\nAn error occurred during sitemap generation:', error);
    process.exit(1);
  }
}

main();