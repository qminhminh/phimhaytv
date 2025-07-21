const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function fixSitemapXMLFormat() {
  console.log('🔧 Fixing XML format issues in sitemaps...');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  const sitemapFiles = files.filter(file => 
    file.startsWith('sitemap-') && file.endsWith('.xml') && file !== 'sitemap-static.xml'
  );
  
  let totalFixed = 0;
  
  sitemapFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    console.log(`\n📄 Processing ${file}...`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all URL blocks
      const urlRegex = /<url>[\s\S]*?<\/url>/g;
      const urlBlocks = content.match(urlRegex) || [];
      
      console.log(`   Found ${urlBlocks.length} URL blocks`);
      
      // Fix each URL block
      const fixedUrlBlocks = urlBlocks.map(urlBlock => {
        const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
        if (!locMatch) return urlBlock; // Skip invalid URL blocks
        
        const currentTime = new Date().toISOString();
        
        // Check what's missing and rebuild the complete URL block
        const hasLastmod = urlBlock.includes('<lastmod>') && urlBlock.includes('</lastmod>');
        const hasChangefreq = urlBlock.includes('<changefreq>') && urlBlock.includes('</changefreq>');
        const hasPriority = urlBlock.includes('<priority>') && urlBlock.includes('</priority>');
        
        // If any required tag is missing, rebuild the entire URL block
        if (!hasLastmod || !hasChangefreq || !hasPriority) {
          totalFixed++;
          return `
  <url>
    <loc>${locMatch[1]}</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
        
        // Check if lastmod has empty value
        const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
        if (lastmodMatch && (!lastmodMatch[1] || lastmodMatch[1].trim() === '')) {
          const fixedBlock = urlBlock.replace(
            /<lastmod>.*?<\/lastmod>/,
            `<lastmod>${currentTime}</lastmod>`
          );
          totalFixed++;
          return fixedBlock;
        }
        
        return urlBlock;
      });
      
      // Rebuild sitemap content
      const newContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fixedUrlBlocks.join('')}
</urlset>`;
      
      // Write back to file
      fs.writeFileSync(filePath, newContent);
      console.log(`   ✅ Fixed and saved ${file}`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} URL entries across all sitemaps`);
}

function validateSitemapXML() {
  console.log('\n🔍 Validating fixed sitemaps...');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  const sitemapFiles = files.filter(file => 
    file.startsWith('sitemap-') && file.endsWith('.xml')
  );
  
  let allValid = true;
  
  sitemapFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check XML structure
      const urlRegex = /<url>[\s\S]*?<\/url>/g;
      const urlBlocks = content.match(urlRegex) || [];
      
      let issues = 0;
      
      urlBlocks.forEach((urlBlock, index) => {
        // Check required tags
        const hasLoc = urlBlock.includes('<loc>') && urlBlock.includes('</loc>');
        const hasLastmod = urlBlock.includes('<lastmod>') && urlBlock.includes('</lastmod>');
        const hasChangefreq = urlBlock.includes('<changefreq>') && urlBlock.includes('</changefreq>');
        const hasPriority = urlBlock.includes('<priority>') && urlBlock.includes('</priority>');
        
        if (!hasLoc || !hasLastmod || !hasChangefreq || !hasPriority) {
          if (issues === 0) {
            console.log(`   ❌ ${file} has issues:`);
          }
          console.log(`      URL ${index + 1}: Missing tags - loc:${hasLoc}, lastmod:${hasLastmod}, changefreq:${hasChangefreq}, priority:${hasPriority}`);
          issues++;
          allValid = false;
        }
        
        // Check URL validity
        const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
        if (locMatch) {
          try {
            new URL(locMatch[1]);
          } catch {
            if (issues === 0) {
              console.log(`   ❌ ${file} has issues:`);
            }
            console.log(`      URL ${index + 1}: Invalid URL format: ${locMatch[1]}`);
            issues++;
            allValid = false;
          }
        }
      });
      
      if (issues === 0) {
        console.log(`   ✅ ${file}: ${urlBlocks.length} URLs - All valid`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error validating ${file}:`, error.message);
      allValid = false;
    }
  });
  
  return allValid;
}

// Main execution
console.log('🚀 Starting sitemap XML format fix...');

fixSitemapXMLFormat();
const isValid = validateSitemapXML();

if (isValid) {
  console.log('\n🎉 All sitemaps are now valid and ready for Google!');
  console.log('\n📋 Next steps:');
  console.log('   1. Resubmit sitemap.xml in Google Search Console');
  console.log('   2. Wait 24-48 hours for indexing');
  console.log('   3. Check "Coverage" report for discovered pages');
} else {
  console.log('\n⚠️  Some issues remain. Please check the output above.');
} 