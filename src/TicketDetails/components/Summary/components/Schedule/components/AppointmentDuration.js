import React, { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { Typography, Popover, Button, Divider, TextField } from "@mui/material";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/pro-regular-svg-icons";

const AppointmentDuration = (props) => {
  const { ticket, updateTicket } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [error, setError] = React.useState(""); // State to track error messages

  // Convert minutes to HH:mm format
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return dayjs().hour(hours).minute(mins); // Create a dayjs object
  };

  // Separate state for what is displayed in the field and popover
  const [displayDuration, setDisplayDuration] = React.useState(
    ticket.max_duration !== undefined
      ? convertMinutesToTime(ticket.max_duration)
      : dayjs().hour(1).minute(0) // Default to 1 hour (01:00)
  );

  const [tempMaxDuration, setTempMaxDuration] = React.useState(
    ticket.max_duration !== undefined
      ? convertMinutesToTime(ticket.max_duration)
      : dayjs().hour(1).minute(0) // Default to 1 hour (01:00)
  );

  useEffect(() => {
    if (ticket.max_duration !== undefined) {
      const convertedTime = convertMinutesToTime(ticket.max_duration);
      setDisplayDuration(convertedTime); // Update both displayed and temp durations
      setTempMaxDuration(convertedTime);
    }
  }, [ticket.max_duration]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setError(""); // Reset the error when closing the popover
  };

  const onSaveDuration = () => {
    // Check if the selected time is 00:00
    if (tempMaxDuration.hour() === 0 && tempMaxDuration.minute() === 0) {
      setError("Appointment Duration cannot be 00:00"); // Set error message if time is 00:00
      return; // Prevent saving
    }

    // Calculate the total minutes when saving
    const totalMinutes = tempMaxDuration.hour() * 60 + tempMaxDuration.minute();
    updateTicket({ ticket_id: ticket.ticket_id, max_duration: totalMinutes }); // Pass total minutes

    setDisplayDuration(tempMaxDuration); // Only update the displayed duration when saved
    handleClose();
  };

  const handleTimeChange = (newTime) => {
    setTempMaxDuration(newTime); // Keep it as dayjs object
    setError(""); // Clear error on valid time selection
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Ensure durationDisplay shows "01:00" by default
  const durationDisplay = displayDuration.isValid()
    ? displayDuration.hour() === 0 && displayDuration.minute() === 0
      ? "01:00" // Default to "01:00" if both hour and minute are zero
      : displayDuration.format("HH:mm") // Show "HH:mm" format otherwise
    : "Select a duration";

  return (
    <>
      <div
        onClick={handleClick}
        className="pointer"
        style={{ display: "flex", alignItems: "center" }}
      >
        <FontAwesomeIcon
          icon={faCalendarDay}
          className=" fa-fw text-muted f-16 mr-2"
        />
        <Typography variant="subtitle1">
          Appointment Duration:
          <Typography
            variant="subtitle1"
            className={`primary-on-hover d-inline-block ml-2`}
          >
            {durationDisplay}
          </Typography>
        </Typography>
      </div>
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
      
        <div style={{ padding: "10px 20px" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopTimePicker
              value={tempMaxDuration}
              onChange={handleTimeChange}
              ampm={false} // Use 24-hour format
              views={["hours", "minutes"]} // Only allow selecting hours and minutes
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(error)} // Pass error state
                  helperText={error || params.helperText} // Display error message or default helper text
                />
              )}
              defaultValue={dayjs().hour(1).minute(0)} // Set default time to 01:00
            />
          </LocalizationProvider>
          {error && (
            <Typography color="error" variant="body2" style={{ marginTop: 8 }}>
              {error}
            </Typography>
          )}
        </div>
        <Divider />
        <div className="text-right">
          <Button color="primary" onClick={onSaveDuration}>
            Save
          </Button>
          <Button color="default" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default React.memo(AppointmentDuration);
