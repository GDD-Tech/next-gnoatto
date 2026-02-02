'use client'
import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useState, useRef, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { getVehicleData } from "@/utils/staticVehicles";
import VehicleItemList from "./VehicleItemList";
import BasicModal from "../modal/BasicModal";
import NewVehicleModal from "../modal/NewVehicleModal";
import Toaster from "../toaster/Toaster";
import DataTable from "../data-table/DataTable";

// Configure dayjs to use Brazilian Portuguese
dayjs.locale('pt-br');

export default function Mp4Player(props) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [startDateTime, setStartDateTime] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [leftDirection, setLeftDirection] = useState('');
  const [rightDirection, setRightDirection] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [storedVehicles, setStoredVehicles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('warning');
  const [vehicleDirection, setVehicleDirection] = useState('none');
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const videoRef = useRef(null);

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
      } else {
        setStoredVehicles(JSON.parse(stored));
      }
    }
  }, [props.clearVehiclesFlag]);

  useEffect(() => {
    if (props.videoFile) {
      handleVideoLoad(props.videoFile);
    }
  }, [props.videoFile]);

  const handleVideoLoad = (file) => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
  };

  const parseDateTime = (dateTimeStr) => {
    // Parse DD/MM/YYYY hh:mm:ss
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
    const match = dateTimeStr.match(regex);
    if (!match) return null;

    const [, day, month, year, hours, minutes, seconds] = match;
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const formatDateTime = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const calculateCurrentDateTime = () => {
    if (!startDateTime || !videoRef.current) return '';

    // startDateTime is now a dayjs object
    const videoTimeSeconds = videoRef.current.currentTime;
    const currentDate = startDateTime.add(videoTimeSeconds, 'second');
    
    return currentDate.format('DD/MM/YYYY HH:mm:ss');
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
      // Calculate and update current date/time when paused
      const calculatedDateTime = calculateCurrentDateTime();
      setCurrentDateTime(calculatedDateTime);
    }
  };

  const handleSpeedChange = (event) => {
    const speed = event.target.value;
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (!isPaused && startDateTime) {
      const calculatedDateTime = calculateCurrentDateTime();
      setCurrentDateTime(calculatedDateTime);
    }
  };

  const handleDirection = (label, direction, vehicle, axles, isNew) => {
    // Always calculate current date/time from video
    if (!startDateTime || !videoRef.current) {
      handleToastMessage("Selecione uma data/hora inicial!", "warning");
      return;
    }

    // Calculate current date/time based on video position
    const videoTimeSeconds = videoRef.current.currentTime;
    const calculatedDate = startDateTime.add(videoTimeSeconds, 'second');
    const calculatedDateTime = calculatedDate.format('DD/MM/YYYY HH:mm:ss');
    
    // Update currentDateTime state
    setCurrentDateTime(calculatedDateTime);

    // Parse calculatedDateTime to extract date and time
    const parsedDate = parseDateTime(calculatedDateTime);
    if (!parsedDate) {
      handleToastMessage("Data/hora inválida!", "error");
      return;
    }

    const dateStr = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;

    const object = {
      id: uuidv4(),
      trackId: '',
      time: timeStr,
      date: dateStr,
      direction: direction === 'left' ? leftDirection : rightDirection,
      fromTo: direction === 'left' ? (rightDirection + " - " + leftDirection) : (leftDirection + " - " + rightDirection),
      type: vehicle?.exportName ?? vehicleDetails?.exportName,
      category: label ?? vehicleLabel,
      raisedAxles: axles
    };

    if (!isValidData(object)) {
      return;
    }

    const updatedList = [...storedVehicles];
    updatedList.push(object);
    setStoredVehicles(updatedList);
    localStorage.setItem('vehicleList', JSON.stringify(updatedList));

    handleToastMessage("Veículo adicionado!", "success");
  };

  function handleToastMessage(message, type) {
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
    // Calculate current time when clicking vehicle
    if (!startDateTime || !videoRef.current) {
      handleToastMessage("Selecione uma data/hora inicial!", "warning");
      return;
    }
    
    // Calculate and update current date/time
    const videoTimeSeconds = videoRef.current.currentTime;
    const calculatedDate = startDateTime.add(videoTimeSeconds, 'second');
    const calculatedDateTime = calculatedDate.format('DD/MM/YYYY HH:mm:ss');
    setCurrentDateTime(calculatedDateTime);
    
    setVehicleLabel(label);
    setVehicleDetails(vehicle);
    setVehicleDirection(direction);
    setModalOpen(true);
    setIsNewVehicle(isNew);
  };

  const handleChangeLeft = (event) => {
    setLeftDirection(event.target.value);
  };

  const handleChangeRight = (event) => {
    setRightDirection(event.target.value);
  };

  const resetToastMessage = () => {
    setToastMessage(null);
  };

  const deleteRow = (row) => {
    const newList = storedVehicles.filter(item => item.id !== row.id);
    setStoredVehicles(newList);
    localStorage.setItem('vehicleList', JSON.stringify(newList));
  };

  const deleteAll = () => {
    setStoredVehicles([]);
    localStorage.removeItem('vehicleList');
  };

  const handleAddNewVehicle = () => {
    if (!leftDirection || !rightDirection) {
      handleToastMessage("Direções não podem estar vazias!", "warning");
      return;
    }
    if (!startDateTime || !videoRef.current) {
      handleToastMessage("Selecione uma data/hora inicial!", "warning");
      return;
    }
    
    // Calculate and update current date/time
    const videoTimeSeconds = videoRef.current.currentTime;
    const calculatedDate = startDateTime.add(videoTimeSeconds, 'second');
    const calculatedDateTime = calculatedDate.format('DD/MM/YYYY HH:mm:ss');
    setCurrentDateTime(calculatedDateTime);
    
    setNewVehicleModalOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', p: 2 }}>
        <Box sx={{ p: 1, width: '100%', maxWidth: '40vw' }}>
          <Typography variant="h5" sx={{ color: '#22423A', fontWeight: 'bold', mb: 2 }}>
            Player de Vídeo MP4
          </Typography>

          {/* Direção - Acima do vídeo */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#22423A', fontWeight: 'bold', mb: 1 }}>
              Direção
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Esquerda"
                color="error"
                size="small"
                focused
                value={leftDirection}
                onChange={handleChangeLeft}
                fullWidth
              />
              <TextField
                label="Direita"
                color="success"
                size="small"
                focused
                value={rightDirection}
                onChange={handleChangeRight}
                fullWidth
              />
              <Button variant="contained" color="primary" onClick={handleAddNewVehicle}>
                <AddIcon />
              </Button>
            </Box>
          </Box>

          {/* Player de Vídeo */}
          {videoUrl && (
            <Box sx={{ mb: 3 }}>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
                onPause={() => {
                  setIsPaused(true);
                  const calculatedDateTime = calculateCurrentDateTime();
                  setCurrentDateTime(calculatedDateTime);
                }}
                onPlay={() => setIsPaused(false)}
                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
              />
            </Box>
          )}

          {/* Campos de Controle */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DateTimePicker
                label="Data/Hora Inicial"
                value={startDateTime}
                onChange={(newValue) => setStartDateTime(newValue)}
                format="DD/MM/YYYY HH:mm:ss"
                ampm={false}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    color: "primary",
                    focused: true
                  }
                }}
              />
            </LocalizationProvider>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Velocidade</InputLabel>
              <Select
                value={playbackSpeed}
                label="Velocidade"
                onChange={handleSpeedChange}
              >
                <MenuItem value={1}>1x</MenuItem>
                <MenuItem value={2}>2x</MenuItem>
                <MenuItem value={3}>3x</MenuItem>
                <MenuItem value={4}>4x</MenuItem>
                <MenuItem value={5}>5x</MenuItem>
                <MenuItem value={6}>6x</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Data/Hora Atual (Calculada)"
              value={currentDateTime}
              InputProps={{
                readOnly: true,
              }}
              size="small"
              fullWidth
              color="secondary"
              focused
            />
          </Box>
        </Box>

        <Box sx={{ p: 1, maxWidth: '60vw' }}>
          <Box sx={{ pt: 3 }}>
            <Typography variant="h5" sx={{ color: '#22423A', fontWeight: 'bold' }}>
              Painel de Veiculos
            </Typography>
            <div className='gno-flex-column'>
              <VehicleItemList
                vehicleList={getVehicleData('passeio')}
                onVehicleClick={handleVehicleClick}
                onHandleDirection={handleDirection}
                label={'Passeio'}
                left={leftDirection}
                right={rightDirection}
                isNew={false}
              />
              <VehicleItemList
                vehicleList={getVehicleData('onibus')}
                onVehicleClick={handleVehicleClick}
                onHandleDirection={handleDirection}
                label={'Onibus'}
                left={leftDirection}
                right={rightDirection}
                isNew={false}
              />
              <VehicleItemList
                vehicleList={getVehicleData('caminhao')}
                onVehicleClick={handleVehicleClick}
                onHandleDirection={handleDirection}
                label={'Caminhão'}
                left={leftDirection}
                right={rightDirection}
                isNew={false}
              />
            </div>
          </Box>
        </Box>
      </Box>

      <Box>
        <BasicModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          vehicle={{ time: currentDateTime, date: currentDateTime }}
          left={leftDirection}
          right={rightDirection}
          direction={vehicleDirection}
          onHandleDirection={handleDirection}
          isNew={isNewVehicle}
        />
        <NewVehicleModal
          isOpen={newVehicleModalOpen}
          onClose={() => setNewVehicleModalOpen(false)}
          getVehicleData={getVehicleData}
          handleVehicleClick={handleVehicleClick}
          handleDirection={handleDirection}
          leftDirection={leftDirection}
          rightDirection={rightDirection}
        />
        {toastMessage && <Toaster message={toastMessage} type={toastType} onReset={resetToastMessage} />}
        {storedVehicles.length > 0 && (
          <DataTable
            vehicleList={storedVehicles}
            onDelete={deleteRow}
            onDeleteAll={deleteAll}
            openResetDialog={props.resetRequest}
            onResetDialogOpened={props.onResetHandled}
          />
        )}
      </Box>
    </>
  );
}
