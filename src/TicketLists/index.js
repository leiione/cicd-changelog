import React, { useState, useMemo } from "react";
import { Box } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import TicketItem from "./components/TicketItem";
import TicketLoader from "../utils/TicketLoader";
import { GET_ISP_TICKETS } from "Dashboard/DashboardGraphQL";
import { useQuery } from "@apollo/client";
import { HeaderContainer, HeaderTitle, TicketListContainer, NoTicketsContainer, NoTicketsText } from "./styles/TicketListStyles";
import ErrorPage from "components/ErrorPage";

const TicketLists = () => {
  const INITIAL_LOAD_LIMIT = 20;
  const [page, setPage] = useState(0); 
  const [pageSize] = useState(INITIAL_LOAD_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const variables = useMemo(() => ({
    page: page,
    pageSize: pageSize,
    sortField: "ticket_id",
    sortOrder: "asc",
    flag_subscriber_deleted: false,
  }), [page, pageSize]);

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