import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
      p={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" style={{ marginTop: 16 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loader;
