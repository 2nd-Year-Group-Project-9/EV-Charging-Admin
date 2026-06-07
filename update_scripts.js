const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(__dirname);

htmlFiles.forEach(file => {
    // skip login/signup since already done
    if (file.includes('login.html') || file.includes('signup.html')) return;

    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('<script src="../assets/js/auth.js"></script>')) {
        content = content.replace(
            /<script src="\.\.\/assets\/js\/auth\.js"><\/script>\s*<script>/g,
            `<script type="module" src="../assets/js/auth.js"></script>\n<script type="module">\n    import { Auth } from '../assets/js/auth.js';`
        );
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Updated: ' + file);
    }
});
