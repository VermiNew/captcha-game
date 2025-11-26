import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Game phase type
 */
type GamePhase = 'loading' | 'ready' | 'playing' | 'complete';

/**
 * Tile interface
 */
interface Tile {
  id: number;
  imageUrl: string;
  rotation: number;
  correctRotation: number;
  correctPosition: number;
  currentPosition: number;
}

/**
 * Challenge props interface
 */
interface ChallengeProps {
  onComplete: (success: boolean, timeSpent: number, score: number) => void;
  timeLimit?: number;
  challengeId: string;
}

/**
 * Image Puzzle Challenge Component
 * Load 9 images, they are randomly rotated and positioned. Click to swap tiles.
 */
const ImagePuzzleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit = 180,
  challengeId,
}) => {
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [loadedImages, setLoadedImages] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageUrlsRef = useRef<string[]>([]);

  const GRID_SIZE = 3;
  const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length !== TOTAL_TILES) {
      alert(`Please select exactly ${TOTAL_TILES} images!`);
      return;
    }

    setLoadedImages(0);
    const urls: string[] = [];
    let loadedCount = 0;

    // Create URLs for all images
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      urls.push(url);
      
      // Preload image to ensure it's ready
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setLoadedImages(loadedCount);
        
        if (loadedCount === TOTAL_TILES) {
          imageUrlsRef.current = urls;
          initializePuzzle(urls);
        }
      };
      img.onerror = () => {
        alert('Error loading one or more images. Please try again.');
        urls.forEach(u => URL.revokeObjectURL(u));
      };
      img.src = url;
    });
  }, []);

  /**
   * Initialize puzzle with shuffled tiles
   */
  const initializePuzzle = useCallback((imageUrls: string[]) => {
    const rotations = [0, 90, 180, 270];
    const positions = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    const newTiles: Tile[] = imageUrls.map((url, index) => ({
      id: index,
      imageUrl: url,
      rotation: rotations[Math.floor(Math.random() * rotations.length)],
      correctRotation: 0,
      correctPosition: index,
      currentPosition: positions[index],
    }));

    setTiles(newTiles);
    setPhase('ready');
    startCountdown();
  }, []);

  /**
   * Start countdown before game
   */
  const startCountdown = useCallback(() => {
    setCountdown(3);
    let count = 3;
    
    const runCountdown = () => {
      if (count > 0) {
        setCountdown(count);
        count--;
        countdownTimerRef.current = setTimeout(runCountdown, 1000);
      } else {
        setPhase('playing');
        startTimeRef.current = Date.now();
      }
    };
    
    runCountdown();
  }, []);

  /**
   * Handle tile click
   */
  const handleTileClick = useCallback((tileId: number) => {
    if (phase !== 'playing') return;

    if (selectedTile === null) {
      // Select first tile
      setSelectedTile(tileId);
    } else if (selectedTile === tileId) {
      // Deselect if clicking same tile
      setSelectedTile(null);
    } else {
      // Swap tiles
      setTiles(prevTiles => {
        const newTiles = [...prevTiles];
        const tile1Index = newTiles.findIndex(t => t.id === selectedTile);
        const tile2Index = newTiles.findIndex(t => t.id === tileId);
        
        if (tile1Index !== -1 && tile2Index !== -1) {
          // Swap positions
          const temp = newTiles[tile1Index].currentPosition;
          newTiles[tile1Index].currentPosition = newTiles[tile2Index].currentPosition;
          newTiles[tile2Index].currentPosition = temp;
        }
        
        return newTiles;
      });
      
      setSelectedTile(null);
      setMoves(prev => prev + 1);
    }
  }, [phase, selectedTile]);

  /**
   * Handle tile rotation
   */
  const handleTileRotate = useCallback((tileId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phase !== 'playing') return;

    setTiles(prevTiles => {
      const newTiles = [...prevTiles];
      const tileIndex = newTiles.findIndex(t => t.id === tileId);
      
      if (tileIndex !== -1) {
        newTiles[tileIndex].rotation = (newTiles[tileIndex].rotation + 90) % 360;
      }
      
      return newTiles;
    });
  }, [phase]);

  /**
   * Check if puzzle is solved
   */
  const isPuzzleSolved = useMemo(() => {
    return tiles.every(tile => 
      tile.currentPosition === tile.correctPosition && 
      tile.rotation === tile.correctRotation
    );
  }, [tiles]);

  /**
   * Handle puzzle completion
   */
  useEffect(() => {
    if (isPuzzleSolved && phase === 'playing' && tiles.length > 0) {
      setPhase('complete');
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      
      // Scoring: base 300 points - move penalty + time bonus
      const baseScore = 300;
      const movePenalty = Math.min(moves * 2, 150);
      const timeBonus = Math.max(0, Math.round(100 - timeSpent / 3));
      const score = baseScore - movePenalty + timeBonus;
      
      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 2500);
    }
  }, [isPuzzleSolved, phase, tiles.length, moves, onComplete]);

  /**
   * Get tile at position
   */
  const getTileAtPosition = useCallback((position: number): Tile | undefined => {
    return tiles.find(tile => tile.currentPosition === position);
  }, [tiles]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      imageUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  /**
   * Calculate accuracy
   */
  const accuracy = useMemo(() => {
    if (tiles.length === 0) return 0;
    const correctTiles = tiles.filter(tile => 
      tile.currentPosition === tile.correctPosition && 
      tile.rotation === tile.correctRotation
    ).length;
    return Math.round((correctTiles / tiles.length) * 100);
  }, [tiles]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1rem',
    }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Image Puzzle Challenge
      </motion.h2>

      <p style={{
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
      }}>
        {phase === 'loading' && '📁 Upload 9 images to create your puzzle'}
        {phase === 'ready' && '🎮 Get ready to solve...'}
        {phase === 'playing' && '🧩 Click tiles to swap, right side button to rotate'}
        {phase === 'complete' && '🎉 Puzzle solved!'}
      </p>

      {/* File Upload Section */}
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '100%',
              padding: '2rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              cursor: 'pointer',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}
          >
            📸 Select 9 Images
          </motion.button>

          {loadedImages > 0 && loadedImages < TOTAL_TILES && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              Loading images... {loadedImages}/{TOTAL_TILES}
            </motion.div>
          )}

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#1f2937' }}>
              📋 Instructions:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Select exactly 9 images from your device</li>
              <li>Images will be scrambled and rotated randomly</li>
              <li>Click two tiles to swap their positions</li>
              <li>Click the rotate button (↻) to rotate a tile</li>
              <li>Solve the puzzle as quickly as possible!</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Countdown Display */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: '#6366f1',
              textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            }}
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {(phase === 'playing' || phase === 'complete') && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.75rem 1.5rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
              Moves
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold', color: '#6366f1' }}>
              {moves}
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.75rem 1.5rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
              Accuracy
            </span>
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: accuracy === 100 ? '#10b981' : '#6366f1' 
            }}>
              {accuracy}%
            </span>
          </div>

          <motion.button
            onClick={() => setShowPreview(!showPreview)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              background: showPreview ? '#6366f1' : 'white',
              color: showPreview ? 'white' : '#6366f1',
              border: '2px solid #6366f1',
              borderRadius: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {showPreview ? '🔍 Hide Preview' : '🔍 Show Preview'}
          </motion.button>
        </div>
      )}

      {/* Preview Grid */}
      <AnimatePresence>
        {showPreview && phase === 'playing' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.75rem',
              border: '2px solid #e5e7eb',
            }}>
              {tiles.sort((a, b) => a.correctPosition - b.correctPosition).map(tile => (
                <div
                  key={tile.id}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '0.25rem',
                    overflow: 'hidden',
                    opacity: 0.5,
                  }}
                >
                  <img
                    src={tile.imageUrl}
                    alt={`Preview ${tile.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Puzzle Grid */}
      {(phase === 'playing' || phase === 'complete') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            width: '100%',
            maxWidth: '500px',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '1rem',
            border: '3px solid #6366f1',
          }}
        >
          {Array.from({ length: TOTAL_TILES }).map((_, position) => {
            const tile = getTileAtPosition(position);
            const isSelected = tile && selectedTile === tile.id;
            const isCorrect = tile && 
              tile.currentPosition === tile.correctPosition && 
              tile.rotation === tile.correctRotation;

            return (
              <motion.div
                key={position}
                onClick={() => tile && handleTileClick(tile.id)}
                whileHover={tile && phase === 'playing' ? { scale: 1.05 } : {}}
                whileTap={tile && phase === 'playing' ? { scale: 0.95 } : {}}
                style={{
                  aspectRatio: '1',
                  position: 'relative',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  cursor: tile && phase === 'playing' ? 'pointer' : 'default',
                  border: isSelected ? '4px solid #6366f1' : 
                          isCorrect ? '3px solid #10b981' : '2px solid #e5e7eb',
                  boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.5)' :
                             isCorrect ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                  background: tile ? 'transparent' : '#e5e7eb',
                }}
              >
                {tile && (
                  <>
                    <motion.img
                      src={tile.imageUrl}
                      alt={`Tile ${tile.id}`}
                      animate={{ rotate: tile.rotation }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                    
                    {/* Rotate Button */}
                    {phase === 'playing' && (
                      <motion.button
                        onClick={(e) => handleTileRotate(tile.id, e)}
                        whileHover={{ scale: 1.1, background: '#6366f1' }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.8)',
                          color: 'white',
                          border: '2px solid white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        ↻
                      </motion.button>
                    )}

                    {/* Correct indicator */}
                    {isCorrect && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#10b981',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Completion Message */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            padding: '1.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid #10b981',
            borderRadius: '0.75rem',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: '#10b981',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
          Puzzle solved in {moves} moves!
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
            Perfect work! All pieces are in place.
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      {phase === 'playing' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          💡 Tip: Use the preview to see the correct arrangement. Green borders = correct!
        </motion.p>
      )}
    </div>
  );
};

export default ImagePuzzleChallenge;