#!/usr/bin/env python3
import os
import re

challenge_dir = "src/components/challenges"

# Pattern to find and remove unused timeLimit and challengeId
def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Remove unused timeLimit and challengeId from destructuring
    # Pattern: { onComplete, timeLimit, challengeId, } or similar
    content = re.sub(
        r'\{\s*onComplete,\s*\n\s*timeLimit,\s*\n\s*challengeId,\s*\n\s*\}',
        '{ onComplete, }',
        content
    )
    
    content = re.sub(
        r'\{\s*onComplete,\s*\n\s*timeLimit,\s*\n\s*\}',
        '{ onComplete, }',
        content
    )
    
    content = re.sub(
        r'\{\s*onComplete,\s*\n\s*challengeId,\s*\n\s*\}',
        '{ onComplete, }',
        content
    )
    
    # Single line versions
    content = re.sub(
        r'\{\s*onComplete,\s*timeLimit,\s*challengeId,\s*\}',
        '{ onComplete, }',
        content
    )
    
    content = re.sub(
        r'\{\s*onComplete,\s*timeLimit,\s*\}',
        '{ onComplete, }',
        content
    )
    
    content = re.sub(
        r'\{\s*onComplete,\s*challengeId,\s*\}',
        '{ onComplete, }',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Get all challenge files
for filename in os.listdir(challenge_dir):
    if filename.endswith('.tsx') and filename not in ['ChallengeBase.tsx']:
        filepath = os.path.join(challenge_dir, filename)
        if fix_file(filepath):
            print(f"Fixed: {filename}")
        else:
            print(f"No changes: {filename}")
