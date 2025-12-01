#!/usr/bin/env python3
import os
import re

files = [
    "src/components/challenges/14_ClickPrecision.tsx",
    "src/components/challenges/17_SimonSays.tsx",
    "src/components/challenges/18_BalanceGame.tsx",
    "src/components/challenges/41_ImagePuzzle.tsx",
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix: const [startTime] = useState(() => Date.now());
    # To: const startTimeRef = useRef(0); in useEffect set it
    
    # Replace useState startTime declarations
    content = re.sub(
        r"const \[startTime\] = useState\(\(\) => Date\.now\(\)\);",
        "const startTimeRef = useRef(0);",
        content
    )
    
    # Fix assignments in useEffect
    content = re.sub(
        r"startTime = Date\.now\(\);",
        "startTimeRef.current = Date.now();",
        content
    )
    
    # Fix references
    content = re.sub(
        r"Date\.now\(\) - startTime",
        "Date.now() - startTimeRef.current",
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed: {filepath}")

# Fix GameContainer - remove challengeId from props
filepath = "src/components/GameContainer.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"challengeId: currentChallenge\.id\.toString\(\),",
    "",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Fixed: {filepath}")
