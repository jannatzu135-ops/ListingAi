const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+"lucide-react";/);
if (importMatch) {
  const imports = importMatch[1].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
  const unused = imports.filter(icon => {
    const regex = new RegExp(`<${icon}[\\s>]`, 'g');
    return !regex.test(content);
  });
  console.log(unused.join(', '));
}
