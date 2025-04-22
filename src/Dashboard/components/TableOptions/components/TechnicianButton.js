import React, { useState, useEffect } from 'react';
import { Box, Menu, MenuItem, ListItemText } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setTechnicianFilter } from '../../../../config/store';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TechnicianButton = ({ appuserTechnicians, loading }) => {
  const dispatch = useDispatch();
  const selectedTechnicianId = useSelector(state => state.ticketTablePreferences.technicianId);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedValue, setSelectedValue] = useState(selectedTechnicianId);
  
  useEffect(() => {
    setSelectedValue(selectedTechnicianId);
  }, [selectedTechnicianId]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (technicianId) => {
    setSelectedValue(technicianId);
    dispatch(setTechnicianFilter(technicianId));
    handleClose();
  };

  // Find the currently selected technician
  const selectedTechnician = selectedValue === null 
    ? { realname: "All Technicians" }
    : selectedValue === 0 
      ? { realname: "Unassigned" }
      : appuserTechnicians?.find(tech => tech.appuser_id === selectedValue) || { realname: "All Technicians" };

  // Format display name based on selection
  const getButtonContent = () => {
    if (selectedValue === 0) {
      return (
        <>
          <FilterListIcon style={{ fontSize: 14, marginRight: 2 }} />
          Unassigned
          <ExpandMoreIcon style={{ fontSize: 14, marginLeft: 2 }} />
        </>
      );
    }
    
    if (selectedValue === null) {
      return (
        <>
          <FilterListIcon style={{ fontSize: 14, marginRight: 2 }} />
          All
          <span className="d-none d-sm-inline"> Technicians</span>
          <ExpandMoreIcon style={{ fontSize: 14, marginLeft: 2 }} />
        </>
      );
    }
    
    return (
      <>
        <FilterListIcon style={{ fontSize: 14, marginRight: 2 }} />
        {selectedTechnician.realname}
        <ExpandMoreIcon style={{ fontSize: 14, marginLeft: 2 }} />
      </>
    );
  };

  return (
    <>
      <Box
        component="span"
        className={`sort-filters ${selectedValue !== null ? "active" : ""}`}
        onClick={handleClick}
        sx={{
          display: 'inline-block',
          padding: '4px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          backgroundColor: selectedValue !== null ? '#1976d2' : 'transparent',
          color: 'inherit',
          borderTopLeftRadius: '4px',
          borderBottomLeftRadius: '4px',
          borderTopRightRadius: '0',
          borderBottomRightRadius: '0',
          borderRight: 'none!important',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          boxSizing: 'border-box',
          minWidth: '140px',
          whiteSpace: 'nowrap',
          height: '30px',
          '&:hover': {
            backgroundColor: selectedValue !== null ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        {getButtonContent()}
      </Box>
      <Menu
        id="technician-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 300
          }
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick(null)}>
          <ListItemText primary="All Technicians" />
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(0)}>
          <ListItemText primary="Unassigned" />
        </MenuItem>
        {appuserTechnicians?.map((technician) => (
          <MenuItem 
            key={technician.appuser_id} 
            onClick={() => handleMenuItemClick(technician.appuser_id)}
          >
            <ListItemText primary={technician.realname} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TechnicianButton;
