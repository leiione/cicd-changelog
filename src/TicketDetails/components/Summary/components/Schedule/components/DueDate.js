import React, { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Typography, Popover, Button, Divider } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import moment from "moment-timezone";
import dayjs from "dayjs";

const DueDate = (props) => {
  const { classes, ticket, updateTicket } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tempDueDate, setTempDueDate] = React.useState(ticket.due_by_date);

  useEffect(() => {
    if(ticket.due_by_date && !tempDueDate) {
      setTempDueDate(ticket.due_by_date);
    }
  }, [ticket.due_by_date, tempDueDate])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSaveDueDate = () => {
    updateTicket({ ticket_id: ticket.ticket_id, due_by_date: tempDueDate });
    handleClose();
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const dueDate = !ticket.due_by_date ? "Select a date" : moment(ticket.due_by_date).format("MMM DD, YYYY");

  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick}>
        <CalendarToday className="text-muted f-20" style={{ marginRight: 5 }} /> Due Date
        <Typography variant="subtitle1" className={`${classes.dueDate} ${!ticket.due_by_date ? 'font-italic' : ''} d-inline-block ml-3`}>
          {dueDate}
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
        <div style={{ margin: "-10px" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar value={dayjs(tempDueDate)} onChange={(date) => setTempDueDate(date.$d)} />
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
export default React.memo(DueDate);
