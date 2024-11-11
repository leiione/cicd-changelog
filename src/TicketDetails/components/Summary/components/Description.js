import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

const Description = (props) => {
  const { ticket, updateTicket } = props;
  const [openInline, setOpenInline] = useState(false);
  const [description, setDescription] = useState(ticket.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State to track error

  const handleInlineEdit = () => setOpenInline(true);

  const handleCancel = () => {
    setOpenInline(false);
    setDescription(ticket.description);
    setError(""); // Reset error on cancel
  };

  const handleSave = async () => {
    if (description.length > 100) {
      setError("Must not exceed 100 characters");
      return; // Prevent save if error
    }
    setLoading(true);
    let toUpdate = { description: description };
    try {
      await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });
      setOpenInline(false); // Close the editor after successful update
    } catch (error) {
      console.error("Failed to update the description:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setDescription(value);
      setError(""); // Clear error if within limit
    } else {
      setError("Must not exceed 100 characters");
    }
  };

  return (
    <>
      {!openInline ? (
        ticket.description ? (
          <div className="cursor-pointer" onClick={handleInlineEdit}>
            <Typography variant="body1" className="break-word">
              {ticket.description}
            </Typography>
          </div>
        ) : (
          <Button color="primary" onClick={handleInlineEdit}>
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
            onChange={handleChange}
            disabled={loading}
            error={!!error} // Indicate error in TextField
            helperText={error} // Display error message
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
              disabled={loading}
            >
              Save
            </Button>
            <Button
              color="default"
              size="small"
              onClick={handleCancel}
              className="my-1"
              disabled={loading}
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
