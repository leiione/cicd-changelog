import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNote } from "@fortawesome/pro-regular-svg-icons";
import ButtonWithLabel from "Common/ButtonWithLabel";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";

const AddNoteButton = (props) => {
  const dispatch = useDispatch();
  const { setAddNew,lablesVisible} = props;
  const handleAdd = (event, type) => {
    preventEvent(event);
    setAddNew(type);
    dispatch(
      setCardPreferences({
        card: "messagesCard",
        preferences: { expanded: true },
      })
    );
  };

  return (
    <>
        <ButtonWithLabel
          buttonLabel="Add Note"
          lablesVisible={lablesVisible}
          onClick={(event) => handleAdd(event, "note")}
          buttonIcon={<FontAwesomeIcon className="primary-hover" icon={faNote} size="lg" />}
        />
    </>
  );
};

export default AddNoteButton;

