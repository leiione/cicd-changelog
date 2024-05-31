import { IconButton, Tooltip } from "@mui/material";
import React from "react";

const ButtonWithLable = (props) => {
  const { buttonLabel, buttonIcon, color, lablesVisible, onClick } = props;
  return (
    <>
      <Tooltip title={!lablesVisible && buttonLabel} placement="top">
        <span
          className="d-inline-flex align-items-center mr-1"
          onClick={onClick}
        >
          <IconButton
            color={color ? color : "default"}
            className={lablesVisible ? "pr-1" : ""}
          >
            {buttonIcon}
          </IconButton>
          <span className={lablesVisible ? "" : "d-none"}>{buttonLabel}</span>
        </span>
      </Tooltip>
    </>
  );
};
export default ButtonWithLable;
