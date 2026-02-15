'use client'
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  DialogContentText
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CompleteServiceModal({ 
  open, 
  onClose, 
  onConfirm, 
  serviceTitle,
  vehicleFileName,
  axleFileName 
}) {
  const [confirmed, setConfirmed] = useState(false);

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  const handleConfirm = () => {
    if (confirmed && onConfirm) {
      onConfirm();
      setConfirmed(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Completar Serviço</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          Esta ação exportará os dados abaixo e resetará a contagem.
        </DialogContentText>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1 }}>
          {/* Exportar Veículos */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon/>
            <Typography>
              Exportar Veículos
            </Typography>
          </Box>

          {/* Exportar Eixos */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon />
            <Typography>
              Exportar Eixos
            </Typography>
          </Box>

          {/* Resetar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon />
            <Typography color="error">
              Resetar Contagem Total
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Checkbox 
              checked={confirmed} 
              onChange={(e) => setConfirmed(e.target.checked)} 
            />
          }
          label="Confirmo que estou ciente das ações acima."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!confirmed}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
