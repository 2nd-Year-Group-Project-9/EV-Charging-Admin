const fs = require('fs');
const path = require('path');

const files = [
    'admin/dashboard.html',
    'admin/stations.html',
    'admin/analytics.html',
    'admin/settings.html',
    'admin/manage-station.html',
    'admin/onboarding.html',
    'super-admin/dashboard.html',
    'super-admin/manage-admins.html',
    'super-admin/manage-stations.html',
    'super-admin/reports.html',
    'super-admin/settings.html'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Sidebar element
    content = content.replace(
        /<aside id="sidebar" class="[^"]*h-screen w-64 fixed left-0 top-0 -translate-x-full lg:translate-x-0 transition-transform duration-300 z-\[60\][^"]*"/,
        '<aside id="sidebar" class="group h-screen w-64 lg:w-20 lg:hover:w-64 fixed left-0 top-0 -translate-x-full lg:translate-x-0 transition-all duration-300 z-[60] bg-slate-100 dark:bg-slate-950 flex flex-col p-4 gap-2 overflow-x-hidden shadow-2xl lg:shadow-none hover:shadow-2xl"'
    );
    // Fix flex flex-col overflow hidden for the brand area
    content = content.replace(
        /<div class="mb-8 px-2 flex flex-col">/,
        '<div class="mb-8 px-2 flex flex-col overflow-hidden">'
    );

    // 2. Sidebar text and icons
    content = content.replace(/<h1 class="([^"]*)text-teal-900([^"]*)">([^<]*)<\/h1>/, 
        '<h1 class="$1text-teal-900$2 whitespace-nowrap opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">$3</h1>');
    
    content = content.replace(/<span class="([^"]*)text-xs font-semibold tracking-wide uppercase text-slate-500([^"]*)">([^<]*)<\/span>/,
        '<span class="$1text-xs font-semibold tracking-wide uppercase text-slate-500$2 whitespace-nowrap opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">$3</span>');

    // For all nav links: add whitespace-nowrap to the <a> and opacity transition to the text span
    // and shrink-0 to the icon span
    content = content.replace(/<a ([^>]*)class="([^"]*flex items-center gap-3[^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, inner) => {
        let newInner = inner.replace(/<span class="material-symbols-outlined"/, '<span class="material-symbols-outlined shrink-0"');
        newInner = newInner.replace(/<span class="text-sm font-label tracking-wide uppercase font-semibold">/, '<span class="text-sm font-label tracking-wide uppercase font-semibold opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">');
        newInner = newInner.replace(/<span class="text-sm font-semibold tracking-wide uppercase">/, '<span class="text-sm font-semibold tracking-wide uppercase opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">');
        
        let newClass = p2;
        if (!newClass.includes('whitespace-nowrap')) {
            newClass += ' whitespace-nowrap';
        }
        return `<a ${p1}class="${newClass}"${p3}>${newInner}</a>`;
    });

    // 3. Main canvas
    content = content.replace(
        /<main class="lg:ml-64 flex-1 flex flex-col min-h-screen">/, 
        '<main class="lg:ml-20 transition-all duration-300 flex-1 flex flex-col min-h-screen">'
    );
    
    // Restore the accidental main replacement if it was broken in admin/dashboard
    if (file === 'admin/dashboard.html') {
        content = content.replace(
            /<main class="lg:ml-20 transition-all duration-300 flex-1 flex flex-col min-h-screen">[\s\S]*?<!-- Dashboard Content -->/,
            `<main class="lg:ml-20 transition-all duration-300 flex-1 flex flex-col min-h-screen">
        <header class="w-full sticky top-0 z-40 bg-slate-50/70 backdrop-blur-xl flex flex-wrap justify-between items-center px-4 md:px-8 py-4 shadow-[0px_24px_48px_rgba(0,83,91,0.06)] gap-4">
            <div class="flex items-center gap-2 sm:gap-4">
                <button id="mobile-menu-btn" class="lg:hidden text-slate-600 hover:text-primary transition-colors flex items-center justify-center mr-2">
                    <span class="material-symbols-outlined text-3xl">menu</span>
                </button>
                <h2 class="text-xl sm:text-2xl font-headline font-bold text-primary">Network Overview</h2>
            </div>
            <div class="flex items-center gap-2 sm:gap-4">
                <div class="relative hidden sm:block">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" id="searchInput" placeholder="Search infrastructure..." class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-48 sm:w-80 focus:ring-2 focus:ring-primary/20">
                </div>
                <button class="sm:hidden w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-slate-600">
                    <span class="material-symbols-outlined">search</span>
                </button>
                <div class="w-px h-6 bg-slate-200 mx-1 sm:mx-2"></div>
                <div class="text-right hidden sm:block">
                    <p class="text-sm font-bold text-teal-800" id="profile-name">Loading...</p>
                    <p class="text-[10px] text-on-surface-variant uppercase tracking-tighter">Station Owner</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <span class="material-symbols-outlined">person</span>
                </div>
            </div>
        </header>

<!-- Dashboard Content -->`
        );
        // Also fix the grid that was mangled in the last edit
        content = content.replace(
            /<div class="p-4 md:p-8 space-y-6 md:space-y-8 max-w-\[1400px\]">[\s\S]*?<!-- Recent Activity Section -->/m,
            `<div class="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px]">
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Stations</p>
            <h3 id="stat-total-stations" class="text-3xl font-headline font-extrabold text-primary">0</h3>
        </div>
        <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Ports</p>
            <h3 id="stat-total-ports" class="text-3xl font-headline font-extrabold text-teal-600">0</h3>
        </div>
        <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
            <h3 id="stat-uptime" class="text-3xl font-headline font-extrabold text-tertiary">0%</h3>
        </div>
        <div class="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Users</p>
            <h3 id="stat-active-users" class="text-3xl font-headline font-extrabold text-secondary">0</h3>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div class="lg:col-span-2 bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 class="text-base font-bold text-slate-800">Energy Consumption Trends</h3>
                <div class="flex gap-2">
                    <button class="px-3 py-1 text-xs font-bold bg-surface-container-low text-primary rounded-lg">Week</button>
                    <button class="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Month</button>
                </div>
            </div>
            <div class="h-[250px] md:h-[300px] w-full mt-auto relative">
                <canvas id="usageChart"></canvas>
            </div>
        </div>
        <div class="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100">
            <h3 class="text-base font-bold text-slate-800 mb-6">Device Status</h3>
            <div class="h-[200px] md:h-[250px] w-full relative flex items-center justify-center">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Activity Section -->`
        );
    } else {
        // 4. Header paddings (other pages)
        content = content.replace(
            /<header class="w-full sticky top-0 z-40 bg-slate-50\/70 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-\[0px_24px_48px_rgba\(0,83,91,0\.06\)\]">/,
            '<header class="w-full sticky top-0 z-40 bg-slate-50/70 backdrop-blur-xl flex flex-wrap justify-between items-center px-4 md:px-8 py-4 shadow-[0px_24px_48px_rgba(0,83,91,0.06)] gap-4">'
        );
        content = content.replace(
            /<div class="flex items-center gap-4">\s*<button id="mobile-menu-btn"/,
            '<div class="flex items-center gap-2 sm:gap-4">\n                <button id="mobile-menu-btn"'
        );
        content = content.replace(
            /<h2 class="text-2xl font-headline font-bold text-primary">/,
            '<h2 class="text-xl sm:text-2xl font-headline font-bold text-primary">'
        );
        
        // Fix header right section
        content = content.replace(
            /<div class="flex items-center gap-4">\s*<div class="relative">/,
            '<div class="flex items-center gap-2 sm:gap-4">\n                <div class="relative hidden sm:block">'
        );
        // Add mobile search button right after relative div
        content = content.replace(
            /(<input[^>]*>[\s\S]*?<\/div>)\s*<div class="w-px/,
            '$1\n                <button class="sm:hidden w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-slate-600">\n                    <span class="material-symbols-outlined">search</span>\n                </button>\n                <div class="w-px'
        );
        content = content.replace(
            /<div class="w-px h-6 bg-slate-200 mx-2"><\/div>/,
            '<div class="w-px h-6 bg-slate-200 mx-1 sm:mx-2"></div>'
        );
        content = content.replace(
            /<div class="text-right">/,
            '<div class="text-right hidden sm:block">'
        );
        content = content.replace(
            /<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">/,
            '<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">'
        );
        
        // 5. Dashboard content container
        content = content.replace(
            /<div class="p-8 space-y-8 max-w-\[1400px\]">/,
            '<div class="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px]">'
        );
        // 4 grid cols to 1/2/4
        content = content.replace(
            /<div class="grid grid-cols-1 md:grid-cols-4 gap-6">/g,
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">'
        );
        // 3 grid cols
        content = content.replace(
            /<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">/g,
            '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">'
        );
    }
    
    // Ensure overflow-x-auto on all table wrappers if not present
    content = content.replace(
        /<div class="bg-surface-container-lowest rounded-\[1rem\] overflow-hidden">\s*<table/g,
        '<div class="bg-surface-container-lowest rounded-[1rem] overflow-hidden">\n<div class="overflow-x-auto">\n<table'
    );
    // Add closing div if we added overflow-x-auto
    if (content.includes('<div class="overflow-x-auto">\n<table')) {
        content = content.replace(/<\/table>\s*<\/div>\s*<\/section>/g, '</table>\n</div>\n</div>\n</section>');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`No changes made to ${file}`);
    }
});
