import { faMessageLines } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuItem } from "@mui/material";
import ButtonWithLabel from "Common/ButtonWithLabel";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import usePermission from "config/usePermission";
import React from "react";
import { useDispatch } from "react-redux";
import { NO_RIGHTS_MSG } from "utils/messages";

const AddMessageButton = (props) => {
  const dispatch = useDispatch();
  const { setAddNew, error, lablesVisible } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const permitCreate = usePermission("ticket_note_message", "flag_create")

  const onIconClick = (event) => {
    preventEvent(event);
    // Only set anchor element if user has permission AND there's no error
    if(permitCreate && !error) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleAdd = (event, type) => {
    preventEvent(event);
    if(permitCreate) {
      setAddNew(type);
      dispatch(
        setCardPreferences({
          card: "messagesCard",
          preferences: { expanded: true },
        })
      );
    }
    setAnchorEl(null)
  };

  return (
    <>
      <span>
        <ButtonWithLabel
          buttonLabel={!permitCreate ? NO_RIGHTS_MSG : "Add Message"}
          lablesVisible={lablesVisible}
          onClick={onIconClick}
          buttonIcon={<FontAwesomeIcon className="primary-on-hover" icon={faMessageLines} size="lg" />}
          disabled={error || !permitCreate}
        />
      </span>
      {/* Only render Menu when user has permission and there's no error */}
      {permitCreate && !error && (
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
      )}
    </>
  );
};

export default AddMessageButton;