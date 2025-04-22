import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { checkIfCacheExists } from "config/apollo";
import HookMultiAutoComplete from "Dashboard/common/HookMultiAutoComplete";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { GET_TICKET_STATUS } from "TicketDetails/TicketGraphQL";

const StatusField = ({ control, name }) => {
  const online = useSelector(state => state.networkStatus?.online || false);
  const { data, loading, error, client } = useQuery(GET_TICKET_STATUS, {
    fetchPolicy: online ? "network-only" : "cache-only",
  });
  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET_STATUS })

  const statuses = useMemo(() => {
    let options = []
    if ((!loading || cacheExists) && data?.ticketStatuses) {
      options = data.ticketStatuses.map(status => ({
        label: status.name,
        value: status.id
      }))
    }
    return options;
  }, [loading, cacheExists, data]);
  
  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <HookMultiAutoComplete
      label="Status*"
      control={control}
      name={name}
      options={statuses}
    />
  );
};

export default StatusField;