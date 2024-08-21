import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  Avatar,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { preventEvent } from "Common/helper";
import { useQuery } from "@apollo/client";
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";

const fetchAssigneeName = (assigneeID, data) => {
  if (data && data.assignees) {
    const assignee = data.assignees.find(
      (assignee) => assignee.appuser_id === assigneeID
    );
    return assignee ? assignee.realname : "Undefined";
  }
  return ""; // Return blank instead of the ID
};

const Assignee = (props) => {
  const { ticket, updateTicket } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssignees, setAssignees] = useState([]);
  const [tempAssignees, setTempAssignees] = useState([]); // Temporary state for editing
  const openMenu = Boolean(anchorEl);

  const { data } = useQuery(GET_ASSIGNEES, {
    fetchPolicy: "network-only",
  });

  const fetchAssigneeNameCallback = useCallback(
    (assigneeID) => fetchAssigneeName(assigneeID, data),
    [data]
  );

  useEffect(() => {
    if (ticket && ticket.assignees && Array.isArray(ticket.assignees) && data && data.assignees) {
      const initialAssignees = ticket.assignees.map((assigneeId) => ({
        appuser_id: assigneeId,
        realname: fetchAssigneeNameCallback(assigneeId),
      }));
      setAssignees(initialAssignees);
      setTempAssignees(initialAssignees); // Initialize tempAssignees
    }
  }, [ticket, data, fetchAssigneeNameCallback]);

  const handlePopoverClose = (event) => {
    preventEvent(event);
    setTempAssignees(selectedAssignees); // Reset changes if not saved
    setAnchorEl(null);
  };

  const handleSave = async () => {
    // Map the tempAssignees to only include fields expected by the AssigneeInput type
    const assignees = tempAssignees.map((assignee) => ({
      appuser_id: assignee.appuser_id,
      realname: assignee.realname,
    }));
  
    await updateTicket({
      ticket_id: ticket.ticket_id,
      assignees: assignees,
    });
    setAnchorEl(null);
  };

  const handleSelectAssignee = (assignee) => {
    const isSelected = tempAssignees.some(
      (a) => a.appuser_id === assignee.appuser_id
    );
    if (isSelected) {
      setTempAssignees(
        tempAssignees.filter((a) => a.appuser_id !== assignee.appuser_id)
      );
    } else {
      setTempAssignees([...tempAssignees, assignee]);
    }
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name) {
    if (!name || typeof name !== "string") {
      return {
        sx: {
          bgcolor: stringToColor("Anonymous"),
        },
        children: "A",
      };
    }

    const nameParts = name.split(" ");
    const initials =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : `${nameParts[0][0]}`;

    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials,
    };
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs="auto">
          <Typography variant="subtitle1">Assignees: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {ticket && ticket.assignees && Array.isArray(ticket.assignees) && ticket.assignees.length > 0 ? (
            ticket.assignees.map((assigneeId) => {
              const assigneeName = fetchAssigneeNameCallback(assigneeId);
              return (
                <Typography variant="subtitle1" className="d-flex align-items-center" key={assigneeId}>
                  {assigneeName && (
                    <Avatar
                      {...stringAvatar(assigneeName)}
                      sx={{ width: 24, height: 24 }}
                      className="mr-2"
                    />
                  )}
                  {assigneeName || ""}
                </Typography>
              );
            })
          ) : (
            <Typography variant="subtitle2" color="primary" onClick={handleClick}>
              Add
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
            {data && data.assignees && data.assignees.map((assignee) => (
              <MenuItem
                key={assignee.appuser_id}
                onClick={() => handleSelectAssignee(assignee)}
                style={{
                  backgroundColor: tempAssignees.some(
                    (a) => a.appuser_id === assignee.appuser_id
                  )
                    ? "#f0f0f0"
                    : "transparent",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      style={{ display: "none" }} // Hide the checkbox visually
                      checked={tempAssignees.some(
                        (a) => a.appuser_id === assignee.appuser_id
                      )}
                      name={assignee.realname}
                    />
                  }
                  label={`${assignee.realname}`}
                />
              </MenuItem>
            ))}
            <div className="drawer-footer">
              <Button color="primary" variant="outlined" onClick={handleSave}>
                Save
              </Button>
              <Button color="default" variant="outlined" onClick={handlePopoverClose}>
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
