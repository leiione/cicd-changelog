import React, { useEffect, useState } from "react";
import { Typography, Popover, Button, Divider } from "@mui/material";
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

// Helper function to parse date string to Date object
const parseToDate = (dateStr) => {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch (e) {
    console.error("Error parsing date:", e);
    return new Date();
  }
};

const DueDate = (props) => {
  const { ticket, updateTicket, hasDueDate, setHasDueDate } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [tempDate, setTempDate] = useState(null);
  const [dueDateDisplay, setDueDateDisplay] = useState(ticket.due_by_date);
  const [openPrompt, togglePrompt] = useState(false);
  
  // Convert to a Date object for react-day-picker
  const [selectedDay, setSelectedDay] = useState(() => 
    parseToDate(ticket.due_by_date)
  );

  // Sync state when ticket changes
  useEffect(() => {
    if (ticket && ticket.due_by_date) {
      setDueDateDisplay(ticket.due_by_date);
      setSelectedDay(parseToDate(ticket.due_by_date));
    }
  }, [ticket, ticket.due_by_date]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle saving the date to the ticket
  const saveDate = (date) => {
    if (!date || !ticket || !ticket.ticket_id) return;
    
    // Format date as YYYY-MM-DD
    const formattedDate = moment(date).format("YYYY-MM-DD");
    
    // Update UI
    setDueDateDisplay(formattedDate);
    setSelectedDay(date);
    
    // Send update to server
    updateTicket({
      ticket_id: ticket.ticket_id,
      due_by_date: formattedDate,
    });
    
    if (!hasDueDate) setHasDueDate(true);
    handleClose();
  };

  // When a day is selected in the calendar
  const handleDaySelect = (day) => {
    if (!day) return;
    
    // Check if selected date is in the past
    const isBeforeDate = moment(day).isBefore(new Date(), "day");
    
    if (isBeforeDate) {
      // For past dates, show confirmation
      togglePrompt(true);
      setTempDate(day);
    } else {
      // For future dates, save directly
      saveDate(day);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Format displayed date
  const dueDate = !dueDateDisplay
    ? "Select a date"
    : moment(dueDateDisplay, "YYYY-MM-DD").format("MMM DD, YYYY");
  
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
          <div style={{ padding: '8px' }}>
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDaySelect}
              // modifiersStyles={dayPickerStyles}
              showOutsideDays
              fixedWeeks
            />
          </div>
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
              onClick: () => {
                saveDate(tempDate);
                togglePrompt(false);
                setTempDate(null);
              },
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: () => {
                setTempDate(null);
                togglePrompt(false);
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default React.memo(DueDate);
