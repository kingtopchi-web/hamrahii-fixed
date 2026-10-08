const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Replace min-h-screen bg-white -> min-h-screen bg-[var(--bg-page)]
    content = content.replace(/min-h-screen bg-white/g, 'min-h-screen bg-[var(--bg-page)]');
    content = content.replace(/bg-white min-h-screen/g, 'bg-[var(--bg-page)] min-h-screen');

    // 2. Also replace "bg-white" in main containers that aren't necessarily min-h-screen but are full page sections
    // (We will just let the rest be bg-surface)
    content = content.replace(/bg-white/g, 'bg-[var(--bg-surface)]');

    // 3. Fix borders - change border-gray-100 or border-slate-200 to border-[var(--border-subtle)]
    content = content.replace(/border-gray-100/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-gray-200/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-slate-200/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-\[\#E5E5E5\]/g, 'border-[var(--border-subtle)]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
