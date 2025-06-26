const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://phimapi.com';
const SITE_URL = 'https://phimhaytv.top'; // Thay đổi thành domain của bạn
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_MAX_URLS = 5000;

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
      throw new Error(`API request failed with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Network or other error fetching ${url.toString()}:`, error);
    throw error;
  }
}

async function getAllMovies() {
  let movies = [];
  let currentPage = 1;
  let totalPages = 1;

  console.log('Fetching all movies...');

  // Fetch the first page to get pagination info
  const initialResponse = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { page: currentPage, limit: 100 });
  
  if (initialResponse.status && initialResponse.pagination) {
    movies.push(...initialResponse.items);
    totalPages = initialResponse.pagination.totalPages;
    console.log(`Total pages: ${totalPages}`);

    // Fetch remaining pages
    for (currentPage = 2; currentPage <= totalPages; currentPage++) {
      process.stdout.write(`Fetching page ${currentPage}/${totalPages}... \r`);
      try {
        const response = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { page: currentPage, limit: 100 });
        if (response.status && response.items) {
          movies.push(...response.items);
        }
      } catch (error) {
        console.error(`\nError fetching page ${currentPage}. Skipping.`);
      }
    }
  } else {
    console.error("Could not fetch initial movie data or pagination info.", initialResponse);
    return [];
  }

  console.log(`\nFetched a total of ${movies.length} movies.`);
  
  const uniqueMoviesMap = new Map();
  movies.forEach(movie => uniqueMoviesMap.set(movie._id, movie));
  const uniqueMovies = Array.from(uniqueMoviesMap.values());
  console.log(`Found ${uniqueMovies.length} unique movies after deduplication.`);
 
  return uniqueMovies;
}


async function generateSitemap(movies) {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const sitemapIndexEntries = [];

  // Generate sitemap for movies
  const movieChunks = [];
  for (let i = 0; i < movies.length; i += SITEMAP_MAX_URLS) {
    movieChunks.push(movies.slice(i, i + SITEMAP_MAX_URLS));
  }

  movieChunks.forEach((chunk, index) => {
    const sitemapFileName = `sitemap-movies-${index + 1}.xml`;
    const sitemapPath = path.join(PUBLIC_DIR, sitemapFileName);

    const urls = chunk.map(movie => {
      const movieUrl = `${SITE_URL}/movies/${movie.slug}`;
      const lastMod = movie.modified && movie.modified.time 
        ? new Date(movie.modified.time).toISOString()
        : new Date().toISOString();
      return `
  <url>
    <loc>${movieUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`Generated ${sitemapFileName} with ${chunk.length} URLs.`);

    sitemapIndexEntries.push(`
  <sitemap>
    <loc>${SITE_URL}/${sitemapFileName}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`);
  });

  // Generate sitemap for episodes
  console.log('\nFetching episode data for all movies. This might take a while...');
  let allEpisodeUrls = [];

  const concurrencyLimit = 50; // To avoid overwhelming the API server
  for (let i = 0; i < movies.length; i += concurrencyLimit) {
    const movieBatch = movies.slice(i, i + concurrencyLimit);
    process.stdout.write(`Fetching episodes for movies ${i + 1}-${Math.min(i + concurrencyLimit, movies.length)}/${movies.length}... \r`);
    
    const promises = movieBatch.map(async (movie) => {
      try {
        const data = await fetcher(`/phim/${movie.slug}`);
        const detail = data.movie || (data.item ? data.item : null);
        const episodes = data.episodes || (data.item ? data.item.episodes : []);

        if (detail && episodes) {
          const lastMod = detail.modified && detail.modified.time 
            ? new Date(detail.modified.time).toISOString()
            : new Date().toISOString();
          
          const episodeUrls = [];
          episodes.forEach(server => {
            if (server.server_data) {
              server.server_data.forEach(episode => {
                episodeUrls.push({
                  loc: `${SITE_URL}/watch/${movie.slug}/${episode.slug}`,
                  lastmod: lastMod
                });
              });
            }
          });
          return episodeUrls;
        }
      } catch (error) {
        process.stdout.write(`\nError fetching episodes for ${movie.slug}. Skipping. \n`);
      }
      return [];
    });

    const results = await Promise.all(promises);
    results.forEach(urls => allEpisodeUrls.push(...urls));
  }

  console.log(`\nFetched all episode data. Total episode URLs found: ${allEpisodeUrls.length}`);

  const uniqueEpisodeUrlMap = new Map();
  allEpisodeUrls.forEach(urlData => {
    uniqueEpisodeUrlMap.set(urlData.loc, urlData);
  });
  const uniqueEpisodeUrls = Array.from(uniqueEpisodeUrlMap.values());
  console.log(`Found ${uniqueEpisodeUrls.length} unique episode URLs after deduplication.`);

  if (uniqueEpisodeUrls.length > 0) {
    const episodeChunks = [];
    for (let i = 0; i < uniqueEpisodeUrls.length; i += SITEMAP_MAX_URLS) {
      episodeChunks.push(uniqueEpisodeUrls.slice(i, i + SITEMAP_MAX_URLS));
    }

    episodeChunks.forEach((chunk, index) => {
      const sitemapFileName = `sitemap-episodes-${index + 1}.xml`;
      const sitemapPath = path.join(PUBLIC_DIR, sitemapFileName);

      const urls = chunk.map(urlData => `
  <url>
    <loc>${urlData.loc}</loc>
    <lastmod>${urlData.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      fs.writeFileSync(sitemapPath, sitemapContent);
      console.log(`Generated ${sitemapFileName} with ${chunk.length} URLs.`);

      sitemapIndexEntries.push(`
  <sitemap>
    <loc>${SITE_URL}/${sitemapFileName}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`);
    });
  }

  // Generate sitemap index file
  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.join('')}
</sitemapindex>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndexContent);
  console.log('Generated sitemap.xml (index file).');
}

async function main() {
  try {
    const movies = await getAllMovies();
    if (movies.length > 0) {
      await generateSitemap(movies);
      console.log('\nSitemap generation completed successfully!');
    } else {
      console.log('No movies found to generate sitemap.');
    }
  } catch (error) {
    console.error('An error occurred during sitemap generation:', error);
  }
}

main(); 