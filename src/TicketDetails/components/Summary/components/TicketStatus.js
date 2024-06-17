import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TicketStatus = (props) => {
  const { customer } = props;
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
      <Button
        color="default"
        onClick={handleClick}
        endIcon={openMenu ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
      >
        <span className="text-dark font-weight-light">
          {customer.status ? customer.status : "Task"}
        </span>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handlePopoverClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handlePopoverClose} color="default">
          Open
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Resolved
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Pending
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Cancelled
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};
export default TicketStatus;
