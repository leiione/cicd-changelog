import React from "react";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";

const AccordionCard = (props) => {
  const { children, label, iconButtons, menuOption, cardFooter, className, defaultExpanded = false, expanded, setExpanded } = props;

  let accordionProps = {}
  if (setExpanded) {
    accordionProps = {
      expanded: expanded,
      onChange: () => setExpanded(!expanded)
    }
  }

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      {...accordionProps}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="h6" className="mr-3">{label}</Typography>
        <div className="d-flex align-items-center">{iconButtons}</div>
        <div className="ml-auto">{menuOption}</div>
      </AccordionSummary>
      <AccordionDetails className={className}>{children}</AccordionDetails>
      {cardFooter && <AccordionActions>{cardFooter}</AccordionActions>}
    </Accordion>
  );
};
export default React.memo(AccordionCard);
