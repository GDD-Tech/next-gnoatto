import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import VehicleItemList from "../video-player/VehicleItemList";
import { getVehicleData } from "@/utils/staticVehicles";

export default function NewVehicleModal({ isOpen = false, onClose = () => {}, handleVehicleClick = () => {}, handleDirection = () => {}, leftDirection = '', rightDirection = ''}) {
    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <Typography variant="h6" sx={{ color: '#22423A', fontWeight: 'bold' }}>Painel de Veiculos</Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 1, maxWidth: '90vw' }}>
                    <div className='gno-flex-column'>
                        <VehicleItemList vehicleList={getVehicleData('passeio')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Passeio'} left={leftDirection} right={rightDirection} isNew={true} />
                        <VehicleItemList vehicleList={getVehicleData('onibus')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Onibus'} left={leftDirection} right={rightDirection} isNew={true} />
                        <VehicleItemList vehicleList={getVehicleData('caminhao')} onVehicleClick={handleVehicleClick} onHandleDirection={handleDirection} label={'Caminhão'} left={leftDirection} right={rightDirection} isNew={true} />
                    </div>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}