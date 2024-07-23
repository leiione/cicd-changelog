import React, { useState } from "react";
import { Grid, Typography, MenuItem, Popover, Avatar } from "@mui/material";
import { preventEvent } from "Common/helper";
import { useQuery } from "@apollo/client";
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";

const Assignee = (props) => {
  const { ticket, updateTicket } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignee, setAssignee] = useState({
    assigned_name: ticket.assigned_name,
    assigned_id: ticket.assigned_id,
  });
  const openMenu = Boolean(anchorEl);

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = async (event, assignee) => {
    if (assignee !== "backdropClick") {
      await updateTicket({
        ticket_id: ticket.ticket_id,
        assignees: [assignee.appuser_id],
      });
      setAssignee({
        assigned_name: assignee.realname,
        assigned_id: assignee.appuser_id,
      });
    }
    preventEvent(event);
    setAnchorEl(null);
  };

  const { data } = useQuery(GET_ASSIGNEES, {
    fetchPolicy: "network-only",
  });
  function stringAvatar(name) {
    return {
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs="auto">
          <Typography variant="subtitle1">Assignee: </Typography>
        </Grid>
        <Grid item xs="auto">
          <Typography variant="subtitle1" onClick={handleClick}>
            <Avatar
              {...stringAvatar(assignee.assigned_name)}
              sx={{ width: 24, height: 24 }}
            />
            {assignee.assigned_name ? assignee.assigned_name : "Undefined"}
          </Typography>

          <Popover
            open={openMenu}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            classes={{ paper: "overflow-hidden" }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            {data &&
              data.assignees &&
              data.assignees.map((assignee) => (
                <MenuItem
                  key={assignee.appuser_id} // Use a unique identifier as key
                  onClick={(event) => handlePopoverClose(event, assignee)} // Adjust this handler as needed
                >
                  <Avatar
                    {...stringAvatar(assignee.realname)}
                    sx={{ width: 24, height: 24 }}
                  />
                  {assignee.realname} - {assignee.email}
                </MenuItem>
              ))}
          </Popover>
        </Grid>
      </Grid>
    </>
  );
};
export default Assignee;
