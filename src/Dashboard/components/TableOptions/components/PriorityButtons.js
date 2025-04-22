import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from '@mui/material';
import { setPriorityFilter } from "../../../../config/store";

// Define all available priority values
const priorities = ["High", "Normal", "Low"];

const PriorityButtons = () => {
  const dispatch = useDispatch();
  const priority = useSelector(state => state.ticketTablePreferences.priorityFilter || []);

  const handlePriorityChange = (e, priorityValue) => {
    e.preventDefault();
    
    let updatedPriority = [...priority];
    
    if (updatedPriority.includes(priorityValue)) {
      // Remove the priority if it's already selected
      updatedPriority = updatedPriority.filter(item => item !== priorityValue);
    } else {
      // Add the priority if it's not already selected
      updatedPriority.push(priorityValue);
    }
    
    dispatch(setPriorityFilter(updatedPriority));
  };

  return (
    <Box sx={{ 
      display: 'inline-flex', 
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {priorities.map((priorityText, index) => (
        <Box
          component="span"
          key={`priority-${priorityText}`}
          className={`sort-filters ${priority.includes(priorityText) ? " active" : ""}`}
          onClick={(e) => handlePriorityChange(e, priorityText)}
          sx={{
            display: 'inline-block',
            padding: '4px 12px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderRight: index < priorities.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            backgroundColor: priority.includes(priorityText) ? '#1976d2' : 'transparent',
            color: 'inherit',
            '&:hover': {
              backgroundColor: priority.includes(priorityText) ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {priorityText}
        </Box>
      ))}
    </Box>
  );
};

export default PriorityButtons;