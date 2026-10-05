const fs = require('fs');
const path = require('path');

const directory = 'c:/NG-Office_work/Shivank/hamrahi-main-fixed/Admin/src/pages/Admin';

const replacements = {
    // Backgrounds
    "dashboard-bg": "bg-[#F8FAFC]",
    "bg-white": "bg-[#FFFFFF]",
    "bg-gray-50/70": "bg-[#F8FAFC]",
    "bg-gray-50": "bg-[#F8FAFC]",
    "bg-gray-100": "bg-[#F8FAFC]",
    "hover:bg-gray-100/80": "hover:bg-[#F8FAFC]",
    "hover:bg-gray-50": "hover:bg-[#F8FAFC]",
    
    // Text
    "text-gray-900": "text-[#0F172A]",
    "text-gray-800": "text-[#0F172A]",
    "text-gray-700": "text-[#0F172A]",
    "text-gray-600": "text-[#475569]",
    "text-gray-500": "text-[#64748B]",
    "text-gray-400": "text-[#94A3B8]",
    
    // Borders
    "border-gray-100/90": "border-[#E2E8F0]",
    "border-gray-100/70": "border-[#E2E8F0]",
    "border-gray-100": "border-[#E2E8F0]",
    "border-gray-200": "border-[#E2E8F0]",
    "border-gray-300": "border-[#CBD5E1]",
    
    // Red accent
    "text-[#E10600]": "text-[#EF4444]",
    "text-red-500": "text-[#EF4444]",
    "text-red-600": "text-[#DC2626]",
    "bg-[#E10600]": "bg-[#EF4444]",
    "bg-red-500": "bg-[#EF4444]",
    "bg-red-600": "bg-[#DC2626]",
    "bg-red-50": "bg-[#FEF2F2]",
    "border-red-100": "border-[#FCA5A5]",
    "border-red-200": "border-[#FCA5A5]",
    
    // Green accent (Success)
    "text-emerald-700": "text-[#10B981]",
    "text-green-600": "text-[#10B981]",
    "text-green-500": "text-[#10B981]",
    "bg-emerald-50": "bg-[#ECFDF5]",
    "bg-green-50": "bg-[#ECFDF5]",
    "border-emerald-200": "border-[#A7F3D0]",
    "bg-emerald-500": "bg-[#10B981]",
    "bg-green-500": "bg-[#10B981]",
    
    // Blue accent
    "bg-blue-50": "bg-[#EFF6FF]",
    "text-blue-600": "text-[#3B82F6]",
    
    // Yellow accent
    "bg-amber-50": "bg-[#FFFBEB]",
    "text-amber-600": "text-[#F59E0B]",
};

function processDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.jsx') && file !== 'Admin.jsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            for (const [old, newStr] of Object.entries(replacements)) {
                // Escape special regex characters in old string (like square brackets)
                const escapedOld = old.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                newContent = newContent.replace(new RegExp(escapedOld, 'g'), newStr);
            }
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${file}`);
            }
        }
    });
}

processDirectory(directory);
