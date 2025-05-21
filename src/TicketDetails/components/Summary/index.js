import React, { useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import TicketPriority from "./components/TicketPriority";
import TicketType from "./components/TicketType";
import TicketStatus from "./components/TicketStatus";
import { Grid, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import Followers from "./components/Followers";
import Assignee from "./components/Assignee";
import Signature from "./components/Signature";
import Description from "./components/Description";
import Schedule from "./components/Schedule";
import ServiceContact from "./components/ServiceContact";
import LinkedTickets from "./components/LinkedTickets";
import {
  GET_TICKET,
  GET_ACTIVITIES,
  GET_TICKET_ATTACHMENTS,
  UPDATE_TICKET_MUTATION,
  GET_TICKET_CUSTOM_FIELDS,
  GET_TICKET_TASKS,
} from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences, showSnackbar } from "config/store";
import {
  HeaderSkeletonLoader,
  SummarySkeletonLoader,
} from "./components/SkeletonLoader";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import RecentUpdates from "./components/RecentUpdates";
import AttachmentCount from "./components/AttachmentCount";

const Summary = (props) => {
  const dispatch = useDispatch();
  const summaryCard = useSelector((state) => state.summaryCard);
  const flags = useSelector((state) => state.flags);
  const enableQueueJobs = flags && flags.enableQueueJobs
  const preferences = summaryCard ? summaryCard.subComponent : {};

  const {
    loading,
    appuser_id,
    customer,
    handleOpenTicket,
    setOpenQueueJobs,
    defaultAttacmentCount,
    requiredCustomFieldsCount,
    isSignatureAdded,
    setIsSignatureAdded,
    ticketCached,
    setTicketCached,
    attachmentRef
  } = props;

  const showSignature = true; // this should come from ticket type settings
  const [isSubmitting, setSubmitting] = useState(false);

  const handlePullTab = (event) => {
    preventEvent(event);
    dispatch(
      setCardPreferences({
        card: "summaryCard",
        preferences: {
          ...summaryCard,
          subComponent: {
            ...preferences,
            assignee: !preferences.assignee,
          },
        },
      })
    );
  };

  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);

  // 3. Function to execute the mutation
  const handleUpdate = async (input_ticket) => {
    setSubmitting(true);
    try {

      // Define base refetch queries that always run
      const baseRefetchQueries = [
        { query: GET_TICKET, variables: { id: customer.ticket_id } },
        { query: GET_ACTIVITIES, variables: { ticket_id: customer.ticket_id } }
      ];

      const refetchQueries = [...baseRefetchQueries];
      if (input_ticket.type) {
        refetchQueries.push(
          { query: GET_TICKET_ATTACHMENTS, variables: { ticket_id: customer.ticket_id } },
          { query: GET_TICKET_CUSTOM_FIELDS, variables: { ticketId: customer.ticket_id } },
          { query: GET_TICKET_TASKS, variables: { ticket_id: customer.ticket_id } }
        );
      }

      await updateTicket({
        variables: {
          input_ticket: input_ticket,
        },
        refetchQueries: refetchQueries, 
      });
      setTicketCached({ ...ticketCached, ...input_ticket });
      dispatch(
        showSnackbar({
          message: "Ticket updated successfully",
          severity: "success",
        })
      );
      setSubmitting(false);
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
      setSubmitting(false);
    }
  };

  return (
    <AccordionCard
      defaultExpanded
      label="Summary (LIVE)"
      className="py-0"
      iconButtons={
        loading ? (
          <HeaderSkeletonLoader />
        ) : (
          <>
            <TicketPriority customer={customer} handleUpdate={handleUpdate} />
            <TicketType
              ticket={customer}
              handleUpdate={handleUpdate}
            />
            <TicketStatus
              ticket={customer}
              defaultAttacmentCount={defaultAttacmentCount}
              requiredCustomFieldsCount={requiredCustomFieldsCount}
              isSignatureAdded={isSignatureAdded}
              handleUpdate={handleUpdate}
            />
          </>
        )
      }
      menuOption={
        <HeaderMenuOptions appuser_id={appuser_id} category="Summary Card" setOpenQueueJobs={setOpenQueueJobs} enableQueueJobs={enableQueueJobs} />
      }
    >
      {loading ? (
        <SummarySkeletonLoader />
      ) : (
        <Grid container spacing={1}>
          <Grid item xs={preferences.assignee ? 8 : true} className="h-100">
            <div className="py-3 pr-5">
              <Description ticket={customer} updateTicket={handleUpdate} />
              <div className="border-top mt-3 pt-3">
                <ServiceContact
                  ticket={customer}
                  updateTicket={handleUpdate}
                  isSubmitting={isSubmitting}
                />
                <Schedule
                  isSubmitting={isSubmitting}
                  ticket={customer}
                  updateTicket={handleUpdate}
                />
                <LinkedTickets
                  ticket={customer}
                    handleOpenTicket={handleOpenTicket}
                    setTicketCached={setTicketCached}
                />
              </div>
            </div>
          </Grid>
          <Grid
            item
            xs={preferences.assignee ? 4 : "auto"}
            className="min-h-100 position-relative"
          >
            <IconButton
              onClick={handlePullTab}
              size="small"
              className="border rounded-0 position-absolute"
              style={{ left: !preferences.assignee ? -4 : -21, top: 15 }}
            >
              {preferences.assignee ? (
                <ChevronRight className="f-18" />
              ) : (
                <ChevronLeft className="f-18" />
              )}
            </IconButton>
            {preferences.assignee && (
              <div className="border-left pl-3 py-3 h-100 d-flex flex-column">
                <Assignee ticket={customer} updateTicket={handleUpdate} />
                <Followers ticket={customer} updateTicket={handleUpdate} />
                <AttachmentCount attachmentRef={attachmentRef} ticket={customer} />
                {showSignature && (
                  <Signature
                    ticket={customer}
                    setIsSignatureAdded={setIsSignatureAdded}
                  />
                  )}
                <div className="mt-auto">
                  <RecentUpdates ticket_id={customer.ticket_id} />
                </div>
              </div>
            )}
          </Grid>
        </Grid>
      )}
    </AccordionCard>
  );
};
export default Summary;
