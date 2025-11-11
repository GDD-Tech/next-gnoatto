'use client'
import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({ isOpen, onClose, vehicle, left, right, direction, onHandleDirection }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const eixoList = [
    { id: 0, value: 0, name: 0 },
    { id: 1, value: 1, name: 1 },
    { id: 2, value: 2, name: 2 },
    { id: 3, value: 3, name: 3 },
    { id: 4, value: 4, name: 4 }
  ];

  function handleAxles(direction, qty){
    onHandleDirection(null, direction, null, qty);
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Selecione a quantidade de eixos erguidos. {vehicle?.description}
        </Typography>

        {['none', 'left'].includes(direction) && 
          <div style={{ marginTop: '8px'}}>
            <Typography variant="subtitle2" color='error'>
              Direção: <strong>{left}</strong>
            </Typography>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {eixoList.map((eixo) => (
                <Button key={eixo.id} variant="contained" color="primary" onClick={() => handleAxles('left', eixo.value)} >
                  {eixo.value}
                </Button>
              ))}
            </div>
          </div>
        }

        {['none', 'right'].includes(direction) && 
          <div style={{ marginTop: '8px'}}>
            <Typography variant="subtitle2" color='success'>
              Direção: <strong>{right}</strong>
            </Typography>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {eixoList.map((eixo) => (
                <Button key={eixo.id} variant="contained" color="primary" onClick={() => handleAxles('right', eixo.value)} >
                  {eixo.value}
                </Button>
              ))}
            </div>
          </div>
        }
      </Box>
    </Modal>
  );
}
