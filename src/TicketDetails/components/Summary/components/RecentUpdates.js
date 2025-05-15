import React, { useMemo } from "react";
import {Skeleton, Typography } from "@mui/material";
import { GET_RECENT_LOGS, TICKET_SUBSCRIPTION } from "TicketDetails/TicketGraphQL";
import { useSelector } from "react-redux";
import { useQuery, useSubscription } from "@apollo/client";
import { checkIfCacheExists } from "config/apollo";
import ErrorPage from "components/ErrorPage";
import Stopwatch from "./Stopawtch";

const RecentUpdates = ({ ticket_id }) => {
  const timeZone = useSelector((state) => state.timeZone);
  const online = useSelector(state => state.networkStatus?.online || false);
  
  const { loading, error, data, client, refetch } = useQuery(GET_RECENT_LOGS, {
    variables: { id: ticket_id, time_zone: timeZone },
    fetchPolicy: online ? "cache-and-network" : "cache-only",
    skip: !ticket_id,
  });

  useSubscription(TICKET_SUBSCRIPTION, {
    variables: { ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetch();
    },
  });

  const cacheExists = checkIfCacheExists(client, { query: GET_RECENT_LOGS, variables: { id: ticket_id, time_zone: timeZone } })

  const recent = useMemo(() => {
    return (!loading || cacheExists) && data && data.ticketRecentLogs ? data.ticketRecentLogs : {};
  }, [loading, cacheExists, data]);

  if (error) return <ErrorPage error={error} />
  if (loading && !cacheExists) return (
    <>
      <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "100%" }} />
      <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "100%" }} />
    </>
  )
  
  return (
    <>
      <Typography variant="caption" className="d-block mt-2">
        Created by: <strong>{recent.created_by}</strong> on{" "}
        {recent.created_by_time}
      </Typography>
      <Typography variant="caption">
        Last updated by: <strong>{recent.last_updated_by}</strong>{" "}
        on {recent.last_updated_by_time}
      </Typography>
      {/* Added Stopwatch for Ticket */}
      <Stopwatch />
    </>
  );
};

export default RecentUpdates;
