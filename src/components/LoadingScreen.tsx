import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: white;
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 40px;
  font-weight: bold;
  background: linear-gradient(45deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ProgressBarContainer = styled.div`
  width: 300px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const ProgressBar = styled.div<{ $progress?: number }>`
  height: 100%;
  width: ${(props) => (props.$progress !== undefined ? props.$progress : 0)}%;
  background: linear-gradient(90deg, #00d4ff, #0099ff);
  transition: width 0.3s ease;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
`;

const ProgressText = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  margin-top: 20px;
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-weight: 500;
`;

interface LoadingScreenProps {
  progress: number;
  isLoading?: boolean;
  eta?: number | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  isLoading = true,
  eta,
}) => {
  const [etaDisplay, setEtaDisplay] = useState('');

  useEffect(() => {
    if (!eta || !isLoading) {
      setEtaDisplay('');
      return;
    }

    const updateEta = () => {
      const now = Date.now();
      const remainingMs = eta - now;
      
      if (remainingMs <= 0) {
        setEtaDisplay('');
        return;
      }
      
      const seconds = Math.ceil(remainingMs / 1000);
      if (seconds < 60) {
        setEtaDisplay(`${seconds}s`);
      } else {
        const minutes = Math.ceil(seconds / 60);
        setEtaDisplay(`${minutes}m`);
      }
    };

    updateEta();
    const interval = setInterval(updateEta, 1000);
    return () => clearInterval(interval);
  }, [eta, isLoading]);

  return (
    <LoadingContainer>
      <LoadingContent>
        <Title>🎮 Captcha Game</Title>
        <LoadingText>
          {isLoading ? 'Loading challenges...' : 'Ready to start!'}
        </LoadingText>
        <ProgressBarContainer>
          <ProgressBar $progress={progress} />
        </ProgressBarContainer>
        <ProgressText>{Math.round(progress)}% {etaDisplay && `• ETA: ${etaDisplay}`}</ProgressText>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default LoadingScreen;
