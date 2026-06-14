'use client'
import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Image from 'next/image';
import logo from '@/assets/logo.jpg'
import { readProjectFolder } from "../../utils/projectReader";
import FullScreenSpinner from '../utility/FullScreenSpinner';
import { FileDownload, RestartAlt, UploadFile } from '@mui/icons-material';

const drawerWidth = 240;

function MainHeader(props) {
  // props.isProjectOpen: boolean — shows/hides Reset and Export buttons
  const { window: muiWindow } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = React.useState(null);
  const [resetMenuAnchor, setResetMenuAnchor] = React.useState(null);
  const [resetCurrentServiceDialog, setResetCurrentServiceDialog] = React.useState(false);
  const [resetFileName, setResetFileName] = React.useState('');
  const projectInputRef = React.useRef(null);

  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

  const handleExportMenuOpen = (event) => setExportMenuAnchor(event.currentTarget);
  const handleExportMenuClose = () => setExportMenuAnchor(null);
  const handleResetMenuOpen = (event) => setResetMenuAnchor(event.currentTarget);
  const handleResetMenuClose = () => setResetMenuAnchor(null);

  // ─── Export ──────────────────────────────────────────────────────────────

  const exportStoredVehicles = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('vehicleList');
        if (!raw) { alert('Nenhum registro para exportar'); setLoading(false); return; }
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || list.length === 0) { alert('Nenhum registro para exportar'); setLoading(false); return; }

        const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];
        const grouped = {};

        list.forEach((v) => {
          const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
          const time = v.time ?? '00:00';
          const type = v.type ?? 'Desconhecido';
          const fromTo = v.fromTo ?? v.from_to ?? '';
          const [hourStr, minStr] = time.split(':');
          const hour = parseInt(hourStr, 10) || 0;
          const min = parseInt(minStr, 10) || 0;
          const bucket = Math.floor(min / 15) * 15;
          const nextBucket = (bucket + 15) % 60;
          const nextHour = (bucket + 15 >= 60 ? hour + 1 : hour) % 24;
          const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;
          if (!grouped[date]) grouped[date] = {};
          const dirKey = fromTo || '';
          if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
          if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { counts: {} };
          if (!grouped[date][dirKey][timeRange].counts[type]) grouped[date][dirKey][timeRange].counts[type] = 0;
          grouped[date][dirKey][timeRange].counts[type]++;
        });

        const dates = Object.keys(grouped).sort();
        const allTimeSlots = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 15) {
            const nextM = (m + 15) % 60;
            const nextH = m + 15 >= 60 ? h + 1 : h;
            allTimeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`);
          }
        }

        const csvRows = [['Data', 'Hora', 'Direção', ...vehicleTypes]];
        dates.forEach((date) => {
          Object.keys(grouped[date]).sort().forEach((dir) => {
            allTimeSlots.forEach((timeRange) => {
              const row = [date, timeRange, dir];
              vehicleTypes.forEach((type) => {
                row.push(grouped[date]?.[dir]?.[timeRange]?.counts[type] ?? 0);
              });
              csvRows.push(row);
            });
          });
        });

        const csv = '﻿' + csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedTitle = (localStorage.getItem('serviceTitle') || 'sem_titulo').replace(/[^a-z0-9_\-]/gi, '_');
        a.download = `${sanitizedTitle}_contagem_veiculos_${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setLoading(false);
      } catch (e) {
        console.error(e);
        alert('Erro ao exportar dados');
        setLoading(false);
      }
    }, 100);
  };

  const exportAxlesReport = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('vehicleList');
        if (!raw) { alert('Nenhum registro para exportar'); setLoading(false); return; }
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || list.length === 0) { alert('Nenhum registro para exportar'); setLoading(false); return; }

        const axleMapping = { '2E': 2, '3E': 1, '4E': 2, 'Moto': 2, '2CB': 2, '3CB': 3, '4CB': 4, '2C (16)': 2, '2C (22)': 2, '3C': 3, '4C': 4, '2S2': 4, '2S3': 5, '2I3': 5, '2J3': 5, '3S2': 5, '3S3': 6, '4S3': 7, '3I3': 6, '3J3': 6, '3T4': 7, '3T6': 9, '2C2': 4, '2C3': 5, '3C2': 5, '3C3': 6, '3D4': 7, '3D6': 9 };
        const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];
        const grouped = {};

        list.forEach((v) => {
          const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
          const time = v.time ?? '00:00';
          const type = v.type ?? 'Desconhecido';
          const fromTo = v.fromTo ?? v.from_to ?? '';
          const raisedAxles = parseInt(v.raisedAxles ?? 0, 10);
          const effectiveAxles = Math.max(0, (axleMapping[type] ?? 0) - raisedAxles);
          const [hourStr, minStr] = time.split(':');
          const hour = parseInt(hourStr, 10) || 0;
          const min = parseInt(minStr, 10) || 0;
          const bucket = Math.floor(min / 15) * 15;
          const nextBucket = (bucket + 15) % 60;
          const nextHour = (bucket + 15 >= 60 ? hour + 1 : hour) % 24;
          const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;
          if (!grouped[date]) grouped[date] = {};
          const dirKey = fromTo || '';
          if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
          if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { axleCounts: {} };
          if (!grouped[date][dirKey][timeRange].axleCounts[type]) grouped[date][dirKey][timeRange].axleCounts[type] = 0;
          grouped[date][dirKey][timeRange].axleCounts[type] += effectiveAxles;
        });

        const dates = Object.keys(grouped).sort();
        const allTimeSlots = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 15) {
            const nextM = (m + 15) % 60;
            const nextH = m + 15 >= 60 ? h + 1 : h;
            allTimeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`);
          }
        }

        const csvRows = [['Data', 'Hora', 'Direção', ...vehicleTypes]];
        dates.forEach((date) => {
          Object.keys(grouped[date]).sort().forEach((dir) => {
            allTimeSlots.forEach((timeRange) => {
              const row = [date, timeRange, dir];
              vehicleTypes.forEach((type) => {
                row.push(grouped[date]?.[dir]?.[timeRange]?.axleCounts[type] ?? 0);
              });
              csvRows.push(row);
            });
          });
        });

        const csv = '﻿' + csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedTitle = (localStorage.getItem('serviceTitle') || 'sem_titulo').replace(/[^a-z0-9_\-]/gi, '_');
        a.download = `${sanitizedTitle}_contagem_eixos_${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setLoading(false);
      } catch (e) {
        console.error(e);
        alert('Erro ao exportar dados de eixos');
        setLoading(false);
      }
    }, 100);
  };

  const handleExportVehicles = () => { handleExportMenuClose(); exportStoredVehicles(); };
  const handleExportAxles = () => { handleExportMenuClose(); exportAxlesReport(); };

  // ─── Import project ───────────────────────────────────────────────────────

  const handleImportProject = () => {
    if (mobileOpen) setMobileOpen(false);
    projectInputRef.current?.click();
  };

  async function handleProjectUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    setTimeout(async () => {
      try {
        const result = await readProjectFolder(files);
        props.onLoadProject(result);
      } catch (error) {
        console.error('Erro ao carregar projeto:', error);
        alert('Erro ao carregar projeto:\n' + error.message);
      } finally {
        setLoading(false);
        if (projectInputRef.current) projectInputRef.current.value = '';
      }
    }, 100);
  }

  // ─── Reset ────────────────────────────────────────────────────────────────

  function handleResetTotal() {
    handleResetMenuClose();
    if (mobileOpen) setMobileOpen(false);
    if (typeof props.onResetRequest === 'function') props.onResetRequest();
  }

  function handleResetCurrentService() {
    handleResetMenuClose();
    if (mobileOpen) setMobileOpen(false);
    const fileName = props.currentFileName || (typeof window !== 'undefined' ? localStorage.getItem('currentFileName') : null);
    if (!fileName) { alert('Nenhum arquivo carregado atualmente.'); return; }
    setResetFileName(fileName);
    setResetCurrentServiceDialog(true);
  }

  function confirmResetCurrentService() {
    const targetName = resetFileName?.trim();
    if (!targetName || targetName === 'Desconhecido') {
      alert('Nenhum arquivo válido selecionado para reset.');
      setResetCurrentServiceDialog(false);
      return;
    }
    const raw = localStorage.getItem('vehicleList');
    if (!raw) { alert('Nenhum registro encontrado no sistema.'); setResetCurrentServiceDialog(false); return; }
    try {
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) {
        localStorage.setItem('vehicleList', JSON.stringify([]));
        if (typeof props.onClearVehicles === 'function') props.onClearVehicles();
        setResetCurrentServiceDialog(false);
        return;
      }
      const filteredList = list.filter(v => (v.fileName || '').trim().toLowerCase() !== targetName.toLowerCase());
      if (filteredList.length === list.length) {
        alert('Nenhum registro encontrado especificamente para: ' + targetName);
      } else {
        localStorage.setItem('vehicleList', JSON.stringify(filteredList));
        localStorage.removeItem(`startDateTime_${targetName}`);
        if (typeof props.onClearVehicles === 'function') props.onClearVehicles();
      }
    } catch (e) {
      console.error('Erro ao resetar contagem:', e);
      alert('Ocorreu um erro ao processar os dados salvos.');
    } finally {
      setResetCurrentServiceDialog(false);
    }
  }

  // ─── Drawer ───────────────────────────────────────────────────────────────

  const drawer = (
    <Box onClick={(e) => {
      const submenus = ['Exportar Dados', 'Resetar'];
      if (!submenus.includes(e.target.textContent)) handleDrawerToggle();
    }} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Image src={logo} width={55} alt='logo' />
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: 'center' }} onClick={handleImportProject}>
            <ListItemText primary="Importar Projeto" />
          </ListItemButton>
        </ListItem>
        {props.isProjectOpen && (
          <>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: 'center' }} onClick={(e) => handleResetMenuOpen(e)}>
                <ListItemText primary="Resetar" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: 'center' }} onClick={(e) => handleExportMenuOpen(e)}>
                <ListItemText primary="Exportar Dados" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const container = muiWindow !== undefined ? () => muiWindow().document.body : undefined;

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar component="nav" position='static' sx={{ backgroundColor: '#22423A' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 3 }}>
              <Image src={logo} width={55} alt='logo' />
              <Box display='flex' flexDirection='column' justifyContent={'flex-start'} alignItems={'flex-start'}>
                <Typography variant="h2" fontSize={18} fontWeight={'bold'}>
                  Contador de Veículos
                </Typography>
                <Typography variant="h4" fontSize={12} fontWeight={500} letterSpacing={0.5}>
                  Gnoatto Botoni
                </Typography>
              </Box>
            </Box>

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button sx={{ color: '#fff' }} startIcon={<UploadFile />} onClick={handleImportProject}>
                Importar Projeto
              </Button>
              {props.isProjectOpen && (
                <>
                  <Button sx={{ color: '#fff' }} startIcon={<RestartAlt />} onClick={handleResetMenuOpen}>
                    Resetar
                  </Button>
                  <Button sx={{ color: '#fff' }} startIcon={<FileDownload />} onClick={handleExportMenuOpen}>
                    Exportar Dados
                  </Button>
                </>
              )}
            </Box>

            {/* Export submenu */}
            <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={handleExportMenuClose}>
              <MenuItem onClick={handleExportVehicles}>Exportar Veículos</MenuItem>
              <MenuItem onClick={handleExportAxles}>Exportar Eixos</MenuItem>
            </Menu>

            {/* Reset submenu */}
            <Menu anchorEl={resetMenuAnchor} open={Boolean(resetMenuAnchor)} onClose={handleResetMenuClose}>
              <MenuItem onClick={handleResetTotal}>Serviço Total</MenuItem>
              <MenuItem onClick={handleResetCurrentService}>Contagem Atual</MenuItem>
            </Menu>

            {/* Hidden project folder input */}
            <input
              ref={projectInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              style={{ display: 'none' }}
              onChange={handleProjectUpload}
            />
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Box>
      <FullScreenSpinner open={loading} />

      {/* Reset Current Service Confirmation Dialog */}
      <Dialog open={resetCurrentServiceDialog} onClose={() => setResetCurrentServiceDialog(false)}>
        <DialogTitle>Confirmar Reset da Contagem Atual</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover todos os registros do arquivo atual?
          </DialogContentText>
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>Arquivo:</Typography>
          <Typography>{resetFileName}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetCurrentServiceDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={confirmResetCurrentService} variant="contained" color="error">Confirmar e Deletar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

MainHeader.propTypes = {
  window: PropTypes.func,
};

export default MainHeader;
