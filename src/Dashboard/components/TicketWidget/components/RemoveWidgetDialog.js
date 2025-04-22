import React from "react";
import DialogAlert from "components/DialogAlert";

const RemoveWidgetDialog = ({ openPrompt, setOpenPrompt, onRemoveItem }) => {
  return (
    <DialogAlert
      open={openPrompt}
      message={`Are you sure you want remove this widget?`}
      buttonsList={[
        {
          label: "No",
          size: "medium",
          color: "default",
          onClick: () => setOpenPrompt(false),
        },
        {
          label: "Yes",
          size: "medium",
          color: "primary",
          onClick: onRemoveItem,
        }
      ]}
    />
  );
};

export default RemoveWidgetDialog;