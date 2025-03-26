import React, { useEffect } from "react";
import { Typography, Popover, Button, Divider, Grid, Slider, Tooltip, Box } from "@mui/material";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/pro-regular-svg-icons";
import { padStart } from "lodash";
import moment from "moment-timezone";
import { InfoOutlined } from "@mui/icons-material";

export const DateFormat_DATETIME = "YYYY-MM-DD HH:mm:ss"

const padLeft = (value) => {
  if (Number(value) < 10) {
    return padStart(String(value).trim(), 2, '0')
  }
  return value
}

const getDurationLabel = (scaledValue) => {
  let label = `${scaledValue} minutes`;
  if (scaledValue % 60 === 0 && scaledValue > 0) {
    const hours = Math.floor(scaledValue / 60);
    label = `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  } else if (scaledValue % 15 === 0 && scaledValue > 60) {
    const hours = Math.floor(scaledValue / 60);
    const mins = scaledValue - (hours * 60);
    label = `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} mins`;
  }
  return label
}

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
    ticket.max_duration !== undefined ? ticket.max_duration : 60
  );

  useEffect(() => {
    if (ticket.max_duration !== undefined) {
      const convertedTime = convertMinutesToTime(ticket.max_duration);
      setDisplayDuration(convertedTime); // Update both displayed and temp durations
      setTempMaxDuration(ticket.max_duration || 60);
    }
  }, [ticket.max_duration]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (reset = true) => {
    setAnchorEl(null);
    setError(""); // Reset the error when closing the popover
    if (reset) {
      setTempMaxDuration(ticket.max_duration || 60);
    }
  };

  const onSaveDuration = () => {
    // Check if the selected time is 00:00
    if (!tempMaxDuration || tempMaxDuration === 0) {
      setError("duration must be higher than zero minutes"); // Set error message if time is 00:00
      return; // Prevent saving
    }

    updateTicket({ ticket_id: ticket.ticket_id, max_duration: tempMaxDuration }); // Pass total minutes

    const convertedTime = convertMinutesToTime(tempMaxDuration);
    setDisplayDuration(convertedTime); // Only update the displayed duration when saved
    handleClose(false);
  };

  const handleSliderChange = (event, newTime) => {
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
  
  const endDateTooltip = React.useMemo(() => {
    if ((!ticket.start && !ticket.due_by_date) || !tempMaxDuration) {
        return null
    }
    const startDate = new Date(ticket.start) || new Date(ticket.due_by_date)
    const formattedDate = `${startDate.getFullYear()}-${padLeft(startDate.getMonth() + 1)}-${padLeft(startDate.getDate())}`
    const timeArrival = ticket.latest_arrival_time ? ticket.latest_arrival_time : ticket.earliest_arrival_time || "08:00:00"
    let earliestArrivalDate = moment.utc(`${formattedDate} ${timeArrival}`, "YYYY-MM-DD HH:mm").format(DateFormat_DATETIME)
    let endTime = moment.utc(earliestArrivalDate).add(tempMaxDuration, "m").format("hh:mm A")
    return (
      <Tooltip title={`Complete by ${endTime}`} placement="bottom-end">
          <InfoOutlined fontSize="large" sx={{ marginBottom: '6px' }} />
      </Tooltip>
    )
  }, [tempMaxDuration, ticket.start, ticket.due_by_date, ticket.earliest_arrival_time, ticket.latest_arrival_time])

  const durationLabel = getDurationLabel(tempMaxDuration)
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
            component="span"
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
         <Box sx={{ width: 300, margin: "10px 15px 0px 15px" }} >
          <Grid container spacing={2} justifyContent="space-around" alignItems="center">
            <Grid item xs={7} >
              <Slider
                value={tempMaxDuration}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
                step={15}
                min={15}
                max={765}
                error={Boolean(error)}
                durationHelperText={error}
              />
            </Grid>
            <Grid item xs={5}>
              <Typography gutterBottom>
                {durationLabel} {endDateTooltip}
              </Typography>
            </Grid>
            </Grid>
          {error && (
            <Typography color="error" variant="body2" style={{ marginTop: 8 }}>
              {error}
            </Typography>
          )}
        </Box>
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
