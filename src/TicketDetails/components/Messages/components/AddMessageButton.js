import { MessageOutlined } from "@mui/icons-material";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";

const AddMessageButton = props => {
  const dispatch = useDispatch()
  const { setAddNew } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const onIconClick = (event) => {
    preventEvent(event)
    setAnchorEl(event.currentTarget)
  }

  const handleAdd = (event, type) => {
    preventEvent(event)
    setAddNew(type)
    setAnchorEl(null)
    dispatch(setCardPreferences({ card: "messagesCard", preferences: { expanded: true } }));
  }

  return (
    <>
      <Tooltip title={"Add Message"} placement="top">
        <IconButton
          color={"default"}
          onClick={onIconClick}
        >
          <MessageOutlined />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={(event) => handleAdd(event, "email")}>Email</MenuItem>
        <MenuItem onClick={(event) => handleAdd(event, "sms")}>SMS</MenuItem>
      </Menu>
    </>
  )
}

export default AddMessageButton;