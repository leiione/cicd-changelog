import React from "react";
import { Button, ButtonGroup } from "@mui/material";

const Filter = (props) => {
  return (
      <ButtonGroup variant="outlined" aria-label="Basic button group">
        <Button>All</Button>
        <Button>Notes</Button>
        <Button>Messages</Button>
      </ButtonGroup>
  );
};
export default Filter;
