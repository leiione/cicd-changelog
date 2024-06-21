import React, { useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import TicketPriority from "./components/TicketPriority";
import TicketType from "./components/TicketType";
import TicketStatus from "./components/TicketStatus";
import { Grid, IconButton, Typography } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import Followers from "./components/Followers";
import Assignee from "./components/Assignee";
import Signature from "./components/Signature";
import Description from "./components/Description";
import Schedule from "./components/Schedule";
import ServiceContact from "./components/ServiceContact";
import LinkedTickets from "./components/LinkedTickets";

const Summary = (props) => {
  const { customer, showSignature } = props;
  const [showFilters, setShowFilters] = useState(true);
  const handleFilterVisibility = (event) => {
    preventEvent(event);
    setShowFilters(!showFilters);
  };

  return (
    <AccordionCard
      label="Overview"
      className="py-0"
      iconButtons={
        <>
          <TicketPriority customer={customer} />
          <TicketType customer={customer} />
          <TicketStatus customer={customer} />
        </>
      }
      menuOption={<HeaderMenuOptions />}
    >
      <Grid container spacing={1}>
        <Grid item xs className="h-100">
          <div className="py-3 pr-5">
            <Description customer={customer} />
            <div className="border-top mt-3 pt-3">
              <Schedule customer={customer} />
              <ServiceContact customer={customer} />
              <LinkedTickets customer={customer} />
            </div>
          </div>
        </Grid>
        <Grid item xs="auto" className="h-100 position-relative">
          <IconButton
            onClick={handleFilterVisibility}
            size="small"
            className="border rounded-0 position-absolute"
            style={{ left: showFilters ? -4 : -21, top: 15 }}
          >
            <ChevronLeft className="f-18" />
          </IconButton>
          {!showFilters && (
            <div className="border-left pl-3 py-3 h-100">
              <Assignee customer={customer} />
              <Followers customer={customer} />
              {showSignature && <Signature showSignature={showSignature} />}
              <Typography variant="caption" className="d-block mt-2">
                Created by: <strong>name is missing</strong> on{" "}
                {customer.date_added}
              </Typography>
              <Typography variant="caption">
                Last updated by: <strong>name is missing</strong> on{" "}
                {customer.last_modified}
              </Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </AccordionCard>
  );
};
export default Summary;
