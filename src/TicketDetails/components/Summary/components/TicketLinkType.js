import React, { useEffect } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { GET_TICKET_LINK_TYPES } from "TicketDetails/TicketGraphQL";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
  },
}));
const TickeLinkType = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { tickeLinkType, setTicketLinkType } = props;
 
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event, taskType) => {
   
    setTicketLinkType(taskType);
    preventEvent(event);
    setAnchorEl(null);
  };

  const { loading, error, data } = useQuery(GET_TICKET_LINK_TYPES);

  useEffect(() => {
    if (data && data.ticketLinkTypes && data.ticketLinkTypes.length > 0) {
      // Assuming data.ticketLinkTypes is the array of ticket link types
      setTicketLinkType(data.ticketLinkTypes[0]);
    }
  }, [data,setTicketLinkType]); // This effect depends on 'data', it runs when 'data' changes


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <>

      <span className="text-dark font-weight-normal">Ticket Type Relationship:</span>
      <Button
        color="default"
        onClick={handleClick}
        endIcon={openMenu ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
      >
        <span className="text-dark font-weight-normal">{tickeLinkType && tickeLinkType.name && tickeLinkType.name}</span>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handlePopoverClose}
        classes={{ paper: classes.paperHeight }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
          {data.ticketLinkTypes.map((type) => (
        <MenuItem
          key={type.id}
          onClick={(event) =>
            handlePopoverClose(event, type)
          }
        >
          {type.name}
        </MenuItem>
      ))}
        
      </Menu>

         </>
  );
};
export default TickeLinkType;
