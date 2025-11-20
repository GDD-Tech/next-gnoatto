"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import * as React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function ImportFile({ onVehicleSelect, storedVehicles = [], registros, imagens }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevCountRef = useRef(registros ? registros.length : 0);
  const prevFirstRef = useRef(registros && registros[0] ? registros[0].image_path : null);

  useEffect(() => {
    const prevCount = prevCountRef.current || 0;
    const prevFirst = prevFirstRef.current;
    const currCount = registros ? registros.length : 0;
    const currFirst = registros && registros[0] ? registros[0].image_path : null;

    const isNewLoad = (prevCount === 0 && currCount > 0) || (currFirst && prevFirst !== currFirst);

    if (isNewLoad) {
      setCurrentIndex(0);
      if (typeof onVehicleSelect === 'function') onVehicleSelect(registros[0]);
    }

    prevCountRef.current = currCount;
    prevFirstRef.current = currFirst;
  }, [registros, onVehicleSelect]);

  const getStatus = (registro) => {
    if (!registro?.track_id) return "Pendente";
    return storedVehicles.some(v => v.trackId === registro.track_id) ? "Completo" : "Pendente";
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1 < registros.length ? prev + 1 : prev;
      onVehicleSelect(registros[nextIndex]);
      return nextIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev - 1 >= 0 ? prev - 1 : prev;
      onVehicleSelect(registros[nextIndex]);
      return nextIndex;
    });
  };

  const registroAtual = registros[currentIndex];
  const imagemUrl = registroAtual ? imagens[registroAtual.image_path] : null;

  return (
    <Box>
      {registroAtual && (
        <>
          {/* 📸 Exibe a imagem correspondente */}
          {imagemUrl && (
            <Box>
              <img src={imagemUrl} alt={registroAtual.predicted_class} width='100%'/>
              {/* <Image src={imagemUrl} alt={registroAtual.predicted_class} width={800} height={500}/> */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1}}>
            <div><strong>Id:</strong> {registroAtual.track_id}</div>
            <div><strong>Horario:</strong> {registroAtual.time}</div>
            <div><strong>Status:</strong> <span style={{ color: getStatus(registroAtual) === "Completo" ? "#22C55E" : "#EF4444" }}>{getStatus(registroAtual)}</span></div>
          </Box>

          {/* ⏮️ ⏭️ Navegação */}
          <div className="gno-flex gno-justify-center gno-gap-16">
            <Button variant="contained" sx={{backgroundColor: '#22423A'}} onClick={handlePrev} startIcon={<ArrowBack />} disabled={currentIndex === 0}>Anterior</Button>
            <Button variant="contained" sx={{backgroundColor: '#22423A'}} onClick={handleNext} endIcon={<ArrowForward />} disabled={currentIndex === registros.length - 1}>Proximo</Button>
          </div>
        </>
      )}
      {!registroAtual && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 800, minHeight: 500, border: '2px dashed #ccc', borderRadius: 2, backgroundColor: '#f9f9f9', }}>
          <Typography variant="h6" color="textSecondary">
            Selecione um arquivo para começar
          </Typography>
        </Box>
      )}
    </Box>
  );
}
