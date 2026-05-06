const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk('src/pages/dashboard');
const nonFunctional = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const buttonRegex = /<button[^>]*>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const btnHtml = match[0];
    if (!btnHtml.includes('onClick') && !btnHtml.includes('type="submit"')) {
      // Find the text inside the button to identify it
      const startIdx = match.index + match[0].length;
      const endIdx = content.indexOf('</button>', startIdx);
      const btnText = endIdx !== -1 ? content.slice(startIdx, endIdx).replace(/<[^>]+>/g, '').trim() : 'Unknown';
      
      // Get line number
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      nonFunctional.push({ file: path.basename(file), line: lineNumber, text: btnText });
    }
  }
}

console.log(JSON.stringify(nonFunctional, null, 2));
