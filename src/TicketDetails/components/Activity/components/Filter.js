import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  const allOptions = ["All", "Task", "Attachment", "Message", "Note", "Log"];
  const [filters, setFilters] = useState(["All"]);

  const handleFilter = (event, newFilters) => {
    if (newFilters.includes("All")) {
      // If "All" is selected, toggle between all selected or none selected
      if (filters.includes("All")) {
        setFilters([]);
        setFilter([]);
      } else {
        setFilters(allOptions);
        setFilter(allOptions);
      }
    } else {
      // Allow individual deselection and automatically manage "All"
      if (newFilters.length === allOptions.length - 1) {
        // If all individual options are selected, include "All"
        setFilters(allOptions);
        setFilter(allOptions);
      } else {
        // Update with the current selection, excluding "All"
        setFilters(newFilters);
        setFilter(newFilters);
      }
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
      {allOptions.map((option) => (
        <ToggleButton key={option} value={option} aria-label={option}>
          {option}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default Filter;
