import React, { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Button, Collapse } from "@mui/material";
import DueDate from "./DueDate";
import PreferredArrival from "./PreferredArrival";

const Schedule = (props) => {
  const { customer } = props;
  const [expandCollapse, setExpandCollapse] = useState("");
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <>
      <Button
        color="default"
        className="mx-0 px-1 text-muted"
        onClick={handleCollapse}
      >
        {expandCollapse ? (
          <ExpandMore className="mr-1" />
        ) : (
          <ExpandLess className="mr-1" />
        )}
        Schedule
      </Button>
      <Collapse in={expandCollapse} className="pl-4 mr-1">
        <DueDate customer={customer} />
        <PreferredArrival customer={customer} />
      </Collapse>
    </>
  );
};
export default Schedule;
