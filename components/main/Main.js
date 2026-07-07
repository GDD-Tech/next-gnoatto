'use client'
import { useState, useEffect } from "react";
import MainHeader from "@/components/main-header/MainHeader";
import ImageLoader from "@/components/video-player/ImageLoader";
import Mp4Player from "@/components/video-player/Mp4Player";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function Main() {
    const [mode, setMode] = useState('zip'); // 'zip' or 'mp4'
    const [videoFile, setVideoFile] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [imagens, setImagens] = useState({});
    const [resetRequest, setResetRequest] = useState(false);
    const [currentFileName, setCurrentFileName] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('currentFileName');
        if (saved) setCurrentFileName(saved);
    }, []);
    const [pendingFileData, setPendingFileData] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [clearVehiclesFlag, setClearVehiclesFlag] = useState(0);
    const [importConflictType, setImportConflictType] = useState(null); // 'different_file' | 'same_file'
    const [continueFromLast, setContinueFromLast] = useState(false);
    const [loadVersion, setLoadVersion] = useState(0);

    function loadZipData(result, filename) {
        // Check if there's a different file being loaded and records exist
        if (typeof window === 'undefined') return;
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;

        // Compare with localStorage value instead of state (handles page reload case)
        if (hasRecords) {
            if (storedFileName && filename !== storedFileName) {
                // Different file, existing records -> Warn to delete
                setPendingFileData({ result, filename, type: 'zip' });
                setImportConflictType('different_file');
                setShowConfirmDialog(true);
            } else if (filename === storedFileName) {
                // Same file, existing records -> Auto-continue silently
                applyFileData(result, filename, true);
            } else {
                // Should ideally not happen if hasRecords is true but no storedFileName, consider as different
                setPendingFileData({ result, filename, type: 'zip' });
                setImportConflictType('different_file');
                setShowConfirmDialog(true);
            }
        } else {
            // Load directly
            applyFileData(result, filename, false);
        }
    }

    function applyFileData(result, filename, continueFromLast = false) {
        const records = result?.tempRegistros ?? [];
        const images = result?.tempImagens ?? {};
        setRegistros(records);
        setImagens(prev => {
            Object.values(prev).forEach(url => { try { URL.revokeObjectURL(url); } catch (_) {} });
            return images;
        });
        setCurrentFileName(filename);
        // Save filename to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentFileName', filename);
        }
        setContinueFromLast(continueFromLast);
        setLoadVersion(v => v + 1); // Sinaliza nova carga para componentes filhos
        setMode('zip');
    }

    function loadMp4Data(file) {
        if (typeof window === 'undefined') return;
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;

        if (hasRecords && storedFileName) {
            if (storedFileName !== file.name) {
                // Different file - ask to delete old records
                setImportConflictType('different_file');
                setPendingFileData({ file, filename: file.name, type: 'mp4' });
                setShowConfirmDialog(true);
            } else {
                // Same file - auto-continue silently
                applyMp4Data(file, true);
            }
        } else {
            // Load directly
            applyMp4Data(file, false);
        }
    }

    function applyMp4Data(file, continueFromLast = false) {
        setMode('mp4');
        setVideoFile(file);
        // Save MP4 filename to state and localStorage
        setCurrentFileName(file.name);
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentFileName', file.name);
        }
        setContinueFromLast(continueFromLast);
    }

    function handleConfirmDeleteAndLoad() {
        // Clear existing records and filename
        if (typeof window === 'undefined') return;
        localStorage.removeItem('vehicleList');
        localStorage.removeItem('currentFileName');
        // Notify ImageLoader to reload data from localStorage
        setClearVehiclesFlag(prev => prev + 1);
        // Load new file
        if (pendingFileData) {
            applyFileData(pendingFileData.result, pendingFileData.filename);
        }
        setShowConfirmDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    function handleKeepDataAndLoad() {
        if (pendingFileData) {
            if (pendingFileData.type === 'zip') {
                applyFileData(pendingFileData.result, pendingFileData.filename);
            } else if (pendingFileData.type === 'mp4') {
                applyMp4Data(pendingFileData.file);
            }
        }
        setShowConfirmDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    function handleCancelLoad() {
        setShowConfirmDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }


    return (
        <>
            <MainHeader
                onLoadRecords={loadZipData}
                onLoadMp4={loadMp4Data}
                onResetRequest={() => setResetRequest(true)}
                onClearVehicles={() => setClearVehiclesFlag(prev => prev + 1)}
                currentFileName={currentFileName}
            />
            {mode === 'zip' ? (
                <ImageLoader
                    loadedRecords={registros}
                    loadedImages={imagens}
                    resetRequest={resetRequest}
                    onResetHandled={() => setResetRequest(false)}
                    clearVehiclesFlag={clearVehiclesFlag}
                    fileName={currentFileName}
                    continueFromLast={continueFromLast}
                    loadVersion={loadVersion}
                />
            ) : (
                <Mp4Player
                    videoFile={videoFile}
                    resetRequest={resetRequest}
                    onResetHandled={() => setResetRequest(false)}
                    clearVehiclesFlag={clearVehiclesFlag}
                    continueFromLast={continueFromLast}
                    onServiceCompleted={() => {
                        setCurrentFileName(null);
                        setVideoFile(null);
                    }}
                />
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onClose={handleCancelLoad}>
                <DialogTitle>
                    {importConflictType === 'same_file' ? 'Arquivo Existente Detectado' : 'Arquivo Diferente Detectado'}
                </DialogTitle>
                <DialogContent>
                    {importConflictType === 'different_file' && (
                        <>
                            <Typography>
                                Você está carregando um arquivo diferente. Deseja deletar os registros atuais?
                            </Typography>
                            <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                                Arquivo anterior:
                            </Typography>
                            <Typography sx={{ fontWeight: 'normal' }}>
                                {currentFileName || 'Desconhecido'}
                            </Typography>
                            <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                                Novo arquivo:
                            </Typography>
                            <Typography sx={{ fontWeight: 'normal' }}>
                                {pendingFileData?.filename}
                            </Typography>
                        </>
                    )}
                    {importConflictType === 'same_file' && (
                        <>
                            <Typography>
                                Este arquivo é o mesmo que o carregado anteriormente e existem dados salvos no sistema.
                            </Typography>
                            <Typography sx={{ mt: 2 }}>
                                Deseja manter os dados salvos ou apagá-los e iniciar uma nova contagem?
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelLoad} color="inherit" size="small" sx={{ fontSize: '0.75rem' }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDeleteAndLoad} variant="contained" color="error" size="small" sx={{ fontSize: '0.75rem' }}>
                        {importConflictType === 'same_file' ? 'Reiniciar' : 'Deletar Registros'}
                    </Button>
                    <Button onClick={handleKeepDataAndLoad} variant="contained" color="primary" size="small" sx={{ fontSize: '0.75rem' }}>
                        {importConflictType === 'same_file' ? 'Manter Dados' : 'Manter Contagem'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
