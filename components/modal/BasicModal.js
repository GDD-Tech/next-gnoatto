'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: { xs: '50%', md: '75%' },
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const eixoList = [
  { id: 0, value: 0 },
  { id: 1, value: 1 },
  { id: 2, value: 2 },
  { id: 3, value: 3 },
  { id: 4, value: 4 },
];

export default function BasicModal({ isOpen, onClose, vehicle, left, right, direction, onHandleDirection, isNew }) {
  const handleClose = () => {
    if (onClose) onClose();
  };

  function handleAxles(dir, qty) {
    onHandleDirection(null, dir, null, qty, isNew);
    handleClose();
  }

  return (
    <Modal
      open={!!isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.1)' } } }}
    >
      <Box sx={style}>
        <Typography variant="h6" component="h6">
          Selecione a quantidade de eixos erguidos. {vehicle?.description}
        </Typography>

        {['none', 'right'].includes(direction) &&
          <div style={{ marginTop: '8px' }}>
            <Typography variant="subtitle2" color='error'>
              <strong>Direção:</strong> {right}
            </Typography>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {eixoList.map((eixo) => (
                <Button key={eixo.id} variant="contained" color="primary" onClick={() => handleAxles('right', eixo.value)}>
                  {eixo.value}
                </Button>
              ))}
            </div>
          </div>
        }

        {['none', 'left'].includes(direction) &&
          <div style={{ marginTop: '8px' }}>
            <Typography variant="subtitle2" color='success'>
              <strong>Direção:</strong> {left}
            </Typography>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {eixoList.map((eixo) => (
                <Button key={eixo.id} variant="contained" color="primary" onClick={() => handleAxles('left', eixo.value)}>
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
