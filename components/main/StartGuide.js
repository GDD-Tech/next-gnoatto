'use client';
import { CheckCircleOutline, CloudUpload, PlayCircleOutline } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import { useRef, useState } from 'react';
import { readProjectFolder } from "../../utils/projectReader";
import FullScreenSpinner from '../utility/FullScreenSpinner';

export default function StartGuide({ onLoadProject }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const result = await readProjectFolder(files);
        onLoadProject(result);
      } catch (error) {
        console.error('Erro ao carregar projeto:', error);
        alert('Erro ao carregar projeto:\n' + error.message);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }, 100);
  };

  const steps = [
    {
      icon: <CloudUpload color="primary" sx={{ fontSize: 24 }} />,
      title: '1. Importe a Pasta',
      description: 'Clique no botão abaixo e selecione a pasta configurada do seu projeto.'
    },
    {
      icon: <PlayCircleOutline color="primary" sx={{ fontSize: 24 }} />,
      title: '2. Classifique os Veículos',
      description: 'Navegue pelas detecções ou assista aos vídeos e classifique o tráfego.'
    },
    {
      icon: <CheckCircleOutline color="primary" sx={{ fontSize: 24 }} />,
      title: '3. Salve e Conclua',
      description: 'O progresso é salvo automaticamente. Avance de etapa até finalizar o projeto.'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
      }}
    >
      <Card 
        elevation={3}
        sx={{ 
          maxWidth: 480, 
          width: '100%', 
          borderRadius: 3,
          p: 2,
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff'
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#22423A' }} align="center">
            Como Iniciar
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
            Siga os passos abaixo para operar a aplicação.
          </Typography>

          <Stack spacing={3} sx={{ mb: 4 }}>
            {steps.map((step, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ mt: 0.5 }}>{step.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#22423A' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          <input
            ref={fileInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: 'none' }}
            onChange={handleFolderUpload}
          />

          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            sx={{ 
              borderRadius: 2, 
              py: 1.5, 
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            Importar Pasta de Projeto
          </Button>
        </CardContent>
      </Card>

      <FullScreenSpinner open={loading} />
    </Box>
  );
}
