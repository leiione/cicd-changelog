import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

const Description = (props) => {
  const { ticket, updateTicket } = props;
  const [openInline, setOpenInline] = useState("");
  const [description, setDescription] = useState(ticket.description);

  const handleInlineEdit = () =>
    setTimeout(() => {
      setOpenInline(!openInline);
    }, 500);

  const handleCancel = () => {
    setOpenInline(!openInline);
    setDescription(ticket.description);
  };


   const handleSave = async () => {
    let toUpdate = { description: description };
    await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });

   };
 


   

  return (
    <>
      {!openInline ? (
        ticket.description ? (
          <div className="cursor-pointer" onClick={() => handleInlineEdit()}>
            <Typography variant="body2">Description</Typography>
            <Typography variant="body1">{ticket.description}</Typography>
          </div>
        ) : (
          <Button color="primary" onClick={() => handleInlineEdit()}>
            Click to add description
          </Button>
        )
      ) : (
        <div className="position-relative">
          <TextField
            id="standard-basic"
            variant="standard"
            className="mb-0"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div
            className="position-absolute right-0 bg-white rounded shadow"
            style={{ bottom: -32 }}
          >
            <Button
              color="primary"
              size="small"
              onClick={handleSave}
              className="my-1"
            >
              Save
            </Button>
            <Button
              color="default"
              size="small"
              onClick={handleCancel}
              className="my-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
export default Description;
