import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";
import { cloneDeep } from "lodash";
import DialogAlert from "components/DialogAlert";

const TaskMenuOptions = (props) => {
  const { show, task, ticketTasks, setTicketTasks, onSaveTaskChanges } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openAlert, setOpenAlert] = React.useState(false);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setAnchorEl(null);
  };

  const onDeleteTask = () => {
    let newTasks = cloneDeep(ticketTasks)
    newTasks = newTasks.filter(x => x.task_id !== task.task_id)
    setTicketTasks(newTasks);
    onSaveTaskChanges(newTasks)
  }

  const onOpenAlert = () => {
    if (task.task_id > 0) {
      setOpenAlert(true);
    } else {
      onDeleteTask()
    }
  }

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
          <MenuItem onClick={onOpenAlert}> Delete</MenuItem>
        </Popover>
      }
      {openAlert && (
        <DialogAlert
          open={openAlert}
          message={"Are you sure you want to delete this task?"}
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              onClick: () => onDeleteTask(),
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: () => setOpenAlert(false),
            },
          ]}
        />
      )}
    </>
  );
};
export default TaskMenuOptions;
