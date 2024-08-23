import React from "react";
import { Button, ButtonGroup } from "@mui/material";

const Filter = (props) => {
  const { setFilter } = props;
  
  return (
      <ButtonGroup variant="outlined" aria-label="Basic button group">
        <Button onClick={() => setFilter('all')}>All</Button>
        <Button onClick={() => setFilter('notes')}>Notes</Button>
        <Button onClick={() => setFilter('message')}>Messages</Button>
      </ButtonGroup>
  );
};
export default Filter;
