import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert, SentimentSatisfiedAlt } from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";

const HeaderMenuOptions = (props) => {
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
        <MoreVert />
      </IconButton>

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
        <MenuItem onClick={handlePopoverClose} color="default">
          <SentimentSatisfiedAlt className="mr-2" /> Feedback
        </MenuItem>
      </Popover>
    </>
  );
};
export default HeaderMenuOptions;
