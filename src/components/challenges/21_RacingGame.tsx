/**
 * Racing Game Challenge
 * 
 * Inspired by: https://codepen.io/johan-tirholm/pen/PGYExJ
 * Canvas-based racing game with road curves and speed mechanics
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.lg};
`;

const GameCanvas = styled.canvas`
  border: 3px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  background: linear-gradient(135deg, #D4F5FE, #D4F5FE);
  display: block;
  width: 100%;
  max-width: 400px;
`;

const Controls = styled.div`
  text-align: center;
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
`;

const Speedometer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.borderLight};
`;

const SpeedBar = styled.div`
  flex: 1;
  height: 12px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.borderLight};
  overflow: hidden;
`;

const SpeedFill = styled(motion.div)<{ $speed: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #A855F7);
  border-radius: ${theme.borderRadius.sm};
  width: ${props => Math.min(props.$speed / 50 * 100, 100)}%;
`;

const SpeedText = styled.span`
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  min-width: 60px;
  text-align: right;
`;

const MessageBox = styled(motion.div)<{ $type: 'crash' | 'success' }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${props => props.$type === 'crash'
    ? 'rgba(220, 104, 90, 0.1)'
    : 'rgba(34, 197, 94, 0.1)'};
  border: 2px solid ${props => props.$type === 'crash'
    ? '#dc685a'
    : theme.colors.success};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const MessageText = styled.p`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

interface GameState {
  speed: number;
  xpos: number;
  turn: number;
  curve: number;
  currentCurve: number;
  section: number;
  crashed: boolean;
  distance: number;
}

const RacingGame: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    speed: 0,
    xpos: 0,
    turn: 0,
    curve: 0,
    currentCurve: 0,
    section: 50,
    crashed: false,
    distance: 0,
  });

  const keysPressed = useRef({
    up: false,
    left: false,
    right: false,
    down: false,
  });

  const [speed, setSpeed] = useState(0);
  const [crashed, setCrashed] = useState(false);
  const [won, setWon] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const CAR_WIDTH = 40;
  const CAR_HEIGHT = 30;
  const MAX_SPEED = 50;
  const TARGET_DISTANCE = 100;

  const colors = {
    sky: '#D4F5FE',
    ground: '#8FC04C',
    road: '#606a7c',
    roadLine: '#FFF',
  };

  const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const drawRoad = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    const basePos = CANVAS_WIDTH + state.xpos;
    const min = 60;
    const max = 150;

    ctx.fillStyle = colors.road;
    ctx.beginPath();
    ctx.moveTo((basePos + min) / 2 - state.currentCurve * 3, colors.sky.length);
    ctx.quadraticCurveTo(
      (basePos + min) / 2 + state.currentCurve / 3,
      100,
      (basePos + max) / 2,
      CANVAS_HEIGHT
    );
    ctx.lineTo((basePos - max) / 2, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(
      (basePos - min) / 2 + state.currentCurve / 3,
      100,
      (basePos - min) / 2 - state.currentCurve * 3,
      0
    );
    ctx.closePath();
    ctx.fill();

    // Road lines
    ctx.strokeStyle = colors.roadLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - state.currentCurve * 1.5, 0);
    ctx.quadraticCurveTo(
      CANVAS_WIDTH / 2 + state.currentCurve / 3,
      100,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT
    );
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawCar = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    const carX = CANVAS_WIDTH / 2 + state.turn * 15;
    const carY = CANVAS_HEIGHT - 80;

    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(carX - CAR_WIDTH / 2, carY - CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);

    // Windows
    ctx.fillStyle = '#B8E1FF';
    ctx.fillRect(carX - 12, carY - 10, 24, 12);

    // Lights
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(carX - 18, carY + 12, 8, 6);
    ctx.fillRect(carX + 10, carY + 12, 8, 6);
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const drawSpeedometer = (ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    const x = 30;
    const y = 30;
    const radius = 25;

    // Background circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Speed text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(state.speed).toString(), x, y);

    ctx.font = '8px Arial';
    ctx.fillText('km/h', x, y + 12);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas || crashed || won) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Calculate movement
    if (keysPressed.current.up) {
      state.speed += 0.5;
    } else if (state.speed > 0) {
      state.speed -= 0.3;
    }

    if (keysPressed.current.down && state.speed > 0) {
      state.speed -= 1;
    }

    state.xpos -= state.currentCurve * state.speed * 0.005;

    if (state.speed) {
      if (keysPressed.current.left) {
        state.turn = Math.max(state.turn - 0.1, -3);
      }
      if (keysPressed.current.right) {
        state.turn = Math.min(state.turn + 0.1, 3);
      }
    }

    if (state.turn !== 0 && !keysPressed.current.left && !keysPressed.current.right) {
      state.turn += state.turn > 0 ? -0.05 : 0.05;
    }

    state.speed = clamp(state.speed, 0, MAX_SPEED);
    state.xpos = clamp(state.xpos, -250, 250);
    state.section -= state.speed * 0.1;
    state.distance += state.speed * 0.01;

    // Change curve
    if (state.section < 0) {
      state.section = randomRange(1000, 9000);
      const newCurve = randomRange(-50, 50);
      state.curve = newCurve;
    }

    const move = state.speed * 0.01;
    if (state.currentCurve < state.curve) {
      state.currentCurve = Math.min(
        state.currentCurve + move,
        state.curve
      );
    } else if (state.currentCurve > state.curve) {
      state.currentCurve = Math.max(
        state.currentCurve - move,
        state.curve
      );
    }

    // Crash detection
    if (Math.abs(state.xpos) > 200) {
      state.crashed = true;
      setCrashed(true);
      setTimeout(() => {
        onComplete(false, 10, 0);
      }, 2000);
      return;
    }

    // Win condition
    if (state.distance > TARGET_DISTANCE) {
      state.crashed = true;
      setWon(true);
      setTimeout(() => {
        onComplete(true, 10, 100);
      }, 2000);
      return;
    }

    setSpeed(Math.round(state.speed));

    // Draw
    drawGround(ctx);
    drawRoad(ctx);
    drawCar(ctx);
    drawSpeedometer(ctx);

    requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        keysPressed.current.up = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') {
        keysPressed.current.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        keysPressed.current.right = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        keysPressed.current.down = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keysPressed.current.up = false;
      if (e.key === 'ArrowLeft') keysPressed.current.left = false;
      if (e.key === 'ArrowRight') keysPressed.current.right = false;
      if (e.key === 'ArrowDown') keysPressed.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    gameLoop();
  }, [crashed, won]);

  return (
    <ChallengeBase
      title="Racing Game"
      description="Drive the car and stay on the road"
 
 

    >
      <Container>
        <Controls>Use arrow keys to drive</Controls>

        <GameCanvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />

        <Speedometer>
          <span>Speed:</span>
          <SpeedBar>
            <SpeedFill $speed={speed} />
          </SpeedBar>
          <SpeedText>{speed} / {MAX_SPEED}</SpeedText>
        </Speedometer>

        <AnimatePresence>
          {crashed && (
            <MessageBox
              $type="crash"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <MessageText>💥 Crashed!</MessageText>
            </MessageBox>
          )}
          {won && (
            <MessageBox
              $type="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <MessageText>🏁 Finish Line!</MessageText>
            </MessageBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default RacingGame;
