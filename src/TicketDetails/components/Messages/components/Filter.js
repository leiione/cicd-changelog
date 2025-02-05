import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  // Default filter selection includes all three
  const [filters, setFilters] = useState(["all"]);

  const handleFilter = (event, newFilters) => {
    if (newFilters.includes("all") && !filters.includes("all")) {
      // If "All" is clicked while other filters are active, reset to "All"
      setFilters(["all"]);
      setFilter(["all"]);
    } else if (newFilters.includes("all") && newFilters.length === 1) {
      // If "All" is clicked by itself, keep "All" selected
      setFilters(["all"]);
      setFilter(["all"]);
    } else if (newFilters.length === 0) {
      setFilters(["all"]);
      setFilter(["all"]);
    } else {
      // If any other filter is clicked, deselect "All"
      const updatedFilters = newFilters.filter((filter) => filter !== "all");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    }
  };

  return (
    <ToggleButtonGroup
      value={filters}
      onChange={handleFilter} // Use onChange for group-level handling
      aria-label="filter"
      size="small"
      className="mb-2"
      exclusive={false} // Allow multiple selections
    >
      <ToggleButton value="all" aria-label="All">
        All
      </ToggleButton>
      <ToggleButton value="notes" aria-label="Notes">
        Notes
      </ToggleButton>
      <ToggleButton value="message" aria-label="Messages">
        Messages
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default Filter;
