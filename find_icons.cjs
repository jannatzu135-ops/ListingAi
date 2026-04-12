const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const matches = content.match(/<([A-Z][a-zA-Z0-9]+)/g);
if (matches) {
  const unique = [...new Set(matches.map(m => m.substring(1)))];
  console.log(unique.join(', '));
}
