import * as React from 'react';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import { keyframes } from '@mui/system';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const rotateReverse = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
`;

export default function FullScreenSpinner({ open }) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          position: 'relative',
        }}
      >
        {/* Outer spinning ring */}
        <Box
          sx={{
            position: 'relative',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ring 1 - Outer */}
          <Box
            sx={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              border: '4px solid transparent',
              borderTopColor: '#fff',
              borderRightColor: '#fff',
              borderRadius: '50%',
              animation: `${rotate} 1.5s linear infinite`,
            }}
          />
          
          {/* Ring 2 - Middle */}
          <Box
            sx={{
              position: 'absolute',
              width: '70px',
              height: '70px',
              border: '4px solid transparent',
              borderTopColor: 'rgba(255, 255, 255, 0.6)',
              borderLeftColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: `${rotateReverse} 2s linear infinite`,
            }}
          />
          
          {/* Ring 3 - Inner */}
          <Box
            sx={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              border: '3px solid transparent',
              borderTopColor: 'rgba(255, 255, 255, 0.8)',
              borderRightColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              animation: `${rotate} 1s linear infinite`,
            }}
          />
          
          {/* Central dot with pulse */}
          <Box
            sx={{
              width: '12px',
              height: '12px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>
    </Backdrop>
  );
}
