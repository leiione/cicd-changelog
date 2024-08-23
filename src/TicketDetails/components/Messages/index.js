import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";
import { GET_TICKET_MESSAGES } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import Loader from "components/Loader";
import { checkIfCacheExists } from "config/apollo";

const Messages = (props) => {
  const { appuser_id, ticket } = props;
  const [filter, setFilter] = React.useState("all");

  const { loading, error, data, client } = useQuery(GET_TICKET_MESSAGES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "cache-and-network",
    skip: !ticket.ticket_id || filter === "notes",
  });
  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET_MESSAGES, variables: { ticket_id: ticket.ticket_id } })

  if (error) return <ErrorPage error={error} />

  const messages = filter !== "notes" && (!loading || cacheExists) && data && data.ticketMessages ? data.ticketMessages : [];

  return (
    <AccordionCard
      label="Messages"
      iconButtons={<></>}
      menuOption={
        <>
          <HeaderMenuOptions appuser_id={appuser_id} category="Message Card" />
        </>
      }
    >
      {(loading && !cacheExists) ? <Loader loaderStyle={{ position: "static" }} />
        : <>
          <Filter filter={filter} setFilter={setFilter} />
          <MessagesTable messages={messages} />
        </>
      }
    </AccordionCard>
  );
};
export default Messages;
