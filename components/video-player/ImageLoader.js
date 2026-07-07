'use client'
import { Box, Button, Typography } from "@mui/material";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { getVehicleData } from "@/utils/staticVehicles";

import { playCountSound } from "@/utils/soundUtils";
import ImportFile from "./ImportFile";
import VehicleItemList from "./VehicleItemList";
import BasicModal from "../modal/BasicModal";
import NewVehicleModal from "../modal/NewVehicleModal";
import Toaster from "../toaster/Toaster";
import DataTable from "../data-table/DataTable";
import CompleteServiceModal from "../modal/CompleteServiceModal";
import { exportAsZip } from "@/utils/exportUtils";

export default function ImageLoader(props) {
  // props.projectConfig: { serviceTitle, leftDirection, rightDirection } — set when in project mode
  // props.onFolderEnd: called when the last frame of this folder is classified
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

  // Calcula o último trackId tratado de forma síncrona durante o render,
  // garantindo que ImportFile já receba o valor correto antes de rodar seus efeitos.
  const startTrackId = useMemo(() => {
    if (!props.continueFromLast) return null;
    if (typeof window === 'undefined') return null;
    const storedVehiclesRaw = localStorage.getItem('vehicleList');
    if (!storedVehiclesRaw) return null;
    try {
      const vehicles = JSON.parse(storedVehiclesRaw);
      const lastVehicleWithTrackId = vehicles
        .filter(v => v.trackId && v.trackId !== '')
        .sort((a, b) => parseInt(b.trackId) - parseInt(a.trackId))[0];
      return lastVehicleWithTrackId?.trackId ?? null;
    } catch {
      return null;
    }
  // props.loadVersion garante recomputo mesmo quando continueFromLast já era true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.continueFromLast, props.loadVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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
    if (typeof window !== 'undefined' && serviceTitle) {
      localStorage.setItem('serviceTitle', serviceTitle);
    }
  }, [serviceTitle]);

  // Save leftDirection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && leftDirection) {
      localStorage.setItem('leftDirection', leftDirection);
    }
  }, [leftDirection]);

  // Save rightDirection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && rightDirection) {
      localStorage.setItem('rightDirection', rightDirection);
    }
  }, [rightDirection]);

  // Apply project config (serviceTitle, directions) when entering project mode or changing folders
  useEffect(() => {
    if (!props.projectConfig) return;
    const { serviceTitle: title, leftDirection: left, rightDirection: right } = props.projectConfig;
    if (title) setServiceTitle(title);
    if (left) setLeftDirection(left);
    if (right) setRightDirection(right);
    if (typeof window !== 'undefined') {
      if (title) localStorage.setItem('serviceTitle', title);
      if (left) localStorage.setItem('leftDirection', left);
      if (right) localStorage.setItem('rightDirection', right);
    }
  }, [props.projectConfig]);

  // Reload storedVehicles when clearVehiclesFlag changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (props.clearVehiclesFlag > 0) {
      const stored = localStorage.getItem('vehicleList');
      if (!stored) {
        setStoredVehicles([]);
        setLeftDirection('');
        setRightDirection('');
      } else {
        setStoredVehicles(JSON.parse(stored));
      }
    }
  }, [props.clearVehiclesFlag]);

  // Continue from last record when flag is set
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (props.continueFromLast && props.loadedRecords && props.loadedRecords.length > 0 && startTrackId) {
      // Encontra o registro correspondente ao último trackId tratado
      const record = props.loadedRecords.find(r => String(r.track_id) === String(startTrackId));
      if (record) {
        setSelectedVehicle(record);
      }
    }
  }, [props.continueFromLast, props.loadedRecords, startTrackId]);


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
      videoTime: 0,
      frame: selectedVehicle?.frame ?? null,
    }

    if (!isValidData(object)) {
      return;
    }

    const updatedList = [...storedVehicles, object];
    setStoredVehicles(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vehicleList', JSON.stringify(updatedList));
    }

    playCountSound();
    handleToastMessage("Veículo adicionado!", "success");

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
      const classifiedTrackIds = new Set(storedVehicles.map(v => String(v.trackId)).filter(Boolean));
      const unclassifiedFrames = (props.loadedRecords || []).filter(r => !classifiedTrackIds.has(String(r.track_id)));
      await exportAsZip(storedVehicles, serviceTitle, unclassifiedFrames);

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Box>
                  <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 'bold', fontSize: '1.15rem' }}>Serviço: </Typography>
                  <Typography component="span" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.15rem' }}>{serviceTitle}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" component="span" sx={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '0.844rem' }}>Esquerda: </Typography>
                  <Typography variant="body2" component="span" sx={{ fontSize: '0.975rem' }}>{leftDirection}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" component="span" sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.844rem' }}>Direita: </Typography>
                  <Typography variant="body2" component="span" sx={{ fontSize: '0.975rem' }}>{rightDirection}</Typography>
                </Box>
              </Box>
              <Button variant="contained" color="primary" onClick={handleAddNewVehicle}><AddIcon /></Button>
              <Button variant="contained" color="success" onClick={handleCompleteService} disabled={!serviceTitle || storedVehicles.length === 0} sx={{ whiteSpace: 'nowrap' }}>
                Completar Serviço
              </Button>
            </Box>
          )}
          <ImportFile onVehicleSelect={handleVehicleSelect} storedVehicles={storedVehicles} registros={props?.loadedRecords ?? []} imagens={props?.loadedImages ?? {}} registerNext={(fn) => (nextFnRef.current = fn)} startTrackId={startTrackId} loadVersion={props.loadVersion} onFolderComplete={props.onFolderEnd} />
        </Box>
        {selectedVehicle && (
          <Box sx={{ p: 0.5, maxWidth: '52vw' }}>
            <Box sx={{ pt: 1 }}>
              <Typography variant="h5" sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : '#22423A', fontWeight: 'bold' }}>Painel de Veículos</Typography>
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
            vehicleFileName={`${serviceTitle.replace(/[^a-z0-9_\-]/gi, '_')}_contagem_veiculos_[timestamp].csv`}
            axleFileName={`${serviceTitle.replace(/[^a-z0-9_\-]/gi, '_')}_contagem_eixos_[timestamp].csv`}
            completedItems={props.completedItems ?? []}
          />
        </Box>
      )}
    </>
  );
}
