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
import Image from 'next/image';
import logo from '@/assets/logo.webp'
import { readFolder } from "../../utils/fileReader";
import FullScreenSpinner from '../utility/FullScreenSpinner';

const drawerWidth = 240;
const navItems = ['Importar Arquivo', 'Resetar Contagem', 'Exportar Dados'];

function MainHeader(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = React.useState(null);
  const [importMenuAnchor, setImportMenuAnchor] = React.useState(null);
  const folderInputRef = React.useRef(null);
  const mp4InputRef = React.useRef(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleImportMenuOpen = (event) => {
    setImportMenuAnchor(event.currentTarget);
  };

  const handleImportMenuClose = () => {
    setImportMenuAnchor(null);
  };

  const exportStoredVehicles = () => {
    setLoading(true);
    // Use setTimeout to ensure the spinner shows before heavy processing
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('vehicleList');
        if (!raw) {
          alert('Nenhum registro para exportar');
          setLoading(false);
          return;
        }
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || list.length === 0) {
          alert('Nenhum registro para exportar');
          setLoading(false);
          return;
        }

        // Define vehicle types in the exact order you want
        const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

        // Group by date -> fromTo (De Para) -> 15-minute time slots
        const grouped = {};

        list.forEach((v) => {
          const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
          const time = v.time ?? '00:00';
          const type = v.type ?? 'Desconhecido';
          const fromTo = v.fromTo ?? v.from_to ?? '';

          // Extract hour and minute from time (format: "HH:MM")
          const [hourStr, minStr] = time.split(':');
          const hour = parseInt(hourStr, 10) || 0;
          const min = parseInt(minStr, 10) || 0;

          // Calculate 15-minute bucket
          const bucket = Math.floor(min / 15) * 15;
          const nextBucket = (bucket + 15) % 60;
          const nextHour = bucket + 15 >= 60 ? hour + 1 : hour;
          const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;

          if (!grouped[date]) grouped[date] = {};
          const dirKey = fromTo || '';
          if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
          if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { counts: {} };
          if (!grouped[date][dirKey][timeRange].counts[type]) grouped[date][dirKey][timeRange].counts[type] = 0;
          grouped[date][dirKey][timeRange].counts[type]++;
        });

        const dates = Object.keys(grouped).sort();

        // Generate all possible 15-minute time slots for a day
        const allTimeSlots = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 15) {
            const nextM = (m + 15) % 60;
            const nextH = m + 15 >= 60 ? h + 1 : h;
            const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
            allTimeSlots.push(slot);
          }
        }

        // Build CSV rows
        const csvRows = [];

        // Add header row
        csvRows.push(['Data', 'Hora', 'Direção', ...vehicleTypes]);

        // Add data rows: for each date, for each direction (fromTo), for each time slot
        dates.forEach((date) => {
          const directions = Object.keys(grouped[date]).sort();
          // ensure at least one direction (could be [''] if only empty)
          directions.forEach((dir) => {
            allTimeSlots.forEach((timeRange) => {
              const row = [date, timeRange, dir];
              vehicleTypes.forEach((type) => {
                const count = (grouped[date] && grouped[date][dir] && grouped[date][dir][timeRange] && grouped[date][dir][timeRange].counts[type])
                  ? grouped[date][dir][timeRange].counts[type]
                  : 0;
                row.push(count);
              });
              csvRows.push(row);
            });
          });
        });

        // Convert to CSV string
        const csv = csvRows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Prepend UTF-8 BOM so Excel on Windows recognizes accents/cedilla correctly
        const csvWithBOM = '\uFEFF' + csv;

        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `vehicle_count_${ts}.csv`;
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

  const handleNavClick = (item, event) => {
    // Close mobile drawer if open
    if (mobileOpen) setMobileOpen(false);

    switch (item) {
      case 'Exportar Dados':
        // Open submenu instead of direct export
        handleExportMenuOpen(event);
        break;
      case 'Resetar Contagem':
        handleReset();
        break;
      case 'Importar Arquivo':
        // Open submenu instead of direct upload
        handleImportMenuOpen(event);
        break;
      default:
        break;
    }
  };

  const handleExportVehicles = () => {
    handleExportMenuClose();
    if (mobileOpen) setMobileOpen(false);
    exportStoredVehicles();
  };

  const exportAxlesReport = () => {
    setLoading(true);
    // Use setTimeout to ensure the spinner shows before heavy processing
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('vehicleList');
        if (!raw) {
          alert('Nenhum registro para exportar');
          setLoading(false);
          return;
        }
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || list.length === 0) {
          alert('Nenhum registro para exportar');
          setLoading(false);
          return;
        }

        // Create mapping of vehicle type to axle count
        const axleMapping = {
          '2E': 2,
          '3E': 1,
          '4E': 2,
          'Moto': 2,
          '2CB': 2,
          '3CB': 3,
          '4CB': 4,
          '2C (16)': 2,
          '2C (22)': 2,
          '3C': 3,
          '4C': 4,
          '2S2': 4,
          '2S3': 5,
          '2I3': 5,
          '2J3': 5,
          '3S2': 5,
          '3S3': 6,
          '4S3': 7,
          '3I3': 6,
          '3J3': 6,
          '3T4': 7,
          '3T6': 9,
          '2C2': 4,
          '2C3': 5,
          '3C2': 5,
          '3C3': 6,
          '3D4': 7,
          '3D6': 9,
        };

        // Define vehicle types in the exact order
        const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

        // Group by date -> fromTo (De Para) -> 15-minute time slots
        const grouped = {};

        list.forEach((v) => {
          const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
          const time = v.time ?? '00:00';
          const type = v.type ?? 'Desconhecido';
          const fromTo = v.fromTo ?? v.from_to ?? '';
          const raisedAxles = parseInt(v.raisedAxles ?? 0, 10);

          // Get base axle count for this vehicle type
          const baseAxles = axleMapping[type] ?? 0;
          // Calculate effective axles: base axles - raised axles
          const effectiveAxles = Math.max(0, baseAxles - raisedAxles);

          // Extract hour and minute from time (format: "HH:MM")
          const [hourStr, minStr] = time.split(':');
          const hour = parseInt(hourStr, 10) || 0;
          const min = parseInt(minStr, 10) || 0;

          // Calculate 15-minute bucket
          const bucket = Math.floor(min / 15) * 15;
          const nextBucket = (bucket + 15) % 60;
          const nextHour = bucket + 15 >= 60 ? hour + 1 : hour;
          const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;

          if (!grouped[date]) grouped[date] = {};
          const dirKey = fromTo || '';
          if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
          if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { axleCounts: {} };
          if (!grouped[date][dirKey][timeRange].axleCounts[type]) grouped[date][dirKey][timeRange].axleCounts[type] = 0;
          grouped[date][dirKey][timeRange].axleCounts[type] += effectiveAxles;
        });

        const dates = Object.keys(grouped).sort();

        // Generate all possible 15-minute time slots for a day
        const allTimeSlots = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 15) {
            const nextM = (m + 15) % 60;
            const nextH = m + 15 >= 60 ? h + 1 : h;
            const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
            allTimeSlots.push(slot);
          }
        }

        // Build CSV rows
        const csvRows = [];

        // Add header row
        csvRows.push(['Data', 'Hora', 'Direção', ...vehicleTypes]);

        // Add data rows: for each date, for each direction (fromTo), for each time slot
        dates.forEach((date) => {
          const directions = Object.keys(grouped[date]).sort();
          directions.forEach((dir) => {
            allTimeSlots.forEach((timeRange) => {
              const row = [date, timeRange, dir];
              vehicleTypes.forEach((type) => {
                const axleCount = (grouped[date] && grouped[date][dir] && grouped[date][dir][timeRange] && grouped[date][dir][timeRange].axleCounts[type])
                  ? grouped[date][dir][timeRange].axleCounts[type]
                  : 0;
                row.push(axleCount);
              });
              csvRows.push(row);
            });
          });
        });

        // Convert to CSV string
        const csv = csvRows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Prepend UTF-8 BOM so Excel on Windows recognizes accents/cedilla correctly
        const csvWithBOM = '\uFEFF' + csv;

        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `axle_count_${ts}.csv`;
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

  const handleExportAxles = () => {
    handleExportMenuClose();
    if (mobileOpen) setMobileOpen(false);
    exportAxlesReport();
  };

  async function handleFolderUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);

    // Pequeno delay para garantir que o spinner de loading apareça antes do processamento pesado
    setTimeout(async () => {
      try {
        const result = await readFolder(files);
        // use the folder name from the first file's path if available
        const folderName = files[0].webkitRelativePath?.split('/')[0] || "Pasta de Dados";
        props.onLoadRecords(result, folderName);
      } catch (error) {
        console.error('Erro ao carregar pasta:', error);
        alert('Erro ao carregar pasta');
      } finally {
        setLoading(false);
        if (folderInputRef.current) folderInputRef.current.value = '';
      }
    }, 100);
  }

  function handleMp4Upload(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    if (typeof props.onLoadMp4 === 'function') {
      props.onLoadMp4(file);
    }
    // Clear the input so the same file can be selected again
    event.target.value = '';
  }

  const handleImportFolder = () => {
    handleImportMenuClose();
    if (mobileOpen) setMobileOpen(false);
    folderInputRef.current?.click();
  };

  const handleImportMp4 = () => {
    handleImportMenuClose();
    if (mobileOpen) setMobileOpen(false);
    mp4InputRef.current?.click();
  };

  function handleReset() {
    if (typeof props.onResetRequest === 'function') {
      props.onResetRequest();
    }
  }

  const drawer = (
    <Box onClick={(e) => {
      // Don't close drawer if clicking on submenu items
      const submenuItems = ['Exportar Dados', 'Importar Arquivo'];
      if (!submenuItems.includes(e.target.textContent)) {
        handleDrawerToggle();
      }
    }} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Image src={logo} width={55} alt='logo' />
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          item === 'Exportar Dados' ? (
            <React.Fragment key={item}>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: 'center' }} onClick={(e) => handleNavClick(item, e)}>
                  <ListItemText primary={item} />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ) : (
            <ListItem key={item} disablePadding>
              <ListItemButton sx={{ textAlign: 'center' }} onClick={(e) => handleNavClick(item, e)}>
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

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
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              <Image src={logo} width={55} alt='logo' />
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {navItems.map((item) => (
                item === 'Importar Arquivo' ? (
                  <React.Fragment key={item}>
                    <Button sx={{ color: '#fff' }} onClick={(e) => handleNavClick(item, e)}>
                      {item}
                    </Button>
                  </React.Fragment>
                ) : (
                  <Button key={item} sx={{ color: '#fff' }} onClick={(e) => handleNavClick(item, e)}>
                    {item}
                  </Button>
                )
              ))}
            </Box>
            {/* Export submenu */}
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={handleExportVehicles}>Exportar Veículos</MenuItem>
              <MenuItem onClick={handleExportAxles}>Exportar Eixos</MenuItem>
            </Menu>
            {/* Import submenu */}
            <Menu
              anchorEl={importMenuAnchor}
              open={Boolean(importMenuAnchor)}
              onClose={handleImportMenuClose}
            >
              <MenuItem onClick={handleImportFolder}>Importar Frames</MenuItem>
              <MenuItem onClick={handleImportMp4}>Importar MP4</MenuItem>
            </Menu>
            {/* Hidden file inputs */}
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              style={{ display: 'none' }}
              onChange={handleFolderUpload}
            />
            <input ref={mp4InputRef} type="file" accept=".mp4,video/mp4" style={{ display: 'none' }} onChange={handleMp4Upload} />
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
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
    </>
  );
}

MainHeader.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default MainHeader;
