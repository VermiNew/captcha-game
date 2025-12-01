#!/usr/bin/env python3
import os
import re

# Fix GameContainer - remove unused useState
filepath = "src/components/GameContainer.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"import.*useState.*from 'react';",
    lambda m: m.group(0).replace(", useState", ""),
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix 14_ClickPrecision - remove unused timeLimit, challengeId, startTimeRef
filepath = "src/components/challenges/14_ClickPrecision.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Remove these patterns
content = re.sub(
    r"const { onComplete, timeLimit, challengeId, } = props;",
    "const { onComplete, } = props;",
    content
)

content = re.sub(
    r"\s*const startTimeRef = useRef<number>\(Date\.now\(\)\);\n",
    "",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix 17_SimonSays
filepath = "src/components/challenges/17_SimonSays.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"const { onComplete, timeLimit, challengeId, } = props;",
    "const { onComplete, } = props;",
    content
)

content = re.sub(
    r"\s*const startTimeRef = useRef<number>\(Date\.now\(\)\);\n",
    "",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix 18_BalanceGame
filepath = "src/components/challenges/18_BalanceGame.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"\s*const startTimeRef = useRef<number>\(Date\.now\(\)\);\n",
    "",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix 41_ImagePuzzle
filepath = "src/components/challenges/41_ImagePuzzle.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"const { onComplete, timeLimit, challengeId, } = props;",
    "const { onComplete, } = props;",
    content
)

content = re.sub(
    r"\s*const startTimeRef = useRef<number>\(Date\.now\(\)\);\n",
    "",
    content
)

# Remove unused index parameter
content = re.sub(
    r"\(_, index\) =>",
    "(_) =>",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix 15_MemoryMatch - remove rating variable
filepath = "src/components/challenges/15_MemoryMatch.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"const rating = getRating\(moves\);",
    "getRating(moves);",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

# Fix utils
filepath = "src/utils/challengeRegistry.ts"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"const PlaceholderChallenge = ",
    "// const PlaceholderChallenge = ",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

filepath = "src/utils/debug.ts"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"} catch \(e\) {",
    "} catch (_) {",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")

filepath = "src/utils/safeRunner.ts"
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r"\} catch \(_\) \{\s*\}",
    "} catch (_) {\n    // Ignore error\n  }",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Fixed: {filepath}")
