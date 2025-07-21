const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://phimapi.com';
const SITE_URL = 'https://phimhaytv.top'; // ⚠️ CẬP NHẬT DOMAIN THỰC TẾ CỦA BẠN
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_MAX_URLS = 25000; // Tăng lên để giảm số file sitemap
const DAILY_UPDATE_LIMIT = 25; // Lấy tối đa 25 phim để đảm bảo có đủ 20 phim mới

// --- Helper Functions ---

// Rate limiting để tránh 429 errors
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms giữa các requests

async function fetcher(path, params = {}, retries = 3) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });

  // Rate limiting: đảm bảo interval tối thiểu giữa requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SitemapGenerator/1.0',
        'Accept': 'application/json',
      }
    });
    
    if (res.status === 429) {
      // Rate limited - retry với exponential backoff
      if (retries > 0) {
        const backoffTime = (4 - retries) * 1000; // 1s, 2s, 3s
        console.log(`Rate limited, retrying in ${backoffTime}ms... (${retries} retries left)`);
        await delay(backoffTime);
        return fetcher(path, params, retries - 1);
      } else {
        console.error(`Rate limited and no retries left: ${url.toString()}`);
        return null;
      }
    }
    
    if (!res.ok) {
      console.error(`Error fetching ${url.toString()}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return res.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Network error, retrying... (${retries} retries left): ${error.message}`);
      await delay(1000);
      return fetcher(path, params, retries - 1);
    }
    
    console.error(`Network error after all retries ${url.toString()}:`, error.message);
    return null;
  }
}

function getValidLastMod(movie) {
  const now = new Date();
  // The movie object from the list endpoint might not have `modified` field.
  // The movie object from the detail endpoint has `movie.modified.time`.
  const modifiedTime = movie?.modified?.time;

  if (!modifiedTime) {
    return now.toISOString();
  }
  
  const modifiedDate = new Date(modifiedTime);
  
  // Check if the date is invalid or in the future
  if (isNaN(modifiedDate.getTime()) || modifiedDate > now) {
    return now.toISOString();
  }
  
  return modifiedDate.toISOString();
}

