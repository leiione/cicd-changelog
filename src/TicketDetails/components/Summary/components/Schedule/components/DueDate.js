import React, { useEffect, useState, useCallback } from "react";
import { Typography, Popover, Button, Divider, Box } from "@mui/material";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import moment from "moment-timezone";
import dayjs from "dayjs";
import DialogAlert from "components/DialogAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/pro-regular-svg-icons";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Custom CSS to ensure the calendar displays correctly
const calendarStyles = {
  '& .rdp': {
    margin: '0',
  },
  '& .rdp-months': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .rdp-month': {
    margin: '0',
  },
  '& .rdp-caption': {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#1976d2',
    padding: '0 0 8px 0',
    textAlign: 'center',
  },
  '& .rdp-nav': {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  '& .rdp-head': {
    marginTop: '8px',
  },
  '& .rdp-cell': {
    width: '36px',
    height: '36px',
    padding: '0',
  },
  '& .rdp-button': {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    margin: '0',
    padding: '0',
  },
  '& .rdp-day_selected': {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  '& .rdp-day_today': {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  '& .rdp-day:hover:not(.rdp-day_selected)': {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
};

// Helper function to check if a date is in the past
const isDateInPast = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

const DueDate = (props) => {
  const { ticket, updateTicket, hasDueDate, setHasDueDate } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [tempDate, setTempDate] = useState(null);
  const [openPrompt, togglePrompt] = useState(false);
  
  // State for immediate UI feedback before server response
  const [localDueDate, setLocalDueDate] = useState(ticket?.due_by_date);
  
  // Initialize selected day state
  const [selectedDay, setSelectedDay] = useState(
    ticket?.due_by_date ? new Date(ticket.due_by_date) : undefined
  );

  // Synchronize states with ticket changes from server
  useEffect(() => {
    if (ticket) {
      setLocalDueDate(ticket.due_by_date);
      setSelectedDay(ticket.due_by_date ? new Date(ticket.due_by_date) : undefined);
    }
  }, [ticket, ticket?.due_by_date]);
  
  // Handle opening the date picker
  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Handle closing the date picker
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Handle saving the date to the ticket
  const saveDate = useCallback((date) => {
    if (!date || !ticket || !ticket.ticket_id) return;
    
    // Format date as YYYY-MM-DD
    const formattedDate = moment(date).format("YYYY-MM-DD");
    
    // Update local UI state immediately for instant feedback
    setLocalDueDate(formattedDate);
    setSelectedDay(date);
    
    // Send update to server
    updateTicket({
      ticket_id: ticket.ticket_id,
      due_by_date: formattedDate,
    });
    
    if (!hasDueDate) setHasDueDate(true);
    handleClose();
  }, [ticket, updateTicket, hasDueDate, setHasDueDate, handleClose, setLocalDueDate, setSelectedDay]);

  // When a day is selected in the calendar
  const handleDaySelect = useCallback((day) => {
    if (!day) return;
    
    // Check if date is in past (strictly before today)
    if (isDateInPast(day)) {
      // For past dates, show confirmation dialog
      togglePrompt(true);
      setTempDate(day);
    } else {
      // For today and future dates, save directly
      saveDate(day);
    }
  }, [saveDate]);

  // Handle confirming past date selection
  const handleConfirmPastDate = useCallback(() => {
    saveDate(tempDate);
    togglePrompt(false);
    setTempDate(null);
  }, [tempDate, saveDate, togglePrompt]);

  // Handle rejecting past date selection
  const handleRejectPastDate = useCallback(() => {
    setTempDate(null);
    togglePrompt(false);
  }, [togglePrompt]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Format displayed date - using local state for immediate UI updates
  const dueDate = !localDueDate
    ? "Select a date"
    : moment(localDueDate, "YYYY-MM-DD").format("MMM DD, YYYY");
  
  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick} className="pointer">
        <FontAwesomeIcon
          icon={faCalendarDay}
          className="fa-fw text-muted f-16 mr-2"
        />
        Due Date:
        <Typography
          variant="subtitle1"
          component="span"
          className="primary-on-hover d-inline-block ml-2"
        >
          {dueDate}
        </Typography>
      </Typography>
      
      {open && (
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={calendarStyles} style={{ padding: '8px' }}>
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDaySelect}
              showOutsideDays
              fixedWeeks
              defaultMonth={new Date()}
            />
          </Box>
          <Divider />
          <div className="text-right p-2">
            <Button color="default" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Popover>
      )}
      
      {openPrompt && (
        <DialogAlert
          open={openPrompt}
          message={<span>Are you sure you want to set this in the past date?</span>}
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              onClick: handleConfirmPastDate,
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: handleRejectPastDate,
            },
          ]}
        />
      )}
    </>
  );
};

export default React.memo(DueDate);
