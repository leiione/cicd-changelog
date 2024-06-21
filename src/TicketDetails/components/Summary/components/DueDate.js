import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Typography, Popover, Button } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";

const DueDate = (props) => {
  const { customer } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick}>
        <CalendarIcon className="text-dark" /> Due Date
        <span className="text-dark d-inline-block ml-3">
          {customer.date_added}
        </span>
      </Typography>
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar />
        </LocalizationProvider>
        <div className="text-right">
          <Button color="primary" variant="outlined" onClick={handleClose}>
            Save
          </Button>
          <Button color="default" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Popover>
    </>
  );
};
export default DueDate;
