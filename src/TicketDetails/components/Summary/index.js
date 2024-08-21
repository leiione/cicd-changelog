import React, { useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import TicketPriority from "./components/TicketPriority";
import TicketType from "./components/TicketType";
import TicketStatus from "./components/TicketStatus";
import { Grid, IconButton, Typography } from "@mui/material";
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
  UPDATE_TICKET_MUTATION,
} from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import {
  HeaderSkeletonLoader,
  SummarySkeletonLoader,
} from "./components/SkeletonLoader";
import HeaderMenuOptions from "components/HeaderMenuOptions";

const Summary = (props) => {
  const dispatch = useDispatch();
  const {
    loading,
    appuser_id,
    customer,
    ticketTypes,
    ticketStatuses,
    handleOpenTicket,
  } = props;

  const showSignature = true; // this should come from ticket type settings

  const [showFilters, setShowFilters] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const handleFilterVisibility = (event) => {
    preventEvent(event);
    setShowFilters(!showFilters);
  };

  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);

  // 3. Function to execute the mutation
  const handleUpdate = async (input_ticket) => {
    setSubmitting(true);
    try {
      await updateTicket({
        variables: {
          input_ticket: input_ticket,
        },
        refetchQueries: [
          { query: GET_TICKET, variables: { id: customer.ticket_id } },
        ],
      });
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
      label="Summary"
      className="py-0"
      iconButtons={
        loading ? (
          <HeaderSkeletonLoader />
        ) : (
          <>
            <TicketPriority customer={customer} handleUpdate={handleUpdate} />
            <TicketType
              customer={customer}
              ticketTypes={ticketTypes}
              handleUpdate={handleUpdate}
            />
            <TicketStatus
              customer={customer}
              ticketStatuses={ticketStatuses}
              handleUpdate={handleUpdate}
            />
          </>
        )
      }
      menuOption={
        <HeaderMenuOptions appuser_id={appuser_id} category="Summary Card" />
      }
    >
      {loading ? (
        <SummarySkeletonLoader />
      ) : (
        <Grid container spacing={1}>
          <Grid item xs className="h-100">
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
                />
              </div>
            </div>
          </Grid>
          <Grid item xs="auto" className="min-h-100 position-relative">
            <IconButton
              onClick={handleFilterVisibility}
              size="small"
              className="border rounded-0 position-absolute"
              style={{ left: !showFilters ? -4 : -21, top: 15 }}
            >
              {showFilters ? (
                <ChevronRight className="f-18" />
              ) : (
                <ChevronLeft className="f-18" />
              )}
            </IconButton>
            {showFilters && (
              <div className="border-left pl-3 py-3 h-100 d-flex flex-column">
                <Assignee ticket={customer} updateTicket={handleUpdate} />
                <Followers ticket={customer} updateTicket={handleUpdate} />
                {showSignature && <Signature ticket={customer} />}
                <div className="mt-auto">
                  <Typography variant="caption" className="d-block mt-2">
                    Created by: <strong>{customer.created_by}</strong> on{" "}
                    {customer.created_by_time}
                  </Typography>
                  <Typography variant="caption">
                    Last updated by: <strong>{customer.last_updated_by}</strong>{" "}
                    on {customer.last_updated_by_time}
                  </Typography>
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
