import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TicketType = (props) => {
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
        <span className="text-dark font-weight-normal f-13">
          {customer.type ? customer.type : "Open"}
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
          Task
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Onsite Repair
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Onsite Install
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Onsite Other
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Onsite Site Survey
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          Phone Call
        </MenuItem>
      </Menu>
    </>
  );
};
export default TicketType;
