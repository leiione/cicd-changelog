import React from 'react';
import { Snackbar, Alert } from "@mui/material"
import { hideSnackbar } from 'config/store';
import { useDispatch, useSelector } from 'react-redux';

const GlobalSnackbar = (props) => {
  const dispatch = useDispatch()
  const snackbar = useSelector((state) => state.snackbar);
  const { open, severity, message, duration } = snackbar

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      open={open}
      autoHideDuration={duration || 4000}
      onClose={() => dispatch(hideSnackbar())}
    >
      <Alert
        elevation={6}
        variant="filled"
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default React.memo(GlobalSnackbar)