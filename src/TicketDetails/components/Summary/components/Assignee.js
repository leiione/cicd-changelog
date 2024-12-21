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
  const [selectedAssignees, setAssignees] = useState([]);
  //const [tempAssignees, setTempAssignees] = useState([]); // Temporary state for editing
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
      data.assignees
    ) {
      const initialAssignees = ticket.assignees.map((assigneeId) => ({
        appuser_id: assigneeId,
        realname: fetchAssigneeNameCallback(assigneeId),
      }));
      setAssignees(initialAssignees);
      //setTempAssignees(initialAssignees); // Initialize tempAssignees
    }
  }, [ticket, data, fetchAssigneeNameCallback]);   
  
  const handleSelectAssignee = async (assignee) => {
    const isSelected = selectedAssignees.some(
      (a) => a.appuser_id === assignee.appuser_id
    );
    let updatedAssignees;
  
    if (isSelected) {
      // Remove the selected assignee
      updatedAssignees = selectedAssignees.filter(
        (a) => a.appuser_id !== assignee.appuser_id
      );
    } else {
      if (selectedAssignees.length < 2) {
        // Add the new assignee
        updatedAssignees = [...selectedAssignees, assignee];
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
  
    // Update the state immediately
    setAssignees(updatedAssignees);
  
    // Persist the changes to the backend
    await updateTicket({
      ticket_id: ticket.ticket_id,
      assignees: updatedAssignees.map((a) => ({
        appuser_id: a.appuser_id,
        realname: a.realname,
      })),
    });
  };

  const handlePopoverClose = (event) => {
    preventEvent(event);
    setSearchTerm(""); // Clear the search field
    setAnchorEl(null); // Close the popover
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
        <Grid item xs="auto">
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
                        disablePadding
                        selected={selectedAssignees.some(
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