import { Button, Typography, Box } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import classes from '@/components/video-player/VehicleItemList.module.css'

export default function VehicleItemList({ vehicleList, label, onVehicleClick, onHandleDirection }) {

  function handleDirectionClick(direction, vehicle) {
    onHandleDirection(label, direction, vehicle, 0);
  }

  function handleVehicleClick(direction, vehicle){
    if(label === 'Caminhão'){
      onVehicleClick(direction, label, vehicle);
    }
  }

  return (
    <>
      <Typography variant="h6" sx={{color: '#22423A', fontWeight: 'bold'}}>{label}</Typography>

      <div className={classes.gnoVehicleList}>
        {vehicleList.map((img, index) => (
          <Box key={index} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 220}}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Button sx={{ minWidth: 50, p: 1}} variant="contained" color="error" onClick={() => handleDirectionClick('right', img,)} ><ArrowForward /></Button>
              <div style={{ cursor: label === 'Caminhão' ? 'pointer' : 'default' }} onClick={() => handleVehicleClick('none', img)}>
                <Image src={img.image} alt={img.description} width={90} />
              </div>
              <Button sx={{ minWidth: 50, p: 1}} variant="contained" color="success" onClick={() => handleDirectionClick('left', img,)} ><ArrowBack /></Button>
            </Box>
            <Typography color="error">{img.description}</Typography>
          </Box>
        ))}
      </div>
    </>
  );
}
