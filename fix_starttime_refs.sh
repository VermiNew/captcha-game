#!/bin/bash

# Fix 14_ClickPrecision
sed -i 's/const startTimeRef = useRef<number>(0);/const startTimeRef = useRef(0);/g' src/components/challenges/14_ClickPrecision.tsx
sed -i 's/startTimeRef\.current =/startTimeRef.current =/g' src/components/challenges/14_ClickPrecision.tsx

# Fix 17_SimonSays  
sed -i 's/startTimeRef\.current =/startTimeRef.current =/g' src/components/challenges/17_SimonSays.tsx

# Fix 18_BalanceGame
sed -i 's/startTimeRef\.current =/startTimeRef.current =/g' src/components/challenges/18_BalanceGame.tsx

# Fix 41_ImagePuzzle
sed -i 's/startTimeRef\.current =/startTimeRef.current =/g' src/components/challenges/41_ImagePuzzle.tsx
