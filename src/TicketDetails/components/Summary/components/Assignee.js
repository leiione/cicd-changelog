import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  IconButton,
  List,
  Tooltip,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
} from "@mui/material";
import { preventEvent } from "Common/helper";
import { useQuery } from "@apollo/client";
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";
import AvatarText from "Common/AvatarText";
import { showSnackbar } from "config/store";
import { useDispatch } from "react-redux";

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
  const [selectedAssignees, setAssignees] = useState([]); // Saved assignees
  const [tempAssignees, setTempAssignees] = useState([]); // Temporary state for editing
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const openMenu = Boolean(anchorEl);
  const dispatch = useDispatch();

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
      data.assignees && tempAssignees.length === 0
    ) {
      const initialAssignees = ticket.assignees.filter(x => x !== 0).map((assigneeId) => ({
        appuser_id: assigneeId,
        realname: fetchAssigneeNameCallback(assigneeId),
      }));
      setAssignees(initialAssignees);
      setTempAssignees(initialAssignees); // Initialize tempAssignees
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, data, fetchAssigneeNameCallback]);
  
  const handlePopoverClose = async (event) => {
    preventEvent(event);
  
    // Ensure the input loses focus to prevent accessibility warning
    const inputElement = document.activeElement;
    if (inputElement?.tagName === "INPUT") {
      inputElement.blur();
    }
  
    setAnchorEl(null); // Close the popover
  
    const assignees = tempAssignees.map((assignee) => ({
      appuser_id: assignee.appuser_id,
      realname: assignee.realname,
    }));
    
    try {
      await updateTicket({
        ticket_id: ticket.ticket_id,
        assignees: assignees,
      });
  
      // Sync the saved state
      setAssignees(tempAssignees);
      setTempAssignees(tempAssignees);
    } catch (error) {
      console.error("Error updating ticket:", error);
      dispatch(
        showSnackbar({
          message: "Failed to update ticket. Please try again.",
          severity: "error",
        })
      );
    }
  
    setSearchTerm(""); // Clear the search field
  };

  const handleSelectAssignee = (assignee) => {
    const isSelected = tempAssignees.some(
      (a) => a.appuser_id === assignee.appuser_id
    );
  
    let updatedTempAssignees;
    if (isSelected) {
      updatedTempAssignees = tempAssignees.filter(
        (a) => a.appuser_id !== assignee.appuser_id
      );
    } else {
      if (tempAssignees.length < 2) {
        updatedTempAssignees = [...tempAssignees, assignee];
      } else {
        dispatch(
          showSnackbar({
            message: "You can only select up to 2 assignees.",
            severity: "error",
          })
        );
        return;
      }
    }  
    // Update both tempAssignees and selectedAssignees for immediate UI reflection
    setTempAssignees(updatedTempAssignees);
    setAssignees(updatedTempAssignees);
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAssignees = data?.assignees?.filter((assignee) =>
    assignee.realname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Grid container spacing={1} className="mb-2">
        <Grid item xs={3.5}>
          <Typography variant="subtitle1">Assignees: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {selectedAssignees.length > 0 ? (
            selectedAssignees.map((assignee) => (
              <Typography
                variant="subtitle1"
                className="d-flex align-items-center mb-1"
                key={assignee.appuser_id}
              >
                <AvatarText
                  title={assignee.realname}
                  charCount={1}
                  sx={{
                    width: 20,
                    height: 20,
                  }}
                  className="mr-2"
                />
                {assignee.realname}
              </Typography>
            ))
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
            <TextField
              placeholder="Search assignees"
              className="p-3"
              variant="standard"
              fullWidth
              value={searchTerm}
              autoFocus
              autoComplete="off"
              onChange={handleSearchChange}
              margin="dense"
            />
            <List className="paper-height-300 overflow-y-auto">
              {filteredAssignees &&
                filteredAssignees.map((assignee) => {
                  return (
                    <Tooltip
                      key={assignee.appuser_id}
                      title={assignee.email}
                      placement="top"
                    >
                      <ListItemButton
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
          </Popover>
        </Grid>
      </Grid>
    </>
  );
};

export default Assignee;