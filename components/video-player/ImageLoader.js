'use client'
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { getVehicleData } from "@/utils/staticVehicles";

import ImportFile from "./ImportFile";
import VehicleItemList from "./VehicleItemList";
import BasicModal from "../modal/BasicModal";
import NewVehicleModal from "../modal/NewVehicleModal";
import Toaster from "../toaster/Toaster";
import DataTable from "../data-table/DataTable";
import CompleteServiceModal from "../modal/CompleteServiceModal";
import { exportAsZip } from "@/utils/exportUtils";

export default function ImageLoader(props) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [serviceTitle, setServiceTitle] = useState('');
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
  const [completeServiceOpen, setCompleteServiceOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vehicleList');
    if (!stored) {
      localStorage.setItem('vehicleList', JSON.stringify([]));
      setStoredVehicles([]);
    } else {
      setStoredVehicles(JSON.parse(stored));
    }
    // Load serviceTitle from localStorage
    const storedTitle = localStorage.getItem('serviceTitle');
    if (storedTitle) {
      setServiceTitle(storedTitle);
    }
    // Load directions from localStorage
    const storedLeftDirection = localStorage.getItem('leftDirection');
    if (storedLeftDirection) {
      setLeftDirection(storedLeftDirection);
    }
    const storedRightDirection = localStorage.getItem('rightDirection');
    if (storedRightDirection) {
      setRightDirection(storedRightDirection);
    }
  }, []);

  // Save serviceTitle to localStorage whenever it changes
  useEffect(() => {
    if (serviceTitle) {
      localStorage.setItem('serviceTitle', serviceTitle);
    }
  }, [serviceTitle]);

  // Save leftDirection to localStorage whenever it changes
  useEffect(() => {
    if (leftDirection) {
      localStorage.setItem('leftDirection', leftDirection);
    }
  }, [leftDirection]);

  // Save rightDirection to localStorage whenever it changes
  useEffect(() => {
    if (rightDirection) {
      localStorage.setItem('rightDirection', rightDirection);
    }
  }, [rightDirection]);

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

  // Continue from last record when flag is set
  useEffect(() => {
    if (props.continueFromLast && props.loadedRecords && props.loadedRecords.length > 0) {
      // Find the last vehicle with a trackId
      const storedVehicles = localStorage.getItem('vehicleList');
      if (storedVehicles) {
        const vehicles = JSON.parse(storedVehicles);
        const lastVehicleWithTrackId = vehicles
          .filter(v => v.trackId && v.trackId !== '')
          .sort((a, b) => parseInt(b.trackId) - parseInt(a.trackId))[0];
        
        if (lastVehicleWithTrackId) {
          // Find this vehicle in loaded records
          const record = props.loadedRecords.find(r => r.track_id === lastVehicleWithTrackId.trackId);
          if (record) {
            setSelectedVehicle(record);
          }
        }
      }
    }
  }, [props.continueFromLast, props.loadedRecords]);

  const handleDirection = (label, direction, vehicle, axles, isNew) => {
    const object = {
      id: uuidv4(),
      trackId: isNew ? '' : selectedVehicle?.track_id,
      time: selectedVehicle?.time,
      date: selectedVehicle?.date,
      direction: direction === 'left' ? leftDirection : rightDirection,
      fromTo: direction === 'left' ? (rightDirection + " - " + leftDirection) : (leftDirection + " - " + rightDirection),
      type: vehicle?.exportName ?? vehicleDetails?.exportName,
      category: label ?? vehicleLabel,
      raisedAxles: axles,
      fileName: props.fileName || '',
      videoTime: 0
    }

    if (!isValidData(object)) {
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

    if (!isNew) {
      try {
        if (nextFnRef.current) nextFnRef.current();
      } catch (e) {
        console.error('error calling registered next function', e);
      }
    }
  }

  function handleToastMessage(message, type) {
    setToastMessage(message);
    setToastType(type);
  }

  function isValidData(data) {
    if (!serviceTitle) {
      handleToastMessage("Titulo do Serviço não pode estar vazio!", "warning");
      return false;
    }
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

  const handleVehicleSelect = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

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

  const handleAddNewVehicle = () => {
    if (!serviceTitle) {
      handleToastMessage("Titulo do Serviço não pode estar vazio!", "warning");
      return;
    }
    if (!leftDirection || !rightDirection) {
      handleToastMessage("Direções não podem estar vazias!", "warning");
      return;
    }
    setNewVehicleModalOpen(true);
  }

  const handleCompleteService = () => {
    if (!serviceTitle) {
      handleToastMessage("Titulo do Serviço não pode estar vazio para completar!", "warning");
      return;
    }
    if (storedVehicles.length === 0) {
      handleToastMessage("Não há dados para exportar!", "warning");
      return;
    }
    setCompleteServiceOpen(true);
  };

  const handleConfirmCompleteService = async () => {
    try {
      // Export vehicles and axles as ZIP
      await exportAsZip(storedVehicles, serviceTitle);

      // Clear all data
      localStorage.removeItem('vehicleList');
      localStorage.removeItem('serviceTitle');
      localStorage.removeItem('leftDirection');
      localStorage.removeItem('rightDirection');
      
      setStoredVehicles([]);
      setServiceTitle('');
      setLeftDirection('');
      setRightDirection('');
      
      setCompleteServiceOpen(false);
      handleToastMessage("Serviço completado com sucesso!", "success");
    } catch (error) {
      console.error('Error completing service:', error);
      handleToastMessage("Erro ao completar serviço: " + error.message, "error");
    }
  };

  const nextFnRef = useRef(null);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', p: 1 }}>
        <Box sx={{ p: 0.5, width: '100%', maxWidth: '48vw' }}>
          {selectedVehicle && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ color: '#22423A', fontWeight: 'bold' }}>Titulo do Serviço</Typography>
              <Box sx={{ display: 'flex', gap: 2, my: 1, alignItems: 'center' }}>
                <TextField 
                  label="Titulo do Serviço" 
                  color="primary" 
                  size="small" 
                  focused 
                  value={serviceTitle} 
                  onChange={(e) => setServiceTitle(e.target.value)} 
                  fullWidth 
                />
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={handleCompleteService}
                  disabled={!serviceTitle || storedVehicles.length === 0}
                  sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                >
                  Completar Serviço
                </Button>
              </Box>
              <Typography variant="h5" sx={{ color: '#22423A', fontWeight: 'bold', mt: 2 }}>Direção</Typography>
              <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                <TextField label="Esquerda" color="error" size="small" focused value={leftDirection} onChange={handleChangeLeft} fullWidth />
                <TextField label="Direita" color="success" size="small" focused value={rightDirection} onChange={handleChangeRight} fullWidth />
                <Button variant="contained" color="primary" onClick={handleAddNewVehicle} ><AddIcon /></Button>
              </Box>
            </Box>
          )}
          <ImportFile onVehicleSelect={handleVehicleSelect} storedVehicles={storedVehicles} registros={props?.loadedRecords ?? []} imagens={props?.loadedImages ?? {}} registerNext={(fn) => (nextFnRef.current = fn)} />
        </Box>
        {selectedVehicle && (
          <Box sx={{ p: 0.5, maxWidth: '52vw' }}>
            <Box sx={{ pt: 1 }}>
              <Typography variant="h5" sx={{ color: '#22423A', fontWeight: 'bold' }}>Painel de Veiculos</Typography>
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
          {toastMessage && <Toaster message={toastMessage} type={toastType} onReset={resetToastMessage} />}
          {storedVehicles.length > 0 && (
            <DataTable vehicleList={storedVehicles} onDelete={deleteRow} onDeleteAll={deleteAll} openResetDialog={props.resetRequest} onResetDialogOpened={props.onResetHandled} />
          )}
          <CompleteServiceModal
            open={completeServiceOpen}
            onClose={() => setCompleteServiceOpen(false)}
            onConfirm={handleConfirmCompleteService}
            serviceTitle={serviceTitle}
            vehicleFileName={`${serviceTitle.replace(/[^a-z0-9_\-]/gi, '_')}_vehicle_count_[timestamp].csv`}
            axleFileName={`${serviceTitle.replace(/[^a-z0-9_\-]/gi, '_')}_axle_count_[timestamp].csv`}
          />
        </Box>
      )}
    </>
  );
}
