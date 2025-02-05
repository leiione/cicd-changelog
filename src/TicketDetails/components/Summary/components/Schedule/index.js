import React, { useEffect } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Button, Collapse, Grid, Typography } from "@mui/material";
import DueDate from "./components/DueDate";
import PreferredArrival from "./components/PreferredArrival";
import AppointmentDuration from "./components/AppointmentDuration";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences } from "config/store";
import moment from "moment-timezone";

const Schedule = (props) => {
  const dispatch = useDispatch();
  const { ticket, updateTicket, isSubmitting } = props;
  const summaryCard = useSelector((state) => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {};
  const [hasDueDate, setHasDueDate] = React.useState(moment(ticket.due_by_date).isValid());

  const handleCollapse = () => {
    dispatch(
      setCardPreferences({
        card: "summaryCard",
        preferences: {
          ...summaryCard,
          subComponent: {
            ...preferences,
            schedule: !preferences.schedule,
          },
        },
      })
    );
  };

  useEffect(() => {
    setHasDueDate(moment(ticket.due_by_date).isValid());
  }, [ticket.due_by_date]);

  return (
    <Grid container spacing={0} alignItems="center">
      <Grid item xs={12}>
        <Button onClick={handleCollapse} className="text-muted ml-0">
          {preferences.schedule ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="body1">Schedule</Typography>
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Collapse
          in={preferences.schedule}
          className="ml-3 pl-3 position-relative"
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <AppointmentDuration ticket={ticket} updateTicket={updateTicket} />
            </Grid>
            <Grid item xs={12}>
              <DueDate ticket={ticket} updateTicket={updateTicket} hasDueDate={hasDueDate} setHasDueDate={setHasDueDate} />
            </Grid>
            <Grid item xs={12}>
              <PreferredArrival
                isSubmitting={isSubmitting}
                ticket={ticket}
                updateTicket={updateTicket}
                hasDueDate={hasDueDate}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
};
export default React.memo(Schedule);
