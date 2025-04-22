import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSchedulingFilter } from "../../../../config/store";
import { Box } from '@mui/material';

export const SchedulingButtons = props => {
  const dispatch = useDispatch();
  const { schedule } = props;
  
  const handleScheduledChange = (e, isScheduled) => {
    e.preventDefault();
    if (schedule.includes(isScheduled)) {
      const index = schedule.indexOf(isScheduled);
      const updatedSchedule = [...schedule];
      updatedSchedule.splice(index, 1);
      dispatch(setSchedulingFilter(updatedSchedule));
    } else {
      const updatedSchedule = [...schedule, isScheduled];
      dispatch(setSchedulingFilter(updatedSchedule));
    }
  };
  
  return (
    <Box sx={{ 
      display: 'inline-flex', 
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <Box
        component="span"
        key={"status-Scheduled"}
        className={"sort-filters " + (schedule.includes(true) ? " active" : "")}
        onClick={(e) => handleScheduledChange(e, true)}
        sx={{
          display: 'inline-block',
          padding: '4px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: schedule.includes(true) ? '#1976d2' : 'transparent',
          color: 'inherit',
          '&:hover': {
            backgroundColor: schedule.includes(true) ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        Scheduled
      </Box>
      <Box
        component="span"
        key={"status-Unscheduled"}
        className={"sort-filters " + (schedule.includes(false) ? " active" : "")}
        onClick={(e) => handleScheduledChange(e, false)}
        sx={{
          display: 'inline-block',
          padding: '4px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          backgroundColor: schedule.includes(false) ? '#1976d2' : 'transparent',
          color: 'inherit',
          '&:hover': {
            backgroundColor: schedule.includes(false) ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        Unscheduled
      </Box>
    </Box>
  );
};

const SchedulingButtonsContainer = () => {
  const schedulingFilter = useSelector(state => state.ticketTablePreferences.schedulingFilter || []);
  
  return (
    <SchedulingButtons
      schedule={schedulingFilter}
    />
  );
};

export default SchedulingButtonsContainer;
