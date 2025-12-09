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
import Image from 'next/image';
import logo from '@/assets/logo.webp'
import { readFile } from "../../utils/fileReader";
import FullScreenSpinner from '../utility/FullScreenSpinner';

const drawerWidth = 240;
const navItems = ['Importar Arquivo', 'Resetar Contagem', 'Exportar Dados'];

function MainHeader(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
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
        const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

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

  const handleNavClick = (item) => {
    // Close mobile drawer if open
    if (mobileOpen) setMobileOpen(false);

    switch (item) {
      case 'Exportar Dados':
        exportStoredVehicles();
        break;
      case 'Resetar Contagem':
        handleReset();
        break;
      case 'Importar Arquivo':
        handleFileUpload();
        break;
      default:
        break;
    }
  };

  async function handleFileUpload(event){
    const file = event.target.files[0];
    if(!file){
      return;
    }
    setLoading(true);
    try {
      const result = await readFile(file);
      props.onLoadRecords(result);
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      alert('Erro ao carregar arquivo');
    } finally {
      setLoading(false);
    }
  }

  function handleReset(){
    if (typeof props.onResetRequest === 'function') {
      props.onResetRequest();
    }
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Image src={logo} width={70} alt='logo'/>
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => handleNavClick(item)}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar component="nav" position='static' sx={{backgroundColor : '#22423A'}}>
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
              <Image src={logo} width={70} alt='logo'/>
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {navItems.map((item) => (
                item === 'Importar Arquivo' ? (
                  <React.Fragment key={item}>
                    <Button sx={{ color: '#fff' }} onClick={() => fileInputRef.current?.click()}>
                      {item}
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </React.Fragment>
                ) : (
                  <Button key={item} sx={{ color: '#fff' }} onClick={() => handleNavClick(item)}>
                    {item}
                  </Button>
                )
              ))}
            </Box>
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
