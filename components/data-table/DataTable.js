"use client";
import React, { useEffect, useState, useMemo } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { Box, Checkbox, FormControlLabel } from "@mui/material";

export default function DataTable({ vehicleList = [], onDelete, onDeleteAll, openResetDialog = false, onResetDialogOpened }) {

    const getLastTen = (arr) => {
        if (!arr || !Array.isArray(arr)) return [];
        const last = arr.length > 10 ? arr.slice(-10) : arr.slice();
        return last.reverse();
    };

  const [rows, setRows] = useState(getLastTen(vehicleList));

  useEffect(() => {
    setRows(getLastTen(vehicleList));
  }, [vehicleList]);

  const handleDelete = (row) => {
    closeConfirmSingle();
    const key = row.id ?? row.trackId ?? row._id ?? row.index;
    const newRows = rows.filter((r) => {
      const rKey = r.id ?? r.trackId ?? r._id ?? r.index;
      return rKey !== key;
    });
    setRows(newRows);
    if (typeof onDelete === "function") onDelete(row);
  };

    // Delete all confirmation dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);
    const [confirmSingleOpen, setConfirmSingleOpen] = useState(false);
    const [confirmAllChecked, setConfirmAllChecked] = useState(false);

    const closeConfirm = () => {
        setConfirmOpen(false);
        setConfirmAllChecked(false);
    };

    const openConfirmSingle = (row) => {
        setDeleteRow(row);
        setConfirmSingleOpen(true);
    };
    
    const closeConfirmSingle = () => {
        setDeleteRow(null);
        setConfirmSingleOpen(false);
    };

    const handleConfirmDeleteAll = () => {
        // Prefer explicit onDeleteAll from parent
        if (typeof onDeleteAll === "function") {
            try {
                onDeleteAll(rows);
            } catch (e) {
                console.error("onDeleteAll error", e);
            }
        } else if (typeof onDelete === "function") {
            // Fallback: call onDelete for each row
            rows.forEach((r) => {
                try {
                    onDelete(r);
                } catch (e) {
                    console.error("onDelete error", e);
                }
            });
        }

        // Clear local rows view
        setRows([]);
        setConfirmAllChecked(false);
        closeConfirm();
    };

    // If parent requests to open the reset confirmation dialog, open it and notify parent
    useEffect(() => {
        if (openResetDialog) {
            setConfirmAllChecked(false);
            setConfirmOpen(true);
            if (typeof onResetDialogOpened === "function") {
                try {
                    onResetDialogOpened();
                } catch (e) {
                    console.error("onResetDialogOpened error", e);
                }
            }
        }
    }, [openResetDialog, onResetDialogOpened]);

    const handleConfirmAllChange = (event) => {
        setConfirmAllChecked(!!event.target.checked);
    };

  // Compute counts per type from the full vehicleList (not only the last 10)
  const typeCounts = useMemo(() => {
    const counts = {};
    (vehicleList || []).forEach((v) => {
      const t = v.type ?? "-";
      counts[t] = (counts[t] || 0) + 1;
    });
    // Return as array of { type, count } sorted by count desc
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [vehicleList]);

  return (
    <>
        {/* Summary table: type -> count and delete-all action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100vw'}}>
            <Box sx={{ m: 3, width: '100%'}}>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Id</strong></TableCell>
                                <TableCell><strong>Direção</strong></TableCell>
                                <TableCell><strong>Tipo</strong></TableCell>
                                <TableCell><strong>Eixos Erguidos</strong></TableCell>
                                <TableCell align="center"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                        Nenhum registro
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((v, idx) => {
                                const key = v.id ?? v.track_id ?? v._id ?? idx;
                                return (
                                    <TableRow key={key} hover>
                                        <TableCell>{v.trackId ?? "-"}</TableCell>
                                        <TableCell>{v.fromTo ?? v.from_to ?? "-"}</TableCell>
                                        <TableCell>{v.type ?? "-"}</TableCell>
                                        <TableCell>{v.raisedAxles ?? v.raised_axles ?? "-"}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => openConfirmSingle(v)}
                                            aria-label="excluir"
                                            >
                                            <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', m: 3 }}>
                <Box sx={{ minWidth: 300 }}>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell align="right"><strong>Contagem</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {typeCounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            <Typography variant="body2" color="textSecondary">Nenhum tipo</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    typeCounts.map((t) => (
                                        <TableRow key={t.type} hover>
                                            <TableCell>{t.type}</TableCell>
                                            <TableCell align="center">{t.count}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
        {/* Confirmation dialog for deleting all records */}
        <Dialog open={confirmOpen} onClose={closeConfirm}>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir todos os registros exibidos? Esta ação não pode ser desfeita.
                    </DialogContentText>
                    <FormControlLabel
                        control={<Checkbox checked={confirmAllChecked} onChange={handleConfirmAllChange} />}
                        label="Confirmo que quero excluir todos os dados."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancelar</Button>
                    <Button color="error" onClick={handleConfirmDeleteAll} disabled={!confirmAllChecked}>
                        Excluir todos
                    </Button>
                </DialogActions>
        </Dialog>

        {/* Confirmation dialog for deleting single record */}
        <Dialog open={confirmSingleOpen} onClose={closeConfirmSingle}>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeConfirmSingle}>Cancelar</Button>
                <Button color="error" onClick={() => deleteRow && handleDelete(deleteRow)} autoFocus>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    </>
  );
}
