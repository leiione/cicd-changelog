import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNote } from "@fortawesome/pro-regular-svg-icons";
import ButtonWithLabel from "Common/ButtonWithLabel";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";
import { NO_RIGHTS_MSG } from "utils/messages";
import usePermission from "config/usePermission";

const AddNoteButton = (props) => {
  const dispatch = useDispatch();
  const { setAddNew, lablesVisible } = props;
  const permitCreate = usePermission("ticket_note_message", "flag_create", 'notes')

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
  };

  return (
    <>
        <ButtonWithLabel
          buttonLabel={permitCreate ? "Add Note" : NO_RIGHTS_MSG}
          lablesVisible={lablesVisible}
          onClick={(event) => handleAdd(event, "note")}
          buttonIcon={<FontAwesomeIcon className="primary-hover" icon={faNote} size="lg" />}
          disabled={!permitCreate}
        />
    </>
  );
};

export default AddNoteButton;

