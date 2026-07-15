'use client';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export default function ProjectCompletionScreen({ onNewProject }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bg = isDark ? '#121212' : '#f0f7f4';
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? '#2e4e45' : '#c8e0d8';
  const primary = '#22423A';
  const textPrimary = isDark ? '#ffffff' : '#22423A';
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(34,66,58,0.65)';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
          px: 5,
          py: 5,
          maxWidth: 440,
          width: '100%',
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.5)'
            : '0 4px 24px rgba(34,66,58,0.12)',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <CheckCircleOutlineIcon
          sx={{
            fontSize: 64,
            color: primary,
          }}
        />

        {/* Title */}
        <Box>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ color: textPrimary, mb: 0.75 }}
          >
            Projeto Concluído
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Todos os dados foram exportados e o serviço foi encerrado com sucesso.
          </Typography>
        </Box>

        <Divider sx={{ width: '100%', borderColor }} />

        {/* Download info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.25,
            borderRadius: 2,
            backgroundColor: isDark ? 'rgba(34,66,58,0.25)' : '#e8f4ef',
            border: `1px solid ${borderColor}`,
            width: '100%',
          }}
        >
          <DownloadDoneIcon sx={{ color: primary, fontSize: 20, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: textPrimary, fontWeight: 500 }}>
            Arquivo ZIP exportado com sucesso
          </Typography>
        </Box>

        {/* Action */}
        <Button
          variant="contained"
          size="medium"
          startIcon={<FolderOpenIcon />}
          onClick={onNewProject}
          sx={{
            mt: 0.5,
            px: 4,
            py: 1.1,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            backgroundColor: primary,
            '&:hover': {
              backgroundColor: '#1a3530',
            },
          }}
        >
          Importar Novo Projeto
        </Button>
      </Box>
    </Box>
  );
}
