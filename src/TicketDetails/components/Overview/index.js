import React, { useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import TicketPriority from "./components/TicketPriority";
import TicketType from "./components/TicketType";
import TicketStatus from "./components/TicketStatus";
import {
  Button,
  Collapse,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronLeft, ExpandLess, ExpandMore } from "@mui/icons-material";
import { preventEvent } from "Common/helper";

const Overview = (props) => {
  const { customer } = props;
  const [showFilters, setShowFilters] = useState(true);
  const handleFilterVisibility = (event) => {
    preventEvent(event);
    setShowFilters(!showFilters);
  };

  const [openInline, setOpenInline] = useState("");

  const handleInlineEdit = () =>
    setTimeout(() => {
      setOpenInline(!openInline);
    }, 500);

  const handleCancel = () => {
    setOpenInline(!openInline);
  };

  const [expandCollapse, setExpandCollapse] = useState("");
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
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
        <Grid item xs>
          <div className="py-3 pr-5">
            {!openInline ? (
              customer.summary ? (
                <div
                  className="cursor-pointer"
                  onClick={() => handleInlineEdit()}
                >
                  <Typography variant="body2">Description</Typography>
                  <Typography variant="body1">{customer.summary}</Typography>
                </div>
              ) : (
                <Button color="primary" onClick={() => handleInlineEdit()}>
                  Click to add description
                </Button>
              )
            ) : (
              <div className="position-relative">
                <TextField
                  id="standard-basic"
                  variant="standard"
                  className="mb-0"
                  fullWidth
                  value={customer.summary}
                />
                <div
                  className="position-absolute right-0 bg-white rounded shadow"
                  style={{ bottom: -32 }}
                >
                  <Button
                    color="primary"
                    size="small"
                    onClick={handleCancel}
                    className="my-1"
                  >
                    Save
                  </Button>
                  <Button
                    color="default"
                    size="small"
                    onClick={handleCancel}
                    className="my-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <div className="border-top mt-3 pt-3">
              <Button
                color="default"
                className="mx-0 px-1 text-muted"
                onClick={handleCollapse}
              >
                {expandCollapse ? (
                  <ExpandMore className="mr-2" />
                ) : (
                  <ExpandLess className="mr-2" />
                )}
                Schedule
              </Button>
              <Collapse in={expandCollapse}>
                <Typography variant="subtitle1">
                  <span className="text-dark">Date </span> {customer.date_added}
                </Typography>
              </Collapse>
            </div>
          </div>
        </Grid>
        <Grid item xs="auto" className="h-100 position-relative">
          <IconButton
            onClick={handleFilterVisibility}
            size="small"
            className="border rounded-0 position-absolute"
            style={{ left: showFilters ? -5 : -21, top: 15 }}
          >
            <ChevronLeft className="f-18" />
          </IconButton>
          {!showFilters && (
            <div className="border-left pl-3 py-3">
              <Grid container>
                <Grid item xs="auto">
                  <Typography variant="subtitle1">Assignee: </Typography>
                </Grid>
                <Grid item xs="auto">
                  <Typography variant="subtitle1">Assignee: </Typography>
                </Grid>
              </Grid>
              <Grid container>
                <Grid item xs="auto">
                  <Typography variant="subtitle1">Followers: </Typography>
                </Grid>
                <Grid item xs="auto">
                  <Typography variant="subtitle1">Assignee: </Typography>
                </Grid>
              </Grid>
              <Typography variant="caption" className="d-block">
                Created by: on {customer.date_added}
              </Typography>
              <Typography variant="caption">
                Last updated by: on {customer.last_modified}{" "}
              </Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </AccordionCard>
  );
};
export default Overview;
