import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  Button,
  IconButton,
  List,
  Tooltip,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { preventEvent } from "Common/helper";
import { useQuery } from "@apollo/client";
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";
import AvatarText from "Common/AvatarText";

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
    if (
      ticket &&
      ticket.assignees &&
      Array.isArray(ticket.assignees) &&
      data &&
      data.assignees
    ) {
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

  return (
    <>
      <Grid container spacing={1} className="mb-2">
        <Grid item xs="auto">
          <Typography variant="subtitle1">Assignees: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {ticket &&
          ticket.assignees &&
          Array.isArray(ticket.assignees) &&
          ticket.assignees.length > 0 ? (
            ticket.assignees.map((assigneeId) => {
              const assigneeName = fetchAssigneeNameCallback(assigneeId);
              return (
                <Typography
                  variant="subtitle1"
                  className="d-flex align-items-center mb-1"
                  key={assigneeId}
                >
                  {assigneeName && (
                    <AvatarText
                      title={assigneeName}
                      charCount={1}
                      sx={{
                        width: 20,
                        height: 20,
                      }}
                      className="mr-2"
                    />
                  )}
                  {assigneeName || ""}
                </Typography>
              );
            })
          ) : (
            <IconButton color="primary" onClick={handleClick} size="small">
              <FontAwesomeIcon icon={faPlusCircle} />
            </IconButton>
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
                data.assignees.map((assignee) => {
                  return (
                    <Tooltip
                      key={assignee.appuser_id}
                      title={assignee.email}
                      placement="top"
                    >
                      <ListItemButton
                        disablePadding
                        selected={tempAssignees.some(
                          (a) => a.appuser_id === assignee.appuser_id
                        )}
                        onClick={() => handleSelectAssignee(assignee)}
                      >
                        <ListItemAvatar>
                          <AvatarText
                            title={assignee.realname}
                            charCount={1}
                            className="mx-auto"
                            sx={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={assignee.realname} />
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
            </List>
            <div className="drawer-footer">
              <Button color="primary" variant="outlined" onClick={handleSave}>
                Save
              </Button>
              <Button
                color="default"
                variant="outlined"
                onClick={handlePopoverClose}
              >
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
