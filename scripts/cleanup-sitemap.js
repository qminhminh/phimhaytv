const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CURRENT_DOMAIN = 'https://phimhaytv.top'; // Cập nhật domain thực tế

/**
 * Xóa tất cả sitemap files cũ
 */
function cleanupOldSitemaps() {
    console.log('🧹 Cleaning up old sitemap files...');
    
    const files = fs.readdirSync(PUBLIC_DIR);
    const sitemapFiles = files.filter(file => 
        (file.startsWith('sitemap-') || file === 'sitemap.xml') && 
        file.endsWith('.xml')
    );
    
    let deletedCount = 0;
    
    sitemapFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        
        // Không xóa sitemap.xml index file
        if (file === 'sitemap.xml') return;
        
        try {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Deleted: ${file}`);
            deletedCount++;
        } catch (error) {
            console.error(`❌ Error deleting ${file}:`, error.message);
        }
    });
    
    console.log(`✅ Cleaned up ${deletedCount} old sitemap files`);
}

/**
 * Kiểm tra và fix domain mismatch trong sitemap hiện có
 */
function fixDomainMismatch() {
    console.log('\n🔧 Fixing domain mismatch in existing sitemaps...');
    
    const files = fs.readdirSync(PUBLIC_DIR);
    const sitemapFiles = files.filter(file => 
        file.startsWith('sitemap-') && file.endsWith('.xml')
    );
    
    let fixedCount = 0;
    
    sitemapFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        
        try {
            let content = fs.readFileSync(filePath, 'utf-8');
            
            // Tìm và thay thế các domain khác
            const oldDomains = [
                'https://phimhaytv.top',
                'http://phimhaytv.top',
                'https://phimhaytv.site',
                'http://phimhaytv.site',
                'https://localhost:3000',
                'http://localhost:3000'
            ];
            
            let hasChanges = false;
            
            oldDomains.forEach(oldDomain => {
                if (content.includes(oldDomain)) {
                    content = content.replaceAll(oldDomain, CURRENT_DOMAIN);
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                console.log(`🔄 Fixed domain in: ${file}`);
                fixedCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error fixing ${file}:`, error.message);
        }
    });
    
    // Fix sitemap index nếu có
    const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    if (fs.existsSync(sitemapIndexPath)) {
        try {
            let content = fs.readFileSync(sitemapIndexPath, 'utf-8');
            let hasChanges = false;
            
            const oldDomains = [
                'https://phimhaytv.top',
                'http://phimhaytv.top'
            ];
            
            oldDomains.forEach(oldDomain => {
                if (content.includes(oldDomain)) {
                    content = content.replaceAll(oldDomain, CURRENT_DOMAIN);
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                fs.writeFileSync(sitemapIndexPath, content);
                console.log(`🔄 Fixed domain in: sitemap.xml (index)`);
                fixedCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error fixing sitemap.xml:`, error.message);
        }
    }
    
    console.log(`✅ Fixed domain in ${fixedCount} files`);
}

/**
 * Validate và clean invalid URLs trong sitemap
 */
function cleanInvalidUrls() {
    console.log('\n🔍 Cleaning invalid URLs from sitemaps...');
    
    const files = fs.readdirSync(PUBLIC_DIR);
    const sitemapFiles = files.filter(file => 
        file.startsWith('sitemap-') && file.endsWith('.xml')
    );
    
    let totalCleaned = 0;
    
    sitemapFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Extract URLs
            const urlRegex = /<url>[\s\S]*?<\/url>/g;
            const urls = content.match(urlRegex) || [];
            
            // Filter valid URLs
            const validUrls = urls.filter(urlBlock => {
                const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
                if (!locMatch) return false;
                
                const url = locMatch[1];
                
                try {
                    new URL(url);
                    return url.startsWith(CURRENT_DOMAIN) && 
                           !url.includes(' ') && 
                           !url.includes('\n') &&
                           !url.includes('undefined') &&
                           !url.includes('null');
                } catch {
                    return false;
                }
            });
            
            const cleanedCount = urls.length - validUrls.length;
            totalCleaned += cleanedCount;
            
            if (cleanedCount > 0) {
                // Rewrite file with valid URLs only
                const newContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${validUrls.join('')}
</urlset>`;
                
                fs.writeFileSync(filePath, newContent);
                console.log(`🧽 Cleaned ${cleanedCount} invalid URLs from ${file} (${validUrls.length} valid URLs remaining)`);
            }
            
        } catch (error) {
            console.error(`❌ Error cleaning ${file}:`, error.message);
        }
    });
    
    console.log(`✅ Cleaned ${totalCleaned} invalid URLs in total`);
}

/**
 * Remove empty sitemap files
 */
function removeEmptySitemaps() {
    console.log('\n🗑️  Removing empty sitemap files...');
    
    const files = fs.readdirSync(PUBLIC_DIR);
    const sitemapFiles = files.filter(file => 
        file.startsWith('sitemap-') && file.endsWith('.xml')
    );
    
    let removedCount = 0;
    
    sitemapFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const urlRegex = /<url>[\s\S]*?<\/url>/g;
            const urls = content.match(urlRegex) || [];
            
            if (urls.length === 0) {
                fs.unlinkSync(filePath);
                console.log(`🗑️  Removed empty sitemap: ${file}`);
                removedCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error checking ${file}:`, error.message);
        }
    });
    
    console.log(`✅ Removed ${removedCount} empty sitemap files`);
}

/**
 * Generate summary report
 */
function generateSummary() {
    console.log('\n📊 CLEANUP SUMMARY');
    console.log('='.repeat(50));
    
    const files = fs.readdirSync(PUBLIC_DIR);
    const sitemapFiles = files.filter(file => 
        file.startsWith('sitemap-') && file.endsWith('.xml')
    );
    
    let totalUrls = 0;
    
    console.log(`\n📁 Remaining sitemap files: ${sitemapFiles.length}`);
    
    sitemapFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const urlRegex = /<url>[\s\S]*?<\/url>/g;
            const urls = content.match(urlRegex) || [];
            totalUrls += urls.length;
            
            console.log(`  ✅ ${file}: ${urls.length} URLs`);
            
        } catch (error) {
            console.log(`  ❌ ${file}: Error reading file`);
        }
    });
    
    console.log(`\n📊 Total URLs: ${totalUrls}`);
    console.log(`🌍 Domain: ${CURRENT_DOMAIN}`);
    
    // Check if sitemap index exists
    const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    if (fs.existsSync(sitemapIndexPath)) {
        console.log(`✅ Sitemap index file exists`);
    } else {
        console.log(`❌ Sitemap index file missing - run 'yarn sitemap:full' to generate`);
    }
}

/**
 * Main cleanup function
 */
async function main() {
    console.log('🧹 STARTING SITEMAP CLEANUP...\n');
    
    try {
        // 1. Clean old sitemaps (optional - comment out if you want to preserve)
        // cleanupOldSitemaps();
        
        // 2. Fix domain mismatch
        fixDomainMismatch();
        
        // 3. Clean invalid URLs
        cleanInvalidUrls();
        
        // 4. Remove empty sitemaps
        removeEmptySitemaps();
        
        // 5. Generate summary
        generateSummary();
        
        console.log('\n🎉 CLEANUP COMPLETED!');
        console.log('\n🔧 Next steps:');
        console.log('  1. Run: yarn sitemap:validate');
        console.log('  2. Test a few URLs manually in browser');
        console.log('  3. Submit to Google Search Console');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run cleanup
main(); 