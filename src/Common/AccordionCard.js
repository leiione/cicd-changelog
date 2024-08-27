import React from "react";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setCardPreferences } from "config/store";
import { toLower, trim } from "lodash";
import { useSelector } from "react-redux";

const AccordionCard = (props) => {
  const dispatch = useDispatch()
  const { children, label, iconButtons, menuOption, cardFooter, className } = props;
  const card = `${trim(toLower(label))}Card`;
  const cardPreferences = useSelector(state => state[card]);
  const expanded = cardPreferences ? cardPreferences.expanded : false;

  const handleChange = () => {
    dispatch(setCardPreferences({ card, preferences: { expanded: !expanded } }))
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
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
