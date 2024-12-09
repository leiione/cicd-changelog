import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  const allOptions = ["All", "Task", "Attachment", "Message", "Note", "Log"];
  const [filters, setFilters] = useState(["All"]); // Initially, only "All" is selected

  const handleFilter = (event, newFilters) => {
    if (newFilters.includes("All") && filters.length > 1) {
      // If "All" is clicked while other filters are active, reset to "All"
      setFilters(["All"]);
      setFilter(["All"]);
    } else if (newFilters.includes("All") && newFilters.length === 1) {
      // If "All" is clicked by itself, keep "All" selected
      setFilters(["All"]);
      setFilter(["All"]);
    } else {
      // If any other filter is clicked, deselect "All"
      const updatedFilters = newFilters.filter((filter) => filter !== "All");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
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
