import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import DialogAlert from "components/DialogAlert";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
  },
}));
const TicketType = (props) => {
  const classes = useStyles();
  const { customer, ticketTypes, handleUpdate } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [type, setType] = React.useState();
  const [openDelete, toggleDelete] = React.useState(null);
  const [updateParams, setUpdateParams] = React.useState({});

  React.useEffect(() => {
    if (customer && customer.type) {
      setType(customer.type ? customer.type : "Open");
    }
  }, [customer]);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event, taskType) => {
    if (taskType !== "backdropClick") {
      setUpdateParams({
        ticket_id: customer.ticket_id,
        type: taskType.ticket_type_desc,
      });
      toggleDelete(true);
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
        <span className="text-dark font-weight-normal f-13">{type}</span>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handlePopoverClose}
        classes={{ paper: classes.paperHeight }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {ticketTypes && ticketTypes.length > 0 ? (
          ticketTypes.map((taskType) => (
            <MenuItem
              key={taskType.ticket_type_id}
              onClick={(event) => handlePopoverClose(event, taskType)}
              color="default"
            >
              {taskType.ticket_type_desc}
            </MenuItem>
          ))
        ) : (
          <>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Task",
                })
              }
              color="default"
            >
              Task
            </MenuItem>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Onsite Repair",
                })
              }
              color="default"
            >
              Onsite Repair
            </MenuItem>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Onsite Install",
                })
              }
              color="default"
            >
              Onsite Install
            </MenuItem>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Onsite Other",
                })
              }
              color="default"
            >
              Onsite Other
            </MenuItem>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Onsite Site Survey",
                })
              }
              color="default"
            >
              Onsite Site Survey
            </MenuItem>
            <MenuItem
              key="default"
              onClick={(event) =>
                handlePopoverClose(event, {
                  ticket_type_id: 17716,
                  ticket_type_desc: "Phone Call",
                })
              }
              color="default"
            >
              Phone Call
            </MenuItem>
          </>
        )}
      </Menu>

      {openDelete && (
        <DialogAlert
          open={openDelete}
          message={
            <span>
              The selected type has an existing template that will replace the
              ticket content.
              <br /> Are you sure you want to change the ticket type?
            </span>
          }
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              onClick: (event) => {
                handleUpdate(updateParams);
                preventEvent(event);
                setType(updateParams.type);
                toggleDelete(false);
              },
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: (event) => {
                toggleDelete(false);
                preventEvent(event);

                setAnchorEl(null);
              },
            },
          ]}
        />
      )}
    </>
  );
};
export default TicketType;
