'use client'
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { getVehicleData } from "@/utils/staticVehicles";

import ImportFile from "./ImportFile";
import VehicleItemList from "./VehicleItemList";
import BasicModal from "../modal/BasicModal";
import NewVehicleModal from "../modal/NewVehicleModal";
import Toaster from "../toaster/Toaster";
import DataTable from "../data-table/DataTable";

export default function ImageLoader(props) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [leftDirection, setLeftDirection] = useState('');
  const [rightDirection, setRightDirection] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [storedVehicles, setStoredVehicles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('warning');
  const [vehicleDirection, setVehicleDirection] = useState('none');
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  
  useEffect(() => {
    const stored = localStorage.getItem('vehicleList');
    if (!stored) {
      localStorage.setItem('vehicleList', JSON.stringify([]));
      setStoredVehicles([]);
    } else {
      setStoredVehicles(JSON.parse(stored));
    }
  }, []);

  // Reload storedVehicles when clearVehiclesFlag changes
  useEffect(() => {
    if (props.clearVehiclesFlag > 0) {
      const stored = localStorage.getItem('vehicleList');
      if (!stored) {
        setStoredVehicles([]);
        setLeftDirection('');
        setRightDirection('');
        setStoredVehicles([]);
      } else {
        setStoredVehicles(JSON.parse(stored));
      }
    }
  }, [props.clearVehiclesFlag]);

  const handleDirection = (label, direction, vehicle, axles, isNew) => {
    const object = {
      id : uuidv4(),
      trackId : isNew ? '' : selectedVehicle?.track_id,
      time : selectedVehicle?.time,
      date : selectedVehicle?.date,
      direction : direction === 'left' ? leftDirection : rightDirection,
      fromTo : direction === 'left' ? (rightDirection + " - " + leftDirection) : (leftDirection + " - " + rightDirection),
      type : vehicle?.exportName ?? vehicleDetails?.description,
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

    if(!isNew){
      try {
        if (nextFnRef.current) nextFnRef.current();
      } catch (e) {
        console.error('error calling registered next function', e);
      }
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

  const handleVehicleClick = (direction, label, vehicle, isNew) => {
    setVehicleLabel(label);
    setVehicleDetails(vehicle);
    setVehicleDirection(direction);
    setModalOpen(true);
    setIsNewVehicle(isNew)
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

  const handleAddNewVehicle = () =>{
    if (!leftDirection || !rightDirection) {
      handleToastMessage("Direções não podem estar vazias!", "warning");
      return;
    }
    setNewVehicleModalOpen(true);
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
                <Button variant="contained" color="primary" onClick={handleAddNewVehicle} ><AddIcon /></Button>
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
                <VehicleItemList vehicleList={getVehicleData('passeio')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Passeio'} left={leftDirection} right={rightDirection} isNew={false}></VehicleItemList>
                <VehicleItemList vehicleList={getVehicleData('onibus')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Onibus'} left={leftDirection} right={rightDirection} isNew={false}></VehicleItemList>
                <VehicleItemList vehicleList={getVehicleData('caminhao')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Caminhão'} left={leftDirection} right={rightDirection} isNew={false}></VehicleItemList>
              </div>
            </Box>
          </Box>
        )}
      </Box>
      {selectedVehicle && (
        <Box>
          <BasicModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            vehicle={selectedVehicle}
            left={leftDirection}
            right={rightDirection}
            direction={vehicleDirection}
            onHandleDirection={handleDirection}
            isNew={isNewVehicle}
          />
          <NewVehicleModal isOpen={newVehicleModalOpen} onClose={() => setNewVehicleModalOpen(false)} getVehicleData={getVehicleData} handleVehicleClick={handleVehicleClick} handleDirection={handleDirection} leftDirection={leftDirection} rightDirection={rightDirection} />
          {toastMessage && <Toaster message={toastMessage} type={toastType} onReset={resetToastMessage}/>}
          {storedVehicles.length > 0 && (
            <DataTable vehicleList={storedVehicles} onDelete={deleteRow} onDeleteAll={deleteAll} openResetDialog={props.resetRequest} onResetDialogOpened={props.onResetHandled} />
          )}
        </Box>
      )}
    </>
  );
}
