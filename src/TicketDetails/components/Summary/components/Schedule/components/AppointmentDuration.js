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

  // Convert minutes to HH:mm format
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return dayjs().hour(hours).minute(mins); // Create a dayjs object
  };

  // Initialize tempMaxDuration with 01:00 as default
  const [tempMaxDuration, setMaxDuration] = React.useState(
    ticket.max_duration !== undefined
      ? convertMinutesToTime(ticket.max_duration)
      : dayjs().hour(1).minute(0) // Default to 1 hour (01:00)
  );

  useEffect(() => {
    if (ticket.max_duration !== undefined) {
      setMaxDuration(convertMinutesToTime(ticket.max_duration)); // Convert minutes to HH:mm
    }
  }, [ticket.max_duration]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSaveDuration = () => {
    // Calculate the total minutes when saving
    const totalMinutes = tempMaxDuration.hour() * 60 + tempMaxDuration.minute();
    updateTicket({ ticket_id: ticket.ticket_id, max_duration: totalMinutes }); // Pass total minutes
    handleClose();
  };

  const handleTimeChange = (newTime) => {
    setMaxDuration(newTime); // Keep it as dayjs object
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Ensure durationDisplay shows "01:00" by default
  const durationDisplay = tempMaxDuration.isValid()
    ? tempMaxDuration.hour() === 0 && tempMaxDuration.minute() === 0
      ? "01:00" // Default to "01:00" if both hour and minute are zero
      : tempMaxDuration.format("HH:mm") // Show "HH:mm" format otherwise
    : "Select a duration";

  return (
    <>
      <div
        onClick={handleClick}
        className="pointer"
        style={{ display: "flex", alignItems: "center" }}
      >
        <FontAwesomeIcon icon={faCalendarDay} className=" fa-fw text-muted f-18 mr-2" />
        <Typography variant="subtitle1">
          Appointment Duration
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
              renderInput={(params) => <TextField {...params} />} // Render the input field normally
              defaultValue={dayjs().hour(1).minute(0)} // Set default time to 01:00
              slots={{
                actionBar: () => null, // Removes the OK button by setting the action bar to null
              }}
            />
          </LocalizationProvider>
        </div>
        <Divider />
        <div className="text-right" style={{ padding: "0px" }}>
          <Button color="primary" size="large" onClick={onSaveDuration}>
            Save
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default React.memo(AppointmentDuration);
