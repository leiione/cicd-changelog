import React from 'react';
import { Skeleton } from '@mui/material';

const TicketLoader = ({ count = 10 }) => {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width="100%"
          height={45}
          sx={{ borderRadius: 2, mb: 2 }}
        />
      ))}
    </>
  );
};

export default TicketLoader;