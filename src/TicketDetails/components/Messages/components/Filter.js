import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const Filter = ({ setFilter }) => {
  // Default filter selection includes all three
  const [filters, setFilters] = useState(["all", "notes", "message"]);

  const handleFilter = (event, newFilters) => {
    // console.log("New Filters Selected:", newFilters);

    // If only "All" is selected, select "all", "notes", and "message"
    if (newFilters.includes("all") && newFilters.length === 1) {
      const updatedFilters = ["all", "notes", "message"];
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    }
    // If "All" is selected along with other filters, remove "All" and keep only the specific filters
    else if (newFilters.includes("all") && newFilters.length > 1) {
      const updatedFilters = newFilters.filter((filter) => filter !== "all");
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    }
    // If both "Notes" and "Messages" are selected, automatically select "All"
    else if (newFilters.includes("notes") && newFilters.includes("message")) {
      const updatedFilters = ["all", "notes", "message"];
      setFilters(updatedFilters);
      setFilter(updatedFilters);
    }
    // If only "notes" or "message" is selected, deselect "All"
    else if (newFilters.length === 1 && (newFilters.includes("notes") || newFilters.includes("message"))) {
      setFilters(newFilters);
      setFilter(newFilters);
    }
    // If no filters are selected, default to showing nothing
    else if (newFilters.length === 0) {
      setFilters([]);
      setFilter([]);
    }
    // Normal selection behavior, update with the current filters
    else {
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
