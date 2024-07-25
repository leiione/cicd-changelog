import React, { useState } from "react";
import {
  Grid,
  Typography,
  Popover,
  Avatar,
  Button,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }
  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs="auto">
          <Typography variant="subtitle1">Assignee: </Typography>
        </Grid>
        <Grid item xs="auto">
          {assignee.assigned_name ? (
            <Typography
              variant="subtitle1"
              className="d-flex align-items-center"
              onClick={handleClick}
            >
              <Avatar
                {...stringAvatar(assignee.assigned_name)}
                sx={{ width: 24, height: 24 }}
                className="mr-2"
              />
              {assignee.assigned_name}
            </Typography>
          ) : (
            <Typography variant="body2" color="primary" onClick={handleClick}>
              Add Assignee
            </Typography>
          )}

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
            <List className="paper-height-300 overflow-y-auto">
              {data &&
                data.assignees &&
                data.assignees.map((assignee) => (
                  <ListItem
                    key={assignee.appuser_id} // Use a unique identifier as key
                    onClick={(event) => handlePopoverClose(event, assignee)} // Adjust this handler as needed
                  >
                    <ListItemIcon>
                      <Avatar
                        {...stringAvatar(assignee.realname)}
                        sx={{ width: 24, height: 24 }}
                      />
                    </ListItemIcon>

                    <ListItemText primary={assignee.realname} />
                  </ListItem>
                ))}
            </List>
            <div className="drawer-footer">
              <Button color="primary" variant="outlined">
                Save
              </Button>
              <Button color="default" variant="outlined">
                Cancel
              </Button>
            </div>
          </Popover>
        </Grid>
      </Grid>
    </>
  );
};
export default Assignee;
