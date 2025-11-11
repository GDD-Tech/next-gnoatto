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

const drawerWidth = 240;
const navItems = ['Importar Arquivo', 'Exportar Dados'];

function MainHeader(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const exportStoredVehicles = () => {
    try {
      const raw = localStorage.getItem('vehicleList');
      if (!raw) {
        alert('Nenhum registro para exportar');
        return;
      }
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        alert('Nenhum registro para exportar');
        return;
      }

      const headers = ['Categoria','Direção','De Para','Eixos Erguidos','Tipo','Track Id','Horario','Data'];
      const rows = list.map((v) => {
        return [
          v.category ?? '',
          v.direction ?? '',
          v.fromTo ?? v.from_to ?? '',
          v.raisedAxles ?? v.raised_axles ?? '',
          v.type ?? '',
          v.trackId ?? v.track_id ?? '',
          v.time ?? '',
          v.date ?? '',
        ];
      });

      const csv = [headers.join(',')]
        .concat(rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')))
        .join('\n');

      // Prepend UTF-8 BOM so Excel on Windows recognizes accents/cedilla correctly
      const csvWithBOM = '\uFEFF' + csv;

      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `vehicle_list_${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Erro ao exportar dados');
    }
  };

  const handleNavClick = (item) => {
    // Close mobile drawer if open
    if (mobileOpen) setMobileOpen(false);

    switch (item) {
      case 'Exportar Dados':
        exportStoredVehicles();
        break;
      case 'Importar Arquivo':
        handleFileUpload();
      default:
        break;
    }
  };

  async function handleFileUpload(event){
    const file = event.target.files[0];
    if(!file){
      return;
    }
    const result = await readFile(file);
    props.onLoadRecords(result);
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
