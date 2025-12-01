#!/usr/bin/env python3
import os
import re

challenge_dir = "src/components/challenges"

def fix_starttime(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Remove const startTimeRef = useRef<number>(Date.now());
    content = re.sub(
        r'\s*const startTimeRef = useRef<number>\(Date\.now\(\)\);\n',
        '',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

for filename in os.listdir(challenge_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(challenge_dir, filename)
        if fix_starttime(filepath):
            print(f"Fixed startTimeRef: {filename}")
