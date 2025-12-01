#!/usr/bin/env python3
import os
import re

challenge_dir = "src/components/challenges"

def fix_date_now(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix: const startTimeRef = useRef<number>(Date.now());
    # To: const [startTime] = useState(() => Date.now());
    content = re.sub(
        r'const startTimeRef = useRef<number>\(Date\.now\(\)\);',
        'const [startTime] = useState(() => Date.now());',
        content
    )
    
    # Replace startTimeRef.current with startTime
    content = re.sub(
        r'startTimeRef\.current',
        'startTime',
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
        if fix_date_now(filepath):
            print(f"Fixed Date.now(): {filename}")
