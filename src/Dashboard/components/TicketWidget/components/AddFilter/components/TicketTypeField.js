import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { checkIfCacheExists } from "config/apollo";
import HookMultiAutoComplete from "Dashboard/common/HookMultiAutoComplete";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { GET_TICKET_TYPES } from "TicketDetails/TicketGraphQL";

const TicketTypeField = ({ control, name }) => {
  const online = useSelector(state => state.networkStatus?.online || false);
  const { data, loading, error, client } = useQuery(GET_TICKET_TYPES, {
    fetchPolicy: online ? "network-only" : "cache-only",
  });
  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET_TYPES })

  const ticketTypes = useMemo(() => {
    let options = []
    if ((!loading || cacheExists) && data?.ticketTypes) {
      options = data.ticketTypes.map(ticketType => ({
        label: ticketType.ticket_type_desc,
        value: ticketType.ticket_type_id
      }))
    }
    return options;
  }, [loading, cacheExists, data]);
  
  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <HookMultiAutoComplete
      label="Ticket Type*"
      control={control}
      name={name}
      options={ticketTypes}
    />
  );
};

export default TicketTypeField;