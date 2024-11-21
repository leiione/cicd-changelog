import React, { useEffect } from "react";
import { MenuItem, Select, FormControl } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { useQuery } from "@apollo/client";
import { GET_TICKET_LINK_TYPES } from "TicketDetails/TicketGraphQL";
import { startCase } from "lodash";

const TickeLinkType = (props) => {
  const { tickeLinkType, setTicketLinkType } = props;

  const handlePopoverClose = (event, taskType) => {
    if (taskType !== "backdropClick") {
      setTicketLinkType(taskType);
    }
    preventEvent(event);
  };

  const { loading, error, data } = useQuery(GET_TICKET_LINK_TYPES);

  useEffect(() => {
    if (data && data.ticketLinkTypes && data.ticketLinkTypes.length > 0) {
      // Assuming data.ticketLinkTypes is the array of ticket link types
      setTicketLinkType(data.ticketLinkTypes[0]);
    }
  }, [data, setTicketLinkType]); // This effect depends on 'data', it runs when 'data' changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <>
      <FormControl variant="standard" fullWidth label="">
        <Select
          labelId="select-label"
          value={tickeLinkType}
          label="Select Item"
        >
          {data.ticketLinkTypes.map((type) => (
            <MenuItem
              key={type.id}
              value={type}
              onClick={(event) => handlePopoverClose(event, type)}
            >
              {startCase(type.name)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
export default TickeLinkType;
