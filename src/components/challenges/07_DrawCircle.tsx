import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Point interface for drawing coordinates
 */
interface Point {
  x: number;
  y: number;
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
 * Calculate circularity of drawn shape (0-100%)
 * Uses multiple criteria: radius consistency, closure, aspect ratio, and smoothness
 */
const calculateCircularity = (points: Point[]): number => {
  if (points.length < 20) return 0;

  // Calculate center
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  // Calculate distances from center to each point
  const distances = points.map((p) =>
    Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)),
  );

  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  if (avgRadius === 0) return 0;

  // Radius consistency (50% weight)
  const variance = distances.reduce(
    (sum, d) => sum + Math.pow(d - avgRadius, 2),
    0,
  ) / distances.length;
  const stdDev = Math.sqrt(variance);
  const radiusScore = Math.max(0, 100 - (stdDev / avgRadius) * 120);

  // Check closure - distance from start to end point (20% weight)
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const closureDistance = Math.sqrt(
    Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2),
  );
  const closureScore = Math.max(0, 100 - (closureDistance / avgRadius) * 100);

  // Check aspect ratio - circle should be symmetric (20% weight)
  const xDistances = points.map((p) => Math.abs(p.x - centerX));
  const yDistances = points.map((p) => Math.abs(p.y - centerY));
  const maxX = Math.max(...xDistances);
  const maxY = Math.max(...yDistances);
  const aspectRatio = Math.min(maxX, maxY) / Math.max(maxX, maxY);
  const aspectScore = aspectRatio * 100;

  // Check smoothness - penalize sudden direction changes (10% weight)
  let angleChanges = 0;
  const sampleSize = Math.min(points.length - 1, 100);
  for (let i = 1; i < sampleSize; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[i + 1];

    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angleDiff = Math.abs(angle2 - angle1);
    
    // Normalize angle difference to 0-π range
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    // Penalize sharp turns (> 45 degrees)
    if (angleDiff > Math.PI / 4) {
      angleChanges++;
    }
  }
  const smoothScore = Math.max(0, 100 - (angleChanges / sampleSize) * 100);

  // Combine scores with weights
  const finalScore = radiusScore * 0.5 + closureScore * 0.2 + aspectScore * 0.2 + smoothScore * 0.1;

  return Math.min(100, Math.max(0, finalScore));
};

/**
 * Draw Circle Challenge Component
 * User must draw a perfect circle with 90% accuracy
 */
const DrawCircleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [successTriggered, setSuccessTriggered] = useState(false);
  const [showHint, setShowHint] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize canvas context
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const size = containerWidth;
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#6366f1';

      ctxRef.current = ctx;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  /**
   * Get coordinates from event (mouse or touch)
   */
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  /**
   * Start drawing
   */
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setShowHint(false);
    setPoints([coords]);

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  }, [getCoordinates]);

  /**
   * Continue drawing
   */
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    setPoints((prev) => [...prev, coords]);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing, getCoordinates]);

  /**
   * Stop drawing and calculate accuracy
   */
  const stopDrawing = useCallback(() => {
    if (!isDrawing || points.length === 0) return;

    setIsDrawing(false);

    // Calculate circularity
    if (points.length < 20) {
      setAccuracy(0);
      return;
    }

    const circularity = calculateCircularity(points);
    const roundedAccuracy = Math.round(circularity);
    setAccuracy(roundedAccuracy);

    // Check if user succeeded
    if (circularity >= 90 && !successTriggered) {
      setSuccessTriggered(true);
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = Math.round(250 + (100 - circularity) * 10); // Bonus for perfection

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1500);
    }
  }, [isDrawing, points, successTriggered, startTime, onComplete]);

  /**
   * Handle clear button
   */
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setAccuracy(0);
    setHasDrawn(false);
    setShowHint(true);
    setSuccessTriggered(false);
  }, []);

  /**
   * Get color based on accuracy
   */
  const getAccuracyColor = useCallback((): string => {
    if (accuracy >= 90) return '#10b981';
    if (accuracy >= 70) return '#f59e0b';
    if (accuracy >= 50) return '#f97316';
    return '#ef4444';
  }, [accuracy]);

  /**
   * Get feedback message
   */
  const getFeedbackMessage = (): string => {
    if (!hasDrawn) return 'Draw a circle to see your accuracy';
    if (accuracy >= 90) return '🎉 Perfect! Challenge completed!';
    if (accuracy >= 80) return '😊 Almost there! Try one more time';
    if (accuracy >= 70) return '👍 Good attempt! Keep practicing';
    if (accuracy >= 50) return '💪 Not bad! Try drawing slower';
    if (accuracy > 0) return '🔄 Keep trying! You can do it';
    return 'Draw must have at least 20 points';
  };

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
        Draw a Perfect Circle
      </motion.h2>

      <p style={{
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
      }}>
        Draw a circle in one stroke. Achieve 90% accuracy to pass!
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '1rem',
          width: '100%',
          border: `2px solid ${getAccuracyColor()}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0 0 0.5rem 0',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Accuracy
        </p>
        <motion.div
          key={accuracy}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: getAccuracyColor(),
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          {accuracy}%
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={getFeedbackMessage()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '1rem',
              fontWeight: accuracy >= 90 ? 'bold' : 'normal',
              color: accuracy >= 90 ? '#10b981' : '#6b7280',
              margin: '0.5rem 0 0 0',
            }}
          >
            {getFeedbackMessage()}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            display: 'block',
            border: '8px solid #6366f1',
            borderRadius: '0.5rem',
            background: '#ffffff',
            cursor: 'crosshair',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            touchAction: 'none',
          }}
        />
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '8rem',
                pointerEvents: 'none',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              ⭕
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <motion.button
          onClick={handleClear}
          disabled={!hasDrawn}
          whileHover={{ scale: hasDrawn ? 1.05 : 1 }}
          whileTap={{ scale: hasDrawn ? 0.95 : 1 }}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '0.5rem',
            cursor: hasDrawn ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            border: '2px solid #6366f1',
            background: '#ffffff',
            color: '#6366f1',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            opacity: hasDrawn ? 1 : 0.5,
          }}
        >
          🗑️ Clear & Try Again
        </motion.button>
      </motion.div>

      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
        fontStyle: 'italic',
        opacity: 0.8,
      }}>
        💡 Tip: Draw slowly and steadily in one smooth motion for better accuracy!
      </p>
    </div>
  );
};

export default DrawCircleChallenge;