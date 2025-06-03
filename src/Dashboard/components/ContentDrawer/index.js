import React from "react";
import { Drawer } from "@mui/material";
import { makeStyles } from "@mui/styles";
import TicketDetails from "TicketDetails";
import { setContentDrawer } from "config/store";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: "67vw",
    [theme.breakpoints.down("xl")]: {
      width: "62vw"
    }
  },
  serviceDeskDrawer: {
    maxWidth: 1000
  },
}));

const ContentDrawer = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch()
  
  const {category, open, ticket, contentOnly, addRecentActionsDrawer } = props

  let content = "TODO";
  let drawerClass = classes.drawerPaper;

  const handleOpenTicketMS = (ticket, action, prevTicket) => {
    if (action === 'docked' && prevTicket && prevTicket.ticket_id > 0) {
      addRecentActionsDrawer({ ...prevTicket, category, name: prevTicket.summary || prevTicket.type, id: prevTicket.ticket_id, fromMS: true })
    }

    if (ticket && ticket.ticket_id > 0) {
      dispatch(setContentDrawer({
        open: true,
        component: 'ticket',
        description: ticket.description || ticket.type,
        id: ticket.ticket_id,
        ticket_id: ticket.ticket_id,
        ticket: ticket
      }));
    }
  }

  switch (category) {
    case 'Service Desk':
      content = (
        <TicketDetails
          category={category}
          ticket={ticket}
          fromDashboard={true}
          handleOpenTicket={handleOpenTicketMS}
          addRecentActionsDrawer={addRecentActionsDrawer}
        />
      )
      drawerClass = `${classes.drawerPaper} ${classes.serviceDeskDrawer}`
      break
    default:
      content = "TODO";
  }

  if (contentOnly) {
    return content
  }
  return (
    <>
      <Drawer
        anchor={"right"}
        variant="persistent"
        open={open}
        classes={{ paper: `${drawerClass} overflow-y-hidden` }}
        key={category}
      >
        {content}
      </Drawer>
    </>
  );
};

export default React.memo(ContentDrawer);
