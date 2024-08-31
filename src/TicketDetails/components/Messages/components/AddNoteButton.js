import { NoteAdd } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { preventEvent } from "Common/helper";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";

const AddNoteButton = props => {
  const dispatch = useDispatch()
  const { setAddNew } = props;
  const handleAdd = (event, type) => {
    preventEvent(event)
    setAddNew(type)
    dispatch(setCardPreferences({ card: "messagesCard", preferences: { expanded: true } }));
  }

  return (
    <>
      <Tooltip title={"Add Note"} placement="top">
        <IconButton
          color={"default"}
          onClick={(event) => handleAdd(event, "note")}
        >
          <NoteAdd />
        </IconButton>
      </Tooltip>
     
    </>
  )
}

export default AddNoteButton;