import React, { useEffect, useState } from "react";
import { Typography, Popover, Button, FormControlLabel, Radio, Divider, Grid, Tooltip, TextField } from "@mui/material";
import moment from "moment-timezone";
import ProgressButton from "Common/ProgressButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/pro-regular-svg-icons";

const PreferredArrival = (props) => {
  const { isSubmitting, ticket, updateTicket } = props;
  const earliestArrivalTime = moment(ticket.earliest_arrival_time && moment(ticket.earliest_arrival_time, [moment.ISO_8601, "HH:mm"]).isValid() ? ticket.earliest_arrival_time : "08:00:00", [moment.ISO_8601, "HH:mm"])
  const latestArrivalTime = moment(ticket.earliest_arrival_time && ticket.latest_arrival_time && moment(ticket.latest_arrival_time, [moment.ISO_8601, "HH:mm"]).isValid() ? ticket.latest_arrival_time : "08:00:00", [moment.ISO_8601, "HH:mm"])
  const arrivalTime = moment(earliestArrivalTime).isSame(latestArrivalTime) ? moment(earliestArrivalTime).format("LT") : `${moment(earliestArrivalTime).format("LT")} - ${moment(latestArrivalTime).format("LT")}`;

  const [anchorEl, setAnchorEl] = useState(null);
  const [preferred, setPreferred] = useState(moment(earliestArrivalTime).isSame(latestArrivalTime) ? "exact" : "window")
  const [startTime, setStartTime] = useState(ticket.earliest_arrival_time || "8:00:00")
  const [endTime, setEndTime] = useState(ticket.latest_arrival_time)
  const [err, setErr] = useState({ start: "", end: "" })

  React.useEffect(() => {
    if (preferred === "window") {
      const start = moment(startTime, [moment.ISO_8601, "HH:mm"])
      const end = moment(endTime, [moment.ISO_8601, "HH:mm"])
      const isAfter = moment(start).isAfter(end)
      const isBefore = moment(end).isBefore(start)
      setErr({
        start: isAfter ? "'Earliest arrival time' should be earlier than 'Latest arrival time'" : "",
        end: isBefore ? "'Latest arrival time' should be later than 'Earliest arrival time'" : ""
      })
    } else {
      setErr({ start: "", end: "" })
    }
    // eslint-disable-next-line
  }, [preferred, startTime, endTime])

  useEffect(() => {
    if (ticket.earliest_arrival_time && ticket.latest_arrival_time && !startTime && !endTime) {
      setStartTime(String(ticket.earliest_arrival_time))
      setEndTime(String(ticket.latest_arrival_time))
      setPreferred(moment(earliestArrivalTime).isSame(latestArrivalTime) ? "exact" : "window")
    }
  }, [ticket.earliest_arrival_time, ticket.latest_arrival_time, startTime, endTime, earliestArrivalTime, latestArrivalTime])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onRadioChange = (event) => {
    const { value } = event.target;
    setPreferred(value);
  }

  const onSaveArrivalTime = async () => {
    await updateTicket({ ticket_id: ticket.ticket_id, earliest_arrival_time: startTime, latest_arrival_time: preferred === "window" ? endTime : startTime });
    if (!isSubmitting) {
      handleClose()
    }
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick} className="pointer">
      <FontAwesomeIcon icon={faClock} className=" fa-fw text-muted f-16 mr-2" /> Preferred Arrival
        <Typography variant="subtitle1" className={`primary-on-hover d-inline-block ml-2`}>
          {arrivalTime}
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
        slotProps={{
          paper: { style: { width: '23%' } }
        }}
      >
        <Grid container spacing={1} style={{ padding: 10 }}>
          <Grid item xs={6}>
            <FormControlLabel
              value="exact"
              checked={preferred === "exact"}
              control={<Radio />}
              onClick={onRadioChange}
              label={<Typography variant="subtitle2" className="f-14">Exact Time</Typography>}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              value="window"
              checked={preferred === "window"}
              control={<Radio />}
              onClick={onRadioChange}
              label={<Typography variant="subtitle2" className="f-14">Window Time</Typography>}
            />
          </Grid>
          <Grid item xs={6} style={{ paddingLeft: 18 }}>
            <Tooltip placement="top" title={err.start > "" ? err.start : ""}>
              <TextField
                error={err.start > ""}
                type="time"
                variant="standard"
                fullWidth
                label={preferred === "window" ? "Earliest Arrival Time" : ''}
                InputLabelProps={{ shrink: true }}
                onChange={e => setStartTime(e.target.value)}
                value={moment(startTime, [moment.ISO_8601, "HH:mm"]).format("HH:mm")}
              />
            </Tooltip>
          </Grid>
          {preferred === "window" &&
            <Grid item xs={6} style={{ paddingLeft: 18 }}>
              <Tooltip placement="top" title={err.end > "" ? err.end : ""}>
                <TextField
                  error={err.end > ""}
                  type="time"
                  variant="standard"
                  fullWidth
                  label={preferred === "window" ? "Latest Arrival Time" : ''}
                  InputLabelProps={{ shrink: true }}
                  onChange={e => setEndTime(e.target.value)}
                  value={moment(endTime, [moment.ISO_8601, "HH:mm"]).format("HH:mm")}
                />
              </Tooltip>
            </Grid>
          }
        </Grid>
        <Divider />
        <div className="text-right">
          <ProgressButton
            color="primary"
            size="large"
            style={{ padding: "5px" }}
            onClick={onSaveArrivalTime}
            isSubmitting={isSubmitting}
            disabled={err.start > "" || err.end > ""}
          >
            Save
          </ProgressButton>
          <Button className="bg-white text-muted" size="large" style={{ padding: "5px" }} onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Popover>
    </>
  );
};
export default React.memo(PreferredArrival);
