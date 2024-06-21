import React, { useState } from "react";
import { ExpandLess, ExpandMore, LinkOutlined } from "@mui/icons-material";
import { Button,Collapse, Typography } from "@mui/material";

const LinkedTickets = (props) => {
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
        Linked Tickets
      </Button>
      <Button>
        <LinkOutlined />
      </Button>
      <Collapse in={expandCollapse} className="pl-4 mr-1">
        <Typography variant="subtitle1">No Linked Tickets</Typography>
      </Collapse>
    </>
  );
};
export default LinkedTickets;
