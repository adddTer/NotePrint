const fs = require('fs');

const path = 'src/components/DocWorkspace.tsx';
let content = fs.readFileSync(path, 'utf-8');

const replacements = [
    { target: 'bg-white', replace: 'bg-white dark:bg-stone-900' },
    { target: 'bg-stone-50', replace: 'bg-stone-50 dark:bg-stone-950' },
    { target: 'bg-stone-100', replace: 'bg-stone-100 dark:bg-stone-800' },
    { target: 'bg-stone-200', replace: 'bg-stone-200 dark:bg-stone-700' },
    
    { target: 'text-stone-900', replace: 'text-stone-900 dark:text-stone-100' },
    { target: 'text-stone-800', replace: 'text-stone-800 dark:text-stone-200' },
    { target: 'text-stone-700', replace: 'text-stone-700 dark:text-stone-200' },
    { target: 'text-stone-600', replace: 'text-stone-600 dark:text-stone-300' },
    { target: 'text-stone-500', replace: 'text-stone-500 dark:text-stone-400' },
    { target: 'text-stone-400', replace: 'text-stone-400 dark:text-stone-500' },
    
    { target: 'border-stone-200', replace: 'border-stone-200 dark:border-stone-700' },
    { target: 'border-stone-300', replace: 'border-stone-300 dark:border-stone-600' },
    { target: 'border-stone-400', replace: 'border-stone-400 dark:border-stone-500' },
    
    { target: 'hover:bg-stone-50', replace: 'hover:bg-stone-50 dark:hover:bg-stone-800' },
    { target: 'hover:bg-stone-100', replace: 'hover:bg-stone-100 dark:hover:bg-stone-700' },
    { target: 'hover:bg-stone-200', replace: 'hover:bg-stone-200 dark:hover:bg-stone-700' },
];

for (const rep of replacements) {
    // only replace if not already replaced
    const regex = new RegExp(rep.target + '(?![ \\w-]*dark:)', 'g');
    content = content.replace(regex, rep.replace);
}

fs.writeFileSync(path, content, 'utf-8');
console.log('DocWorkspace updated');
