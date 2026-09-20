const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/ridelocal/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace #411900 with #fb923c
  content = content.replace(/#411900/g, '#fb923c');
  
  // Replace rgba(65, 25, 0, ...) with rgba(249, 115, 22, ...)
  content = content.replace(/rgba\(65,\s*25,\s*0,/g, 'rgba(249, 115, 22,');
  
  // Specific gradient fix in index.css
  content = content.replace(/linear-gradient\(135deg,\s*#fb923c,\s*#fb923c\)/g, 'linear-gradient(135deg, #fb923c, #f97316)');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
