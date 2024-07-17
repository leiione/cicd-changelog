import React, { useState } from "react";
import { ExpandLess, ExpandMore, LinkOutlined } from "@mui/icons-material";
import { Button,Collapse, Typography } from "@mui/material";
import InnerDrawer from "Common/InnerDrawer";
import LinkedTicketsList from "./LinkedTicketsList";

const LinkedTickets = (props) => {
  const [expandCollapse, setExpandCollapse] = useState("");
  const [isLinkedTicketDrawerOpen, setIsLinkedTicketDrawerOpen] = useState(false);
  
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  const handleLinkButtonClick =()=>{
    setIsLinkedTicketDrawerOpen(!isLinkedTicketDrawerOpen);
  }

  const onCloseLinkedTicketDrawer = (skipDirty, equipId) => {
    setIsLinkedTicketDrawerOpen(false);
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
      <Button onClick={() => handleLinkButtonClick()}>       
         <LinkOutlined   />
      </Button>
      <Collapse in={expandCollapse} className="pl-4 mr-1">
        <Typography variant="subtitle1">No Linked Tickets</Typography>
      </Collapse>


      {isLinkedTicketDrawerOpen &&
        <InnerDrawer header={"Linked Tickets"} open={isLinkedTicketDrawerOpen} onCloseDrawer={() => onCloseLinkedTicketDrawer(false)}>
           <LinkedTicketsList></LinkedTicketsList>
        </InnerDrawer>
      }





    </>
  );
};
export default LinkedTickets;
