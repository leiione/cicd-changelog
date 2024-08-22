import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";
import { GET_TICKET_MESSAGES } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import Loader from "components/Loader";

const Messages = (props) => {
  const { appuser_id, ticket } = props;

  const { loading, error, data } = useQuery(GET_TICKET_MESSAGES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "network-only",
  });

  if (error) return <ErrorPage error={error} />
  if (loading) return <Loader />
  
  const messages = !loading && data && data.ticketMessages ? data.ticketMessages : [];

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
      <Filter />

      <MessagesTable messages={messages} />
    </AccordionCard>
  );
};
export default Messages;
