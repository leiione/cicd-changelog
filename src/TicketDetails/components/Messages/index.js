import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";
import {
  GET_TICKET_MESSAGES,
  GET_TICKET_NOTES,
} from "TicketDetails/TicketGraphQL";
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
  const cacheExists = checkIfCacheExists(client, {
    query: GET_TICKET_MESSAGES,
    variables: { ticket_id: ticket.ticket_id },
  });

  const {
    loading: loadingNotes,
    error: errorNotes,
    data: dataNotes,
    client: clientNotes,
  } = useQuery(GET_TICKET_NOTES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "cache-and-network",
    skip: !ticket.ticket_id,
  });
  const cacheExistsNotes = checkIfCacheExists(clientNotes, {
    query: GET_TICKET_NOTES,
    variables: { ticket_id: ticket.ticket_id },
  });

  if (error || errorNotes) return <ErrorPage error={error} />;

  let messages = [];

  if (
    filter === "notes" &&
    (!loadingNotes || cacheExistsNotes) &&
    dataNotes &&
    dataNotes.ticketNotes
  ) {
    messages = dataNotes.ticketNotes;
  } else if (
    filter === "message" &&
    (!loading || cacheExists) &&
    data &&
    data.ticketMessages
  ) {
    messages = data.ticketMessages;
  } else if (
    filter === "all" &&
    (!loading || cacheExists) &&
    data &&
    data.ticketMessages &&
    (!loadingNotes || cacheExistsNotes) &&
    dataNotes &&
    dataNotes.ticketNotes
  ) {
    messages = [...data.ticketMessages, ...dataNotes.ticketNotes];
  }


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
      {(loading || loadingNotes) && (!cacheExists || !cacheExistsNotes) ? (
        <Loader loaderStyle={{ position: "static", textAlign: "center" }} />
      ) : (
        <>
          <Filter filter={filter} setFilter={setFilter} />
          <MessagesTable messages={messages} />
        </>
      )}
    </AccordionCard>
  );
};
export default Messages;
