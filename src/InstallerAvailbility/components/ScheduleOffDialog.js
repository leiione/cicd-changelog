import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  IconButton,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from '@apollo/client';
import { GET_INSTALLER_SCHEDULE_OFF } from '../InstallerGraphQL';
import DataGridTable from "Common/DataGridTable";

const ScheduledOffDialog = ({ open, onClose, scheduledOffData }) => {

  const ref = useRef(null);

  const { data, loading } = useQuery(GET_INSTALLER_SCHEDULE_OFF, {
    variables: { userId: scheduledOffData?.user_id },
    skip: !scheduledOffData?.user_id
  });

  if (!scheduledOffData) return null;


  const columns = [
    { field: 'date', headerName: 'Date', flex: 2 },
    { field: 'time', headerName: 'Time', flex: 1.5 },
    { field: 'reason', headerName: 'Reason', flex: 1 }
  ];

  const rows = data?.getInstallerScheduleOff?.map((item, index) => ({
    id: index, // Using index as id since user_id is same for all rows
    date: item.date,
    time: item.time || 'All Day',
    reason: item.reason || 'None'
  })) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs="auto">
            <Typography variant="h6">Scheduled Off</Typography>
          </Grid>
          <Grid item xs="auto">
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: '400px', overflow: 'auto' }}>
          <DataGridTable
            containerHeight={ref.current ? ref.current.clientHeight : 300}
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick={true}
          />
        </Box>

      </DialogContent>
    </Dialog>
  );
};

export default ScheduledOffDialog;