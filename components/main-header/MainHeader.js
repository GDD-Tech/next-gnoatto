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
import Switch from '@mui/material/Switch';
import Image from 'next/image';
import logo from '@/assets/logo.jpg'
import { readProjectFolder } from "../../utils/projectReader";
import FullScreenSpinner from '../utility/FullScreenSpinner';
import { UploadFile, LightMode, DarkMode } from '@mui/icons-material';

const drawerWidth = 240;

function MainHeader(props) {
  // props.darkMode: boolean
  // props.onToggleDarkMode: () => void
  const { window: muiWindow } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const projectInputRef = React.useRef(null);

  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

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

  // ─── Drawer ───────────────────────────────────────────────────────────────

  const drawer = (
    <Box onClick={(e) => { if (e.target.closest('.dark-mode-toggle')) return; handleDrawerToggle(); }} sx={{ textAlign: 'center' }}>
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
        <ListItem disablePadding>
          <ListItemButton className="dark-mode-toggle" sx={{ justifyContent: 'center', gap: 1 }} onClick={props.onToggleDarkMode}>
            <LightMode fontSize="small" />
            <Switch checked={!!props.darkMode} size="small" onChange={props.onToggleDarkMode} onClick={e => e.stopPropagation()} />
            <DarkMode fontSize="small" />
          </ListItemButton>
        </ListItem>
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
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button sx={{ color: '#fff' }} startIcon={<UploadFile />} onClick={handleImportProject}>
                Importar Projeto
              </Button>
              <LightMode sx={{ color: '#fff', fontSize: 18, opacity: 0.85 }} />
              <Switch
                checked={!!props.darkMode}
                onChange={props.onToggleDarkMode}
                size="small"
                sx={{ '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.35)' } }}
              />
              <DarkMode sx={{ color: '#fff', fontSize: 18, opacity: 0.85 }} />
            </Box>

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
    </>
  );
}

MainHeader.propTypes = {
  window: PropTypes.func,
};

export default MainHeader;
