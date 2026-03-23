"use client";
import { useState, useEffect, useCallback } from "react";
import * as React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function ImportFile({ onVehicleSelect, storedVehicles = [], registros, imagens, registerNext, startTrackId, loadVersion }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efeito 1: Sempre que uma nova carga for iniciada (loadVersion muda),
  // reseta para o primeiro registro. Este efeito roda ANTES do Efeito 2.
  useEffect(() => {
    if (!registros || registros.length === 0) return;
    setCurrentIndex(0);
    if (typeof onVehicleSelect === 'function') onVehicleSelect(registros[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadVersion]);

  // Efeito 2: Se houver um startTrackId (continuar de onde parou),
  // sobrescreve o índice definido pelo Efeito 1. Por ser declarado após,
  // React garante que roda depois do Efeito 1 na mesma fase de commits.
  useEffect(() => {
    if (!startTrackId || !registros || registros.length === 0) return;
    const foundIndex = registros.findIndex(r => String(r.track_id) === String(startTrackId));
    if (foundIndex === -1) return;
    // Avança um após o último tratado (próximo a processar)
    const nextIndex = Math.min(foundIndex + 1, registros.length - 1);
    setCurrentIndex(nextIndex);
    if (typeof onVehicleSelect === 'function') onVehicleSelect(registros[nextIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrackId, loadVersion]);


  const getStatus = (registro) => {
    if (!registro?.track_id) return "Pendente";
    return storedVehicles.some(v => v.trackId === registro.track_id) ? "Completo" : "Pendente";
  };

  const handleNext = useCallback(() => {
    if (registros && currentIndex + 1 < registros.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (typeof onVehicleSelect === 'function') {
        onVehicleSelect(registros[nextIndex]);
      }
    }
  }, [registros, onVehicleSelect, currentIndex]);

  useEffect(() => {
    if (typeof registerNext === 'function') {
      registerNext(handleNext);
      return () => registerNext(null);
    }
  }, [registerNext, handleNext]);

  const handlePrev = useCallback(() => {
    if (currentIndex - 1 >= 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      if (registros && registros[nextIndex] && typeof onVehicleSelect === 'function') {
        onVehicleSelect(registros[nextIndex]);
      }
    }
  }, [registros, onVehicleSelect, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentIndex > 0) {
          handlePrev();
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (registros && currentIndex < registros.length - 1) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, handleNext, handlePrev, registros]);

  const registroAtual = registros[currentIndex];
  const imagemUrl = registroAtual ? imagens[registroAtual.image_path] : null;

  return (
    <Box>
      {registroAtual && (
        <>
          {/* 📸 Exibe a imagem correspondente */}
          {imagemUrl && (
            <Box>
              <img src={imagemUrl} alt={registroAtual.predicted_class} width='100%' />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Registro {currentIndex + 1} de {registros.length}</div>
                <div>{registroAtual.image_path}</div>
              </Box>
            </Box>
          )}

          {/* 🧾 Informações do registro
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(registroAtual, null, 2)}
          </pre> */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <div><strong>Id:</strong> {registroAtual.track_id}</div>
            <div><strong>Horario:</strong> {registroAtual.time}</div>
            <div><strong>Status:</strong> <span style={{ color: getStatus(registroAtual) === "Completo" ? "#22C55E" : "#EF4444" }}>{getStatus(registroAtual)}</span></div>
          </Box>

          {/* ⏮️ ⏭️ Navegação */}
          <div className="gno-flex gno-justify-center gno-gap-16">
            <Button variant="contained" sx={{ backgroundColor: '#22423A' }} onClick={handlePrev} startIcon={<ArrowBack />} disabled={currentIndex === 0}>Anterior</Button>
            <Button variant="contained" sx={{ backgroundColor: '#22423A' }} onClick={handleNext} endIcon={<ArrowForward />} disabled={currentIndex === registros.length - 1}>Proximo</Button>
          </div>
        </>
      )}
      {!registroAtual && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: { xs: 300, sm: 400, md: 500 },
          border: '2px dashed #ccc',
          borderRadius: 2,
          backgroundColor: '#f9f9f9',
        }}>
          <Typography variant="h6" color="textSecondary">
            Selecione um arquivo para começar
          </Typography>
        </Box>
      )}
    </Box>
  );
}
