"use client";
import { useEffect, useState } from "react";
import { Alert, Stack, Collapse } from "@mui/material";

export default function Toaster({ message, type = "info", onReset }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setOpen(false);
      const openTimer = setTimeout(() => setOpen(true), 100);

      let closeTimer;
      if (type === "success") {
        closeTimer = setTimeout(() => {
          setOpen(false);
          onReset?.();
        }, 2000);
      }

      return () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [message, type, onReset]);

  function handleClose() {
    setOpen(false);
    onReset?.();
  }

  return (
    <Stack sx={{ width: "100%", position: "fixed", top: 20, left: 0, zIndex: 9999, alignItems: "center", }} spacing={2}>
      <Collapse in={open}>
        <Alert severity={type} onClose={handleClose}>
          {message}
        </Alert>
      </Collapse>
    </Stack>
  );
}
