import { useCallback } from 'react';
import { statuses } from '../../utils/ticketFilters';

export const useTicketFilters = (setSelectedFilters, resetPagination) => {
  const handleFilterToggle = useCallback((filterLabel) => {
    setSelectedFilters((prev) => {
      const newFilters = [...prev];
      const isPresent = newFilters.includes(filterLabel);

      if (filterLabel === "All") {
        const filtered = newFilters.filter(f => !statuses.includes(f));
        return isPresent ? filtered : [...filtered, "All"];
      }

      // Handle Scheduled/Unscheduled mutual exclusivity
      if (filterLabel === "Scheduled") {
        return isPresent 
          ? newFilters.filter(f => f !== "Scheduled")
          : [...newFilters.filter(f => f !== "Unscheduled"), "Scheduled"];
      }

      if (filterLabel === "Unscheduled") {
        return isPresent 
          ? newFilters.filter(f => f !== "Unscheduled")
          : [...newFilters.filter(f => f !== "Scheduled"), "Unscheduled"];
      }

      if (statuses.includes(filterLabel)) {
        const updated = newFilters.filter(f => f !== "All");
        return isPresent
          ? updated.filter(f => f !== filterLabel)
          : [...updated, filterLabel];
      }

      return isPresent
        ? newFilters.filter((f) => f !== filterLabel)
        : [...newFilters, filterLabel];
    });
    
    if (filterLabel !== "All") {
      resetPagination();
    }
  }, [setSelectedFilters, resetPagination]);

  return { handleFilterToggle };
};
