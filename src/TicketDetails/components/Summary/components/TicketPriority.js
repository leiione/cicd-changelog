import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import {
  ArrowCircleDownOutlined,
  ArrowCircleUpOutlined,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";

const TicketPriority = (props) => {
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

  console.log("Ticket", customer);

  return (
    <>
      <IconButton color="default" onClick={handleClick}>
        <ArrowCircleDownOutlined className="text-secondary" />
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
          <ArrowCircleDownOutlined className="mr-2 text-secondary" /> Priority:
          Low
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          <RemoveCircleOutlineOutlined className="mr-2 text-warning" />
          Priority: Medium
        </MenuItem>
        <MenuItem onClick={handlePopoverClose} color="default">
          <ArrowCircleUpOutlined className="mr-2 text-success" /> Priority: High
        </MenuItem>
      </Popover>
    </>
  );
};
export default TicketPriority;
