import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TicketStatus = (props) => {
  const { customer, ticketStatuses,handleUpdate } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [status, setStatus] = React.useState();

  React.useEffect(() => {
    if (customer && customer.priority) {
      setStatus(customer.status ? customer.status : "Task");
    }
  }, [customer]);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event, status) => {
    if (status !== "backdropClick") {
      setStatus(status)
      handleUpdate({
        ticket_id: customer.ticket_id, 
        status: status,
        
      })
    
    }
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
        <span className="text-dark font-weight-normal f-13">{status}</span>
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
        {ticketStatuses &&
          ticketStatuses.map((taskStatus) => (
            <MenuItem
              key={taskStatus.id}
              onClick={(event) => handlePopoverClose(event, taskStatus.name)}
              color="default"
            >
              {taskStatus.name}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};
export default TicketStatus;
