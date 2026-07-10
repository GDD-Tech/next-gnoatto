'use client'
import { Box, Button, Chip, Typography } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

export default function ProjectNavigation({ folders, currentIndex, onPrev, onNext }) {
  if (!folders || folders.length === 0) return null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 0.75,
      backgroundColor: '#f0f7f4',
      borderBottom: '1px solid #c8e0d8',
      gap: 1.5,
      flexWrap: 'wrap',
    }}>
      <Button
        variant="outlined"
        size="small"
        onClick={onPrev}
        disabled={currentIndex === 0}
        sx={{ borderColor: '#22423A', color: '#22423A', minWidth: 0, px: 1 }}
      >
        <NavigateBefore fontSize="small" />
      </Button>

      <Typography variant="body2" fontWeight="bold" color="#22423A" sx={{ whiteSpace: 'nowrap' }}>
        {currentIndex + 1} / {folders.length}
      </Typography>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        overflowX: 'auto',
        maxWidth: { xs: '55vw', sm: '65vw', md: '75vw', lg: 'auto' },
        whiteSpace: 'nowrap',
        py: 0.5,
        '&::-webkit-scrollbar': { display: 'none' },
        'scrollbarWidth': 'none',
      }}>
        {folders.map((folder, i) => (
          <Chip
            key={folder.name}
            label={folder.name}
            size="small"
            sx={i === currentIndex ? {
              backgroundColor: '#22423A',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'default',
            } : {
              backgroundColor: '#fff',
              color: '#555',
              border: '1px solid #c8e0d8',
              cursor: 'default',
              opacity: 0.8,
            }}
          />
        ))}
      </Box>

      <Button
        variant="outlined"
        size="small"
        onClick={onNext}
        disabled={currentIndex === folders.length - 1}
        sx={{ borderColor: '#22423A', color: '#22423A', minWidth: 0, px: 1 }}
      >
        <NavigateNext fontSize="small" />
      </Button>
    </Box>
  );
}
