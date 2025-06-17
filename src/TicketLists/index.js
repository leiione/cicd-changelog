import React, { useState, useMemo, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import TicketItem from "./components/TicketItem";
import TicketLoader from "../utils/TicketLoader";
import { GET_ISP_TICKETS } from "Dashboard/DashboardGraphQL";
import { useQuery } from "@apollo/client";
import { HeaderContainer, HeaderTitle, TicketListContainer, NoTicketsContainer, NoTicketsText } from "./styles/TicketListStyles";
import ErrorPage from "components/ErrorPage";
import dayjs from "dayjs";
import DateSelector from "./components/DateSelector";
import FilterDrawer from "./components/FilterDrawer";
import TuneIcon from "@mui/icons-material/Tune";
import { useTicketFilters } from "./hooks/useTicketFilters";
import { priorities, statuses } from "utils/ticketFilters";


const TicketLists = () => {
  const INITIAL_LOAD_LIMIT = 20;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(INITIAL_LOAD_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [open, setOpen] = useState(false);


  const dateFilter = useMemo(() => {
    const [startDate, endDate] = dateRange;
    return {
      startDate: startDate?.format("YYYY-MM-DD 00:00:00"),
      endDate: endDate?.format("YYYY-MM-DD 23:59:59")
    };
  }, [dateRange]);

  const filterVariables = useMemo(() => {
    const statusFilters = selectedFilters.filter(f => statuses.includes(f));
    const priorityFilters = selectedFilters.filter(f => priorities.includes(f));
    const hasScheduled = selectedFilters.includes("Scheduled");
    const hasUnscheduled = selectedFilters.includes("Unscheduled");

    return {
      status: statusFilters.length > 0 && !selectedFilters.includes("All") ? statusFilters : null,
      priority: priorityFilters.length > 0 ? priorityFilters : null,
      scheduled: hasScheduled ? true : hasUnscheduled ? false : null,
      technicianId: selectedTechnician ? [parseInt(selectedTechnician)] : null
    };
  }, [selectedFilters, selectedTechnician]);

  const variables = useMemo(() => ({
    page: page,
    pageSize: pageSize,
    sortField: "ticket_id",
    sortOrder: "desc",
    dateRange: dateFilter,
    ...filterVariables,
    flag_subscriber_deleted: false,
  }), [page, pageSize, dateFilter, filterVariables]);

  const { loading, error } = useQuery(GET_ISP_TICKETS, {
    variables,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const newTickets = data?.getISPTickets?.tickets || [];
      const pageInfo = data?.getISPTickets?.pageInfo || {};

      if (page === 0 && newTickets.length === 0) {
        setHasMore(false);
        setInitialLoadComplete(true);
        return;
      }

      setTickets(prev => page === 0 ? newTickets : [...prev, ...newTickets]);

      setHasMore(pageInfo.hasNextPage);

      if (page === 0) {
        setInitialLoadComplete(true);
      }
    },
    onError: () => {
      if (page === 0) {
        setInitialLoadComplete(true);
      }
    }
  });

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const resetPagination = useCallback(() => {
    setPage(0);
    setTickets([]);
    setHasMore(true);
    setInitialLoadComplete(false);
    setPageSize(INITIAL_LOAD_LIMIT);
  }, []);

  const toggleDrawer = (state) => () => setOpen(state);

  const { handleFilterToggle } = useTicketFilters(setSelectedFilters, resetPagination);

  const handleTechnicianChange = (techId) => {
    setSelectedTechnician(techId);
    resetPagination();
  };

  const handleAccordionChange = (ticketId) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <HeaderContainer>
        <HeaderTitle variant="h6" component="div">Service Desk</HeaderTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DateSelector
            dateRange={dateRange}
            reset={resetPagination}
            setDateRange={setDateRange}
          />
          <IconButton onClick={toggleDrawer(true)}>
            <TuneIcon />
          </IconButton>
          <FilterDrawer
            open={open}
            toggleDrawer={toggleDrawer}
            selectedFilters={selectedFilters}
            handleToggle={handleFilterToggle}
            selectedTechnician={selectedTechnician}
            onTechnicianChange={handleTechnicianChange}
          />
        </Box>
      </HeaderContainer>

      <TicketListContainer id="scrollableDiv">
        {loading && !initialLoadComplete ? (
          <TicketLoader />
        ) : initialLoadComplete && tickets.length === 0 ? (
          <NoTicketsContainer>
            <NoTicketsText>No tickets found</NoTicketsText>
          </NoTicketsContainer>
        ) : (
          <InfiniteScroll
            dataLength={tickets.length}
            next={loadMore}
            hasMore={hasMore}
            loader={hasMore && <TicketLoader />}
            endMessage={
              tickets.length > 0 && (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  {tickets.length >= INITIAL_LOAD_LIMIT ? "End of tickets" : ""}
                </Box>
              )
            }
            scrollableTarget="scrollableDiv"
          >
            <TicketItem
              tickets={tickets}
              expandedTicketId={expandedTicketId}
              handleAccordionChange={handleAccordionChange}
            />
          </InfiniteScroll>
        )}
      </TicketListContainer>
    </>
  );
};

export default TicketLists;