'use client'
import { useState } from "react";
import MainHeader from "@/components/main-header/MainHeader";
import ImageLoader from "@/components/video-player/ImageLoader";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function Main() {
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

    function loadZipData(result, filename) {
        // Check if there's a different file being loaded and records exist
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;
        
        // Compare with localStorage value instead of state (handles page reload case)
        if (storedFileName && filename !== storedFileName && hasRecords) {
            // Store pending data and show confirmation dialog
            setPendingFileData({ result, filename });
            setShowConfirmDialog(true);
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
    }

    function handleConfirmLoad() {
        // Clear existing records and filename
        localStorage.removeItem('vehicleList');
        localStorage.removeItem('currentFileName');
        // Load new file
        if (pendingFileData) {
            applyFileData(pendingFileData.result, pendingFileData.filename);
        }
        setShowConfirmDialog(false);
        setPendingFileData(null);
    }

    function handleCancelLoad() {
        setShowConfirmDialog(false);
        setPendingFileData(null);
    }

    return (
        <>
            <MainHeader onLoadRecords={loadZipData} onResetRequest={() => setResetRequest(true)} />
            <ImageLoader loadedRecords={registros} loadedImages={imagens} resetRequest={resetRequest} onResetHandled={() => setResetRequest(false)} />
            
            {/* Confirmation Dialog for Different File */}
            <Dialog open={showConfirmDialog} onClose={handleCancelLoad}>
                <DialogTitle>Arquivo Diferente Detectado</DialogTitle>
                <DialogContent>
                    <Typography>
                        Você está carregando um arquivo diferente. Deseja deletar os registros atuais?
                    </Typography>
                    <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                        Arquivo anterior: {currentFileName}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                        Novo arquivo: {pendingFileData?.filename}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelLoad} color="error">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmLoad} variant="contained" color="primary">
                        Confirmar e Deletar Registros
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
