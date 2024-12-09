import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  const allOptions = ["All", "Task", "Attachment", "Message", "Note", "Log"];
  const [filters, setFilters] = useState(["All"]); // Initially, only "All" is selected

  const handleFilter = (event, newFilters) => {
    if (newFilters.includes("All") && newFilters.length === 1) {
      // If "All" is selected, reset to only "All"
      setFilters(["All"]);
      setFilter(["All"]);
    } else if (newFilters.includes("All")) {
      // If another filter is clicked while "All" is selected, deselect "All"
      const updatedFilters = newFilters.filter((filter) => filter !== "All");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    } else {
      // If another filter is selected, update the state with that filter
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
      exclusive={false} // Allow multiple selections programmatically
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
