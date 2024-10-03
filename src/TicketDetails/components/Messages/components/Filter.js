import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  // Default filter selection includes all three
  const [filters, setFilters] = useState(["all", "notes", "message"]);

  const handleFilter = (event, newFilters) => {
    console.log("New Filters Selected:", newFilters);

    if (newFilters.includes("all") && newFilters.length === 1) {
      // If only "All" is selected, select "all", "notes", and "message"
      const updatedFilters = ["all", "notes", "message"];
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    } else if (newFilters.includes("all") && newFilters.length > 1) {
      // If "All" is selected along with other filters, remove "All" and keep only the specific filters
      const updatedFilters = newFilters.filter((filter) => filter !== "all");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    } else if (newFilters.length === 1 && (newFilters.includes("notes") || newFilters.includes("message"))) {
      // If either "notes" or "message" is the only one selected, deselect "all"
      setFilters(newFilters);
      setFilter(newFilters);
    } else if (newFilters.length === 0) {
      // If no filters are selected, default to showing nothing
      setFilters([]);
      setFilter([]);
    } else {
      // Normal selection behavior, update with the current filters
      setFilters(newFilters);
      setFilter(newFilters);
    }
  };

  return (
    <ToggleButtonGroup
      value={filters}
      onChange={handleFilter} // Use onChange for group-level handling
      aria-label="filter"
      size="small"
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
