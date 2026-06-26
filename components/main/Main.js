'use client'
import { useState, useMemo, useEffect } from "react";
import MainHeader from "@/components/main-header/MainHeader";
import ImageLoader from "@/components/video-player/ImageLoader";
import Mp4Player from "@/components/video-player/Mp4Player";
import ProjectNavigation from "@/components/project-navigation/ProjectNavigation";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function Main() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved === 'true') setDarkMode(true);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('darkMode', String(next));
            return next;
        });
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: { main: darkMode ? '#4a9d84' : '#22423A' },
        },
    });

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
    const [importConflictType, setImportConflictType] = useState(null); // 'different_file' | 'same_file' | 'project'
    const [showContinueDialog, setShowContinueDialog] = useState(false);
    const [continueFromLast, setContinueFromLast] = useState(false);
    const [loadVersion, setLoadVersion] = useState(0);

    // Project mode state
    const [projectData, setProjectData] = useState(null);
    const [currentFolderIndex, setCurrentFolderIndex] = useState(0);

    // Derived values: in project mode these override the regular state
    const isProjectMode = Boolean(projectData);
    const currentFolder = isProjectMode ? projectData.folders[currentFolderIndex] : null;

    const effectiveMode = isProjectMode
        ? (currentFolder?.type === 'video' ? 'mp4' : 'zip')
        : mode;
    const effectiveVideoFile = isProjectMode ? currentFolder?.videoFile : videoFile;
    const effectiveRegistros = isProjectMode ? (currentFolder?.records ?? []) : registros;
    const effectiveImagens = isProjectMode ? (currentFolder?.images ?? {}) : imagens;
    const effectiveFileName = isProjectMode ? currentFolder?.name : currentFileName;

    const projectConfig = useMemo(() => {
        if (!isProjectMode || !projectData) return null;
        return {
            serviceTitle: projectData.serviceTitle,
            leftDirection: projectData.leftDirection,
            rightDirection: projectData.rightDirection,
            startDateTime: currentFolder?.startDateTime ?? null,
        };
    }, [isProjectMode, projectData, currentFolder]);

    // ─── Regular file loading ────────────────────────────────────────────────

    function loadZipData(result, filename) {
        if (typeof window === 'undefined') return;
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;

        if (hasRecords) {
            if (storedFileName && filename !== storedFileName) {
                setPendingFileData({ result, filename, type: 'zip' });
                setImportConflictType('different_file');
                setShowConfirmDialog(true);
            } else if (filename === storedFileName) {
                setPendingFileData({ result, filename, type: 'zip' });
                setImportConflictType('same_file');
                setShowContinueDialog(true);
            } else {
                setPendingFileData({ result, filename, type: 'zip' });
                setImportConflictType('different_file');
                setShowConfirmDialog(true);
            }
        } else {
            applyFileData(result, filename, false);
        }
    }

    function applyFileData(result, filename, continueFromLast = false) {
        const records = result?.tempRegistros ?? [];
        const images = result?.tempImagens ?? {};
        setRegistros(records);
        setImagens(images);
        setCurrentFileName(filename);
        setProjectData(null); // exit project mode
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentFileName', filename);
        }
        setContinueFromLast(continueFromLast);
        setLoadVersion(v => v + 1);
        setMode('zip');
    }

    function loadMp4Data(file) {
        if (typeof window === 'undefined') return;
        const storedVehicles = localStorage.getItem('vehicleList');
        const storedFileName = localStorage.getItem('currentFileName');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;

        if (hasRecords && storedFileName) {
            if (storedFileName !== file.name) {
                setImportConflictType('different_file');
                setPendingFileData({ file, filename: file.name, type: 'mp4' });
                setShowConfirmDialog(true);
            } else {
                setImportConflictType('same_file');
                setPendingFileData({ file, filename: file.name, type: 'mp4' });
                setShowContinueDialog(true);
            }
        } else {
            applyMp4Data(file, false);
        }
    }

    function applyMp4Data(file, continueFromLast = false) {
        setMode('mp4');
        setVideoFile(file);
        setCurrentFileName(file.name);
        setProjectData(null); // exit project mode
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentFileName', file.name);
        }
        setContinueFromLast(continueFromLast);
    }

    // ─── Project loading ─────────────────────────────────────────────────────

    function loadProjectData(data) {
        if (typeof window === 'undefined') return;
        const storedVehicles = localStorage.getItem('vehicleList');
        const hasRecords = storedVehicles && JSON.parse(storedVehicles).length > 0;

        if (hasRecords) {
            setPendingFileData({ type: 'project', data });
            setImportConflictType('project');
            setShowConfirmDialog(true);
        } else {
            applyProjectData(data);
        }
    }

    function applyProjectData(data) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('serviceTitle', data.serviceTitle);
            localStorage.setItem('leftDirection', data.leftDirection);
            localStorage.setItem('rightDirection', data.rightDirection);
            localStorage.setItem('currentFileName', data.folders[0]?.name ?? '');
        }
        setProjectData(data);
        setCurrentFolderIndex(0);
        setContinueFromLast(false);
        setLoadVersion(v => v + 1);
    }

    function handleProjectNextFolder() {
        if (!projectData) return;
        if (currentFolderIndex < projectData.folders.length - 1) {
            const nextIndex = currentFolderIndex + 1;
            setCurrentFolderIndex(nextIndex);
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentFileName', projectData.folders[nextIndex]?.name ?? '');
            }
            setContinueFromLast(false);
            setLoadVersion(v => v + 1);
        }
    }

    function handleProjectPrevFolder() {
        if (!projectData) return;
        if (currentFolderIndex > 0) {
            const prevIndex = currentFolderIndex - 1;
            setCurrentFolderIndex(prevIndex);
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentFileName', projectData.folders[prevIndex]?.name ?? '');
            }
            setContinueFromLast(false);
            setLoadVersion(v => v + 1);
        }
    }

    // ─── Conflict dialog handlers ─────────────────────────────────────────────

    function handleConfirmDeleteAndLoad() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('vehicleList');
        localStorage.removeItem('currentFileName');
        setClearVehiclesFlag(prev => prev + 1);
        if (pendingFileData) {
            if (pendingFileData.type === 'project') {
                applyProjectData(pendingFileData.data);
            } else {
                applyFileData(pendingFileData.result, pendingFileData.filename);
            }
        }
        setShowConfirmDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    function handleKeepDataAndLoad() {
        if (pendingFileData) {
            if (pendingFileData.type === 'project') {
                applyProjectData(pendingFileData.data);
            } else if (pendingFileData.type === 'zip') {
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

    function handleContinueFromLast() {
        if (pendingFileData) {
            if (pendingFileData.type === 'zip') {
                applyFileData(pendingFileData.result, pendingFileData.filename, true);
            } else if (pendingFileData.type === 'mp4') {
                applyMp4Data(pendingFileData.file, true);
            }
        }
        setShowContinueDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    function handleStartFromBeginning() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('vehicleList');
        setClearVehiclesFlag(prev => prev + 1);

        if (pendingFileData) {
            if (pendingFileData.type === 'zip') {
                applyFileData(pendingFileData.result, pendingFileData.filename, false);
            } else if (pendingFileData.type === 'mp4') {
                applyMp4Data(pendingFileData.file, false);
            }
        }
        setShowContinueDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    function handleCancelContinue() {
        setShowContinueDialog(false);
        setPendingFileData(null);
        setImportConflictType(null);
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainHeader
                onLoadProject={loadProjectData}
                onResetRequest={() => setResetRequest(true)}
                onClearVehicles={() => setClearVehiclesFlag(prev => prev + 1)}
                currentFileName={effectiveFileName}
                isProjectOpen={isProjectMode}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
            />

            {isProjectMode && (
                <ProjectNavigation
                    folders={projectData.folders}
                    currentIndex={currentFolderIndex}
                    onPrev={handleProjectPrevFolder}
                    onNext={handleProjectNextFolder}
                />
            )}

            {isProjectMode && (effectiveMode === 'zip' ? (
                <ImageLoader
                    key={`project-folder-${currentFolderIndex}`}
                    loadedRecords={effectiveRegistros}
                    loadedImages={effectiveImagens}
                    resetRequest={resetRequest}
                    onResetHandled={() => setResetRequest(false)}
                    clearVehiclesFlag={clearVehiclesFlag}
                    fileName={effectiveFileName}
                    continueFromLast={continueFromLast}
                    loadVersion={loadVersion}
                    projectConfig={projectConfig}
                    onFolderEnd={handleProjectNextFolder}
                    completedItems={projectData.folders.map(f => f.name)}
                />
            ) : (
                <Mp4Player
                    key={`project-folder-${currentFolderIndex}`}
                    videoFile={effectiveVideoFile}
                    resetRequest={resetRequest}
                    onResetHandled={() => setResetRequest(false)}
                    clearVehiclesFlag={clearVehiclesFlag}
                    continueFromLast={continueFromLast}
                    projectConfig={projectConfig}
                    onFolderEnd={handleProjectNextFolder}
                    completedItems={projectData.folders.map(f => f.name)}
                />
            ))}

            {/* Confirmation Dialog — different file or project import */}
            <Dialog open={showConfirmDialog} onClose={handleCancelLoad}>
                <DialogTitle>
                    {importConflictType === 'project'
                        ? 'Importar Novo Projeto'
                        : importConflictType === 'same_file'
                            ? 'Arquivo Existente Detectado'
                            : 'Arquivo Diferente Detectado'}
                </DialogTitle>
                <DialogContent>
                    {importConflictType === 'project' && (
                        <>
                            <Typography>
                                Você está importando um novo projeto. Existem registros de contagem salvos no sistema.
                            </Typography>
                            <Typography sx={{ mt: 2 }}>
                                Deseja deletar os registros existentes ou mantê-los junto com o novo projeto?
                            </Typography>
                        </>
                    )}
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

            {/* Dialog para continuar do último registro */}
            <Dialog open={showContinueDialog} onClose={handleCancelContinue}>
                <DialogTitle>Continuar de onde parou?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Este arquivo já foi importado anteriormente e existem registros salvos.
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2 }}>
                        Deseja continuar de onde parou ou começar uma nova contagem?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelContinue} color="inherit" size="small" sx={{ fontSize: '0.75rem' }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleStartFromBeginning} variant="outlined" color="warning" size="small" sx={{ fontSize: '0.75rem' }}>
                        Reiniciar
                    </Button>
                    <Button onClick={handleContinueFromLast} variant="contained" color="primary" size="small" sx={{ fontSize: '0.75rem' }}>
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

