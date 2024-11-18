import React, { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Typography, Popover, Button, Divider } from "@mui/material";
import moment from "moment-timezone";
import dayjs from "dayjs";
import DialogAlert from "components/DialogAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/pro-regular-svg-icons";
import { useSelector } from "react-redux";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DueDate = (props) => {
  const { ticket, updateTicket } = props;
  const ispTimezone = useSelector(state => state.timeZone)

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tempDueDate, setTempDueDate] = React.useState(
    ticket.due_by_date || moment().format("YYYY-MM-DD")
  );
  const [tempDate, setTempDate] = React.useState(ticket.due_by_date);
  const [openPrompt, togglePrompt] = React.useState(false);

  useEffect(() => {
    if (ticket.due_by_date && !tempDueDate) {
      setTempDueDate(ticket.due_by_date);
    }
  }, [ticket.due_by_date, tempDueDate]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSaveDueDate = () => {
    updateTicket({ ticket_id: ticket.ticket_id, due_by_date: moment(tempDueDate.$d).format('YYYY-MM-DD') });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const dueDate = !ticket.due_by_date
    ? "Select a date"
    : moment(ticket.due_by_date, "YYYY-MM-DD").format("MMM DD, YYYY");
  const handleChange = (newDate) => {
    const isBeforeDate = moment(newDate.$d).isBefore(new Date(), "day");
    if (isBeforeDate) {
      togglePrompt(true);
      setTempDate(newDate);
    } else {
      setTempDueDate(newDate);
    }
  };
  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick} className="pointer">
        <FontAwesomeIcon
          icon={faCalendarDay}
          className=" fa-fw text-muted f-16 mr-2"
        />
        Due Datee
        <Typography
          variant="subtitle1"
          className={`primary-on-hover d-inline-block ml-2`}
        >
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
            <DateCalendar value={dayjs.tz(tempDueDate, ispTimezone)} onChange={handleChange} />
          </LocalizationProvider>
        </div>
        <Divider />
        <div className="text-right">
          <Button
            color="primary"
            size="large"
            style={{ padding: "5px" }}
            onClick={onSaveDueDate}
          >
            Save
          </Button>
          <Button
            className="bg-white text-muted"
            size="large"
            style={{ padding: "5px" }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </Popover>
      {openPrompt && (
        <DialogAlert
          open={openPrompt}
          message={
            <span>Are you sure you want to set this in the past date?</span>
          }
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              onClick: () => {
                setTempDueDate(tempDate);
                togglePrompt(false);
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
