import { Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import classes from '@/components/video-player/VehicleItemList.module.css'
import AddIcon from '@mui/icons-material/Add';

export default function VehicleItemList({ vehicleList, label, onVehicleClick, onHandleDirection }) {

  function handleDirectionClick(direction, vehicle) {
    onHandleDirection(label, direction, vehicle, 0);
  }

  function handleVehicleClick(direction, vehicle){
    if(label !== 'Caminhão'){
      handleDirectionClick(direction, vehicle);
    } else {
      onVehicleClick(direction, label, vehicle);
    }
  }

  return (
    <>
      <Typography variant="h6" sx={{color: '#22423A', fontWeight: 'bold'}}>{label}</Typography>

      <div className={classes.gnoVehicleList}>
        {vehicleList.map((img, index) => (
          <div key={index} className="gno-flex-column gno-align-center">
            <div className={classes.gnoVehicle}>
              {/* <Button sx={{ minWidth: 40, p: 1}} variant="contained" color="primary" onClick={() => handleVehicleClick('left', img)} ><AddIcon /></Button> */}
              <Button sx={{ minWidth: 50, p: 1}} variant="contained" color="success" onClick={() => handleDirectionClick('right', img,)} ><ArrowForward /></Button>
              <div style={{ cursor: 'pointer' }} onClick={() => handleVehicleClick('none', img)}>
                <Image src={img.image} alt={img.description} width={90} />
              </div>
              <Button sx={{ minWidth: 50, p: 1}} variant="contained" color="error" onClick={() => handleDirectionClick('left', img,)} ><ArrowBack /></Button>
              {/* <Button sx={{ minWidth: 40, p: 1}} variant="contained" color="primary" onClick={() => handleVehicleClick('right', img)} ><AddIcon /></Button> */}
            </div>
            <Typography color="error">{img.description}</Typography>
          </div>
        ))}
      </div>
    </>
  );
}
