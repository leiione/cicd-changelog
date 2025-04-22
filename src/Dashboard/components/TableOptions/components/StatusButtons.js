import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Menu, MenuItem } from '@mui/material';
import { setStatusFilter } from "../../../../config/store";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DoneIcon from '@mui/icons-material/Done';

// Define all available status values
const statuses = ["All", "Open", "Pending", "Resolved", "Others"];
// Define sub-statuses for the "Others" dropdown
const otherStatuses = ["Others", "Queued", "Reopened"];

const StatusButtons = () => {
  const dispatch = useDispatch();
  const status = useSelector(state => state.ticketTablePreferences.statusFilter || []);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Check if any other status is selected to determine if "Others" should be highlighted
  const isAnyOtherStatusSelected = otherStatuses.some(s => status.includes(s));
  const isOthersSelected = status.includes('Others') || isAnyOtherStatusSelected || status.includes('All');
  
  const handleOthersClick = (event) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSubStatusChange = (e, subStatusValue) => {
    e.preventDefault();
    
    let updatedStatus = [...status];
    let showAll = false;
    
    if (status.includes(subStatusValue)) {
      // Remove ONLY the status that was clicked
      updatedStatus = updatedStatus.filter(item => item !== subStatusValue);
      
      // Always remove 'All' if any status is deselected
      updatedStatus = updatedStatus.filter(item => item !== 'All');
    } else {
      // Add the status if it's not already selected
      updatedStatus.push(subStatusValue);
      
      // Check if all statuses are now selected
      const allIndividualStatuses = [...statuses.filter(s => s !== 'All'), ...otherStatuses];
      if (allIndividualStatuses.every(s => updatedStatus.includes(s) || s === 'Others')) {
        if (!updatedStatus.includes('All')) {
          updatedStatus.push('All');
          showAll = true;
        }
      }
    }
    
    dispatch(setStatusFilter(updatedStatus, showAll));
  };

  const handleStatusChange = (e, statusValue) => {
    e.preventDefault();
    
    let updatedStatus = [...status];
    let showAll = false;
    
    // Handle 'All' button logic
    if (statusValue === 'All') {
      if (!status.includes('All')) {
        // Select all statuses including the sub-statuses
        updatedStatus = [...statuses, ...otherStatuses];
        showAll = true;
      } else {
        updatedStatus = [];
      }
    } else if (statusValue === 'Others') {
      if (status.includes('Others') || isAnyOtherStatusSelected) {
        // If Others or any sub-status is selected, remove them all
        updatedStatus = updatedStatus.filter(item => !['Others', ...otherStatuses].includes(item));
        // Also remove 'All' if it was selected
        updatedStatus = updatedStatus.filter(item => item !== 'All');
      } else {
        // Add Others and all sub-statuses
        updatedStatus.push('Others');
        otherStatuses.forEach(s => {
          if (!updatedStatus.includes(s)) {
            updatedStatus.push(s);
          }
        });
        
        // Check if all statuses are now selected
        const allIndividualStatuses = statuses.filter(s => s !== 'All');
        const selectedIndividualStatuses = updatedStatus.filter(s => s !== 'All');
        
        if (allIndividualStatuses.every(s => selectedIndividualStatuses.includes(s))) {
          if (!updatedStatus.includes('All')) {
            updatedStatus.push('All');
            showAll = true;
          }
        }
      }
    } else {
      if (status.includes(statusValue)) {
        // Remove the status if it's already selected
        updatedStatus = updatedStatus.filter(item => item !== statusValue);
        // Also remove 'All' if it was selected
        updatedStatus = updatedStatus.filter(item => item !== 'All');
      } else {
        // Add the status if it's not already selected
        updatedStatus.push(statusValue);
        
        // Check if all individual statuses are selected (except 'All')
        const allIndividualStatuses = [...statuses.filter(s => s !== 'All'), ...otherStatuses];
        const selectedIndividualStatuses = updatedStatus.filter(s => s !== 'All');
        
        // If all individual statuses are selected, also select 'All'
        if (allIndividualStatuses.every(s => selectedIndividualStatuses.includes(s) || (s === 'Others' && otherStatuses.every(os => selectedIndividualStatuses.includes(os))))) {
          if (!updatedStatus.includes('All')) {
            updatedStatus.push('All');
            showAll = true;
          }
        }
      }
    }
    
    dispatch(setStatusFilter(updatedStatus, showAll));
  };

  // Insert a global style to override any potential CSS class conflicts
  React.useEffect(() => {
    // Create a style element to override any .sort-filters styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .sort-filters:last-child {
        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box sx={{ 
      display: 'inline-flex',
      borderLeft: 'none',
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0',
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px',
      overflow: 'hidden',
      height: '30px',
    }}>
      {statuses.map((statusText, index) => (
        <Box
          component="span"
          key={`status-${statusText}`}
          className={`sort-filters ${(statusText === 'Others' ? isOthersSelected : status.includes(statusText)) ? " active" : ""}`}
          onClick={(e) => {
            if (statusText === 'Others') {
              handleOthersClick(e);
            } else {
              handleStatusChange(e, statusText);
            }
          }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 12px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            borderRight: index < statuses.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            backgroundColor: (statusText === 'Others' ? isOthersSelected : status.includes(statusText)) ? '#1976d2' : 'transparent',
            color: 'inherit',
            borderRadius: '0',
            borderTopLeftRadius: index === 0 ? '0 !important' : '0',
            borderBottomLeftRadius: index === 0 ? '0 !important' : '0',
            borderTopRightRadius: index === statuses.length - 1 ? '4px !important' : '0',
            borderBottomRightRadius: index === statuses.length - 1 ? '4px !important' : '0',
            height: '100%',
            '&:hover': {
              backgroundColor: (statusText === 'Others' ? isOthersSelected : status.includes(statusText)) ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {statusText}
          {statusText === 'Others' && (
            <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5, width: 16, height: 16 }} />
          )}
        </Box>
      ))}
      
      {/* Dropdown menu for "Others" button */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: '140px',
            width: 'auto',
            boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
          }
        }}
      >
        {otherStatuses.map((subStatus) => (
          <MenuItem 
            key={subStatus} 
            onClick={(e) => handleSubStatusChange(e, subStatus)}
            sx={{
              fontSize: '1rem',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              paddingLeft: '24px',
              position: 'relative'
            }}
          >
            {status.includes(subStatus) && (
              <Box
                component="span"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginRight: '25px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <DoneIcon fontSize="small" />
              </Box>
            )}
            {subStatus}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default StatusButtons;
