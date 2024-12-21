import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  Tooltip,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  TextField,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FOLLOWERS } from "TicketDetails/TicketGraphQL";
import { preventEvent } from "Common/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";
import AvatarText from "Common/AvatarText";

const fetchFollowerName = (followerEmail, data) => {
  if (data && data.followers) {
    const follower = data.followers.find(
      (follower) => follower.email === followerEmail
    );
    return follower ? follower.realname : "Undefined";
  }
  return ""; // Return blank instead of the email
};

const Followers = (props) => {
  const { ticket, updateTicket } = props;
  const [selectedFollowers, setFollowers] = useState([]);
  // const [tempFollowers, setTempFollowers] = useState([]); // Temporary state for editing
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const openMenu = Boolean(anchorEl);

  const { data } = useQuery(GET_FOLLOWERS, {
    fetchPolicy: "network-only",
  });

  const fetchFollowerNameCallback = useCallback(
    (followerEmail) => fetchFollowerName(followerEmail, data),
    [data]
  );

  useEffect(() => {
    if (ticket && ticket.followers && data && data.followers) {
      const initialFollowers = ticket.followers
        .split(",")
        .map((followerEmail) => {
          const follower = data.followers.find(
            (f) => f.email === followerEmail
          );
          return follower
            ? follower
            : {
                email: followerEmail,
                realname: fetchFollowerNameCallback(followerEmail),
              };
        });
      setFollowers(initialFollowers); // Initialize selectedFollowers only
    }
  }, [ticket, data, fetchFollowerNameCallback]);
  

  const handlePopoverClose = (event) => {
    preventEvent(event);
    // setTempFollowers(selectedFollowers); // Reset changes if not saved
    setSearchTerm(""); // Clear the search field
    setAnchorEl(null);
  };

  const handleSelectFollower = async (follower) => {
    const isSelected = selectedFollowers.some((a) => a.email === follower.email);
    let updatedFollowers;
  
    if (isSelected) {
      // Remove the selected follower
      updatedFollowers = selectedFollowers.filter(
        (a) => a.email !== follower.email
      );
    } else {
      // Add the new follower
      updatedFollowers = [...selectedFollowers, follower];
    }
  
    // Update the state immediately
    setFollowers(updatedFollowers);
  
    // Persist the changes to the backend
    const followerEmails = updatedFollowers.map((f) => f.email);
    await updateTicket({
      ticket_id: ticket.ticket_id,
      followers: followerEmails.join(","), // Update backend with comma-separated emails
    });
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFollowers = data?.followers
    ?.filter((follower) =>
      follower.realname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aDisabled = !a.email;
      const bDisabled = !b.email;
      return aDisabled - bDisabled;
    });

    return (
      <>
        <Grid container spacing={1} className="mb-2">
          <Grid item xs="auto">
            <Typography variant="subtitle1">Followers: </Typography>
          </Grid>
          <Grid item xs="auto" onClick={handleClick}>
            {selectedFollowers.length > 0 ? (
              selectedFollowers.map((follower) => (
                <Typography
                  variant="subtitle1"
                  className="d-flex align-items-center mb-1"
                  key={follower.email}
                >
                  {follower.realname && (
                    <AvatarText
                      title={follower.realname}
                      charCount={1}
                      sx={{
                        width: 20,
                        height: 20,
                      }}
                      className="mr-2"
                    />
                  )}
                  {follower.realname || ""}
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
                  placeholder="Search followers"
                  className="p-3"
                  variant="standard"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  autoFocus
                  autoComplete="off"
                  margin="dense"
                />
                <List className="paper-height-300 overflow-y-auto">
                  {filteredFollowers &&
                    filteredFollowers.map((follower) => {
                      const isDisabled = !follower.email;
                      return (
                        <Tooltip
                          key={follower.email}
                          title={
                            isDisabled
                              ? "This appuser does not have an associated email account."
                              : follower.email
                          }
                          placement="top"
                        >
                          <ListItemButton
                            disablePadding
                            disabled={isDisabled}
                            selected={selectedFollowers.some(
                              (a) => a.email === follower.email
                            )}
                            onClick={() => handleSelectFollower(follower)}
                          >
                            <ListItemAvatar>
                              <AvatarText
                                title={follower.realname}
                                charCount={1}
                                className="mx-auto"
                                sx={{
                                  width: 20,
                                  height: 20,
                                }}
                              />
                            </ListItemAvatar>
                            <ListItemText primary={follower.realname} />
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

export default Followers;