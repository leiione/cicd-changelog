import { MessageOutlined } from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";
import ButtonWithLabel from "Common/ButtonWithLabel";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";

const AddMessageButton = (props) => {
  const dispatch = useDispatch();
  const { setAddNew, error, lablesVisible } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const onIconClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  const handleAdd = (event, type) => {
    preventEvent(event);
    setAddNew(type);
    setAnchorEl(null);
    dispatch(
      setCardPreferences({
        card: "messagesCard",
        preferences: { expanded: true },
      })
    );
  };

  return (
    <>
      <span>
        <ButtonWithLabel
          buttonLabel="Add Message"
          lablesVisible={lablesVisible}
          onClick={onIconClick}
          buttonIcon={<MessageOutlined />}
          disabled={error}
        />
      </span>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={(event) => handleAdd(event, "email")}>
          Email
        </MenuItem>
        <MenuItem onClick={(event) => handleAdd(event, "sms")}>SMS</MenuItem>
      </Menu>
    </>
  );
};

export default AddMessageButton;
