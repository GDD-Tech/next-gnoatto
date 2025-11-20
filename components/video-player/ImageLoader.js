'use client'
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';

import passeio from "@/assets/vehicles/01 Passeio.png";
import reboque1 from "@/assets/vehicles/02 Reboque Passeio 1 Eixo.png";
import reboque2 from "@/assets/vehicles/03 Reboque Passeio 2 Eixos.png";
import moto from "@/assets/vehicles/moto.png";
import onibus2 from "@/assets/vehicles/04 2C 2 Eixos.png";
import onibus3 from "@/assets/vehicles/05 3C 3 Eixos.png";
import onibus4 from "@/assets/vehicles/06 4C 4 Eixos.png";
import caminhao2 from "@/assets/vehicles/07 2C 16.png";
import caminhao22 from "@/assets/vehicles/08 2C 22.png";
import caminhao3 from "@/assets/vehicles/09 3C.png";
import caminhao4 from "@/assets/vehicles/4C.png";
import caminhao5 from "@/assets/vehicles/11 2S2 4 Eixos.png";
import c2S35Eixos from "@/assets/vehicles/2S3 5 Eixos.png";
import c3S36Eixos from "@/assets/vehicles/3S3 6 Eixos.png";
import c2C24Eixos from "@/assets/vehicles/2C2 4 Eixos.png";
import c2I35Eixos from "@/assets/vehicles/2I3 5 Eixos.png";
import c2J35Eixos from "@/assets/vehicles/2J3 5 Eixos.png";
import c3S25Eixos from "@/assets/vehicles/3S2 5 Eixos.png";
import c4S37Eixos from "@/assets/vehicles/4S3 7 Eixos.png";
import c3I36Eixos from "@/assets/vehicles/3I3 6 Eixos.png";
import c3J36Eixos from "@/assets/vehicles/3J3 6 Eixos.png";
import c3T47Eixos from "@/assets/vehicles/3T4 7 Eixos Bitrem.png";
import c3T69Eixos from "@/assets/vehicles/3T6 9 Eixos Rodotrem Tritrem.png";
import c2C35Eixos from "@/assets/vehicles/2C3 5 Eixos.png";
import c3C25Eixos from "@/assets/vehicles/3C2 5 Eixos.png";
import c3C36Eixos from "@/assets/vehicles/3C3 6 Eixos.png";
import c3D47Eixos from "@/assets/vehicles/3D4 7 Eixos.png";
import c3D69Eixos from "@/assets/vehicles/3D6 9 Eixos Rodotrem.png";
import ImportFile from "./ImportFile";
import VehicleItemList from "./VehicleItemList";
import BasicModal from "../modal/BasicModal";
import Toaster from "../toaster/Toaster";
import DataTable from "../data-table/DataTable";

const passeioImgList = [
  { id: 'passeio', image: passeio, type:'passeio', description: "Passeio" },
  { id: 'moto', image: moto, type:'passeio', description: "Moto" },
  { id: 'reboque1', image: reboque1, type:'passeio', description: "Reboque Passeio 1 Eixo" },
  { id: 'reboque2', image: reboque2, type:'passeio', description: "Reboque Passeio 2 Eixos" },
];

const onibusImgList = [
  { id: 'onibus2', image: onibus2, type:'onibus', description: "2C 2 Eixos" },
  { id: 'onibus3', image: onibus3, type:'onibus', description: "3C 3 Eixos" },
  { id: 'onibus4', image: onibus4, type:'onibus', description: "4C 4 Eixos" },
]

const caminhaoImgList = [
  { id: 'caminhao2', image: caminhao2, type:'caminhao', description: "2C (16)" },
  { id: 'caminhao22', image: caminhao22, type:'caminhao', description: "2C (22)" },
  { id: 'caminhao3', image: caminhao3, type:'caminhao', description: "3C" },
  { id: 'caminhao4', image: caminhao4, type:'caminhao', description: "4C" },
  { id: 'caminhao5', image: caminhao5, type:'caminhao', description: "2S2 4 Eixos" },
  { id: 'c2S35Eixos', image: c2S35Eixos, type:'caminhao', description: "2S3 5 Eixos" },
  { id: 'c2I35Eixos', image: c2I35Eixos, type:'caminhao', description: "2I3 5 Eixos" },
  { id: 'c2J35Eixos', image: c2J35Eixos, type:'caminhao', description: "2J3 5 Eixos" },
  { id: 'c3S25Eixos', image: c3S25Eixos, type:'caminhao', description: "3S2 5 Eixos" },
  { id: 'c3S36Eixos', image: c3S36Eixos, type:'caminhao', description: "3S3 6 Eixos" },
  { id: 'c4S37Eixos', image: c4S37Eixos, type:'caminhao', description: "4S3 7 Eixos" },
  { id: 'c3I36Eixos', image: c3I36Eixos, type:'caminhao', description: "3I3 6 Eixos" },
  { id: 'c3J36Eixos', image: c3J36Eixos, type:'caminhao', description: "3J3 6 Eixos" },
  { id: 'c3T47Eixos', image: c3T47Eixos, type:'caminhao', description: "3T4 7 Eixos Bitrem" },
  { id: 'c3T69Eixos', image: c3T69Eixos, type:'caminhao', description: "3T6 9 Eixos Rodotrem Tritrem" },
  { id: 'c2C24Eixos', image: c2C24Eixos, type:'caminhao', description: "2C2 4 Eixos" },
  { id: 'c2C35Eixos', image: c2C35Eixos, type:'caminhao', description: "2C3 5 Eixos" },
  { id: 'c3C25Eixos', image: c3C25Eixos, type:'caminhao', description: "3C2 5 Eixos" },
  { id: 'c3C36Eixos', image: c3C36Eixos, type:'caminhao', description: "3C3 6 Eixos" },
  { id: 'c3D47Eixos', image: c3D47Eixos, type:'caminhao', description: "3D4 7 Eixos" },
  { id: 'c3D69Eixos', image: c3D69Eixos, type:'caminhao', description: "3D6 9 Eixos Rodotrem" },
]

