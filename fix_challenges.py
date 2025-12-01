import os
import re

challenges_dir = "src/components/challenges"

# Find all challenge files
for filename in os.listdir(challenges_dir):
    if filename.endswith(".tsx") and filename not in ["ChallengeBase.tsx", "Timer.tsx"]:
        filepath = os.path.join(challenges_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to find and remove challengeId and onComplete from ChallengeBase
        pattern = r'(<ChallengeBase\s+title="[^"]+"\s+description="[^"]+"\s+)\s*challengeId=\{challengeId\}\s*onComplete=\{onComplete\}\s*(>)'
        replacement = r'\1\2'
        
        new_content = re.sub(pattern, replacement, content)
        
        # Also handle cases where they might be on separate lines
        pattern2 = r'(\s+challengeId=\{challengeId\})\s*'
        new_content = re.sub(pattern2, '', new_content)
        
        pattern3 = r'(\s+onComplete=\{onComplete\})\s*'
        new_content = re.sub(pattern3, '', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed: {filename}")

print("Done!")
