import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Typography, Popover, Button, Divider } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import moment from "moment-timezone";
import dayjs from "dayjs";

const DueDate = (props) => {
  const { classes, ticket } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dueDate, setDueDate] = React.useState(ticket.date_added);
  const [tempDueDate, setTempDueDate] = React.useState(ticket.date_added);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSaveDueDate = () => {
    setDueDate(tempDueDate);
    handleClose();
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick}>
        <CalendarToday className="text-dark" style={{ marginRight: 5 }} /> Due Date
        <Typography variant="subtitle1" className={`${classes.dueDate} d-inline-block ml-3`}>
          {moment(dueDate).format("MMM DD, YYYY")}
        </Typography>
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
        <div style={{ margin: "-10px -10px -32px" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar value={dayjs(tempDueDate)} onChange={(date) => setTempDueDate(date.$d)}/>
          </LocalizationProvider>
        </div>
        <Divider />
        <div className="text-right">
          <Button color="primary" size="large" style={{ padding: "5px" }} onClick={onSaveDueDate}>
            Save
          </Button>
          <Button className="bg-white text-muted" size="large" style={{ padding: "5px" }} onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Popover>
    </>
  );
};
export default DueDate;
