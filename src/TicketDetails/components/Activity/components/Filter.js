import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  const allOptions = ["All", "Task", "Attachment", "Message", "Note", "Log"];
  const [filters, setFilters] = useState(["All"]);

  const handleFilter = (event, newFilters) => {
    if (newFilters.includes("All") && newFilters.length === 1) {
      // If only "All" is selected, select all options
      setFilters(allOptions);
      setFilter(allOptions);
    } else if (newFilters.includes("All") && newFilters.length > 1) {
      // If "All" is selected along with others, deselect "All"
      const updatedFilters = newFilters.filter((filter) => filter !== "All");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    } else if (
      newFilters.length === allOptions.length - 1 &&
      !newFilters.includes("All")
    ) {
      // If all options except "All" are selected, select "All" automatically
      setFilters(allOptions);
      setFilter(allOptions);
    } else {
      // Update with the current selection
      setFilters(newFilters);
      setFilter(newFilters);
    }
  };

  return (
    <ToggleButtonGroup
      value={filters}
      onChange={handleFilter}
      aria-label="filter"
      size="small"
      exclusive={false}
    >
      <ToggleButton value="All" aria-label="All">
        All
      </ToggleButton>
      <ToggleButton value="Task" aria-label="Task">
        Task
      </ToggleButton>
      <ToggleButton value="Attachment" aria-label="Attachment">
        Attachment
      </ToggleButton>
      <ToggleButton value="Message" aria-label="Message">
        Message
      </ToggleButton>
      <ToggleButton value="Note" aria-label="Note">
        Note
      </ToggleButton>
      <ToggleButton value="Log" aria-label="Log">
        Log
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default Filter;
