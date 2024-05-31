import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";

const Activity = (props) => {
  const [filters, SetFilters] = useState(() => ["Message"]);
  const handleFilter = (event, newFilters) => {
    SetFilters(newFilters);
  };

  return (
    <AccordionCard
      label="Activity"
      className={"pt-0"}
      menuOption={
        <div className="d-flex align-items-center">
          <HeaderMenuOptions />
        </div>
      }
    >
      <div className="py-2">
        <ToggleButtonGroup
          value={filters}
          size="small"
          onChange={handleFilter}
          aria-label="filter"
        >
          <ToggleButton value="All" aria-label="All">
            All
          </ToggleButton>
          <ToggleButton value="Note" aria-label="Note">
            Notes
          </ToggleButton>
          <ToggleButton value="Message" aria-label="Message">
            Message
          </ToggleButton>
          <ToggleButton value="Attachment" aria-label="Attachment">
            Attachment
          </ToggleButton>
          <ToggleButton value="Logs" aria-label="Logs">
            Logs
          </ToggleButton>
        </ToggleButtonGroup>


        
      </div>
    </AccordionCard>
  );
};
export default Activity;
