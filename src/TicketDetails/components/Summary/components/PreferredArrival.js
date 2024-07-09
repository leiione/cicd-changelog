import React from "react";
import { Typography, Popover, Button, FormControl, RadioGroup, FormControlLabel, Radio, Divider } from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import moment from "moment-timezone";
import { includes } from "lodash";

const PreferredArrival = (props) => {
  const { classes, ticket } = props;
  const start = !includes([null, "00:00:00", "00:00:00+00"], ticket.earliest_arrival_time) ? moment(ticket.earliest_arrival_time, [moment.ISO_8601, "HH:mm"]) : moment("08:00:00+00", [moment.ISO_8601, "HH:mm"])
  const end = !includes([null, "00:00:00", "00:00:00+00"], ticket.latest_arrival_time) ? moment(ticket.latest_arrival_time, [moment.ISO_8601, "HH:mm"]) : moment("08:00:00+00", [moment.ISO_8601, "HH:mm"])
  const arrivalTime = moment(start).isSame(end) ? moment(start).format("LT") : `${moment(start).format("LT")} - ${moment(end).format("LT")}`;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tempArrivalTime, setTempArrivalTime] = React.useState({
    start: start,
    end: end,
    preferredTime: moment(start).isSame(end) ? "exact" : "window"
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onRadioChange = (event) => {
    const { value } = event.target;
    setTempArrivalTime({ ...tempArrivalTime, preferredTime: value });
  }

  const onSaveArrivalTime = () => {
    // TODO save
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Typography variant="subtitle1" onClick={handleClick}>
        <AccessTime className="text-dark" style={{ marginRight: 5 }} /> Preferred Arrival
        <Typography variant="subtitle1" className={`${classes.dueDate} d-inline-block ml-3`}>
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
      >
        <div style={{ padding: 10 }}>
          <FormControl>
            <RadioGroup
              row
              value={tempArrivalTime.preferredTime}
              onChange={onRadioChange}
            >
              <FormControlLabel value="exact" control={<Radio />} label={<Typography variant="subtitle2" className="f-14">Exact Time</Typography>} />
              <FormControlLabel value="window" control={<Radio />} label={<Typography variant="subtitle2" className="f-14">Window Time</Typography>} />
            </RadioGroup>
          </FormControl>
        </div>
        <Divider />
        <div className="text-right">
          <Button color="primary" size="large" style={{ padding: "5px" }} onClick={onSaveArrivalTime}>
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
export default PreferredArrival;
