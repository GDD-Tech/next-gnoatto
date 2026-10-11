"use client";
import { useState, useEffect, useCallback } from "react";
import { Box, Button, ClickAwayListener, Fade, Paper, Popper, Tooltip, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const RAISED_AXLES_OPTIONS = [0, 1, 2, 3, 4];

export default function ImportFile({ onVehicleSelect, storedVehicles = [], registros, imagens, registerNext, startTrackId, loadVersion, onFolderComplete, fileName = '', suggestion = null, onApplySuggestion }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [axlesAnchorEl, setAxlesAnchorEl] = useState(null);

  // Fecha o Popper de eixos ao trocar de registro
  useEffect(() => { setAxlesAnchorEl(null); }, [currentIndex]);

  const handleSuggestionClick = (event) => {
    if (!suggestion) return;
    if (suggestion.considerAxes) {
      setAxlesAnchorEl(axlesAnchorEl ? null : event.currentTarget);
      return;
    }
    onApplySuggestion?.(0);
  };

  const handleSelectAxles = (qty) => {
    setAxlesAnchorEl(null);
    onApplySuggestion?.(qty);
  };

  useEffect(() => {
    if (!registros || registros.length === 0) return;
    let targetIndex = 0;
    if (startTrackId) {
      const foundIndex = registros.findIndex(r => String(r.track_id) === String(startTrackId));
      if (foundIndex !== -1) {
        targetIndex = Math.min(foundIndex + 1, registros.length - 1);
      }
    }
    setCurrentIndex(targetIndex);
    if (typeof onVehicleSelect === 'function') onVehicleSelect(registros[targetIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadVersion]);


  const getStatus = (registro) => {
    if (!registro) return "Pendente";
    return storedVehicles.some(v => {
      if (registro.sequence_id != null && v.sequenceId != null) {
        return v.sequenceId === registro.sequence_id && v.fileName === fileName;
      }
      // Fallback para registros antigos sem sequenceId
      return v.trackId && String(v.trackId) === String(registro.track_id);
    }) ? "Completo" : "Pendente";
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

  // Used by auto-advance after classification — calls onFolderComplete when at the last frame
  const handleAutoAdvance = useCallback(() => {
    if (registros && currentIndex + 1 < registros.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (typeof onVehicleSelect === 'function') onVehicleSelect(registros[nextIndex]);
    } else if (typeof onFolderComplete === 'function') {
      onFolderComplete();
    }
  }, [registros, onVehicleSelect, currentIndex, onFolderComplete]);

  useEffect(() => {
    if (typeof registerNext === 'function') {
      registerNext(handleAutoAdvance);
      return () => registerNext(null);
    }
  }, [registerNext, handleAutoAdvance]);

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
            <div><strong>Id:</strong> {registroAtual.sequence_id ?? registroAtual.track_id}</div>
            <div><strong>Horario:</strong> {registroAtual.time}</div>
            <div><strong>Status:</strong> {(() => { const s = getStatus(registroAtual); return <span style={{ color: s === "Completo" ? "#22C55E" : "#EF4444" }}>{s}</span>; })()}</div>
          </Box>

          {/* ⏮️ ⏭️ Navegação + 🤖 Sugestão da IA (alinhada à direita, abaixo de Status) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 2 }}>
            <Box />
            <div className="gno-flex gno-justify-center gno-gap-16">
              <Button variant="contained" sx={{ backgroundColor: '#22423A' }} onClick={handlePrev} startIcon={<ArrowBack />} disabled={currentIndex === 0}>Anterior</Button>
              <Button variant="contained" sx={{ backgroundColor: '#22423A' }} onClick={handleNext} endIcon={<ArrowForward />} disabled={currentIndex === registros.length - 1}>Proximo</Button>
            </div>
            <Box sx={{ justifySelf: 'end' }}>
              {suggestion && (
                <ClickAwayListener onClickAway={() => setAxlesAnchorEl(null)}>
                  <Box>
                    <Tooltip title={axlesAnchorEl ? '' : `Sugestão da IA: ${suggestion.vehicle.description} (${suggestion.label})`} arrow>
                      <Button
                        variant={axlesAnchorEl ? 'contained' : 'outlined'}
                        color={suggestion.direction === 'right' ? 'error' : 'success'}
                        onClick={handleSuggestionClick}
                        startIcon={suggestion.direction === 'left' ? <ArrowBack /> : null}
                        endIcon={suggestion.direction === 'right' ? <ArrowForward /> : null}
                        sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                      >
                        {suggestion.vehicle.exportName}
                      </Button>
                    </Tooltip>
                    <Popper open={Boolean(axlesAnchorEl)} anchorEl={axlesAnchorEl} placement="top-end" transition sx={{ zIndex: 1300 }}>
                      {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={150}>
                          <Paper elevation={6} sx={{ p: 1.5, mb: 1 }} onKeyDown={(e) => { if (e.key === 'Escape') setAxlesAnchorEl(null); }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Eixos erguidos — {suggestion.vehicle.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {RAISED_AXLES_OPTIONS.map((qty) => (
                                <Button
                                  key={qty}
                                  variant="contained"
                                  color={suggestion.direction === 'right' ? 'error' : 'success'}
                                  onClick={() => handleSelectAxles(qty)}
                                  sx={{ minWidth: 40 }}
                                >
                                  {qty}
                                </Button>
                              ))}
                            </Box>
                          </Paper>
                        </Fade>
                      )}
                    </Popper>
                  </Box>
                </ClickAwayListener>
              )}
            </Box>
          </Box>
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
          bgcolor: 'background.paper',
        }}>
          <Typography variant="h6" color="textSecondary">
            Selecione um arquivo para começar
          </Typography>
        </Box>
      )}
    </Box>
  );
}
