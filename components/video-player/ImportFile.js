"use client";
import { useState } from "react";
import Image from "next/image";
import * as React from "react";
import { Box, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function ImportFile({ onVehicleSelect, storedVehicles = [], registros, imagens }) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <div className="mt-4">
          <h1 className="text-xl font-bold mb-3">
            Registro {currentIndex + 1} de {registros.length}
          </h1>

          {/* 📸 Exibe a imagem correspondente */}
          {imagemUrl && (
            <div className="mb-3">
              <Image
                src={imagemUrl}
                alt={registroAtual.predicted_class}
                width={800}
                height={500}
                className="max-w-full rounded shadow"
              />
              <p className="text-sm mt-1 text-center">
                {registroAtual.image_path}
              </p>
            </div>
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
        </div>
      )}
    </Box>
  );
}
