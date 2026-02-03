import { Button, Typography, Box, Tooltip } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import classes from '@/components/video-player/VehicleItemList.module.css'

export default function VehicleItemList({ vehicleList, label, onVehicleClick, onHandleDirection, isNew }) {

  function handleDirectionClick(direction, vehicle) {
    onHandleDirection(label, direction, vehicle, 0, isNew);
  }

  function handleVehicleClick(direction, vehicle) {
    if (label === 'Caminhão') {
      onVehicleClick(direction, label, vehicle, isNew);
    }
  }

  return (
    <>
      <Typography variant="h6" sx={{ color: '#22423A', fontWeight: 'bold' }}>{label}</Typography>

      <div className={classes.gnoVehicleList} >
        {vehicleList.map((img, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minWidth: 0 }} >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: { xs: '2px', sm: '2px', md: '4px' } }}>
              <Button
                sx={{
                  minWidth: { xs: 16, sm: 20, md: 24, lg: 28 },
                  maxWidth: { xs: 24, sm: 28, md: 32, lg: 36 },
                  p: { xs: 0.25, sm: 0.5, md: 0.75, lg: 0.75 },
                  '& .MuiSvgIcon-root': { fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' } }
                }}
                variant="contained"
                color="error"
                onClick={() => handleDirectionClick('right', img,)}
              >
                <ArrowForward />
              </Button>
              <div
                style={{
                  cursor: label === 'Caminhão' ? 'pointer' : 'default',
                  flex: '1',
                  display: 'flex',
                  justifyContent: 'center',
                  minWidth: 0
                }}
                onClick={() => handleVehicleClick('none', img)}
              >
                <Image
                  src={img.image}
                  alt={img.description}
                  width={180}
                  style={{ width: '100%', height: 'auto', maxWidth: '180px' }}
                />
              </div>
              <Button
                sx={{
                  minWidth: { xs: 16, sm: 20, md: 24, lg: 28 },
                  maxWidth: { xs: 24, sm: 28, md: 32, lg: 36 },
                  p: { xs: 0.25, sm: 0.5, md: 0.75, lg: 0.75 },
                  '& .MuiSvgIcon-root': { fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' } }
                }}
                variant="contained"
                color="success"
                onClick={() => handleDirectionClick('left', img,)}
              >
                <ArrowBack />
              </Button>
            </Box>
            <Tooltip title={img.description} arrow placement="top">
              <Typography
                color="error"
                sx={{
                  fontSize: { xs: 10, sm: 12, md: 14 },
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  cursor: 'help'
                }}
              >
                {img.description}
              </Typography>
            </Tooltip>
          </Box>
        ))}
      </div>
    </>
  );
}