function writeSitemapFile(fileName, urls) {
  if (urls.length === 0) return;
  
  // Validate URLs trước khi ghi vào sitemap
  const validUrls = urls.filter(url => {
    const locMatch = url.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) return false;
    
    const urlString = locMatch[1];
    try {
      new URL(urlString); // Validate URL format
      return urlString.startsWith('http') && !urlString.includes(' ');
    } catch {
      return false;
    }
  });
  
  if (validUrls.length === 0) return;
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${validUrls.join('')}
</urlset>`;
  
  const sitemapPath = path.join(PUBLIC_DIR, fileName);
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`Generated ${fileName} with ${validUrls.length} URLs (${urls.length - validUrls.length} invalid URLs filtered).`);
}

function updateSitemapIndex(sitemapFiles) {
  const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  
  // Nếu sitemapFiles được truyền vào, chỉ sử dụng những files đó
  // Ngược lại, tự động tìm tất cả sitemap files hiện có
  let allSitemapFiles;
  if (sitemapFiles && sitemapFiles.length > 0) {
    allSitemapFiles = sitemapFiles;
  } else {
    // Tự động tìm tất cả sitemap files hiện có (trừ sitemap.xml chính)
    allSitemapFiles = fs.readdirSync(PUBLIC_DIR)
      .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'))
      .sort();
  }

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
  console.log(`Generated sitemap.xml (index file) with ${existingFiles.length} sitemaps.`);
}

async function getEpisodeUrlsForMovies(movies) {
    let allEpisodeUrls = [];
    const concurrencyLimit = 10; // Giảm xuống để tránh rate limit
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`\nFetching episode data for ${movies.length} movies...`);

    for (let i = 0; i < movies.length; i += concurrencyLimit) {
        const movieBatch = movies.slice(i, i + concurrencyLimit);
        process.stdout.write(`  - Processing movies ${i + 1}-${Math.min(i + concurrencyLimit, movies.length)}/${movies.length} (Success: ${successCount}, Errors: ${errorCount})...\r`);

        const promises = movieBatch.map(async (movie) => {
            const data = await fetcher(`/phim/${movie.slug}`);
            if (!data) {
                errorCount++;
                return [];
            }

            const detail = data.movie || data.item;
            const episodes = data.episodes || (data.item ? data.item.episodes : []);
            if (!detail || !episodes) {
                errorCount++;
                return [];
            }

            successCount++;
            const lastMod = getValidLastMod(detail);
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
        
        // Thêm delay giữa các batch để tránh overload API
        if (i + concurrencyLimit < movies.length) {
            await delay(500); // 500ms pause between batches
        }
    }
    
    console.log(`\nCompleted! Success: ${successCount}, Errors: ${errorCount}`);
    console.log(`Found ${allEpisodeUrls.length} total episode URLs.`);
    return Array.from(new Set(allEpisodeUrls)); // Deduplicate
}

/**
 * Đọc và parse các URLs hiện có từ sitemap để tránh trùng lặp
 */
function getExistingUrls(sitemapFileName) {
  const sitemapPath = path.join(PUBLIC_DIR, sitemapFileName);
  if (!fs.existsSync(sitemapPath)) {
    return new Set();
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = new Set();
  let match;
  
  while ((match = urlRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  return urls;
}

/**
 * Cập nhật sitemap hiện có bằng cách thêm URLs mới và xóa URLs cũ
 */
function updateExistingSitemap(fileName, newUrls, urlsToRemove = new Set()) {
  const sitemapPath = path.join(PUBLIC_DIR, fileName);
  let existingUrls = [];
  
  // Đọc URLs hiện có
  if (fs.existsSync(sitemapPath)) {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const urlRegex = /<url>[\s\S]*?<\/url>/g;
    let match;
    
    while ((match = urlRegex.exec(content)) !== null) {
      const urlContent = match[0];
      const locMatch = urlContent.match(/<loc>(.*?)<\/loc>/);
      if (locMatch && !urlsToRemove.has(locMatch[1])) {
        existingUrls.push(urlContent);
      }
    }
  }
  
  // Kết hợp URLs cũ và mới
  const allUrls = [...existingUrls, ...newUrls];
  
  // Kiểm tra nếu số URLs vượt quá giới hạn, tạo file mới
  if (allUrls.length > SITEMAP_MAX_URLS) {
    // Tìm số file sitemap hiện có cùng loại
    const files = fs.readdirSync(PUBLIC_DIR);
    const pattern = fileName.replace(/(-\d+)?\.xml$/, '');
    const existingFiles = files.filter(f => f.startsWith(pattern) && f.endsWith('.xml'));
    const nextNumber = existingFiles.length + 1;
    const newFileName = `${pattern}-${nextNumber}.xml`;
    
    writeSitemapFile(newFileName, newUrls);
    return [newFileName];
  } else {
    writeSitemapFile(fileName, allUrls);
    return [fileName];
  }
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

  // 2. Validate movies có thể access được
  console.log('\nValidating movie accessibility...');
  const validatedMovies = [];
  let movieValidationCount = 0;
  
  for (let i = 0; i < uniqueMovies.length; i += 20) {
    const movieBatch = uniqueMovies.slice(i, i + 20);
    process.stdout.write(`  - Validating movies ${i + 1}-${Math.min(i + 20, uniqueMovies.length)}/${uniqueMovies.length}...\r`);
    
    const validationPromises = movieBatch.map(async (movie) => {
      const data = await fetcher(`/phim/${movie.slug}`);
      if (data && (data.movie || data.item)) {
        movieValidationCount++;
        return movie;
      }
      return null;
    });
    
    const results = await Promise.all(validationPromises);
    validatedMovies.push(...results.filter(movie => movie !== null));
    
    // Delay between validation batches
    if (i + 20 < uniqueMovies.length) {
      await delay(300);
    }
  }
  
  console.log(`\nValidated ${movieValidationCount}/${uniqueMovies.length} movies are accessible`);
  
  // 3. Generate sitemap cho validated movies only
  const movieUrls = validatedMovies.map(movie => {
    const lastMod = getValidLastMod(movie);
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

  // 4. Generate sitemap for episodes (chỉ cho validated movies)
  const episodeUrls = await getEpisodeUrlsForMovies(validatedMovies);
  for (let i = 0; i < episodeUrls.length; i += SITEMAP_MAX_URLS) {
    const chunk = episodeUrls.slice(i, i + SITEMAP_MAX_URLS);
    const sitemapFileName = `sitemap-episodes-${sitemapFiles.filter(f=>f.startsWith("sitemap-episodes")).length + 1}.xml`;
    writeSitemapFile(sitemapFileName, chunk);
    sitemapFiles.push(sitemapFileName);
  }
  
  // 5. Update sitemap index
  updateSitemapIndex(sitemapFiles);
}

/**
 * RECENT UPDATE MODE - Cải tiến
 * Lấy đúng số lượng phim mới (khoảng 20), tránh trùng lặp với sitemap hiện có
 */
async function generateRecentSitemap() {
  console.log('Starting recent sitemap update...');
  
  let recentMovies = [];
  let page = 1;
  
  // Lấy phim mới cho đến khi có đủ DAILY_UPDATE_LIMIT
  while (recentMovies.length < DAILY_UPDATE_LIMIT) {
    const response = await fetcher('/danh-sach/phim-moi-cap-nhat-v3', { 
      page, 
      limit: Math.min(50, DAILY_UPDATE_LIMIT - recentMovies.length + 10) // Lấy thêm 10 để đảm bảo
    });
    
    if (!response?.status || !response.items || response.items.length === 0) {
      console.log(`Không thể lấy thêm phim từ trang ${page}`);
      break;
    }
    
    recentMovies.push(...response.items);
    page++;
    
    // Tránh vòng lặp vô hạn
    if (page > 5) break;
  }
  
  // Giới hạn số lượng phim lấy về
  recentMovies = recentMovies.slice(0, DAILY_UPDATE_LIMIT);
  console.log(`Fetched ${recentMovies.length} recent movies.`);
  
  if (recentMovies.length === 0) {
    console.log('No recent movies to update.');
    return;
  }

  // Validate recent movies trước khi tạo URLs
  console.log('\nValidating recent movies accessibility...');
  const validatedRecentMovies = [];
  let validatedCount = 0;
  
  for (let i = 0; i < recentMovies.length; i += 10) {
    const batch = recentMovies.slice(i, i + 10);
    process.stdout.write(`  - Validating ${i + 1}-${Math.min(i + 10, recentMovies.length)}/${recentMovies.length}...\r`);
    
    const validationPromises = batch.map(async (movie) => {
      const data = await fetcher(`/phim/${movie.slug}`);
      if (data && (data.movie || data.item)) {
        validatedCount++;
        return movie;
      }
      return null;
    });
    
    const results = await Promise.all(validationPromises);
    validatedRecentMovies.push(...results.filter(movie => movie !== null));
    
    if (i + 10 < recentMovies.length) {
      await delay(200);
    }
  }
  
  console.log(`\nValidated ${validatedCount}/${recentMovies.length} recent movies are accessible`);
  
  if (validatedRecentMovies.length === 0) {
    console.log('No valid recent movies to update.');
    return;
  }

  // Lấy danh sách URLs phim đã tồn tại
  const existingMovieUrls = getExistingUrls('sitemap-movies-1.xml');
  const existingEpisodeUrls = getExistingUrls('sitemap-episodes-1.xml');
  
  // Tạo URLs cho phim mới được validated (chỉ những phim chưa có trong sitemap)
  const newMovieUrls = [];
  const updatedMovieUrls = new Set(); // URLs phim cần cập nhật lastmod
  
  validatedRecentMovies.forEach(movie => {
    const movieUrl = `${SITE_URL}/movies/${movie.slug}`;
    const lastMod = getValidLastMod(movie);
    
    const urlXml = `
  <url>
    <loc>${movieUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    
    if (!existingMovieUrls.has(movieUrl)) {
      newMovieUrls.push(urlXml);
    } else {
      // Phim đã tồn tại, đánh dấu cần cập nhật lastmod
      updatedMovieUrls.add(movieUrl);
    }
  });

  // Lấy URLs episodes cho phim mới (chỉ validated movies)
  const newMoviesOnly = validatedRecentMovies.filter(movie => 
    !existingMovieUrls.has(`${SITE_URL}/movies/${movie.slug}`)
  );
  
  let newEpisodeUrls = [];
  if (newMoviesOnly.length > 0) {
    const allEpisodeUrls = await getEpisodeUrlsForMovies(newMoviesOnly);
    // Chỉ lấy episodes chưa tồn tại
    newEpisodeUrls = allEpisodeUrls.filter(episodeXml => {
      const locMatch = episodeXml.match(/<loc>(.*?)<\/loc>/);
      return locMatch && !existingEpisodeUrls.has(locMatch[1]);
    });
  }

  const updatedFiles = [];
  
  // Cập nhật sitemap movies
  if (newMovieUrls.length > 0) {
    console.log(`Adding ${newMovieUrls.length} new movie URLs to sitemap`);
    const movieFiles = updateExistingSitemap('sitemap-movies-1.xml', newMovieUrls);
    updatedFiles.push(...movieFiles);
  }
  
  // Cập nhật sitemap episodes  
  if (newEpisodeUrls.length > 0) {
    console.log(`Adding ${newEpisodeUrls.length} new episode URLs to sitemap`);
    const episodeFiles = updateExistingSitemap('sitemap-episodes-1.xml', newEpisodeUrls);
    updatedFiles.push(...episodeFiles);
  }

  // Xóa các file sitemap-recent cũ nếu có
  const files = fs.readdirSync(PUBLIC_DIR);
  files.forEach(file => {
    if (file.startsWith('sitemap-recent-')) {
      const filePath = path.join(PUBLIC_DIR, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted old recent sitemap: ${file}`);
    }
  });

  // Cập nhật sitemap index với tất cả files hiện có
  const allSitemapFiles = fs.readdirSync(PUBLIC_DIR)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml') && file !== 'sitemap.xml')
    .sort();
    
  updateSitemapIndex(allSitemapFiles);
  
  console.log(`Updated sitemaps with ${newMovieUrls.length} new movies and ${newEpisodeUrls.length} new episodes`);
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