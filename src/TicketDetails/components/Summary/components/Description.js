import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

const Description = (props) => {
  const { customer } = props;
  const [openInline, setOpenInline] = useState("");

  const handleInlineEdit = () =>
    setTimeout(() => {
      setOpenInline(!openInline);
    }, 500);

  const handleCancel = () => {
    setOpenInline(!openInline);
  };
  return (
    <>
      {!openInline ? (
        customer.summary ? (
          <div className="cursor-pointer" onClick={() => handleInlineEdit()}>
            <Typography variant="body2">Description</Typography>
            <Typography variant="body1">{customer.summary}</Typography>
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
            value={customer.summary}
          />
          <div
            className="position-absolute right-0 bg-white rounded shadow"
            style={{ bottom: -32 }}
          >
            <Button
              color="primary"
              size="small"
              onClick={handleCancel}
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