export default function ImageLoader(props) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [leftDirection, setLeftDirection] = useState('');
  const [rightDirection, setRightDirection] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [storedVehicles, setStoredVehicles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('warning');
  const [vehicleDirection, setVehicleDirection] = useState('none');
  
  useEffect(() => {
    const stored = localStorage.getItem('vehicleList');
    if (!stored) {
      localStorage.setItem('vehicleList', JSON.stringify([]));
      setStoredVehicles([]);
    } else {
      setStoredVehicles(JSON.parse(stored));
    }
  }, []);

  const handleDirection = (label, direction, vehicle, axles) => {
    const object = {
      id : uuidv4(),
      trackId : selectedVehicle?.track_id,
      time : selectedVehicle?.time,
      date : selectedVehicle?.time,
      direction : direction === 'left' ? leftDirection : rightDirection,
      fromTo : direction === 'left' ? (rightDirection + " - " + leftDirection) : (leftDirection + " - " + rightDirection),
      type : vehicle?.description ?? vehicleDetails?.description,
      category : label ?? vehicleLabel,
      raisedAxles : axles
    }

    if(!isValidData(object)){
      return;
    }

    const updatedList = [...storedVehicles];
    const exists = updatedList.some(v => v.trackId === object.trackId);

    updatedList.push(object);
    setStoredVehicles(updatedList);
    localStorage.setItem('vehicleList', JSON.stringify(updatedList));

    handleToastMessage("Veículo adicionado!", "success");
    if (!exists) {
      // nothing special for now
    }

    // If ImportFile registered a next() function, call it to advance to next record
    try {
      if (nextFnRef.current) nextFnRef.current();
    } catch (e) {
      console.error('error calling registered next function', e);
    }
  }

  function handleToastMessage(message, type){
    setToastMessage(message);
    setToastType(type);
  }

  function isValidData(data) {
    if (!data.direction || !leftDirection || !rightDirection) {
      handleToastMessage("Direções não podem estar vazias!", "warning");
      return false;
    }
    return true;
  }

  const handleVehicleClick = (direction, label, vehicle) => {
    setVehicleLabel(label);
    setVehicleDetails(vehicle);
    setVehicleDirection(direction);
    setModalOpen(true);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleChangeLeft = (event) => {
    setLeftDirection(event.target.value);
  };

  const handleChangeRight = (event) => {
    setRightDirection(event.target.value);
  };

  const resetToastMessage = () => {
    setToastMessage(null);
  }

  const deleteRow = (row) => {
    const newList = storedVehicles.filter(item => item.id !== row.id);
    setStoredVehicles(newList);
    localStorage.setItem('vehicleList', JSON.stringify(newList));
  }

  const deleteAll = () => {
    setStoredVehicles([]);
    localStorage.removeItem('vehicleList');
  }

  const nextFnRef = useRef(null);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center'}}>
        <Box sx={{p: 2, width:'100%', maxWidth: '50vw'}}>
          {selectedVehicle && (
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Typography variant="h5" sx={{color: '#22423A', fontWeight: 'bold'}}>Direção</Typography>
              <Box sx={{ display: 'flex', gap: 2, my: 1}}>
                <TextField label="Esquerda" color="error" size="small" focused value={leftDirection} onChange={handleChangeLeft}/>
                <TextField label="Direita" color="success" size="small" focused value={rightDirection} onChange={handleChangeRight}/>
                <Button variant="contained" color="primary" onClick={() => handleChangeRight} ><AddIcon /></Button>
              </Box>
            </Box>
          )}
          <ImportFile onVehicleSelect={handleVehicleSelect} storedVehicles={storedVehicles} registros={props?.loadedRecords ?? []} imagens={props?.loadedImages ?? {}} registerNext={(fn) => (nextFnRef.current = fn)} />
        </Box>
        {selectedVehicle && (
          <Box sx={{p: 2, maxWidth: '50vw'}}>
            <Box sx={{ pt: 3}}>
              <Typography variant="h5" sx={{color: '#22423A', fontWeight: 'bold'}}>Painel de Veiculos</Typography>
              <div className='gno-flex-column'>
                <VehicleItemList vehicleList={passeioImgList} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Passeio'} left={leftDirection} right={rightDirection}></VehicleItemList>
                <VehicleItemList vehicleList={onibusImgList} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Onibus'} left={leftDirection} right={rightDirection}></VehicleItemList>
                <VehicleItemList vehicleList={caminhaoImgList} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Caminhão'} left={leftDirection} right={rightDirection}></VehicleItemList>
              </div>
            </Box>
          </Box>
        )}
      </Box>
      {selectedVehicle && (
        <Box>
          <BasicModal isOpen={modalOpen} onClose={() => setModalOpen(false)} vehicle={selectedVehicle} left={leftDirection} right={rightDirection} direction={vehicleDirection} onHandleDirection={handleDirection}/>
          {toastMessage && <Toaster message={toastMessage} type={toastType} onReset={resetToastMessage}/>}
          {storedVehicles.length > 0 && (
            <DataTable vehicleList={storedVehicles} onDelete={deleteRow} onDeleteAll={deleteAll} openResetDialog={props.resetRequest} onResetDialogOpened={props.onResetHandled} />
          )}
        </Box>
      )}
    </>
  );
}
