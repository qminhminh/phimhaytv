const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BATCH_SIZE = 10; // Kiểm tra 10 URL cùng lúc để không overload server

/**
 * Đọc URLs từ sitemap XML
 */
function extractUrlsFromSitemap(sitemapPath) {
    if (!fs.existsSync(sitemapPath)) {
        return [];
    }
    
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    
    while ((match = urlRegex.exec(content)) !== null) {
        urls.push(match[1]);
    }
    
    return urls;
}

/**
 * Kiểm tra HTTP status của URL
 */
async function checkUrlStatus(url) {
    try {
        const response = await fetch(url, {
            method: 'HEAD', // Chỉ lấy headers, không cần body
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SitemapValidator/1.0)'
            },
            timeout: 10000 // 10 second timeout
        });
        
        return {
            url,
            status: response.status,
            ok: response.ok,
            redirected: response.redirected,
            finalUrl: response.url
        };
    } catch (error) {
        return {
            url,
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

/**
 * Kiểm tra batch URLs
 */
async function checkUrlBatch(urls) {
    const promises = urls.map(url => checkUrlStatus(url));
    return await Promise.all(promises);
}

/**
 * Kiểm tra sitemap structure
 */
function validateSitemapStructure() {
    const issues = [];
    
    // Kiểm tra sitemap index
    const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    if (!fs.existsSync(sitemapIndexPath)) {
        issues.push('❌ sitemap.xml (index file) không tồn tại');
        return issues;
    }
    
    // Đọc sitemap index
    const indexContent = fs.readFileSync(sitemapIndexPath, 'utf-8');
    const sitemapRegex = /<loc>(.*?)<\/loc>/g;
    const sitemapUrls = [];
    let match;
    
    while ((match = sitemapRegex.exec(indexContent)) !== null) {
        sitemapUrls.push(match[1]);
    }
    
    console.log(`📋 Tìm thấy ${sitemapUrls.length} sitemap con trong index`);
    
    // Kiểm tra từng sitemap con
    let totalValidSitemaps = 0;
    let totalUrls = 0;
    
    sitemapUrls.forEach(sitemapUrl => {
        const filename = path.basename(sitemapUrl);
        const sitemapPath = path.join(PUBLIC_DIR, filename);
        
        if (fs.existsSync(sitemapPath)) {
            const urls = extractUrlsFromSitemap(sitemapPath);
            totalUrls += urls.length;
            totalValidSitemaps++;
            console.log(`✅ ${filename}: ${urls.length} URLs`);
        } else {
            issues.push(`❌ ${filename} được reference trong index nhưng không tồn tại`);
        }
    });
    
    console.log(`📊 Tổng cộng: ${totalValidSitemaps}/${sitemapUrls.length} sitemap hợp lệ, ${totalUrls} URLs`);
    
    return { issues, totalUrls, totalValidSitemaps };
}

/**
 * Kiểm tra sample URLs từ mỗi sitemap
 */
async function validateSampleUrls() {
    console.log('\n🔍 Kiểm tra sample URLs...');
    
    const sitemapFiles = fs.readdirSync(PUBLIC_DIR)
        .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'))
        .slice(0, 5); // Chỉ test 5 sitemap đầu tiên
    
    const allResults = [];
    
    for (const filename of sitemapFiles) {
        console.log(`\n📁 Kiểm tra ${filename}...`);
        const sitemapPath = path.join(PUBLIC_DIR, filename);
        const urls = extractUrlsFromSitemap(sitemapPath);
        
        // Lấy 5 URLs ngẫu nhiên để test
        const sampleUrls = urls.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        for (let i = 0; i < sampleUrls.length; i += BATCH_SIZE) {
            const batch = sampleUrls.slice(i, i + BATCH_SIZE);
            const results = await checkUrlBatch(batch);
            allResults.push(...results);
            
            results.forEach(result => {
                if (result.ok) {
                    console.log(`✅ ${result.status} - ${result.url}`);
                } else if (result.status === 0) {
                    console.log(`❌ ERROR - ${result.url} (${result.error})`);
                } else {
                    console.log(`⚠️  ${result.status} - ${result.url}`);
                }
            });
            
            // Delay giữa các batch để không overload server
            if (i + BATCH_SIZE < sampleUrls.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    return allResults;
}

/**
 * Tạo báo cáo chi tiết
 */
function generateReport(structureResult, urlResults) {
    console.log('\n📋 BÁO CÁO TỔNG HỢP');
    console.log('='.repeat(50));
    
    // Báo cáo cấu trúc
    console.log(`\n🏗️  CẤU TRÚC SITEMAP:`);
    console.log(`  ✅ Số sitemap con hợp lệ: ${structureResult.totalValidSitemaps}`);
    console.log(`  📊 Tổng số URLs: ${structureResult.totalUrls}`);
    
    if (structureResult.issues.length > 0) {
        console.log(`  ❌ Vấn đề cấu trúc:`);
        structureResult.issues.forEach(issue => console.log(`     ${issue}`));
    }
    
    // Báo cáo URLs
    if (urlResults.length > 0) {
        const successful = urlResults.filter(r => r.ok).length;
        const errors = urlResults.filter(r => r.status === 0).length;
        const clientErrors = urlResults.filter(r => r.status >= 400 && r.status < 500).length;
        const serverErrors = urlResults.filter(r => r.status >= 500).length;
        const redirects = urlResults.filter(r => r.redirected).length;
        
        console.log(`\n🌐 KIỂM TRA URLS (${urlResults.length} URLs tested):`);
        console.log(`  ✅ Thành công (2xx): ${successful}`);
        console.log(`  🔄 Redirects (3xx): ${redirects}`);
        console.log(`  ⚠️  Client errors (4xx): ${clientErrors}`);
        console.log(`  💥 Server errors (5xx): ${serverErrors}`);
        console.log(`  ❌ Network errors: ${errors}`);
        
        const successRate = (successful / urlResults.length * 100).toFixed(1);
        console.log(`  📈 Tỷ lệ thành công: ${successRate}%`);
        
        // Hiển thị các URLs có vấn đề
        const problemUrls = urlResults.filter(r => !r.ok);
        if (problemUrls.length > 0) {
            console.log(`\n❌ URLS CÓ VẤN ĐỀ:`);
            problemUrls.slice(0, 10).forEach(result => { // Chỉ hiển thị 10 URLs đầu tiên
                console.log(`  ${result.status || 'ERROR'} - ${result.url}`);
                if (result.error) console.log(`    Error: ${result.error}`);
            });
            if (problemUrls.length > 10) {
                console.log(`  ... và ${problemUrls.length - 10} URLs khác`);
            }
        }
    }
    
    // Đưa ra khuyến nghị
    console.log(`\n💡 KHUYẾN NGHỊ:`);
    
    if (structureResult.issues.length > 0) {
        console.log(`  1. Fix các vấn đề cấu trúc sitemap`);
    }
    
    if (urlResults.length > 0) {
        const errorRate = ((urlResults.length - urlResults.filter(r => r.ok).length) / urlResults.length * 100);
        if (errorRate > 10) {
            console.log(`  2. Tỷ lệ lỗi URLs cao (${errorRate.toFixed(1)}%) - cần kiểm tra routing`);
        }
        
        if (urlResults.some(r => r.status === 0)) {
            console.log(`  3. Có lỗi network - kiểm tra DNS/hosting`);
        }
        
        if (urlResults.some(r => r.status === 404)) {
            console.log(`  4. Có URLs 404 - cần cleanup sitemap`);
        }
        
        if (urlResults.some(r => r.status >= 500)) {
            console.log(`  5. Có lỗi server - kiểm tra backend stability`);
        }
    }
    
    console.log(`\n🔧 CÁC BƯỚC TIẾP THEO:`);
    console.log(`  1. Cập nhật SITE_URL trong generate-sitemap.js với domain thực tế`);
    console.log(`  2. Regenerate sitemap: npm run sitemap:full`);
    console.log(`  3. Test lại với: npm run sitemap:validate`);
    console.log(`  4. Submit sitemap mới lên Google Search Console`);
}

/**
 * Main validation function
 */
async function main() {
    console.log('🔍 BẮT ĐẦU VALIDATE SITEMAP...\n');
    
    try {
        // 1. Validate sitemap structure
        console.log('1️⃣ Kiểm tra cấu trúc sitemap...');
        const structureResult = validateSitemapStructure();
        
        // 2. Test sample URLs 
        const urlResults = await validateSampleUrls();
        
        // 3. Generate report
        generateReport(structureResult, urlResults);
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình validate:', error);
        process.exit(1);
    }
}

// Run validation
main(); 