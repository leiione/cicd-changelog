import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";

const TaskMenuOptions = ({ show }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="default" onClick={handleClick}>
        <MoreVert style={!show ? { visibility: "hidden" } : {}} />
      </IconButton>
      {openMenu &&
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
          <MenuItem onClick={handlePopoverClose}> Convert to ticket</MenuItem>
          <MenuItem onClick={handlePopoverClose}> Delete</MenuItem>
        </Popover>
      }
    </>
  );
};
export default TaskMenuOptions;
