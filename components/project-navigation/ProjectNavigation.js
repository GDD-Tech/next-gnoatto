'use client'
import { Box, Button, Chip, Typography } from '@mui/material';
import { NavigateBefore, NavigateNext, FolderOpen } from '@mui/icons-material';

export default function ProjectNavigation({ folders, currentIndex, onPrev, onNext }) {
  if (!folders || folders.length === 0) return null;

  const prevFolder = currentIndex > 0 ? folders[currentIndex - 1] : null;
  const currentFolder = folders[currentIndex];
  const nextFolder = currentIndex < folders.length - 1 ? folders[currentIndex + 1] : null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 0.75,
      backgroundColor: '#f0f7f4',
      borderBottom: '1px solid #c8e0d8',
      gap: 2,
      flexWrap: 'wrap',
    }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<NavigateBefore />}
        onClick={onPrev}
        disabled={!prevFolder}
        sx={{ borderColor: '#22423A', color: '#22423A', minWidth: 140, justifyContent: 'flex-start' }}
      >
        <Typography noWrap variant="body2" sx={{ maxWidth: 110 }}>
          {prevFolder ? prevFolder.name : ' '}
        </Typography>
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FolderOpen sx={{ color: '#22423A', fontSize: 20 }} />
        <Typography variant="body2" fontWeight="bold" color="#22423A">
          {currentIndex + 1} / {folders.length}
        </Typography>
        <Chip
          label={currentFolder?.name}
          size="small"
          sx={{ backgroundColor: '#22423A', color: '#fff', fontWeight: 'bold' }}
        />
        <Chip
          label={currentFolder?.type === 'video' ? 'Vídeo' : 'Frames'}
          size="small"
          color={currentFolder?.type === 'video' ? 'primary' : 'success'}
          variant="outlined"
        />
      </Box>

      <Button
        variant="outlined"
        size="small"
        endIcon={<NavigateNext />}
        onClick={onNext}
        disabled={!nextFolder}
        sx={{ borderColor: '#22423A', color: '#22423A', minWidth: 140, justifyContent: 'flex-end' }}
      >
        <Typography noWrap variant="body2" sx={{ maxWidth: 110 }}>
          {nextFolder ? nextFolder.name : ' '}
        </Typography>
      </Button>
    </Box>
  );
}
