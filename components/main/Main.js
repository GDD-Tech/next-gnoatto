'use client'
import { useState } from "react";
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
    const [currentFileName, setCurrentFileName] = useState(() => {
        // Load filename from localStorage on mount (only on client-side)
        if (typeof window !== 'undefined') {
            return localStorage.getItem('currentFileName') || null;
        }
        return null;
    });
    const [pendingFileData, setPendingFileData] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [clearVehiclesFlag, setClearVehiclesFlag] = useState(0);
    const [importConflictType, setImportConflictType] = useState(null); // 'different_file' | 'same_file'

    function loadZipData(result, filename) {
        // Check if there's a different file being loaded and records exist
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;
        
        // Compare with localStorage value instead of state (handles page reload case)
        if (hasRecords) {
            if (storedFileName && filename !== storedFileName) {
                // Different file, existing records -> Warn to delete
                setPendingFileData({ result, filename });
                setImportConflictType('different_file');
                setShowConfirmDialog(true);
            } else if (filename === storedFileName) {
               // Same file, existing records -> Ask to keep or delete
               setPendingFileData({ result, filename });
               setImportConflictType('same_file');
               setShowConfirmDialog(true);
            } else {
                 // Should ideally not happen if hasRecords is true but no storedFileName, consider as different
                 setPendingFileData({ result, filename });
                 setImportConflictType('different_file');
                 setShowConfirmDialog(true);
            }
        } else {
            // Load directly
            applyFileData(result, filename);
        }
    }

    function applyFileData(result, filename) {
        const records = result?.tempRegistros ?? [];
        const images = result?.tempImagens ?? {};
        setRegistros(records);
        setImagens(images);
        setCurrentFileName(filename);
        // Save filename to localStorage
        localStorage.setItem('currentFileName', filename);
        setMode('zip');
    }

    function loadMp4Data(file) {
        setMode('mp4');
        setVideoFile(file);
    }

    function handleConfirmDeleteAndLoad() {
        // Clear existing records and filename
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
            applyFileData(pendingFileData.result, pendingFileData.filename);
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
            />
            {mode === 'zip' ? (
                <ImageLoader 
                    loadedRecords={registros} 
                    loadedImages={imagens} 
                    resetRequest={resetRequest} 
                    onResetHandled={() => setResetRequest(false)} 
                    clearVehiclesFlag={clearVehiclesFlag} 
                />
            ) : (
                <Mp4Player 
                    videoFile={videoFile}
                    resetRequest={resetRequest} 
                    onResetHandled={() => setResetRequest(false)} 
                    clearVehiclesFlag={clearVehiclesFlag}
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
                    <Button onClick={handleCancelLoad} color="inherit">
                        Cancelar
                    </Button>
                    {importConflictType === 'same_file' && (
                        <Button onClick={handleKeepDataAndLoad} variant="outlined" color="primary">
                            Manter Dados Salvos
                        </Button>
                    )}
                    <Button onClick={handleConfirmDeleteAndLoad} variant="contained" color="error">
                        {importConflictType === 'same_file' ? 'Apagar e Iniciar de Novo' : 'Confirmar e Deletar Registros'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
