import os
import re

directory = "c:/NG-Office_work/Shivank/hamrahi-main-fixed/Admin/src/pages/Admin"

replacements = {
    # Backgrounds
    r"dashboard-bg": "bg-[#F8FAFC]",
    r"bg-white": "bg-[#FFFFFF]",
    r"bg-gray-50/70": "bg-[#F8FAFC]",
    r"bg-gray-50": "bg-[#F8FAFC]",
    r"bg-gray-100": "bg-[#F8FAFC]",
    r"hover:bg-gray-100/80": "hover:bg-[#F8FAFC]",
    r"hover:bg-gray-50": "hover:bg-[#F8FAFC]",
    
    # Text
    r"text-gray-900": "text-[#0F172A]",
    r"text-gray-800": "text-[#0F172A]",
    r"text-gray-700": "text-[#0F172A]",
    r"text-gray-600": "text-[#475569]",
    r"text-gray-500": "text-[#64748B]",
    r"text-gray-400": "text-[#94A3B8]",
    
    # Borders
    r"border-gray-100/90": "border-[#E2E8F0]",
    r"border-gray-100/70": "border-[#E2E8F0]",
    r"border-gray-100": "border-[#E2E8F0]",
    r"border-gray-200": "border-[#E2E8F0]",
    r"border-gray-300": "border-[#CBD5E1]",
    
    # Red accent
    r"text-\[\#E10600\]": "text-[#EF4444]",
    r"text-red-500": "text-[#EF4444]",
    r"text-red-600": "text-[#DC2626]",
    r"bg-\[\#E10600\]": "bg-[#EF4444]",
    r"bg-red-500": "bg-[#EF4444]",
    r"bg-red-600": "bg-[#DC2626]",
    r"bg-red-50": "bg-[#FEF2F2]",
    r"border-red-100": "border-[#FCA5A5]",
    r"border-red-200": "border-[#FCA5A5]",
    
    # Green accent (Success)
    r"text-emerald-700": "text-[#10B981]",
    r"text-green-600": "text-[#10B981]",
    r"text-green-500": "text-[#10B981]",
    r"bg-emerald-50": "bg-[#ECFDF5]",
    r"bg-green-50": "bg-[#ECFDF5]",
    r"border-emerald-200": "border-[#A7F3D0]",
    r"bg-emerald-500": "bg-[#10B981]",
    r"bg-green-500": "bg-[#10B981]",
    
    # Blue accent
    r"bg-blue-50": "bg-[#EFF6FF]",
    r"text-blue-600": "text-[#3B82F6]",
    
    # Yellow accent
    r"bg-amber-50": "bg-[#FFFBEB]",
    r"text-amber-600": "text-[#F59E0B]",
}

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            # Apply Admin.jsx sidebar logic explicitly here or let it be untouched (it was already modified)
            if file == "Admin.jsx":
                continue

            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {file}")
